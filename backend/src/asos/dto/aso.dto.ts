import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum,
  IsDateString,
} from 'class-validator';

export enum AsoType {
  ADMISSIONAL = 'ADMISSIONAL',
  DEMISSIONAL = 'DEMISSIONAL',
  PERIODICO = 'PERIODICO',
  RETORNO_TRABALHO = 'RETORNO_TRABALHO',
  MUDANCA_FUNCAO = 'MUDANCA_FUNCAO',
}

export enum AsoResult {
  APTO = 'APTO',
  INAPTO = 'INAPTO',
}

export enum AsoStatus {
  VALIDO = 'VALIDO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

// -- Create / Update ASO --

export class CreateAsoDto {
  @IsString() @IsNotEmpty() employee_id: string;
  @IsEnum(AsoType) type: AsoType;
  @IsDateString() exam_date: string;
  @IsOptional() @IsDateString() expiry_date?: string;
  @IsOptional() @IsString() doctor_name?: string;
  @IsOptional() @IsString() doctor_crm?: string;
  @IsOptional() @IsString() clinic_name?: string;
  @IsEnum(AsoResult) result: AsoResult;
  @IsOptional() @IsString() restrictions?: string;
  @IsOptional() @IsString() document_url?: string;
  @IsOptional() @IsEnum(AsoStatus) status?: AsoStatus;
  @IsOptional() @IsBoolean() is_mandatory?: boolean;
}

export class UpdateAsoDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsEnum(AsoType) type?: AsoType;
  @IsOptional() @IsDateString() exam_date?: string;
  @IsOptional() @IsDateString() expiry_date?: string;
  @IsOptional() @IsString() doctor_name?: string;
  @IsOptional() @IsString() doctor_crm?: string;
  @IsOptional() @IsString() clinic_name?: string;
  @IsOptional() @IsEnum(AsoResult) result?: AsoResult;
  @IsOptional() @IsString() restrictions?: string;
  @IsOptional() @IsString() document_url?: string;
  @IsOptional() @IsEnum(AsoStatus) status?: AsoStatus;
  @IsOptional() @IsBoolean() is_mandatory?: boolean;
}

// -- Query --

export class QueryAsosDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsEnum(AsoType) type?: AsoType;
  @IsOptional() @IsEnum(AsoResult) result?: AsoResult;
  @IsOptional() @IsEnum(AsoStatus) status?: AsoStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
