import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { EmployeesModule } from './employees/employees.module';
import { TrainingsModule } from './trainings/trainings.module';
import { AsosModule } from './asos/asos.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    EmployeesModule,
    TrainingsModule,
    AsosModule,
    OccurrencesModule,
    VehiclesModule,
    DashboardModule,
  ],
})
export class AppModule {}
