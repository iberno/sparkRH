import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import {
  CreateTrainingDto, UpdateTrainingDto, QueryTrainingsDto,
  TrainingCategory, TrainingStatus,
} from './dto/training.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Trainings')
@Controller('trainings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Listar treinamentos (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'category', required: false, enum: TrainingCategory })
  @ApiQuery({ name: 'status', required: false, enum: TrainingStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryTrainingsDto) {
    return this.trainingsService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de treinamentos' })
  async getStats() {
    return this.trainingsService.getStats();
  }

  @Get('expiring')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Treinamentos vencendo em até 90 dias' })
  async findExpiring() {
    return this.trainingsService.findExpiring();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Buscar treinamento por ID' })
  async findById(@Param('id') id: string) {
    return this.trainingsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar treinamento' })
  async create(@Body() dto: CreateTrainingDto, @Req() req: any) {
    return this.trainingsService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar treinamento' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrainingDto, @Req() req: any) {
    return this.trainingsService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancelar treinamento' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.trainingsService.remove(id, req.user?.id);
  }
}
