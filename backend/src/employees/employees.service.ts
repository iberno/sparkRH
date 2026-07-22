import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateEmployeeDto, UpdateEmployeeDto,
  CreateEmergencyContactDto, UpdateEmergencyContactDto,
  EmployeeStatus,
} from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: {
    search?: string;
    status?: EmployeeStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { cpf: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { social_name: { contains: search, mode: 'insensitive' } },
        { registration_number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employees.findMany({
        where,
        select: {
          id: true,
          registration_number: true,
          cpf: true,
          full_name: true,
          social_name: true,
          email: true,
          phone: true,
          photo_url: true,
          status: true,
          admission_date: true,
          created_at: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { full_name: 'asc' },
      }),
      this.prisma.employees.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, cpf: true, role: true, is_active: true },
        },
        emergency_contacts: true,
        documents: {
          orderBy: { created_at: 'desc' },
        },
        hour_bank_entries: {
          orderBy: { reference_date: 'desc' },
          take: 50,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto, userId?: string) {
    const cpf = dto.cpf.replace(/\D/g, '');

    const existing = await this.prisma.employees.findUnique({
      where: { cpf },
    });

    if (existing) {
      throw new ConflictException('CPF já cadastrado');
    }

    const existingReg = await this.prisma.employees.findUnique({
      where: { registration_number: dto.registration_number },
    });

    if (existingReg) {
      throw new ConflictException('Matrícula já cadastrada');
    }

    const { emergency_contacts, ...data } = dto;

    const employee = await this.prisma.employees.create({
      data: {
        ...data,
        cpf,
        admission_date: new Date(dto.admission_date),
        birth_date: new Date(dto.birth_date),
        rg_expiry: dto.rg_expiry ? new Date(dto.rg_expiry) : null,
        emergency_contacts: emergency_contacts?.length
          ? {
              create: emergency_contacts.map((ec) => ({
                name: ec.name,
                phone: ec.phone,
                relationship: ec.relationship,
                is_primary: ec.is_primary ?? false,
              })),
            }
          : undefined,
      },
      include: {
        emergency_contacts: true,
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'employees',
        entityId: employee.id,
        newValues: { registration_number: employee.registration_number, full_name: employee.full_name, cpf },
      });
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, userId?: string) {
    const employee = await this.prisma.employees.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const updateData: any = { ...dto };

    if (dto.admission_date) {
      updateData.admission_date = new Date(dto.admission_date);
    }
    if (dto.resignation_date) {
      updateData.resignation_date = new Date(dto.resignation_date);
    }
    if (dto.rg_expiry) {
      updateData.rg_expiry = new Date(dto.rg_expiry);
    }

    const updated = await this.prisma.employees.update({
      where: { id },
      data: updateData,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'employees',
        entityId: id,
        oldValues: { full_name: employee.full_name, status: employee.status },
        newValues: { full_name: updated.full_name, status: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const employee = await this.prisma.employees.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    await this.prisma.employees.update({
      where: { id },
      data: { status: 'DEMITIDO', resignation_date: new Date() },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'employees',
        entityId: id,
        oldValues: { status: employee.status },
        newValues: { status: 'DEMITIDO' },
      });
    }

    return { message: 'Colaborador desativado com sucesso' };
  }

  // -- Emergency Contacts --

  async addEmergencyContact(employeeId: string, dto: CreateEmergencyContactDto) {
    const employee = await this.prisma.employees.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Colaborador não encontrado');

    if (dto.is_primary) {
      await this.prisma.emergency_contacts.updateMany({
        where: { employee_id: employeeId, is_primary: true },
        data: { is_primary: false },
      });
    }

    return this.prisma.emergency_contacts.create({
      data: { employee_id: employeeId, ...dto },
    });
  }

  async updateEmergencyContact(contactId: string, dto: UpdateEmergencyContactDto) {
    const contact = await this.prisma.emergency_contacts.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contato não encontrado');

    if (dto.is_primary) {
      await this.prisma.emergency_contacts.updateMany({
        where: { employee_id: contact.employee_id, is_primary: true, id: { not: contactId } },
        data: { is_primary: false },
      });
    }

    return this.prisma.emergency_contacts.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async removeEmergencyContact(contactId: string) {
    const contact = await this.prisma.emergency_contacts.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contato não encontrado');

    await this.prisma.emergency_contacts.delete({ where: { id: contactId } });
    return { message: 'Contato removido com sucesso' };
  }

  // -- Hour Bank --

  async getHourBankBalance(employeeId: string) {
    const entries = await this.prisma.hour_bank.findMany({
      where: { employee_id: employeeId, status: 'VALIDO' },
      orderBy: { reference_date: 'desc' },
    });

    const balance = entries.reduce((acc, e) => acc + Number(e.hours), 0);
    return { entries, balance };
  }

  async getStats() {
    const [total, active, byStatus] = await Promise.all([
      this.prisma.employees.count(),
      this.prisma.employees.count({ where: { status: 'ATIVO' } }),
      this.prisma.employees.groupBy({
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
