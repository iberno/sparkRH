import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

interface LoginDto {
  cpf: string;
  password: string;
}

interface JwtPayload {
  sub: string;
  cpf: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    const user = await this.prisma.users.findUnique({
      where: { cpf },
      include: { employee: true },
    });

    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Conta desativada');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      cpf: user.cpf,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        cpf: user.cpf,
        role: user.role,
        name: user.employee?.full_name,
      },
    };
  }

  async validateUserByCpf(cpf: string) {
    const cleanCpf = cpf.replace(/\D/g, '');

    return this.prisma.users.findUnique({
      where: { cpf: cleanCpf },
      select: {
        id: true,
        cpf: true,
        role: true,
        is_active: true,
        is_first_access: true,
        employee: {
          select: {
            id: true,
            full_name: true,
            registration_number: true,
          },
        },
      },
    });
  }
}
