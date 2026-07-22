import {
  Controller, Get, Post, Put,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimeClocksService } from './time-clocks.service';
import {
  ClockEntryDto, UpdateTimeClockDto, JustifyTimeClockDto, QueryTimeClocksDto,
} from './dto/time-clock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Time Clocks')
@Controller('time-clocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimeClocksController {
  constructor(private readonly service: TimeClocksService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar marcações de ponto (filtros)' })
  async findAll(@Query() query: QueryTimeClocksDto) {
    return this.service.findAll(query);
  }

  @Get('my')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Marcações do colaborador logado' })
  async findMy(
    @Req() req: any,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.service.findByEmployee(req.user.employee_id, startDate, endDate);
  }

  @Get('irregularities')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar irregularidades de ponto' })
  async findIrregularities(@Query() query: QueryTimeClocksDto) {
    return this.service.findIrregularities(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de ponto' })
  async stats(
    @Query('employee_id') employeeId?: string,
    @Query('post_id') postId?: string,
  ) {
    return this.service.stats(employeeId, postId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Buscar marcação de ponto por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Registrar marcação de ponto' })
  async clockEntry(@Body() dto: ClockEntryDto) {
    return this.service.clockEntry(dto);
  }

  @Put(':id/approve')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Aprovar marcação irregular' })
  async approve(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, req.user.id);
  }

  @Put(':id/justify')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Justificar irregularidade' })
  async justify(@Param('id') id: string, @Body() dto: JustifyTimeClockDto) {
    return this.service.justify(id, dto);
  }
}
