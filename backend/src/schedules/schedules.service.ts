import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScheduleDto, UpdateScheduleDto, GenerateSchedulesDto,
  BulkUpdateSchedulesDto, ScheduleStatus,
} from './dto/schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    post_id?: string;
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    status?: ScheduleStatus;
    page?: number;
    limit?: number;
  }) {
    const { post_id, employee_id, start_date, end_date, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};
    if (post_id) where.post_id = post_id;
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.schedule_date = {};
      if (start_date) where.schedule_date.gte = new Date(start_date);
      if (end_date) where.schedule_date.lte = new Date(end_date);
    }

    const [schedules, total] = await Promise.all([
      this.prisma.generated_schedules.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
          post: { select: { id: true, name: true, code: true } },
        },
        orderBy: { schedule_date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generated_schedules.count({ where }),
    ]);

    return {
      data: schedules,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const schedule = await this.prisma.generated_schedules.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
        post: { select: { id: true, name: true, code: true, schedule_type: true } },
      },
    });
    if (!schedule) throw new NotFoundException('Escala não encontrada');
    return schedule;
  }

  async findTemplates(postId?: string) {
    const where: any = {};
    if (postId) where.post_id = postId;

    return this.prisma.post_schedules.findMany({
      where,
      include: { post: { select: { id: true, name: true, code: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findTemplate(id: string) {
    const template = await this.prisma.post_schedules.findUnique({
      where: { id },
      include: { post: { select: { id: true, name: true, code: true } } },
    });
    if (!template) throw new NotFoundException('Modelo de escala não encontrado');
    return template;
  }

  async createTemplate(dto: CreateScheduleDto) {
    return this.prisma.post_schedules.create({
      data: {
        post_id: dto.post_id,
        name: dto.name,
        start_time: dto.start_time,
        end_time: dto.end_time,
        days_of_week: dto.days_of_week.join(','),
        schedule_type: dto.schedule_type || 'FIXA',
        rotation_pattern: dto.rotation_pattern,
        rotation_offset: dto.rotation_offset || 0,
        is_default: dto.is_default || false,
      },
    });
  }

  async updateTemplate(id: string, dto: UpdateScheduleDto) {
    await this.findTemplate(id);
    const data: any = { ...dto };
    if (dto.days_of_week) data.days_of_week = dto.days_of_week.join(',');

    return this.prisma.post_schedules.update({ where: { id }, data });
  }

  async removeTemplate(id: string) {
    await this.findTemplate(id);
    return this.prisma.post_schedules.delete({ where: { id } });
  }

  async generateSchedules(dto: GenerateSchedulesDto) {
    const schedule = await this.findTemplate(dto.schedule_id);
    if (schedule.post_id !== dto.post_id) {
      throw new BadRequestException('Escala não pertence a este posto');
    }

    const post = await this.prisma.work_posts.findUnique({
      where: { id: dto.post_id },
      select: { id: true, required_vacancies: true },
    });

    if (!post) throw new BadRequestException('Posto não encontrado');

    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    const days = schedule.days_of_week.split(',');
    const pattern = schedule.rotation_pattern;
    const patternCycle = pattern ? this.parseRotationPattern(pattern) : null;

    let generatedCount = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay().toString();
      const dayOfMonth = current.getDate();

      let shouldWork = false;
      if (schedule.schedule_type === 'ROTATIVA' && patternCycle) {
        const offset = schedule.rotation_offset || 0;
        const dayInCycle = (dayOfMonth + offset) % patternCycle.total;
        shouldWork = dayInCycle < patternCycle.workDays;
      } else {
        shouldWork = days.includes(dayOfWeek);
      }

      if (shouldWork) {
        for (const empId of dto.employee_ids) {
          const existing = await this.prisma.generated_schedules.findFirst({
            where: {
              post_id: dto.post_id,
              employee_id: empId,
              schedule_date: current,
            },
          });

          if (!existing) {
            const conflicts = await this.checkConflicts(empId, current, schedule.start_time, schedule.end_time);
            if (conflicts.length > 0) {
              continue;
            }

            const created = await this.prisma.generated_schedules.create({
              data: {
                post_id: dto.post_id,
                employee_id: empId,
                schedule_date: current,
                shift_name: schedule.name,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                status: 'PROGRAMADO',
              },
            });
            generatedCount++;
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return { generated: generatedCount };
  }

  private parseRotationPattern(pattern: string) {
    const parts = pattern.split('x');
    if (parts.length === 2) {
      const workDays = parseInt(parts[0]);
      const restDays = parseInt(parts[1]);
      return { workDays, restDays, total: workDays + restDays };
    }
    return null;
  }

  private async checkConflicts(employeeId: string, date: Date, startTime: string, endTime: string) {
    return this.prisma.generated_schedules.findMany({
      where: {
        employee_id: employeeId,
        schedule_date: date,
        status: { not: 'CANCELADO' },
      },
    });
  }

  async getCalendar(postId: string, startDate: string, endDate: string) {
    const schedules = await this.prisma.generated_schedules.findMany({
      where: {
        post_id: postId,
        schedule_date: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      include: {
        employee: { select: { id: true, full_name: true, registration_number: true } },
      },
      orderBy: [{ schedule_date: 'asc' }, { start_time: 'asc' }],
    });

    const calendar: Record<string, any[]> = {};
    for (const s of schedules) {
      const dateKey = s.schedule_date.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({
        id: s.id,
        employee: s.employee,
        shift_name: s.shift_name,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
      });
    }

    return calendar;
  }

  async getConflicts(postId: string, startDate: string, endDate: string) {
    const schedules = await this.prisma.generated_schedules.findMany({
      where: {
        post_id: postId,
        schedule_date: { gte: new Date(startDate), lte: new Date(endDate) },
        status: { not: 'CANCELADO' },
      },
      include: {
        employee: { select: { id: true, full_name: true } },
      },
    });

    const employeeSchedules: Record<string, any[]> = {};
    for (const s of schedules) {
      const empId = s.employee_id;
      if (!employeeSchedules[empId]) employeeSchedules[empId] = [];
      employeeSchedules[empId].push(s);
    }

    const conflicts: any[] = [];
    for (const [empId, empSchedules] of Object.entries(employeeSchedules)) {
      for (let i = 0; i < empSchedules.length; i++) {
        for (let j = i + 1; j < empSchedules.length; j++) {
          const a = empSchedules[i];
          const b = empSchedules[j];
          if (a.schedule_date.getTime() === b.schedule_date.getTime() &&
              a.id !== b.id &&
              this.timeOverlaps(a.start_time, a.end_time, b.start_time, b.end_time)) {
            conflicts.push({
              employee: a.employee,
              date: a.schedule_date,
              schedule_a: { id: a.id, shift_name: a.shift_name, start_time: a.start_time, end_time: a.end_time },
              schedule_b: { id: b.id, shift_name: b.shift_name, start_time: b.start_time, end_time: b.end_time },
            });
          }
        }
      }
    }

    return conflicts;
  }

  private timeOverlaps(startA: string, endA: string, startB: string, endB: string): boolean {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const sA = toMinutes(startA);
    const eA = endA < startA ? toMinutes(endA) + 1440 : toMinutes(endA);
    const sB = toMinutes(startB);
    const eB = endB < startB ? toMinutes(endB) + 1440 : toMinutes(endB);
    return sA < eB && sB < eA;
  }

  async bulkUpdate(dto: BulkUpdateSchedulesDto) {
    const updates = dto.ids.map(id => {
      const data: any = {};
      if (dto.status) data.status = dto.status;
      if (dto.shift_name) data.shift_name = dto.shift_name;
      if (dto.start_time) data.start_time = dto.start_time;
      if (dto.end_time) data.end_time = dto.end_time;
      return this.prisma.generated_schedules.update({ where: { id }, data });
    });

    return this.prisma.$transaction(updates);
  }

  async updateGeneratedStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.generated_schedules.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.generated_schedules.delete({ where: { id } });
  }

  async stats(postId?: string) {
    const where: any = {};
    if (postId) where.post_id = postId;

    const [total, programado, confirmado, ausente, cancelado] = await Promise.all([
      this.prisma.generated_schedules.count({ where }),
      this.prisma.generated_schedules.count({ where: { ...where, status: 'PROGRAMADO' } }),
      this.prisma.generated_schedules.count({ where: { ...where, status: 'CONFIRMADO' } }),
      this.prisma.generated_schedules.count({ where: { ...where, status: 'AUSENTE' } }),
      this.prisma.generated_schedules.count({ where: { ...where, status: 'CANCELADO' } }),
    ]);

    return { total, programado, confirmado, ausente, cancelado };
  }
}
