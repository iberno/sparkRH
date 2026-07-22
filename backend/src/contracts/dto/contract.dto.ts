import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export enum ContractStatus {
  ATIVO = 'ATIVO',
  SUSPENSO = 'SUSPENSO',
  ENCERRADO = 'ENCERRADO',
  EM_RENOVACAO = 'EM_RENOVACAO',
}

export class CreateContractDto {
  @IsString() @IsNotEmpty() client_id: string;
  @IsString() @IsNotEmpty() company_id: string;
  @IsString() @IsNotEmpty() contract_number: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() start_date: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsDateString() renewal_date?: string;
  @IsOptional() @IsNumber() monthly_value?: number;
  @IsOptional() @IsNumber() hourly_value?: number;
  @IsNumber() total_value: number;
  @IsOptional() @IsString() payment_terms?: string;
  @IsOptional() @IsNumber() payment_day?: number;
  @IsOptional() @IsString() payment_method?: string;
  @IsOptional() @IsString() billing_cycle?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateContractDto {
  @IsOptional() @IsString() client_id?: string;
  @IsOptional() @IsString() company_id?: string;
  @IsOptional() @IsString() contract_number?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsDateString() renewal_date?: string;
  @IsOptional() @IsNumber() monthly_value?: number;
  @IsOptional() @IsNumber() hourly_value?: number;
  @IsOptional() @IsNumber() total_value?: number;
  @IsOptional() @IsString() payment_terms?: string;
  @IsOptional() @IsNumber() payment_day?: number;
  @IsOptional() @IsString() payment_method?: string;
  @IsOptional() @IsString() billing_cycle?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus) status: ContractStatus;
}

export class QueryContractsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() client_id?: string;
  @IsOptional() @IsString() company_id?: string;
  @IsOptional() @IsEnum(ContractStatus) status?: ContractStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
