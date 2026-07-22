import { Module } from '@nestjs/common';
import { WorkPostsService } from './work-posts.service';
import { WorkPostsController } from './work-posts.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [WorkPostsController],
  providers: [WorkPostsService],
  exports: [WorkPostsService],
})
export class WorkPostsModule {}
