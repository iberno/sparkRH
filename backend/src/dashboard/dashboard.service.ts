import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const today = new Date();
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);
    const in60Days = new Date(today);
    in60Days.setDate(in60Days.getDate() + 60);
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    const [
      totalEmployees, activeEmployees,
      totalTrainings, expiredTrainings, expiringTrainings,
      totalAsos, expiredAsos, inaptAsos, expiringAsos,
      totalOccurrences, openOccurrences,
      totalVehicles, activeVehicles,
      totalDrivers, expiringCnh,
    ] = await Promise.all([
      this.prisma.employees.count(),
      this.prisma.employees.count({ where: { status: 'ATIVO' } }),
      this.prisma.trainings.count(),
      this.prisma.trainings.count({ where: { status: 'VENCIDO' } }),
      this.prisma.trainings.count({ where: { status: 'CONCLUIDO', expiry_date: { gte: today, lte: in30Days } } }),
      this.prisma.asos.count(),
      this.prisma.asos.count({ where: { status: 'VENCIDO' } }),
      this.prisma.asos.count({ where: { result: 'INAPTO' } }),
      this.prisma.asos.count({ where: { status: 'VALIDO', expiry_date: { gte: today, lte: in30Days } } }),
      this.prisma.occurrences.count(),
      this.prisma.occurrences.count({ where: { status: { in: ['REGISTRADA', 'EM_ANDAMENTO'] } } }),
      this.prisma.vehicles.count(),
      this.prisma.vehicles.count({ where: { status: 'ATIVO' } }),
      this.prisma.drivers.count(),
      this.prisma.drivers.count({ where: { cnh_expiry: { gte: today, lte: in60Days }, status: 'ATIVO' } }),
    ]);

    const [expiringTrainingsList, expiringAsosList, expiringCnhList] = await Promise.all([
      this.prisma.trainings.findMany({
        where: { status: 'CONCLUIDO', expiry_date: { gte: today, lte: in30Days } },
        include: { employee: { select: { full_name: true, cpf: true, registration_number: true } } },
        orderBy: { expiry_date: 'asc' },
        take: 10,
      }),
      this.prisma.asos.findMany({
        where: { status: 'VALIDO', expiry_date: { gte: today, lte: in30Days } },
        include: { employee: { select: { full_name: true, cpf: true, registration_number: true } } },
        orderBy: { expiry_date: 'asc' },
        take: 10,
      }),
      this.prisma.drivers.findMany({
        where: { cnh_expiry: { gte: today, lte: in60Days }, status: 'ATIVO' },
        include: { employee: { select: { full_name: true, cpf: true, registration_number: true } } },
        orderBy: { cnh_expiry: 'asc' },
        take: 10,
      }),
    ]);

    return {
      kpis: {
        totalEmployees, activeEmployees, inactiveEmployees: totalEmployees - activeEmployees,
        totalTrainings, expiredTrainings, expiringTrainings,
        totalAsos, expiredAsos, inaptAsos, expiringAsos,
        totalOccurrences, openOccurrences,
        totalVehicles, activeVehicles,
        totalDrivers, expiringCnh,
      },
      alerts: {
        expiringTrainings: expiringTrainingsList,
        expiringAsos: expiringAsosList,
        expiringCnh: expiringCnhList,
      },
    };
  }
}
