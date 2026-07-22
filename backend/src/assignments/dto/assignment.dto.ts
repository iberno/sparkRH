import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber,
} from 'class-validator';

export enum AssignmentStatus {
  ATIVA = 'ATIVA',
  SUSPENSA = 'SUSPENSA',
  ENCERRADA = 'ENCERRADA',
}

export class CreateAssignmentDto {
  @IsString() @IsNotEmpty() employee_id: string;
  @IsString() @IsNotEmpty() post_id: string;
  @IsDateString() start_date: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsString() shift?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsNumber() base_salary?: number;
  @IsOptional() @IsNumber() additional?: number;
}

export class UpdateAssignmentDto {
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() post_id?: string;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsString() shift?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsNumber() base_salary?: number;
  @IsOptional() @IsNumber() additional?: number;
  @IsOptional() @IsEnum(AssignmentStatus) status?: AssignmentStatus;
}

export class QueryAssignmentsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() post_id?: string;
  @IsOptional() @IsEnum(AssignmentStatus) status?: AssignmentStatus;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
