import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto, UpdateContractDto,
  UpdateContractStatusDto, QueryContractsDto, ContractStatus,
} from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar contratos (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'client_id', required: false })
  @ApiQuery({ name: 'company_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryContractsDto) {
    return this.contractsService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de contratos' })
  async getStats() {
    return this.contractsService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar contrato por ID' })
  async findById(@Param('id') id: string) {
    return this.contractsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar contrato' })
  async create(@Body() dto: CreateContractDto, @Req() req: any) {
    return this.contractsService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar contrato' })
  async update(@Param('id') id: string, @Body() dto: UpdateContractDto, @Req() req: any) {
    return this.contractsService.update(id, dto, req.user?.id);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar status do contrato' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateContractStatusDto, @Req() req: any) {
    return this.contractsService.updateStatus(id, dto.status, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover contrato (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.contractsService.remove(id, req.user?.id);
  }
}
