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

  async getTabPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');

    // Lấy TabPermission từ DB, trả về merge với ALL_TABS
    const dbPerms = await this.prisma.tabPermission.findMany({
      where: { userId },
    });

    const permMap = new Map(dbPerms.map(p => [p.tabKey, p.visible]));

    return this.ALL_TABS.map(tab => ({
      ...tab,
      visible: permMap.has(tab.tabKey) ? permMap.get(tab.tabKey) : true,
    }));
  }

  async setTabPermissions(
    userId: string,
    tabPermissions: { tabKey: string; visible: boolean }[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');

    // Xoá tất cả permissions cũ, tạo mới
    await this.prisma.tabPermission.deleteMany({ where: { userId } });

    if (tabPermissions.length > 0) {
      await this.prisma.tabPermission.createMany({
        data: tabPermissions.map(tp => ({
          userId,
          tabKey: tp.tabKey,
          visible: tp.visible,
        })),
      });
    }

    // Cập nhật allowedTabs string cho backward compatibility
    const visibleTabs = tabPermissions.filter(tp => tp.visible).map(tp => tp.tabKey).join(',');
    await this.prisma.user.update({
      where: { id: userId },
      data: { allowedTabs: visibleTabs || null },
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
