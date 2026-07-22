import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Danh sách tất cả tab có thể cấu hình (parent + sub-items)
  readonly ALL_TABS = [
    { tabKey: 'ho-so', label: 'Hồ sơ', group: 'sidebar' },
    { tabKey: 'tiep-thi', label: 'Tiếp thị liên kết', group: 'sidebar' },
    { tabKey: 'doi-nhom', label: 'Đội nhóm', group: 'sidebar' },
    { tabKey: 'tien-ich', label: 'Tiện ích', group: 'sidebar' },
    { tabKey: 'guide', label: 'Hướng dẫn sử dụng', group: 'sidebar' },

    { tabKey: 'cong-cu', label: 'Công cụ', group: 'sidebar' },
    { tabKey: 'cut', label: 'Tự động cắt', group: 'sidebar', parentKey: 'cong-cu' },
    { tabKey: 'ai-video', label: 'Tạo video AI', group: 'sidebar', parentKey: 'cong-cu' },
    { tabKey: 'reup', label: 'Tạo video Reup', group: 'sidebar', parentKey: 'cong-cu' },
    { tabKey: 'hot-niche', label: 'Tìm ngách hot', group: 'sidebar', parentKey: 'cong-cu' },
    { tabKey: 'bulk-download', label: 'Tải video hàng loạt', group: 'sidebar', parentKey: 'cong-cu' },

    { tabKey: 'tu-dong-hoa', label: 'Tự động hóa', group: 'sidebar' },
    { tabKey: 'workflow', label: 'Tạo workflow', group: 'sidebar', parentKey: 'tu-dong-hoa' },
    { tabKey: 'record', label: 'Ghi thao tác', group: 'sidebar', parentKey: 'tu-dong-hoa' },

    { tabKey: 'tai-khoan', label: 'Tài khoản', group: 'sidebar' },
    { tabKey: 'tk-tiktok', label: 'TikTok', group: 'sidebar', parentKey: 'tai-khoan' },
    { tabKey: 'tk-facebook', label: 'Facebook', group: 'sidebar', parentKey: 'tai-khoan' },
    { tabKey: 'tk-youtube', label: 'YouTube', group: 'sidebar', parentKey: 'tai-khoan' },
    { tabKey: 'tk-x', label: 'X (Twitter)', group: 'sidebar', parentKey: 'tai-khoan' },
    { tabKey: 'tk-instagram', label: 'Instagram', group: 'sidebar', parentKey: 'tai-khoan' },
    { tabKey: 'tk-threads', label: 'Threads', group: 'sidebar', parentKey: 'tai-khoan' },

    { tabKey: 'settings', label: 'Cài đặt', group: 'profile' },
    { tabKey: 'feedback', label: 'Góp ý / Báo lỗi', group: 'profile' },
  ];

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
        bannedUntil: true,
        banReason: true,
        lastActiveAt: true,
        lastIp: true,
        lastOs: true,
        lastDevice: true,
        hiddenTabs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const now = new Date();

    return users.map(user => {
      let isBannedActive = user.isBanned;
      let bannedUntil = user.bannedUntil;

      if (user.isBanned && user.bannedUntil) {
        if (now >= new Date(user.bannedUntil)) {
          isBannedActive = false;
          bannedUntil = null;
          // Async auto-unban DB update in background
          this.prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, bannedUntil: null, banReason: null },
          }).catch(() => {});
        }
      }

      const activeDate = user.lastActiveAt || user.updatedAt || user.createdAt;
      const isOnline = !!user.lastActiveAt && (now.getTime() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000);

      return {
        ...user,
        isBanned: isBannedActive,
        bannedUntil,
        banReason: user.banReason,
        lastActiveAt: activeDate,
        lastIp: user.lastIp || '127.0.0.1 (Localhost)',
        lastOs: user.lastOs || 'Desktop Client',
        lastDevice: user.lastDevice || 'Electron Client',
        isOnline,
      };
    });
  }

  async getTabPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');

    const hiddenSet = new Set(user.hiddenTabs || []);

    return this.ALL_TABS.map(tab => ({
      ...tab,
      visible: !hiddenSet.has(tab.tabKey),
    }));
  }

  async setTabPermissions(
    userId: string,
    tabPermissions: { tabKey: string; visible: boolean }[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');

    const hiddenTabs = tabPermissions.filter(tp => !tp.visible).map(tp => tp.tabKey);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hiddenTabs },
    });

    return this.getTabPermissions(userId);
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async toggleBan(id: string, isBanned: boolean, bannedUntilRaw?: string | null, banReasonRaw?: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');

    const bannedUntil = (isBanned && bannedUntilRaw) ? new Date(bannedUntilRaw) : null;
    const banReason = isBanned ? (banReasonRaw || null) : null;

    return this.prisma.user.update({
      where: { id },
      data: {
        isBanned,
        bannedUntil,
        banReason,
      },
    });
  }

  async updateAllowedTabs(id: string, allowedTabs: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    const hiddenTabs = (allowedTabs || '').split(',').filter(Boolean);
    return this.prisma.user.update({
      where: { id },
      data: { hiddenTabs },
    });
  }
}
