import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateVehicleDto, UpdateVehicleDto, VehicleStatus,
} from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    status?: VehicleStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicles.findMany({
        where,
        select: {
          id: true,
          plate: true,
          model: true,
          brand: true,
          year: true,
          color: true,
          fuel_type: true,
          km_current: true,
          insurance_expiry: true,
          licensing_expiry: true,
          status: true,
          created_at: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { model: 'asc' },
      }),
      this.prisma.vehicles.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: 'ATIVA' },
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
          orderBy: { start_date: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, userId?: string) {
    const plate = dto.plate.toUpperCase().replace(/\s/g, '');

    const existing = await this.prisma.vehicles.findUnique({
      where: { plate },
    });

    if (existing) {
      throw new ConflictException('Placa já cadastrada');
    }

    const vehicle = await this.prisma.vehicles.create({
      data: {
        ...dto,
        plate,
        insurance_expiry: dto.insurance_expiry ? new Date(dto.insurance_expiry) : null,
        licensing_expiry: dto.licensing_expiry ? new Date(dto.licensing_expiry) : null,
        status: dto.status || 'ATIVO',
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'vehicles',
        entityId: vehicle.id,
        newValues: { plate: vehicle.plate, model: vehicle.model, brand: vehicle.brand },
      });
    }

    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, userId?: string) {
    const vehicle = await this.prisma.vehicles.findUnique({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (dto.plate && dto.plate !== vehicle.plate) {
      const plate = dto.plate.toUpperCase().replace(/\s/g, '');
      const existing = await this.prisma.vehicles.findUnique({ where: { plate } });

      if (existing) {
        throw new ConflictException('Placa já cadastrada');
      }
    }

    const updateData: any = { ...dto };

    if (dto.plate) {
      updateData.plate = dto.plate.toUpperCase().replace(/\s/g, '');
    }
    if (dto.insurance_expiry) {
      updateData.insurance_expiry = new Date(dto.insurance_expiry);
    }
    if (dto.licensing_expiry) {
      updateData.licensing_expiry = new Date(dto.licensing_expiry);
    }

    const updated = await this.prisma.vehicles.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'vehicles',
        entityId: id,
        oldValues: { plate: vehicle.plate, model: vehicle.model, status: vehicle.status },
        newValues: { plate: updated.plate, model: updated.model, status: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const vehicle = await this.prisma.vehicles.findUnique({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    await this.prisma.vehicles.update({
      where: { id },
      data: { status: 'INATIVO' },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'vehicles',
        entityId: id,
        oldValues: { status: vehicle.status },
        newValues: { status: 'INATIVO' },
      });
    }

    return { message: 'Veículo desativado com sucesso' };
  }

  async findAlerts() {
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const vehicles = await this.prisma.vehicles.findMany({
      where: {
        status: 'ATIVO',
        OR: [
          {
            insurance_expiry: {
              not: null,
              lte: sixtyDaysFromNow,
              gte: new Date(),
            },
          },
          {
            licensing_expiry: {
              not: null,
              lte: sixtyDaysFromNow,
              gte: new Date(),
            },
          },
        ],
      },
      select: {
        id: true,
        plate: true,
        model: true,
        brand: true,
        insurance_expiry: true,
        licensing_expiry: true,
        status: true,
      },
      orderBy: { insurance_expiry: 'asc' },
    });

    return vehicles;
  }

  async getStats() {
    const [total, active, byStatus] = await Promise.all([
      this.prisma.vehicles.count(),
      this.prisma.vehicles.count({ where: { status: 'ATIVO' } }),
      this.prisma.vehicles.groupBy({
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
