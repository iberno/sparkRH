import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateTimeSheetDto, QueryTimeSheetDto } from './dto/time-sheet.dto';

@Injectable()
export class TimeSheetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTimeSheetDto) {
    const { employee_id, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;

    const [sheets, total] = await Promise.all([
      this.prisma.time_sheets.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
          approver: { select: { id: true, cpf: true } },
        },
        orderBy: { period_start: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.time_sheets.count({ where }),
    ]);

    return {
      data: sheets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sheet = await this.prisma.time_sheets.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
        approver: { select: { id: true, cpf: true } },
      },
    });
    if (!sheet) throw new NotFoundException('Espelho de ponto não encontrado');
    return sheet;
  }

  async findMy(employeeId: string) {
    return this.prisma.time_sheets.findMany({
      where: { employee_id: employeeId },
      orderBy: { period_start: 'desc' },
      take: 12,
    });
  }

  async calculate(dto: CalculateTimeSheetDto) {
    const start = new Date(dto.period_start);
    const end = new Date(dto.period_end);

    const existing = await this.prisma.time_sheets.findFirst({
      where: {
        employee_id: dto.employee_id,
        period_start: start,
        period_end: end,
      },
    });

    if (existing && existing.status === 'APROVADO') {
      throw new BadRequestException('Espelho aprovado não pode ser recalculado');
    }

    const clocks = await this.prisma.time_clocks.findMany({
      where: {
        employee_id: dto.employee_id,
        clock_time: { gte: start, lte: end },
      },
      orderBy: { clock_time: 'asc' },
    });

    const clockGroups: Record<string, any[]> = {};
    for (const c of clocks) {
      const dateKey = c.clock_time.toISOString().split('T')[0];
      if (!clockGroups[dateKey]) clockGroups[dateKey] = [];
      clockGroups[dateKey].push(c);
    }

    let totalWorkedMinutes = 0;
    let totalOvertimeMinutes = 0;
    let totalNightMinutes = 0;
    let totalAbsenceDays = 0;
    let totalJustifiedDays = 0;

    const dailyWorkMinutes = 8 * 60;

    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const dayClocks = clockGroups[dateKey];

      if (!dayClocks || dayClocks.length === 0) {
        totalAbsenceDays++;
        current.setDate(current.getDate() + 1);
        continue;
      }

      const entrada = dayClocks.find(c => c.clock_type === 'ENTRADA');
      const saida = dayClocks.find(c => c.clock_type === 'SAIDA');
      const almocoSaida = dayClocks.find(c => c.clock_type === 'ALMOCO_SAIDA');
      const almocoRetorno = dayClocks.find(c => c.clock_type === 'ALMOCO_RETORNO');

      if (entrada && saida) {
        let workMinutes = (saida.clock_time.getTime() - entrada.clock_time.getTime()) / (1000 * 60);
        if (almocoSaida && almocoRetorno) {
          const breakMinutes = (almocoRetorno.clock_time.getTime() - almocoSaida.clock_time.getTime()) / (1000 * 60);
          workMinutes -= breakMinutes;
        }

        totalWorkedMinutes += workMinutes;

        if (workMinutes > dailyWorkMinutes) {
          totalOvertimeMinutes += workMinutes - dailyWorkMinutes;
        }

        const hour = entrada.clock_time.getHours();
        const saidaHour = saida.clock_time.getHours();
        if (hour >= 22 || saidaHour < 5) {
          const nightStart = Math.max(hour, 22);
          const nightEnd = Math.min(saidaHour + (saidaHour < 5 ? 24 : 0), 29);
          totalNightMinutes += (nightEnd - nightStart) * 60;
        }
      } else {
        totalAbsenceDays++;
      }

      current.setDate(current.getDate() + 1);
    }

    const totalWorkedHours = Math.round((totalWorkedMinutes / 60) * 100) / 100;
    const totalOvertimeHours = Math.round((totalOvertimeMinutes / 60) * 100) / 100;
    const totalNightHours = Math.round((totalNightMinutes / 60) * 100) / 100;

    const employee = await this.prisma.employees.findUnique({
      where: { id: dto.employee_id },
      select: { id: true },
    });
    if (!employee) throw new NotFoundException('Colaborador não encontrado');

    const assignment = await this.prisma.assignments.findFirst({
      where: { employee_id: dto.employee_id, status: 'ATIVA' },
      select: { base_salary: true },
    });

    const hourlyRate = assignment?.base_salary ? Number(assignment.base_salary) / 220 : 0;
    const overtimeValue = Math.round(totalOvertimeHours * hourlyRate * 1.5 * 100) / 100;
    const nightAddValue = Math.round(totalNightHours * hourlyRate * 0.2 * 100) / 100;

    if (existing) {
      return this.prisma.time_sheets.update({
        where: { id: existing.id },
        data: {
          total_worked_hours: totalWorkedHours,
          total_overtime_hours: totalOvertimeHours,
          total_night_hours: totalNightHours,
          total_absence_days: totalAbsenceDays,
          total_justified_days: totalJustifiedDays,
          overtime_value: overtimeValue,
          night_add_value: nightAddValue,
          status: 'CALCULADO',
          calculated_at: new Date(),
        },
      });
    }

    return this.prisma.time_sheets.create({
      data: {
        employee_id: dto.employee_id,
        period_start: start,
        period_end: end,
        total_worked_hours: totalWorkedHours,
        total_overtime_hours: totalOvertimeHours,
        total_night_hours: totalNightHours,
        total_absence_days: totalAbsenceDays,
        total_justified_days: totalJustifiedDays,
        overtime_value: overtimeValue,
        night_add_value: nightAddValue,
        status: 'CALCULADO',
        calculated_at: new Date(),
      },
    });
  }

  async approve(id: string, userId: string) {
    const sheet = await this.findOne(id);
    if (sheet.status !== 'CALCULADO') {
      throw new BadRequestException('Espelho deve estar calculado para ser aprovado');
    }

    return this.prisma.time_sheets.update({
      where: { id },
      data: {
        status: 'APROVADO',
        approved_by: userId,
        approved_at: new Date(),
      },
    });
  }
}
