import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateContractDto, UpdateContractDto,
  QueryContractsDto, ContractStatus,
} from './dto/contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: QueryContractsDto) {
    const { search, client_id, company_id, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { contract_number: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (client_id) {
      where.client_id = client_id;
    }

    if (company_id) {
      where.company_id = company_id;
    }

    if (status) {
      where.status = status;
    }

    const [contracts, total] = await Promise.all([
      this.prisma.contracts.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.contracts.count({ where }),
    ]);

    return {
      data: contracts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const contract = await this.prisma.contracts.findFirst({
      where: { id, deleted_at: null },
      include: {
        client: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        _count: { select: { work_posts: true } },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contract;
  }

  async create(dto: CreateContractDto, userId?: string) {
    const existing = await this.prisma.contracts.findFirst({
      where: { contract_number: dto.contract_number, deleted_at: null },
    });

    if (existing) {
      throw new ConflictException('Número de contrato já cadastrado');
    }

    const contract = await this.prisma.contracts.create({
      data: {
        client_id: dto.client_id,
        company_id: dto.company_id,
        contract_number: dto.contract_number,
        description: dto.description,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        renewal_date: dto.renewal_date ? new Date(dto.renewal_date) : null,
        monthly_value: dto.monthly_value,
        hourly_value: dto.hourly_value,
        total_value: dto.total_value,
        payment_terms: dto.payment_terms,
        payment_day: dto.payment_day,
        payment_method: dto.payment_method,
        billing_cycle: dto.billing_cycle,
        notes: dto.notes,
      },
      include: {
        client: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'contracts',
        entityId: contract.id,
        newValues: { contract_number: contract.contract_number },
      });
    }

    return contract;
  }

  async update(id: string, dto: UpdateContractDto, userId?: string) {
    const contract = await this.prisma.contracts.findFirst({
      where: { id, deleted_at: null },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (dto.contract_number && dto.contract_number !== contract.contract_number) {
      const duplicate = await this.prisma.contracts.findFirst({
        where: { contract_number: dto.contract_number, deleted_at: null, id: { not: id } },
      });

      if (duplicate) {
        throw new ConflictException('Número de contrato já cadastrado');
      }
    }

    const updateData: any = { ...dto };

    if (dto.start_date) {
      updateData.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      updateData.end_date = new Date(dto.end_date);
    }
    if (dto.renewal_date) {
      updateData.renewal_date = new Date(dto.renewal_date);
    }

    const updated = await this.prisma.contracts.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'contracts',
        entityId: id,
        oldValues: { contract_number: contract.contract_number, status: contract.status },
        newValues: { contract_number: updated.contract_number, status: updated.status },
      });
    }

    return updated;
  }

  async updateStatus(id: string, status: ContractStatus, userId?: string) {
    const contract = await this.prisma.contracts.findFirst({
      where: { id, deleted_at: null },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    const allowedTransitions: Record<string, string[]> = {
      ATIVO: ['SUSPENSO', 'EM_RENOVACAO', 'ENCERRADO'],
      SUSPENSO: ['ATIVO'],
      EM_RENOVACAO: ['ATIVO', 'ENCERRADO'],
    };

    const allowed = allowedTransitions[contract.status];

    if (!allowed || !allowed.includes(status)) {
      throw new ConflictException(
        `Transição de status inválida: ${contract.status} → ${status}`,
      );
    }

    const updated = await this.prisma.contracts.update({
      where: { id },
      data: { status },
      include: {
        client: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'contracts',
        entityId: id,
        oldValues: { status: contract.status },
        newValues: { status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const contract = await this.prisma.contracts.findFirst({
      where: { id, deleted_at: null },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    await this.prisma.contracts.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'contracts',
        entityId: id,
        oldValues: { contract_number: contract.contract_number, status: contract.status },
        newValues: { deleted_at: new Date().toISOString() },
      });
    }

    return { message: 'Contrato removido com sucesso' };
  }

  async getStats() {
    const [total, byStatus, totalValue] = await Promise.all([
      this.prisma.contracts.count({ where: { deleted_at: null } }),
      this.prisma.contracts.groupBy({
        by: ['status'],
        where: { deleted_at: null },
        _count: true,
      }),
      this.prisma.contracts.aggregate({
        where: { deleted_at: null },
        _sum: { total_value: true },
      }),
    ]);

    return {
      total,
      totalValue: totalValue._sum.total_value ?? 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
