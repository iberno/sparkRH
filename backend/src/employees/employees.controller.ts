import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto, UpdateEmployeeDto,
  CreateEmergencyContactDto, UpdateEmergencyContactDto,
  QueryEmployeesDto, EmployeeStatus,
} from './dto/employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar colaboradores (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: EmployeeStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de colaboradores' })
  async getStats() {
    return this.employeesService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar colaborador por ID' })
  async findById(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar colaborador' })
  async create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.employeesService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar colaborador' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Req() req: any) {
    return this.employeesService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar colaborador' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.remove(id, req.user?.id);
  }

  // -- Emergency Contacts --

  @Post(':id/emergency-contacts')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Adicionar contato de emergência' })
  async addEmergencyContact(@Param('id') id: string, @Body() dto: CreateEmergencyContactDto) {
    return this.employeesService.addEmergencyContact(id, dto);
  }

  @Put('emergency-contacts/:contactId')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar contato de emergência' })
  async updateEmergencyContact(@Param('contactId') contactId: string, @Body() dto: UpdateEmergencyContactDto) {
    return this.employeesService.updateEmergencyContact(contactId, dto);
  }

  @Delete('emergency-contacts/:contactId')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Remover contato de emergência' })
  async removeEmergencyContact(@Param('contactId') contactId: string) {
    return this.employeesService.removeEmergencyContact(contactId);
  }

  // -- Hour Bank --

  @Get(':id/hour-bank')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Saldo do banco de horas' })
  async getHourBankBalance(@Param('id') id: string) {
    return this.employeesService.getHourBankBalance(id);
  }
}
