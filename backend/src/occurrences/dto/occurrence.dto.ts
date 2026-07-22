import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsDateString,
} from 'class-validator';

export enum OccurrenceType {
  ROUBO = 'ROUBO',
  INCENDIO = 'INCENDIO',
  INVASAO = 'INVASAO',
  VAZAMENTO = 'VAZAMENTO',
  ELETRICIDADE = 'ELETRICIDADE',
  ACIDENTE = 'ACIDENTE',
  AVARIA = 'AVARIA',
  OUTROS = 'OUTROS',
}

export enum OccurrenceSeverity {
  CRITICA = 'CRITICA',
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
}

export enum OccurrenceStatus {
  REGISTRADA = 'REGISTRADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  RESOLVIDA = 'RESOLVIDA',
  CANCELADA = 'CANCELADA',
}

export class CreateOccurrenceDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() post_id?: string;
  @IsEnum(OccurrenceType) @IsNotEmpty() type: OccurrenceType;
  @IsString() @IsNotEmpty() description: string;
  @IsDateString() @IsNotEmpty() occurrence_date: string;
  @IsOptional() @IsEnum(OccurrenceSeverity) severity?: OccurrenceSeverity;
  @IsString() @IsNotEmpty() registered_by: string;
  @IsOptional() @IsString() actions_taken?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photo_urls?: string[];
}

export class UpdateOccurrenceDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() post_id?: string;
  @IsOptional() @IsEnum(OccurrenceType) type?: OccurrenceType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() occurrence_date?: string;
  @IsOptional() @IsEnum(OccurrenceSeverity) severity?: OccurrenceSeverity;
  @IsOptional() @IsEnum(OccurrenceStatus) status?: OccurrenceStatus;
  @IsOptional() @IsString() actions_taken?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photo_urls?: string[];
}

export class ResolveOccurrenceDto {
  @IsString() @IsNotEmpty() actions_taken: string;
  @IsString() @IsNotEmpty() resolved_by: string;
}

export class QueryOccurrencesDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() post_id?: string;
  @IsOptional() @IsEnum(OccurrenceType) type?: OccurrenceType;
  @IsOptional() @IsEnum(OccurrenceSeverity) severity?: OccurrenceSeverity;
  @IsOptional() @IsEnum(OccurrenceStatus) status?: OccurrenceStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
