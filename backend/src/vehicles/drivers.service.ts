import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateDriverDto, UpdateDriverDto, DriverStatus,
} from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    status?: DriverStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { cnh_number: { contains: search, mode: 'insensitive' } },
        {
          employee: {
            full_name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          employee: {
            cpf: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [drivers, total] = await Promise.all([
      this.prisma.drivers.findMany({
        where,
        select: {
          id: true,
          cnh_number: true,
          cnh_category: true,
          cnh_expiry: true,
          cfc_name: true,
          cfc_validity: true,
          status: true,
          created_at: true,
          employee: {
            select: {
              id: true,
              full_name: true,
              registration_number: true,
              cpf: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { employee: { full_name: 'asc' } },
      }),
      this.prisma.drivers.count({ where }),
    ]);

    return {
      data: drivers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const driver = await this.prisma.drivers.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
            cpf: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    return driver;
  }

  async create(dto: CreateDriverDto, userId?: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const existingCnh = await this.prisma.drivers.findUnique({
      where: { cnh_number: dto.cnh_number },
    });

    if (existingCnh) {
      throw new ConflictException('CNH já cadastrada');
    }

    const driver = await this.prisma.drivers.create({
      data: {
        ...dto,
        cnh_expiry: new Date(dto.cnh_expiry),
        cfc_validity: dto.cfc_validity ? new Date(dto.cfc_validity) : null,
        status: dto.status || 'ATIVO',
      },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
            cpf: true,
          },
        },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'drivers',
        entityId: driver.id,
        newValues: {
          cnh_number: driver.cnh_number,
          cnh_category: driver.cnh_category,
          employee_name: employee.full_name,
        },
      });
    }

    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, userId?: string) {
    const driver = await this.prisma.drivers.findUnique({ where: { id } });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    if (dto.cnh_number && dto.cnh_number !== driver.cnh_number) {
      const existing = await this.prisma.drivers.findUnique({
        where: { cnh_number: dto.cnh_number },
      });

      if (existing) {
        throw new ConflictException('CNH já cadastrada');
      }
    }

    if (dto.employee_id) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: dto.employee_id },
      });

      if (!employee) {
        throw new NotFoundException('Colaborador não encontrado');
      }
    }

    const updateData: any = { ...dto };

    if (dto.cnh_expiry) {
      updateData.cnh_expiry = new Date(dto.cnh_expiry);
    }
    if (dto.cfc_validity) {
      updateData.cfc_validity = new Date(dto.cfc_validity);
    }

    const updated = await this.prisma.drivers.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
            cpf: true,
          },
        },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'drivers',
        entityId: id,
        oldValues: {
          cnh_number: driver.cnh_number,
          cnh_category: driver.cnh_category,
          status: driver.status,
        },
        newValues: {
          cnh_number: updated.cnh_number,
          cnh_category: updated.cnh_category,
          status: updated.status,
        },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const driver = await this.prisma.drivers.findUnique({ where: { id } });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    await this.prisma.drivers.update({
      where: { id },
      data: { status: 'INATIVO' },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'drivers',
        entityId: id,
        oldValues: { status: driver.status },
        newValues: { status: 'INATIVO' },
      });
    }

    return { message: 'Motorista desativado com sucesso' };
  }

  async findAlerts() {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const drivers = await this.prisma.drivers.findMany({
      where: {
        status: 'ATIVO',
        OR: [
          {
            cnh_expiry: {
              lte: ninetyDaysFromNow,
              gte: new Date(),
            },
          },
          {
            cfc_validity: {
              lte: ninetyDaysFromNow,
              gte: new Date(),
            },
          },
        ],
      },
      select: {
        id: true,
        cnh_number: true,
        cnh_category: true,
        cnh_expiry: true,
        cfc_name: true,
        cfc_validity: true,
        status: true,
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
          },
        },
      },
      orderBy: { cnh_expiry: 'asc' },
    });

    return drivers;
  }

  async getStats() {
    const [total, active, byStatus] = await Promise.all([
      this.prisma.drivers.count(),
      this.prisma.drivers.count({ where: { status: 'ATIVO' } }),
      this.prisma.drivers.groupBy({
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
