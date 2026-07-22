import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { DriversService } from './drivers.service';
import { VehiclesController } from './vehicles.controller';
import { DriversController } from './drivers.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [VehiclesController, DriversController],
  providers: [VehiclesService, DriversService],
  exports: [VehiclesService, DriversService],
})
export class VehiclesModule {}
