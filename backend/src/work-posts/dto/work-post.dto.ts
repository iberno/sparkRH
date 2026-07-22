import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber,
} from 'class-validator';

export enum PostType {
  VIGILANCIA = 'VIGILANCIA',
  PORTARIA = 'PORTARIA',
  RONDA = 'RONDA',
  MONITORAMENTO = 'MONITORAMENTO',
  LIMPEZA = 'LIMPEZA',
  JARDINAGEM = 'JARDINAGEM',
  INSPECAO = 'INSPECAO',
  FISCAL_LOJA = 'FISCAL_LOJA',
}

export enum ScheduleType {
  FIXO = 'FIXO',
  ROTATIVO = 'ROTATIVO',
  MISTO = 'MISTO',
}

// -- Create / Update WorkPost --

export class CreateWorkPostDto {
  @IsString() @IsNotEmpty() contract_id: string;
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(PostType) @IsNotEmpty() post_type: PostType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsNumber() gps_radius?: number;
  @IsOptional() @IsEnum(ScheduleType) schedule_type?: ScheduleType;
  @IsOptional() @IsNumber() min_staff?: number;
  @IsOptional() @IsNumber() max_staff?: number;
  @IsOptional() @IsNumber() required_vacancies?: number;
  @IsOptional() @IsString() supervisor_id?: string;
}

export class UpdateWorkPostDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(PostType) post_type?: PostType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsNumber() gps_radius?: number;
  @IsOptional() @IsEnum(ScheduleType) schedule_type?: ScheduleType;
  @IsOptional() @IsNumber() min_staff?: number;
  @IsOptional() @IsNumber() max_staff?: number;
  @IsOptional() @IsNumber() required_vacancies?: number;
  @IsOptional() @IsString() supervisor_id?: string;
  @IsOptional() @IsString() status?: string;
}

// -- Query --

export class QueryWorkPostsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() contract_id?: string;
  @IsOptional() @IsEnum(PostType) post_type?: PostType;
  @IsOptional() @IsString() status?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
