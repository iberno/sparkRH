import {
  IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsEnum,
  IsArray, ValidateNested, IsDateString, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EmployeeStatus {
  ATIVO = 'ATIVO',
  AFASTADO = 'AFASTADO',
  FERIAS = 'FERIAS',
  DEMITIDO = 'DEMITIDO',
}

// -- Create / Update Employee --

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() registration_number: string;
  @IsString() @IsNotEmpty() cpf: string;
  @IsOptional() @IsString() rg?: string;
  @IsOptional() @IsString() rg_org?: string;
  @IsOptional() @IsDateString() rg_expiry?: string;
  @IsString() @IsNotEmpty() full_name: string;
  @IsOptional() @IsString() social_name?: string;
  @IsDateString() birth_date: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() marital_status?: string;
  @IsOptional() @IsString() nationality?: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() phone_secondary?: string;

  @IsOptional() @IsString() address_street?: string;
  @IsOptional() @IsString() address_number?: string;
  @IsOptional() @IsString() address_complement?: string;
  @IsOptional() @IsString() address_neighborhood?: string;
  @IsOptional() @IsString() address_city?: string;
  @IsOptional() @IsString() address_state?: string;
  @IsOptional() @IsString() address_zip?: string;

  @IsOptional() @IsString() bank_name?: string;
  @IsOptional() @IsString() bank_agency?: string;
  @IsOptional() @IsString() bank_account?: string;
  @IsOptional() @IsString() bank_account_type?: string;
  @IsOptional() @IsString() bank_pix?: string;

  @IsOptional() @IsString() pis_pasep?: string;
  @IsOptional() @IsString() ctps_number?: string;
  @IsOptional() @IsString() ctps_series?: string;
  @IsOptional() @IsString() ctps_state?: string;

  @IsDateString() admission_date: string;
  @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateEmergencyContactDto)
  emergency_contacts?: CreateEmergencyContactDto[];
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() social_name?: string;
  @IsOptional() @IsString() rg?: string;
  @IsOptional() @IsString() rg_org?: string;
  @IsOptional() @IsDateString() rg_expiry?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() marital_status?: string;
  @IsOptional() @IsString() nationality?: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() phone_secondary?: string;

  @IsOptional() @IsString() address_street?: string;
  @IsOptional() @IsString() address_number?: string;
  @IsOptional() @IsString() address_complement?: string;
  @IsOptional() @IsString() address_neighborhood?: string;
  @IsOptional() @IsString() address_city?: string;
  @IsOptional() @IsString() address_state?: string;
  @IsOptional() @IsString() address_zip?: string;

  @IsOptional() @IsString() bank_name?: string;
  @IsOptional() @IsString() bank_agency?: string;
  @IsOptional() @IsString() bank_account?: string;
  @IsOptional() @IsString() bank_account_type?: string;
  @IsOptional() @IsString() bank_pix?: string;

  @IsOptional() @IsString() pis_pasep?: string;
  @IsOptional() @IsString() ctps_number?: string;
  @IsOptional() @IsString() ctps_series?: string;
  @IsOptional() @IsString() ctps_state?: string;

  @IsOptional() @IsDateString() admission_date?: string;
  @IsOptional() @IsDateString() resignation_date?: string;
  @IsOptional() @IsString() resignation_reason?: string;
  @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
}

// -- Emergency Contacts --

export class CreateEmergencyContactDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() relationship: string;
  @IsOptional() @IsBoolean() is_primary?: boolean;
}

export class UpdateEmergencyContactDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() relationship?: string;
  @IsOptional() @IsBoolean() is_primary?: boolean;
}

// -- Query --

export class QueryEmployeesDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
