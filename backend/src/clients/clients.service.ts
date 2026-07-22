import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateClientDto, UpdateClientDto, ClientType } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    type?: ClientType;
    is_active?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, type } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnpj_cpf: { contains: search, mode: 'insensitive' } },
        { contact_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (query.is_active !== undefined) {
      where.is_active = query.is_active === 'true';
    }

    const [clients, total] = await Promise.all([
      this.prisma.clients.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          cnpj_cpf: true,
          contact_name: true,
          contact_phone: true,
          contact_email: true,
          city: true,
          state: true,
          is_active: true,
          created_at: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.clients.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const client = await this.prisma.clients.findFirst({
      where: { id, deleted_at: null },
      include: {
        _count: { select: { contracts: true } },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async create(dto: CreateClientDto, userId?: string) {
    const cnpj_cpf = dto.cnpj_cpf.replace(/\D/g, '');

    const existing = await this.prisma.clients.findFirst({
      where: { cnpj_cpf, deleted_at: null },
    });

    if (existing) {
      throw new ConflictException('CNPJ/CPF já cadastrado');
    }

    const client = await this.prisma.clients.create({
      data: {
        ...dto,
        cnpj_cpf,
        type: dto.type ?? ClientType.JURIDICA,
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'clients',
        entityId: client.id,
        newValues: { name: client.name, cnpj_cpf: client.cnpj_cpf },
      });
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto, userId?: string) {
    const client = await this.prisma.clients.findFirst({
      where: { id, deleted_at: null },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const updateData: any = { ...dto };

    if (dto.cnpj_cpf) {
      const cnpj_cpf = dto.cnpj_cpf.replace(/\D/g, '');

      if (cnpj_cpf !== client.cnpj_cpf) {
        const existing = await this.prisma.clients.findFirst({
          where: { cnpj_cpf, deleted_at: null },
        });

        if (existing) {
          throw new ConflictException('CNPJ/CPF já cadastrado');
        }
      }

      updateData.cnpj_cpf = cnpj_cpf;
    }

    const updated = await this.prisma.clients.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'clients',
        entityId: id,
        oldValues: { name: client.name, cnpj_cpf: client.cnpj_cpf },
        newValues: { name: updated.name, cnpj_cpf: updated.cnpj_cpf },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const client = await this.prisma.clients.findFirst({
      where: { id, deleted_at: null },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.prisma.clients.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'clients',
        entityId: id,
        oldValues: { name: client.name, is_active: client.is_active },
        newValues: { deleted_at: new Date().toISOString() },
      });
    }

    return { message: 'Cliente removido com sucesso' };
  }

  async getStats() {
    const whereActive = { deleted_at: null, is_active: true };

    const [total, active, byType] = await Promise.all([
      this.prisma.clients.count({ where: { deleted_at: null } }),
      this.prisma.clients.count({ where: whereActive }),
      this.prisma.clients.groupBy({
        by: ['type'],
        _count: true,
        where: { deleted_at: null },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
