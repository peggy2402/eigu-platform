import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        userEmail: dto.userEmail,
        username: dto.username,
        userRole: dto.userRole || 'user',
        action: dto.action,
        module: dto.module,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        device: dto.device,
        payload: dto.payload,
      },
    });
  }

  async getLogs(query: {
    search?: string;
    role?: string;
    module?: string;
    userEmail?: string;
    page?: number;
    limit?: number;
    requesterEmail?: string;
    requesterRole?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    const requesterRole = (query.requesterRole || 'user').toLowerCase();

    // 🔒 Rule 1: User chỉ được xem Lịch sử của chính mình
    if (requesterRole === 'user') {
      where.userEmail = query.requesterEmail || 'unauthorized@eigu.app';
    }
    // 🔒 Rule 2: Staff được xem nhật ký của Staff & User, NƠI CHẶN XEM NHẬT KÝ ADMIN
    else if (requesterRole === 'staff') {
      if (query.role && query.role !== 'all' && query.role.toLowerCase() !== 'admin') {
        where.userRole = query.role.toLowerCase();
      } else {
        where.userRole = { not: 'admin' };
      }
      if (query.userEmail) {
        where.userEmail = { contains: query.userEmail, mode: 'insensitive' };
      }
    }
    // 🛡️ Rule 3: Admin toàn quyền xem và lọc toàn bộ nhật ký
    else if (requesterRole === 'admin') {
      if (query.role && query.role !== 'all') {
        where.userRole = query.role.toLowerCase();
      }
      if (query.userEmail) {
        where.userEmail = { contains: query.userEmail, mode: 'insensitive' };
      }
    }

    if (query.module && query.module !== 'all') {
      where.module = query.module.toLowerCase();
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { payload: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getStats() {
    const [
      totalUsers,
      staffCount,
      adminCount,
      userRoleCount,
      totalAuditLogs,
      totalNotifications,
      totalFeedbacks,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'staff' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.user.count({ where: { role: 'user' } }),
      this.prisma.auditLog.count(),
      this.prisma.notification.count(),
      this.prisma.feedback.count(),
      this.prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, action: true, module: true, userEmail: true, userRole: true, createdAt: true },
      }),
    ]);

    const actionGroups = await this.prisma.auditLog.groupBy({
      by: ['action'],
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 5,
    });

    const moduleGroups = await this.prisma.auditLog.groupBy({
      by: ['module'],
      _count: { module: true },
      orderBy: { _count: { module: 'desc' } },
      take: 5,
    });

    return {
      totalUsers,
      staffCount,
      adminCount,
      userRoleCount,
      totalAuditLogs,
      totalNotifications,
      totalFeedbacks,
      recentActivity,
      topActions: actionGroups.map(g => ({ action: g.action, count: g._count.action })),
      topModules: moduleGroups.map(g => ({ module: g.module, count: g._count.module })),
    };
  }
}
