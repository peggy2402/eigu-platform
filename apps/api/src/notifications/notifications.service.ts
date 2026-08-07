import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(user?: any, q?: string, targetQuery?: string, sortBy?: string) {
    const now = new Date();
    // Tự động xóa các thông báo đã quá hạn sử dụng
    await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // 🔒 PHÂN QUYỀN VÀ BẢO MẬT DỮ LIỆU THÔNG BÁO CÁ NHÂN HÓA (Data Isolation):
    // 1. "all": Thông báo chung cho toàn hệ thống
    // 2. "user" / "staff" / "admin": Thông báo theo vai trò
    // 3. "userId" / "user:userId": Thông báo chỉ định đích danh cá nhân
    // 4. "email" / "email:userEmail": Thông báo chỉ định theo Email
    const allowedTargets: string[] = ['all'];

    if (user) {
      const role = (user.role || '').toLowerCase();
      if (role) {
        allowedTargets.push(role);
        if (role === 'admin' || role === 'staff') {
          allowedTargets.push('staff');
          allowedTargets.push('user');
        }
      }

      const userId = user.id || user.userId || user.sub;
      if (userId) {
        allowedTargets.push(String(userId));
        allowedTargets.push(`user:${userId}`);
      }

      if (user.email) {
        allowedTargets.push(String(user.email));
        allowedTargets.push(`email:${user.email}`);
      }
    } else {
      allowedTargets.push('user');
    }

    const where: any = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    };

    if (targetQuery && targetQuery !== 'all') {
      if (user && (user.role || '').toLowerCase() === 'admin') {
        where.target = targetQuery;
      } else {
        where.target = { in: allowedTargets.filter(t => t === targetQuery) };
      }
    } else {
      where.target = { in: allowedTargets };
    }

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

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'title') orderBy = { title: 'asc' };

    return this.prisma.notification.findMany({
      where,
      orderBy,
      take: 50,
    });
  }

  async findAll(q?: string, target?: string, sortBy?: string) {
    return this.findAllForUser(undefined, q, target, sortBy);
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

  async markAllReadForUser(user?: any) {
    if (!user) {
      await this.prisma.notification.updateMany({
        where: { isRead: false, target: 'all' },
        data: { isRead: true },
      });
      return { success: true };
    }

    const userId = user.id || user.userId || user.sub;
    const role = (user.role || '').toLowerCase();
    const userTargets: string[] = ['all'];
    if (role) userTargets.push(role);
    if (userId) {
      userTargets.push(String(userId));
      userTargets.push(`user:${userId}`);
    }
    if (user.email) {
      userTargets.push(String(user.email));
      userTargets.push(`email:${user.email}`);
    }

    await this.prisma.notification.updateMany({
      where: { isRead: false, target: { in: userTargets } },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllRead() {
    return this.markAllReadForUser(undefined);
  }
}
