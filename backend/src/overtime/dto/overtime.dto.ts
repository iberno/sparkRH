import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OvertimeType {
  HE50 = 'HE50',
  HE100 = 'HE100',
  ADICIONAL_NOTURNO = 'ADICIONAL_NOTURNO',
}

export enum OvertimeStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

export class CreateOvertimeDto {
  @IsString()
  employee_id: string;

  @IsString()
  post_id: string;

  @IsDateString()
  request_date: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsEnum(OvertimeType)
  overtime_type: OvertimeType;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewOvertimeDto {
  @IsEnum(OvertimeStatus)
  status: OvertimeStatus;

  @IsOptional()
  @IsString()
  review_note?: string;
}

export class QueryOvertimeDto {
  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsEnum(OvertimeStatus)
  status?: OvertimeStatus;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
