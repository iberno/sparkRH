import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ClockEntryDto {
  @IsString()
  employee_id: string;

  @IsString()
  post_id: string;

  @IsOptional()
  @IsString()
  clock_type?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  gps_accuracy?: number;

  @IsOptional()
  @IsString()
  auth_method?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateTimeClockDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  irregularity?: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  approved_by?: string;
}

export class JustifyTimeClockDto {
  @IsString()
  justification: string;
}

export class QueryTimeClocksDto {
  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

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
