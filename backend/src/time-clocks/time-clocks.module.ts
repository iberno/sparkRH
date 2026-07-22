import { Module } from '@nestjs/common';
import { TimeClocksController } from './time-clocks.controller';
import { TimeClocksService } from './time-clocks.service';

@Module({
  controllers: [TimeClocksController],
  providers: [TimeClocksService],
  exports: [TimeClocksService],
})
export class TimeClocksModule {}
