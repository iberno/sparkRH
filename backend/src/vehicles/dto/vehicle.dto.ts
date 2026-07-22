import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
  IsDateString, IsNumber,
} from 'class-validator';

export enum VehicleStatus {
  ATIVO = 'ATIVO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO',
}

export class CreateVehicleDto {
  @IsString() @IsNotEmpty() plate: string;
  @IsString() @IsNotEmpty() model: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsNumber() year?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() fuel_type?: string;
  @IsOptional() @IsNumber() km_current?: number;
  @IsOptional() @IsDateString() insurance_expiry?: string;
  @IsOptional() @IsDateString() licensing_expiry?: string;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
}

export class UpdateVehicleDto {
  @IsOptional() @IsString() plate?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsNumber() year?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() fuel_type?: string;
  @IsOptional() @IsNumber() km_current?: number;
  @IsOptional() @IsDateString() insurance_expiry?: string;
  @IsOptional() @IsDateString() licensing_expiry?: string;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
}

export class QueryVehiclesDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
