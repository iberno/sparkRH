import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClockEntryDto, UpdateTimeClockDto, JustifyTimeClockDto, QueryTimeClocksDto,
} from './dto/time-clock.dto';

@Injectable()
export class TimeClocksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTimeClocksDto) {
    const { employee_id, post_id, start_date, end_date, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};
    if (employee_id) where.employee_id = employee_id;
    if (post_id) where.post_id = post_id;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.clock_time = {};
      if (start_date) where.clock_time.gte = new Date(start_date);
      if (end_date) where.clock_time.lte = new Date(end_date);
    }

    const [clocks, total] = await Promise.all([
      this.prisma.time_clocks.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
          post: { select: { id: true, name: true, code: true } },
          approver: { select: { id: true, cpf: true } },
        },
        orderBy: { clock_time: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.time_clocks.count({ where }),
    ]);

    return {
      data: clocks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const clock = await this.prisma.time_clocks.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
        post: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, cpf: true } },
        time_clock_adjustments: true,
      },
    });
    if (!clock) throw new NotFoundException('Registro de ponto não encontrado');
    return clock;
  }

  async findByEmployee(employeeId: string, startDate?: string, endDate?: string) {
    const where: any = { employee_id: employeeId };
    if (startDate || endDate) {
      where.clock_time = {};
      if (startDate) where.clock_time.gte = new Date(startDate);
      if (endDate) where.clock_time.lte = new Date(endDate);
    }

    return this.prisma.time_clocks.findMany({
      where,
      include: {
        post: { select: { id: true, name: true, code: true } },
      },
      orderBy: { clock_time: 'desc' },
    });
  }

  async findIrregularities(query: QueryTimeClocksDto) {
    const { employee_id, post_id, start_date, end_date } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {
      irregularity: { not: null },
      status: { not: 'APROVADO' },
    };
    if (employee_id) where.employee_id = employee_id;
    if (post_id) where.post_id = post_id;
    if (start_date || end_date) {
      where.clock_time = {};
      if (start_date) where.clock_time.gte = new Date(start_date);
      if (end_date) where.clock_time.lte = new Date(end_date);
    }

    const [clocks, total] = await Promise.all([
      this.prisma.time_clocks.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
          post: { select: { id: true, name: true, code: true } },
        },
        orderBy: { clock_time: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.time_clocks.count({ where }),
    ]);

    return {
      data: clocks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async clockEntry(dto: ClockEntryDto) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastClock = await this.prisma.time_clocks.findFirst({
      where: {
        employee_id: dto.employee_id,
        post_id: dto.post_id,
        clock_time: { gte: today },
      },
      orderBy: { clock_time: 'desc' },
    });

    let clockType = dto.clock_type;
    if (!clockType) {
      if (!lastClock) {
        clockType = 'ENTRADA';
      } else if (lastClock.clock_type === 'ENTRADA') {
        clockType = 'ALMOCO_SAIDA';
      } else if (lastClock.clock_type === 'ALMOCO_SAIDA') {
        clockType = 'ALMOCO_RETORNO';
      } else if (lastClock.clock_type === 'ALMOCO_RETORNO') {
        clockType = 'SAIDA';
      } else {
        throw new BadRequestException('Ponto já registrado para hoje');
      }
    }

    if (lastClock && lastClock.clock_type === clockType && clockType === 'SAIDA') {
      throw new BadRequestException('Saída já registrada para hoje');
    }

    let irregularity: string | undefined;
    if (clockType === 'SAIDA' && lastClock && lastClock.clock_type === 'ALMOCO_RETORNO') {
      const workedMs = now.getTime() - lastClock.clock_time.getTime();
      const workedHours = workedMs / (1000 * 60 * 60);
      if (workedHours > 10) {
        irregularity = 'HORAS_EXCESSIVAS';
      }
    }

    if (clockType !== 'ENTRADA' && !lastClock) {
      throw new BadRequestException('Registrar entrada primeiro');
    }

    const toleranceMs = 15 * 60 * 1000;
    if (lastClock && clockType === 'ALMOCO_RETORNO') {
      const breakMs = now.getTime() - lastClock.clock_time.getTime();
      if (breakMs < 30 * 60 * 1000) {
        irregularity = 'INTERVALO_CURTO';
      }
    }

    return this.prisma.time_clocks.create({
      data: {
        employee_id: dto.employee_id,
        post_id: dto.post_id,
        clock_type: clockType,
        clock_time: now,
        latitude: dto.latitude,
        longitude: dto.longitude,
        gps_accuracy: dto.gps_accuracy,
        auth_method: dto.auth_method,
        photo_url: dto.photo_url,
        source: dto.source || 'WEB',
        irregularity,
      },
    });
  }

  async approve(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.time_clocks.update({
      where: { id },
      data: {
        status: 'APROVADO',
        approved_by: userId,
        approved_at: new Date(),
      },
    });
  }

  async justify(id: string, dto: JustifyTimeClockDto) {
    await this.findOne(id);
    return this.prisma.time_clocks.update({
      where: { id },
      data: {
        justification: dto.justification,
        status: 'JUSTIFICADO',
      },
    });
  }

  async stats(employeeId?: string, postId?: string) {
    const where: any = {};
    if (employeeId) where.employee_id = employeeId;
    if (postId) where.post_id = postId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalToday, pendentes, aprovados, irregularidades, totalMes] = await Promise.all([
      this.prisma.time_clocks.count({
        where: { ...where, clock_time: { gte: today, lt: tomorrow } },
      }),
      this.prisma.time_clocks.count({
        where: { ...where, status: 'PENDENTE' },
      }),
      this.prisma.time_clocks.count({
        where: { ...where, status: 'APROVADO' },
      }),
      this.prisma.time_clocks.count({
        where: { ...where, irregularity: { not: null }, status: { not: 'APROVADO' } },
      }),
      this.prisma.time_clocks.count({
        where: {
          ...where,
          clock_time: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
        },
      }),
    ]);

    return { totalToday, pendentes, aprovados, irregularidades, totalMes };
  }
}
