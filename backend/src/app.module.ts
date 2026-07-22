import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { EmployeesModule } from './employees/employees.module';
import { ClientsModule } from './clients/clients.module';
import { ContractsModule } from './contracts/contracts.module';
import { WorkPostsModule } from './work-posts/work-posts.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TrainingsModule } from './trainings/trainings.module';
import { AsosModule } from './asos/asos.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TimeClocksModule } from './time-clocks/time-clocks.module';
import { TimeSheetsModule } from './time-sheets/time-sheets.module';
import { OvertimeModule } from './overtime/overtime.module';

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
    ClientsModule,
    ContractsModule,
    WorkPostsModule,
    AssignmentsModule,
    TrainingsModule,
    AsosModule,
    OccurrencesModule,
    VehiclesModule,
    DashboardModule,
    SchedulesModule,
    TimeClocksModule,
    TimeSheetsModule,
    OvertimeModule,
  ],
})
export class AppModule {}
