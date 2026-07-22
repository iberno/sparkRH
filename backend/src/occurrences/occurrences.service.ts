import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateOccurrenceDto, UpdateOccurrenceDto, ResolveOccurrenceDto,
  OccurrenceStatus,
} from './dto/occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    employee_id?: string;
    post_id?: string;
    type?: string;
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, employee_id, post_id, type, severity, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { actions_taken: { contains: search, mode: 'insensitive' } },
        { employee: { full_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (employee_id) where.employee_id = employee_id;
    if (post_id) where.post_id = post_id;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [occurrences, total] = await Promise.all([
      this.prisma.occurrences.findMany({
        where,
        select: {
          id: true,
          type: true,
          description: true,
          severity: true,
          status: true,
          occurrence_date: true,
          photo_urls: true,
          employee_id: true,
          post_id: true,
          registered_by: true,
          actions_taken: true,
          resolved_by: true,
          resolved_at: true,
          created_at: true,
          employee: {
            select: { full_name: true, cpf: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { occurrence_date: 'desc' },
      }),
      this.prisma.occurrences.count({ where }),
    ]);

    return {
      data: occurrences,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const occurrence = await this.prisma.occurrences.findUnique({
      where: { id },
      include: {
        employee: {
          select: { full_name: true, cpf: true },
        },
      },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    return occurrence;
  }

  async create(dto: CreateOccurrenceDto, userId?: string) {
    const occurrence = await this.prisma.occurrences.create({
      data: {
        ...dto,
        occurrence_date: new Date(dto.occurrence_date),
        status: OccurrenceStatus.REGISTRADA,
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'occurrences',
        entityId: occurrence.id,
        newValues: { type: occurrence.type, description: occurrence.description },
      });
    }

    return occurrence;
  }

  async update(id: string, dto: UpdateOccurrenceDto, userId?: string) {
    const occurrence = await this.prisma.occurrences.findUnique({ where: { id } });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    const updateData: any = { ...dto };

    if (dto.occurrence_date) {
      updateData.occurrence_date = new Date(dto.occurrence_date);
    }

    const updated = await this.prisma.occurrences.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'occurrences',
        entityId: id,
        oldValues: { type: occurrence.type, status: occurrence.status },
        newValues: { type: updated.type, status: updated.status },
      });
    }

    return updated;
  }

  async resolve(id: string, dto: ResolveOccurrenceDto, userId?: string) {
    const occurrence = await this.prisma.occurrences.findUnique({ where: { id } });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    const updated = await this.prisma.occurrences.update({
      where: { id },
      data: {
        status: OccurrenceStatus.RESOLVIDA,
        actions_taken: dto.actions_taken,
        resolved_by: dto.resolved_by,
        resolved_at: new Date(),
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'occurrences',
        entityId: id,
        oldValues: { status: occurrence.status },
        newValues: { status: OccurrenceStatus.RESOLVIDA, actions_taken: dto.actions_taken },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const occurrence = await this.prisma.occurrences.findUnique({ where: { id } });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    await this.prisma.occurrences.update({
      where: { id },
      data: { status: OccurrenceStatus.CANCELADA },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'occurrences',
        entityId: id,
        oldValues: { status: occurrence.status },
        newValues: { status: OccurrenceStatus.CANCELADA },
      });
    }

    return { message: 'Ocorrência cancelada com sucesso' };
  }

  async getStats() {
    const [total, byType, bySeverity, byStatus] = await Promise.all([
      this.prisma.occurrences.count(),
      this.prisma.occurrences.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.occurrences.groupBy({
        by: ['severity'],
        _count: true,
      }),
      this.prisma.occurrences.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        const key = item.severity ?? 'NAO_INFORMADO';
        acc[key] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
