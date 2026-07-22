import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import {
  CreateDriverDto, UpdateDriverDto, QueryDriversDto, DriverStatus,
} from './dto/driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar motoristas (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DriverStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryDriversDto) {
    return this.driversService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de motoristas' })
  async getStats() {
    return this.driversService.getStats();
  }

  @Get('alerts')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Alertas de vencimento de CNH/CFC' })
  async findAlerts() {
    return this.driversService.findAlerts();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar motorista por ID' })
  async findById(@Param('id') id: string) {
    return this.driversService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar motorista' })
  async create(@Body() dto: CreateDriverDto, @Req() req: any) {
    return this.driversService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar motorista' })
  async update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @Req() req: any) {
    return this.driversService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar motorista' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.driversService.remove(id, req.user?.id);
  }
}
