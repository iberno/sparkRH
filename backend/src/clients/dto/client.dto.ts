import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum ClientType {
  JURIDICA = 'JURIDICA',
  FISICA = 'FISICA',
}

export class CreateClientDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsEnum(ClientType) type?: ClientType;
  @IsString() @IsNotEmpty() cnpj_cpf: string;
  @IsOptional() @IsString() contact_name?: string;
  @IsOptional() @IsString() contact_phone?: string;
  @IsOptional() @IsEmail() contact_email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
}

export class UpdateClientDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(ClientType) type?: ClientType;
  @IsOptional() @IsString() cnpj_cpf?: string;
  @IsOptional() @IsString() contact_name?: string;
  @IsOptional() @IsString() contact_phone?: string;
  @IsOptional() @IsEmail() contact_email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() is_active?: boolean;
}

export class QueryClientsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(ClientType) type?: ClientType;
  @IsOptional() is_active?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
