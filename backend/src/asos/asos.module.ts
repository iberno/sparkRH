import { Module } from '@nestjs/common';
import { AsosService } from './asos.service';
import { AsosController } from './asos.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AsosController],
  providers: [AsosService],
  exports: [AsosService],
})
export class AsosModule {}
