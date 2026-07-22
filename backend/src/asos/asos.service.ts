import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateAsoDto, UpdateAsoDto,
  AsoType, AsoResult, AsoStatus,
} from './dto/aso.dto';

@Injectable()
export class AsosService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    employee_id?: string;
    type?: AsoType;
    result?: AsoResult;
    status?: AsoStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, employee_id, type, result, status } = query;
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

    if (type) {
      where.type = type;
    }

    if (result) {
      where.result = result;
    }

    if (status) {
      where.status = status;
    }

    const [asos, total] = await Promise.all([
      this.prisma.asos.findMany({
        where,
        select: {
          id: true,
          employee_id: true,
          type: true,
          exam_date: true,
          expiry_date: true,
          doctor_name: true,
          doctor_crm: true,
          clinic_name: true,
          result: true,
          restrictions: true,
          document_url: true,
          status: true,
          is_mandatory: true,
          created_at: true,
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
        orderBy: { exam_date: 'desc' },
      }),
      this.prisma.asos.count({ where }),
    ]);

    return {
      data: asos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const aso = await this.prisma.asos.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            cpf: true,
            social_name: true,
            registration_number: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!aso) {
      throw new NotFoundException('ASO não encontrado');
    }

    return aso;
  }

  async create(dto: CreateAsoDto, userId?: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const aso = await this.prisma.asos.create({
      data: {
        employee_id: dto.employee_id,
        type: dto.type,
        exam_date: new Date(dto.exam_date),
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : null,
        doctor_name: dto.doctor_name,
        doctor_crm: dto.doctor_crm,
        clinic_name: dto.clinic_name,
        result: dto.result,
        restrictions: dto.restrictions,
        document_url: dto.document_url,
        status: dto.status ?? AsoStatus.VALIDO,
        is_mandatory: dto.is_mandatory ?? true,
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'asos',
        entityId: aso.id,
        newValues: {
          employee_id: dto.employee_id,
          type: dto.type,
          exam_date: dto.exam_date,
          result: dto.result,
        },
      });
    }

    return aso;
  }

  async update(id: string, dto: UpdateAsoDto, userId?: string) {
    const aso = await this.prisma.asos.findUnique({ where: { id } });

    if (!aso) {
      throw new NotFoundException('ASO não encontrado');
    }

    const updateData: any = { ...dto };

    if (dto.exam_date) {
      updateData.exam_date = new Date(dto.exam_date);
    }
    if (dto.expiry_date) {
      updateData.expiry_date = new Date(dto.expiry_date);
    }

    const updated = await this.prisma.asos.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'asos',
        entityId: id,
        oldValues: { type: aso.type, result: aso.result, status: aso.status },
        newValues: { type: updated.type, result: updated.result, status: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const aso = await this.prisma.asos.findUnique({ where: { id } });

    if (!aso) {
      throw new NotFoundException('ASO não encontrado');
    }

    await this.prisma.asos.update({
      where: { id },
      data: { status: AsoStatus.CANCELADO },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'asos',
        entityId: id,
        oldValues: { status: aso.status },
        newValues: { status: AsoStatus.CANCELADO },
      });
    }

    return { message: 'ASO cancelado com sucesso' };
  }

  async findExpiring() {
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    const asos = await this.prisma.asos.findMany({
      where: {
        status: AsoStatus.VALIDO,
        expiry_date: {
          lte: sixtyDaysFromNow,
          gte: now,
        },
      },
      select: {
        id: true,
        employee_id: true,
        type: true,
        exam_date: true,
        expiry_date: true,
        result: true,
        status: true,
        is_mandatory: true,
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

    return asos;
  }

  async getStats() {
    const [total, byType, byResult, byStatus] = await Promise.all([
      this.prisma.asos.count(),
      this.prisma.asos.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.asos.groupBy({
        by: ['result'],
        _count: true,
      }),
      this.prisma.asos.groupBy({
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
      byResult: byResult.reduce((acc, item) => {
        acc[item.result] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
