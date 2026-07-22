import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
  IsDateString,
} from 'class-validator';

export enum DriverStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export class CreateDriverDto {
  @IsString() @IsNotEmpty() employee_id: string;
  @IsString() @IsNotEmpty() cnh_number: string;
  @IsString() @IsNotEmpty() cnh_category: string;
  @IsDateString() cnh_expiry: string;
  @IsOptional() @IsString() cfc_name?: string;
  @IsOptional() @IsDateString() cfc_validity?: string;
  @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
}

export class UpdateDriverDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() cnh_number?: string;
  @IsOptional() @IsString() cnh_category?: string;
  @IsOptional() @IsDateString() cnh_expiry?: string;
  @IsOptional() @IsString() cfc_name?: string;
  @IsOptional() @IsDateString() cfc_validity?: string;
  @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
}

export class QueryDriversDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
