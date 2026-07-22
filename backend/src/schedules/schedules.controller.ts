import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  CreateScheduleDto, UpdateScheduleDto, GenerateSchedulesDto,
  BulkUpdateSchedulesDto, QuerySchedulesDto, ScheduleStatus,
} from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar escalas geradas (paginado)' })
  async findAll(@Query() query: QuerySchedulesDto) {
    return this.service.findAll(query);
  }

  @Get('calendar')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Visualização calendário de escalas' })
  async getCalendar(
    @Query('post_id') postId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.service.getCalendar(postId, startDate, endDate);
  }

  @Get('conflicts')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar conflitos de escalas' })
  async getConflicts(
    @Query('post_id') postId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.service.getConflicts(postId, startDate, endDate);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de escalas' })
  async stats(@Query('post_id') postId?: string) {
    return this.service.stats(postId);
  }

  @Get('templates')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar modelos de escala (templates)' })
  async findTemplates(@Query('post_id') postId?: string) {
    return this.service.findTemplates(postId);
  }

  @Get('templates/:id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar modelo de escala por ID' })
  async findTemplate(@Param('id') id: string) {
    return this.service.findTemplate(id);
  }

  @Post('templates')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar modelo de escala' })
  async createTemplate(@Body() dto: CreateScheduleDto) {
    return this.service.createTemplate(dto);
  }

  @Put('templates/:id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar modelo de escala' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.service.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Remover modelo de escala' })
  async removeTemplate(@Param('id') id: string) {
    return this.service.removeTemplate(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar escala gerada por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('generate')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Gerar escala para período' })
  async generate(@Body() dto: GenerateSchedulesDto) {
    return this.service.generateSchedules(dto);
  }

  @Put('bulk-update')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Atualização em massa de escalas' })
  async bulkUpdate(@Body() dto: BulkUpdateSchedulesDto) {
    return this.service.bulkUpdate(dto);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar status da escala' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateGeneratedStatus(id, status);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Remover escala' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
