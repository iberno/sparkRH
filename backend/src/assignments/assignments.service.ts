import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateAssignmentDto, UpdateAssignmentDto,
  AssignmentStatus,
} from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    employee_id?: string;
    post_id?: string;
    status?: AssignmentStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, employee_id, post_id, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { employee: { full_name: { contains: search, mode: 'insensitive' } } },
        { employee: { cpf: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (post_id) {
      where.post_id = post_id;
    }

    if (status) {
      where.status = status;
    }

    const [assignments, total] = await Promise.all([
      this.prisma.assignments.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
              cpf: true,
              registration_number: true,
            },
          },
          post: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.assignments.count({ where }),
    ]);

    return {
      data: assignments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const assignment = await this.prisma.assignments.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            cpf: true,
            registration_number: true,
          },
        },
        post: {
          select: {
            id: true,
            name: true,
            code: true,
            contract: {
              select: {
                id: true,
                contract_number: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Alocação não encontrada');
    }

    return assignment;
  }

  async create(dto: CreateAssignmentDto, userId?: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    if (employee.status !== 'ATIVO') {
      throw new BadRequestException('Colaborador não está ativo');
    }

    const post = await this.prisma.work_posts.findUnique({
      where: { id: dto.post_id },
    });

    if (!post) {
      throw new NotFoundException('Posto não encontrado');
    }

    if (post.status !== 'ATIVO') {
      throw new BadRequestException('Posto não está ativo');
    }

    const startDate = new Date(dto.start_date);
    const endDate = dto.end_date ? new Date(dto.end_date) : null;

    const conflicting = await this.prisma.assignments.findFirst({
      where: {
        employee_id: dto.employee_id,
        status: { in: ['ATIVA', 'SUSPENSA'] },
        OR: [
          {
            start_date: { lte: endDate || new Date('9999-12-31') },
            end_date: null,
          },
          {
            start_date: { lte: endDate || new Date('9999-12-31') },
            end_date: { gte: startDate },
          },
        ],
      },
    });

    if (conflicting) {
      throw new ConflictException('Colaborador já possui alocação ativa/suspensa neste período');
    }

    const activeCount = await this.prisma.assignments.count({
      where: {
        post_id: dto.post_id,
        status: 'ATIVA',
      },
    });

    if (activeCount >= post.required_vacancies) {
      throw new ConflictException(`Posto já atingiu o limite de ${post.required_vacancies} vagas`);
    }

    const assignment = await this.prisma.assignments.create({
      data: {
        employee_id: dto.employee_id,
        post_id: dto.post_id,
        start_date: startDate,
        end_date: endDate,
        shift: dto.shift,
        position: dto.position,
        base_salary: dto.base_salary,
        additional: dto.additional ?? 0,
        status: 'ATIVA',
      },
      include: {
        employee: {
          select: { id: true, full_name: true, cpf: true },
        },
        post: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'assignments',
        entityId: assignment.id,
        newValues: {
          employee_id: assignment.employee_id,
          post_id: assignment.post_id,
          start_date: assignment.start_date,
          status: assignment.status,
        },
      });
    }

    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, userId?: string) {
    const assignment = await this.prisma.assignments.findUnique({ where: { id } });

    if (!assignment) {
      throw new NotFoundException('Alocação não encontrada');
    }

    const updateData: any = { ...dto };

    if (dto.start_date) {
      updateData.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      updateData.end_date = new Date(dto.end_date);
    }

    const updated = await this.prisma.assignments.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: { id: true, full_name: true, cpf: true },
        },
        post: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'assignments',
        entityId: id,
        oldValues: {
          employee_id: assignment.employee_id,
          post_id: assignment.post_id,
          status: assignment.status,
        },
        newValues: {
          employee_id: updated.employee_id,
          post_id: updated.post_id,
          status: updated.status,
        },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const assignment = await this.prisma.assignments.findUnique({ where: { id } });

    if (!assignment) {
      throw new NotFoundException('Alocação não encontrada');
    }

    const updated = await this.prisma.assignments.update({
      where: { id },
      data: { status: 'ENCERRADA', end_date: new Date() },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'assignments',
        entityId: id,
        oldValues: { status: assignment.status },
        newValues: { status: 'ENCERRADA' },
      });
    }

    return { message: 'Alocação encerrada com sucesso' };
  }

  async getStats() {
    const [total, active, byStatus] = await Promise.all([
      this.prisma.assignments.count(),
      this.prisma.assignments.count({ where: { status: 'ATIVA' } }),
      this.prisma.assignments.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
