import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateWorkPostDto, UpdateWorkPostDto,
  QueryWorkPostsDto,
} from './dto/work-post.dto';

@Injectable()
export class WorkPostsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: QueryWorkPostsDto) {
    const { search, contract_id, post_type, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (contract_id) {
      where.contract_id = contract_id;
    }

    if (post_type) {
      where.post_type = post_type;
    }

    if (status) {
      where.status = status;
    }

    const [workPosts, total] = await Promise.all([
      this.prisma.work_posts.findMany({
        where,
        select: {
          id: true,
          code: true,
          name: true,
          post_type: true,
          address: true,
          city: true,
          state: true,
          schedule_type: true,
          min_staff: true,
          max_staff: true,
          required_vacancies: true,
          status: true,
          created_at: true,
          contract: {
            select: { id: true, contract_number: true, client: { select: { name: true } } },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.work_posts.count({ where }),
    ]);

    return {
      data: workPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const workPost = await this.prisma.work_posts.findUnique({
      where: { id },
      include: {
        contract: {
          select: { id: true, contract_number: true, client: { select: { name: true } } },
        },
        _count: {
          select: { assignments: true },
        },
        post_schedules: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!workPost) {
      throw new NotFoundException('Posto de trabalho não encontrado');
    }

    return workPost;
  }

  async create(dto: CreateWorkPostDto, userId?: string) {
    const existingCode = await this.prisma.work_posts.findFirst({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException('Código do posto já cadastrado');
    }

    const contract = await this.prisma.contracts.findUnique({
      where: { id: dto.contract_id },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    const workPost = await this.prisma.work_posts.create({
      data: {
        contract_id: dto.contract_id,
        code: dto.code,
        name: dto.name,
        post_type: dto.post_type,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        latitude: dto.latitude,
        longitude: dto.longitude,
        gps_radius: dto.gps_radius ?? 100,
        schedule_type: dto.schedule_type ?? 'FIXO',
        min_staff: dto.min_staff ?? 1,
        max_staff: dto.max_staff ?? 5,
        required_vacancies: dto.required_vacancies ?? 1,
        supervisor_id: dto.supervisor_id,
        status: 'ATIVO',
      },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'CREATE',
        entity: 'work_posts',
        entityId: workPost.id,
        newValues: { code: workPost.code, name: workPost.name, post_type: workPost.post_type },
      });
    }

    return workPost;
  }

  async update(id: string, dto: UpdateWorkPostDto, userId?: string) {
    const workPost = await this.prisma.work_posts.findUnique({ where: { id } });

    if (!workPost) {
      throw new NotFoundException('Posto de trabalho não encontrado');
    }

    if (dto.code && dto.code !== workPost.code) {
      const existingCode = await this.prisma.work_posts.findFirst({
        where: { code: dto.code, id: { not: id } },
      });
      if (existingCode) {
        throw new ConflictException('Código do posto já cadastrado');
      }
    }

    const updated = await this.prisma.work_posts.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'UPDATE',
        entity: 'work_posts',
        entityId: id,
        oldValues: { name: workPost.name, status: workPost.status },
        newValues: { name: updated.name, status: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const workPost = await this.prisma.work_posts.findUnique({ where: { id } });

    if (!workPost) {
      throw new NotFoundException('Posto de trabalho não encontrado');
    }

    await this.prisma.work_posts.update({
      where: { id },
      data: { status: 'INATIVO' },
    });

    if (userId) {
      await this.audit.log({
        userId,
        action: 'DELETE',
        entity: 'work_posts',
        entityId: id,
        oldValues: { status: workPost.status },
        newValues: { status: 'INATIVO' },
      });
    }

    return { message: 'Posto de trabalho desativado com sucesso' };
  }

  async getStats() {
    const [total, active, byStatus, byPostType, totalAssignments] = await Promise.all([
      this.prisma.work_posts.count(),
      this.prisma.work_posts.count({ where: { status: 'ATIVO' } }),
      this.prisma.work_posts.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.work_posts.groupBy({
        by: ['post_type'],
        _count: true,
      }),
      this.prisma.assignments.count(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      totalAssignments,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPostType: byPostType.reduce((acc, item) => {
        acc[item.post_type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
