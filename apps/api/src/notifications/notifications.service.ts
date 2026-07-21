import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string, target?: string, sortBy?: string) {
    const now = new Date();
    // Tự động xóa các thông báo đã quá hạn sử dụng
    await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const where: any = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    };

    if (q) {
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (target && target !== 'all') {
      where.target = target;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'title') orderBy = { title: 'asc' };

    return this.prisma.notification.findMany({
      where,
      orderBy,
      take: 50,
    });
  }

  async create(title: string, content: string, target = 'all', ttl = '24h') {
    const now = Date.now();
    let expiresAt: Date | null = null;

    if (ttl === '1h') expiresAt = new Date(now + 1 * 60 * 60 * 1000);
    else if (ttl === '12h') expiresAt = new Date(now + 12 * 60 * 60 * 1000);
    else if (ttl === '24h') expiresAt = new Date(now + 24 * 60 * 60 * 1000);
    else if (ttl === '7d') expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
    else if (ttl === '30d') expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.notification.create({
      data: { title, content, target, expiresAt },
    });
  }

  async update(id: string, title: string, content: string, target: string, ttl?: string) {
    const data: any = { title, content, target };
    if (ttl) {
      const now = Date.now();
      if (ttl === '1h') data.expiresAt = new Date(now + 1 * 60 * 60 * 1000);
      else if (ttl === '12h') data.expiresAt = new Date(now + 12 * 60 * 60 * 1000);
      else if (ttl === '24h') data.expiresAt = new Date(now + 24 * 60 * 60 * 1000);
      else if (ttl === '7d') data.expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      else if (ttl === '30d') data.expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);
    }
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
