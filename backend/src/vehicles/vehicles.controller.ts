import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import {
  CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto, VehicleStatus,
} from './dto/vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar veículos (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: VehicleStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de veículos' })
  async getStats() {
    return this.vehiclesService.getStats();
  }

  @Get('alerts')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Alertas de vencimento de veículos' })
  async findAlerts() {
    return this.vehiclesService.findAlerts();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  async findById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar veículo' })
  async create(@Body() dto: CreateVehicleDto, @Req() req: any) {
    return this.vehiclesService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar veículo' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @Req() req: any) {
    return this.vehiclesService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar veículo' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.vehiclesService.remove(id, req.user?.id);
  }
}
