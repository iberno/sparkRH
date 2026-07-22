import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOvertimeDto, ReviewOvertimeDto, QueryOvertimeDto, OvertimeType, OvertimeStatus } from './dto/overtime.dto';

@Injectable()
export class OvertimeService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryOvertimeDto) {
    const { employee_id, post_id, status, start_date, end_date } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};
    if (employee_id) where.employee_id = employee_id;
    if (post_id) where.post_id = post_id;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.request_date = {};
      if (start_date) where.request_date.gte = new Date(start_date);
      if (end_date) where.request_date.lte = new Date(end_date);
    }

    const [requests, total] = await Promise.all([
      this.prisma.overtime_requests.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
          post: { select: { id: true, name: true, code: true } },
          reviewer: { select: { id: true, cpf: true } },
        },
        orderBy: { request_date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.overtime_requests.count({ where }),
    ]);

    return {
      data: requests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.overtime_requests.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, full_name: true, cpf: true, registration_number: true } },
        post: { select: { id: true, name: true, code: true } },
        reviewer: { select: { id: true, cpf: true } },
      },
    });
    if (!request) throw new NotFoundException('Solicitação de HE não encontrada');
    return request;
  }

  async create(dto: CreateOvertimeDto) {
    const totalHours = this.calculateHours(dto.start_time, dto.end_time);

    const config = await this.prisma.overtime_config.findFirst({
      where: { post_id: dto.post_id, is_active: true },
    });

    if (config) {
      const currentMonth = new Date(dto.request_date).getMonth();
      const currentYear = new Date(dto.request_date).getFullYear();

      const monthRequests = await this.prisma.overtime_requests.count({
        where: {
          employee_id: dto.employee_id,
          status: 'APROVADO',
          request_date: {
            gte: new Date(currentYear, currentMonth, 1),
            lte: new Date(currentYear, currentMonth + 1, 0),
          },
        },
      });

      if (monthRequests >= config.max_per_month) {
        throw new BadRequestException(
          `Limite de ${config.max_per_month} escalas HE/mês atingido`,
        );
      }
    }

    return this.prisma.overtime_requests.create({
      data: {
        employee_id: dto.employee_id,
        post_id: dto.post_id,
        request_date: new Date(dto.request_date),
        start_time: dto.start_time,
        end_time: dto.end_time,
        total_hours: totalHours,
        overtime_type: dto.overtime_type,
        reason: dto.reason,
        status: 'PENDENTE',
      },
    });
  }

  async review(id: string, dto: ReviewOvertimeDto, userId: string) {
    const request = await this.findOne(id);
    if (request.status !== 'PENDENTE') {
      throw new BadRequestException('Solicitação já foi avaliada');
    }

    return this.prisma.overtime_requests.update({
      where: { id },
      data: {
        status: dto.status,
        reviewed_by: userId,
        reviewed_at: new Date(),
        review_note: dto.review_note,
      },
    });
  }

  async stats(employeeId?: string, postId?: string) {
    const where: any = {};
    if (employeeId) where.employee_id = employeeId;
    if (postId) where.post_id = postId;

    const [total, pendentes, aprovados, rejeitados, horasAprovadas] = await Promise.all([
      this.prisma.overtime_requests.count({ where }),
      this.prisma.overtime_requests.count({ where: { ...where, status: 'PENDENTE' } }),
      this.prisma.overtime_requests.count({ where: { ...where, status: 'APROVADO' } }),
      this.prisma.overtime_requests.count({ where: { ...where, status: 'REJEITADO' } }),
      this.prisma.overtime_requests.aggregate({
        where: { ...where, status: 'APROVADO' },
        _sum: { total_hours: true },
      }),
    ]);

    return {
      total,
      pendentes,
      aprovados,
      rejeitados,
      horasAprovadas: Number(horasAprovadas._sum.total_hours) || 0,
    };
  }

  private calculateHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 1440;
    return Math.round(((endMin - startMin) / 60) * 100) / 100;
  }
}
