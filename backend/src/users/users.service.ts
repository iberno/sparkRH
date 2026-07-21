import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, UpdatePermissionsDto, UserRole } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    role?: UserRole;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, role, is_active } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const where: any = {};

    if (search) {
      where.OR = [
        { cpf: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employee: { full_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          cpf: true,
          email: true,
          role: true,
          is_active: true,
          is_first_access: true,
          last_login: true,
          created_at: true,
          updated_at: true,
          employee: {
            select: {
              id: true,
              full_name: true,
              social_name: true,
              registration_number: true,
              phone: true,
              email: true,
              photo_url: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            social_name: true,
            registration_number: true,
            cpf: true,
            phone: true,
            email: true,
            photo_url: true,
            status: true,
          },
        },
        permissions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByCpf(cpf: string) {
    const cleanCpf = cpf.replace(/\D/g, '');

    return this.prisma.users.findUnique({
      where: { cpf: cleanCpf },
      include: {
        employee: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    // Check if CPF already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { cpf },
    });

    if (existingUser) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Check if email already exists (if provided)
    if (dto.email) {
      const existingEmail = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    // Validate employee exists if provided
    if (dto.employeeId) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: dto.employeeId },
      });

      if (!employee) {
        throw new NotFoundException('Colaborador não encontrado');
      }

      // Check if employee already has a user
      const existingUserForEmployee = await this.prisma.users.findUnique({
        where: { employee_id: dto.employeeId },
      });

      if (existingUserForEmployee) {
        throw new ConflictException('Colaborador já possui usuário');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.users.create({
      data: {
        cpf,
        email: dto.email,
        password_hash: passwordHash,
        role: dto.role,
        employee_id: dto.employeeId,
        is_first_access: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
          },
        },
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Check email uniqueness if provided
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    // Check employee uniqueness if provided
    if (dto.employeeId && dto.employeeId !== user.employee_id) {
      const existingUserForEmployee = await this.prisma.users.findUnique({
        where: { employee_id: dto.employeeId },
      });

      if (existingUserForEmployee) {
        throw new ConflictException('Colaborador já possui usuário');
      }
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        email: dto.email,
        role: dto.role,
        is_active: dto.is_active,
        employee_id: dto.employeeId,
      },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Soft delete
    await this.prisma.users.update({
      where: { id },
      data: { is_active: false },
    });

    return { message: 'Usuário desativado com sucesso' };
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Delete existing permissions
    await this.prisma.user_permissions.deleteMany({
      where: { user_id: id },
    });

    // Create new permissions
    const permissions = await Promise.all(
      dto.permissions.map((perm) =>
        this.prisma.user_permissions.create({
          data: {
            user_id: id,
            module: perm.module,
            action: perm.action,
          },
        }),
      ),
    );

    return permissions;
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.users.update({
      where: { id },
      data: { password_hash: passwordHash },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  async getStats() {
    const [total, active, byRole] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.users.count({ where: { is_active: true } }),
      this.prisma.users.groupBy({
        by: ['role'],
        _count: true,
        where: { is_active: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
