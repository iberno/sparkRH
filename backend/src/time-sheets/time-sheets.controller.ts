import {
  Controller, Get, Post, Put,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeSheetsService } from './time-sheets.service';
import { CalculateTimeSheetDto, QueryTimeSheetDto } from './dto/time-sheet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Time Sheets')
@Controller('time-sheets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimeSheetsController {
  constructor(private readonly service: TimeSheetsService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar espelhos de ponto' })
  async findAll(@Query() query: QueryTimeSheetDto) {
    return this.service.findAll(query);
  }

  @Get('my')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Espelho do colaborador logado' })
  async findMy(@Req() req: any) {
    return this.service.findMy(req.user.employee_id);
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Buscar espelho de ponto por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('calculate')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Calcular espelho do período' })
  async calculate(@Body() dto: CalculateTimeSheetDto) {
    return this.service.calculate(dto);
  }

  @Put(':id/approve')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Aprovar espelho de ponto' })
  async approve(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, req.user.id);
  }
}
