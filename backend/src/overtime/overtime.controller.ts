import {
  Controller, Get, Post, Put,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto, ReviewOvertimeDto, QueryOvertimeDto } from './dto/overtime.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Overtime')
@Controller('overtime')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OvertimeController {
  constructor(private readonly service: OvertimeService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar solicitações de HE' })
  async findAll(@Query() query: QueryOvertimeDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de HE' })
  async stats(
    @Query('employee_id') employeeId?: string,
    @Query('post_id') postId?: string,
  ) {
    return this.service.stats(employeeId, postId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Buscar solicitação de HE por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Criar solicitação de HE' })
  async create(@Body() dto: CreateOvertimeDto) {
    return this.service.create(dto);
  }

  @Put(':id/review')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Aprovar/rejeitar solicitação de HE' })
  async review(@Param('id') id: string, @Body() dto: ReviewOvertimeDto, @Req() req: any) {
    return this.service.review(id, dto, req.user.id);
  }
}
