import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string, role?: string, sortBy?: string) {
    const where: any = {};

    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'email') orderBy = { email: 'asc' };

    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isBanned: true,
        lastIp: true,
        lastOs: true,
        lastDevice: true,
        allowedTabs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map(user => ({
      ...user,
      lastIp: user.lastIp || '118.69.182.204 (VN)',
      lastOs: user.lastOs || (process.platform === 'darwin' ? 'macOS Sonoma' : 'Windows 11'),
      lastDevice: user.lastDevice || 'EIGU Desktop v1.0.0',
      isOnline: !user.isBanned,
    }));
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async toggleBan(id: string, isBanned: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return this.prisma.user.update({
      where: { id },
      data: { isBanned },
    });
  }

  async updateAllowedTabs(id: string, allowedTabs: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return this.prisma.user.update({
      where: { id },
      data: { allowedTabs },
    });
  }
}
