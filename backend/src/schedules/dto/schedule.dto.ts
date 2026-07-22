import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ScheduleType {
  FIXA = 'FIXA',
  ROTATIVA = 'ROTATIVA',
  ANOTADA = 'ANOTADA',
}

export enum ScheduleStatus {
  PROGRAMADO = 'PROGRAMADO',
  CONFIRMADO = 'CONFIRMADO',
  AUSENTE = 'AUSENTE',
  CANCELADO = 'CANCELADO',
  TROCA_PENDENTE = 'TROCA_PENDENTE',
}

export class CreateScheduleDto {
  @IsString()
  post_id: string;

  @IsString()
  name: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsArray()
  @IsString({ each: true })
  days_of_week: string[];

  @IsOptional()
  @IsEnum(ScheduleType)
  schedule_type?: ScheduleType;

  @IsOptional()
  @IsString()
  rotation_pattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rotation_offset?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days_of_week?: string[];

  @IsOptional()
  @IsEnum(ScheduleType)
  schedule_type?: ScheduleType;

  @IsOptional()
  @IsString()
  rotation_pattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rotation_offset?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class GenerateSchedulesDto {
  @IsString()
  post_id: string;

  @IsString()
  schedule_id: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;

  @IsArray()
  @IsString({ each: true })
  employee_ids: string[];
}

export class BulkUpdateSchedulesDto {
  @IsArray()
  ids: string[];

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @IsString()
  shift_name?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;
}

export class QuerySchedulesDto {
  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
