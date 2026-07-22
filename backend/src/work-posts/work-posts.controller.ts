import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkPostsService } from './work-posts.service';
import {
  CreateWorkPostDto, UpdateWorkPostDto,
  QueryWorkPostsDto, PostType,
} from './dto/work-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Work Posts')
@Controller('work-posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkPostsController {
  constructor(private readonly workPostsService: WorkPostsService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Listar postos de trabalho (paginado)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'contract_id', required: false })
  @ApiQuery({ name: 'post_type', required: false, enum: PostType })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryWorkPostsDto) {
    return this.workPostsService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Estatísticas de postos de trabalho' })
  async getStats() {
    return this.workPostsService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH', 'MANAGER')
  @ApiOperation({ summary: 'Buscar posto de trabalho por ID' })
  async findById(@Param('id') id: string) {
    return this.workPostsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Criar posto de trabalho' })
  async create(@Body() dto: CreateWorkPostDto, @Req() req: any) {
    return this.workPostsService.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualizar posto de trabalho' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorkPostDto, @Req() req: any) {
    return this.workPostsService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar posto de trabalho' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.workPostsService.remove(id, req.user?.id);
  }
}
