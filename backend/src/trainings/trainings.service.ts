import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateTrainingDto, UpdateTrainingDto, TrainingCategory, TrainingStatus,
} from './dto/training.dto';

@Injectable()
export class TrainingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    employee_id?: string;
    category?: TrainingCategory;
    status?: TrainingStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, employee_id, category, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { certificate_number: { contains: search, mode: 'insensitive' } },
        { employee: { full_name: { contains: search, mode: 'insensitive' } } },
        { employee: { cpf: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const [trainings, total] = await Promise.all([
      this.prisma.trainings.findMany({
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
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { start_date: 'desc' },
      }),
      this.prisma.trainings.count({ where }),
    ]);

    return {
      data: trainings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const training = await this.prisma.trainings.findUnique({
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
      },
    });

    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    return training;
  }

  async create(dto: CreateTrainingDto, userId?: string) {
    const training = await this.prisma.trainings.create({
      data: {
        employee_id: dto.employee_id,
        name: dto.name,
        category: dto.category,
        provider: dto.provider,
        workload: dto.workload,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : null,
        certificate_number: dto.certificate_number,
        certificate_url: dto.certificate_url,
        status: dto.status || TrainingStatus.CONCLUIDO,
      },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            cpf: true,
            registration_number: true,
          },
        },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'trainings',
        entityId: training.id,
        newValues: { name: training.name, category: training.category, employee_id: training.employee_id },
      });
    }

    return training;
  }

  async update(id: string, dto: UpdateTrainingDto, userId?: string) {
    const training = await this.prisma.trainings.findUnique({ where: { id } });

    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    const updateData: any = { ...dto };

    if (dto.start_date) {
      updateData.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      updateData.end_date = new Date(dto.end_date);
    }
    if (dto.expiry_date) {
      updateData.expiry_date = new Date(dto.expiry_date);
    }

    const updated = await this.prisma.trainings.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'trainings',
        entityId: id,
        oldValues: { name: training.name, status: training.status },
        newValues: { name: updated.name, status: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const training = await this.prisma.trainings.findUnique({ where: { id } });

    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    await this.prisma.trainings.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'trainings',
        entityId: id,
        oldValues: { status: training.status },
        newValues: { status: 'CANCELADO' },
      });
    }

    return { message: 'Treinamento cancelado com sucesso' };
  }

  async findExpiring() {
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    const trainings = await this.prisma.trainings.findMany({
      where: {
        status: 'CONCLUIDO',
        expiry_date: {
          not: null,
          gte: now,
          lte: ninetyDaysFromNow,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            cpf: true,
            registration_number: true,
          },
        },
      },
      orderBy: { expiry_date: 'asc' },
    });

    return trainings;
  }

  async getStats() {
    const [total, byCategory, byStatus] = await Promise.all([
      this.prisma.trainings.count(),
      this.prisma.trainings.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.trainings.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
