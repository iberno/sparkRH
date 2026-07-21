import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        employee: true,
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

  async findAll() {
    return this.prisma.users.findMany({
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
  }
}
