import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateTimeSheetDto {
  @IsString()
  employee_id: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;
}

export class QueryTimeSheetDto {
  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
