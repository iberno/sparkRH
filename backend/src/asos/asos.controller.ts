import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AsosService } from './asos.service';
import {
  CreateAsoDto, UpdateAsoDto, QueryAsosDto,
  AsoType, AsoResult, AsoStatus,
} from './dto/aso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ASOs')
@Controller('asos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AsosController {
  constructor(private readonly asosService: AsosService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Listar ASOs (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'type', required: false, enum: AsoType })
  @ApiQuery({ name: 'result', required: false, enum: AsoResult })
  @ApiQuery({ name: 'status', required: false, enum: AsoStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryAsosDto) {
    return this.asosService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de ASOs' })
  async getStats() {
    return this.asosService.getStats();
  }

  @Get('expiring')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'ASOs próximos ao vencimento (60 dias)' })
  async findExpiring() {
    return this.asosService.findExpiring();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Buscar ASO por ID' })
  async findById(@Param('id') id: string) {
    return this.asosService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar ASO' })
  async create(@Body() dto: CreateAsoDto, @Req() req: any) {
    return this.asosService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar ASO' })
  async update(@Param('id') id: string, @Body() dto: UpdateAsoDto, @Req() req: any) {
    return this.asosService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancelar ASO' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.asosService.remove(id, req.user?.id);
  }
}
