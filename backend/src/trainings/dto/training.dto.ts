import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString,
} from 'class-validator';

export enum TrainingCategory {
  NR_10 = 'NR_10',
  NR_12 = 'NR_12',
  NR_20 = 'NR_20',
  NR_35 = 'NR_35',
  DEFESA_PESSOAL = 'DEFESA_PESSOAL',
  PRIMEIROS_SOCORROS = 'PRIMEIROS_SOCORROS',
  MANIPULACAO_EXTINTORES = 'MANIPULACAO_EXTINTORES',
  CFTV_MONITORAMENTO = 'CFTV_MONITORAMENTO',
  RECICLAGEM_SENAI = 'RECICLAGEM_SENAI',
  OUTROS = 'OUTROS',
}

export enum TrainingStatus {
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

// -- Create / Update Training --

export class CreateTrainingDto {
  @IsString() @IsNotEmpty() employee_id: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(TrainingCategory) @IsNotEmpty() category: TrainingCategory;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsNumber() workload?: number;
  @IsDateString() @IsNotEmpty() start_date: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsDateString() expiry_date?: string;
  @IsOptional() @IsString() certificate_number?: string;
  @IsOptional() @IsString() certificate_url?: string;
  @IsOptional() @IsEnum(TrainingStatus) status?: TrainingStatus;
}

export class UpdateTrainingDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(TrainingCategory) category?: TrainingCategory;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsNumber() workload?: number;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsDateString() expiry_date?: string;
  @IsOptional() @IsString() certificate_number?: string;
  @IsOptional() @IsString() certificate_url?: string;
  @IsOptional() @IsEnum(TrainingStatus) status?: TrainingStatus;
}

// -- Query --

export class QueryTrainingsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsEnum(TrainingCategory) category?: TrainingCategory;
  @IsOptional() @IsEnum(TrainingStatus) status?: TrainingStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
