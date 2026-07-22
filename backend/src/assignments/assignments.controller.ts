import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import {
  CreateAssignmentDto, UpdateAssignmentDto,
  QueryAssignmentsDto, AssignmentStatus,
} from './dto/assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar alocações (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'post_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AssignmentStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryAssignmentsDto) {
    return this.assignmentsService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de alocações' })
  async getStats() {
    return this.assignmentsService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar alocação por ID' })
  async findById(@Param('id') id: string) {
    return this.assignmentsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar alocação' })
  async create(@Body() dto: CreateAssignmentDto, @Req() req: any) {
    return this.assignmentsService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar alocação' })
  async update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto, @Req() req: any) {
    return this.assignmentsService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Encerrar alocação' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.assignmentsService.remove(id, req.user?.id);
  }
}
