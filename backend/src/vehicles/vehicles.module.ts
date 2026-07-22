import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { DriversService } from './drivers.service';
import { VehiclesController } from './vehicles.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, DriversService],
  exports: [VehiclesService, DriversService],
})
export class VehiclesModule {}
