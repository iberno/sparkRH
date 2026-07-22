import { Module } from '@nestjs/common';
import { TimeSheetsController } from './time-sheets.controller';
import { TimeSheetsService } from './time-sheets.service';

@Module({
  controllers: [TimeSheetsController],
  providers: [TimeSheetsService],
  exports: [TimeSheetsService],
})
export class TimeSheetsModule {}
