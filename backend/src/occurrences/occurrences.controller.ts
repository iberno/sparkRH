import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OccurrencesService } from './occurrences.service';
import {
  CreateOccurrenceDto, UpdateOccurrenceDto, ResolveOccurrenceDto,
  QueryOccurrencesDto, OccurrenceType, OccurrenceSeverity, OccurrenceStatus,
} from './dto/occurrence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Occurrences')
@Controller('occurrences')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar ocorrências (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'post_id', required: false })
  @ApiQuery({ name: 'type', required: false, enum: OccurrenceType })
  @ApiQuery({ name: 'severity', required: false, enum: OccurrenceSeverity })
  @ApiQuery({ name: 'status', required: false, enum: OccurrenceStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryOccurrencesDto) {
    return this.occurrencesService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de ocorrências' })
  async getStats() {
    return this.occurrencesService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar ocorrência por ID' })
  async findById(@Param('id') id: string) {
    return this.occurrencesService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'GUARD')
  @ApiOperation({ summary: 'Criar ocorrência' })
  async create(@Body() dto: CreateOccurrenceDto, @Req() req: any) {
    return this.occurrencesService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar ocorrência' })
  async update(@Param('id') id: string, @Body() dto: UpdateOccurrenceDto, @Req() req: any) {
    return this.occurrencesService.update(id, dto, req.user?.id);
  }

  @Put(':id/resolve')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Resolver ocorrência' })
  async resolve(@Param('id') id: string, @Body() dto: ResolveOccurrenceDto, @Req() req: any) {
    return this.occurrencesService.resolve(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancelar ocorrência' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.occurrencesService.remove(id, req.user?.id);
  }
}
