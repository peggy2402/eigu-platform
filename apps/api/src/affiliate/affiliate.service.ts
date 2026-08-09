import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AdminUpdatePayoutDto, PayoutStatusAction } from './dto/admin-update-payout.dto';
import {
  AffiliateStatsDto,
  ReferredUserDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
  AdminAffiliateStatsDto,
} from '@eigu-platform/shared';

@Injectable()
export class AffiliateService implements OnModuleInit {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly DEFAULT_COMMISSION_RATE = 15; // 15%
  private readonly MIN_PAYOUT_THRESHOLD = 200000; // 200,000 VNĐ

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async onModuleInit() {
    await this.syncAllUsersReferralCodes();
  }

  async syncAllUsersReferralCodes() {
    try {
      const usersWithoutCode = await this.prisma.user.findMany({
        where: {
          OR: [
            { referralCode: null },
            { referralCode: '' }
          ]
        },
        select: { id: true, email: true, username: true }
      });

      if (usersWithoutCode.length > 0) {
        this.logger.log(`[AffiliateSync] Found ${usersWithoutCode.length} users missing referralCode. Backfilling now...`);
        for (const u of usersWithoutCode) {
          const code = await this.ensureUserReferralCode(u.id);
          this.logger.log(`[AffiliateSync] Backfilled user ${u.email || u.username} -> Code: ${code}`);
        }
        this.logger.log(`[AffiliateSync] Successfully backfilled referralCodes for all users in DB!`);
      }
    } catch (err: any) {
      this.logger.error('[AffiliateSync] Error backfilling referralCodes:', err.message);
    }
  }


  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return 'user***';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  }

  private async ensureUserReferralCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (user && user.referralCode) {
      return user.referralCode;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 20) {
      let rand = '';
      for (let i = 0; i < 4; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code = `EIGU${rand}`;
      const existing = await this.prisma.user.findFirst({ where: { referralCode: code } });
      if (!existing) isUnique = true;
      attempts++;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });
    return code;
  }

  /**
   * Lấy tổng quan số liệu Tiếp thị liên kết cá nhân
   */
  async getStats(userId: string): Promise<AffiliateStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        affiliateBalance: true,
        affiliateWithdrawn: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const referralCode = user.referralCode || (await this.ensureUserReferralCode(userId));
    const referralLink = `https://eigu.site?ref=${referralCode}`;

    const [clickCount, referredCount, commissionSum] = await Promise.all([
      this.prisma.affiliateClick.count({
        where: { referralCode },
      }),
      this.prisma.user.count({
        where: { referredById: userId },
      }),
      this.prisma.affiliateCommission.aggregate({
        where: { referrerId: userId, status: 'COMPLETED' },
        _sum: { commissionAmount: true },
      }),
    ]);

    const totalCommissionEarned = Number(commissionSum._sum.commissionAmount || 0);

    return {
      referralCode,
      referralLink,
      clickCount,
      referredCount,
      totalCommissionEarned,
      affiliateBalance: Number(user.affiliateBalance),
      affiliateWithdrawn: Number(user.affiliateWithdrawn),
      commissionRate: this.DEFAULT_COMMISSION_RATE,
      minPayoutThreshold: this.MIN_PAYOUT_THRESHOLD,
    };
  }

  /**
   * Ghi nhận lượt nhấp đường dẫn tiếp thị công khai
   */
  async recordClick(referralCode: string, ipAddress?: string, userAgent?: string) {
    if (!referralCode) return { success: false };
    const cleanCode = referralCode.trim().toUpperCase();

    const referrer = await this.prisma.user.findFirst({
      where: { referralCode: cleanCode },
      select: { id: true },
    });

    if (!referrer) {
      return { success: false, message: 'Mã giới thiệu không tồn tại' };
    }

    await this.prisma.affiliateClick.create({
      data: {
        referralCode: cleanCode,
        referrerId: referrer.id,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return { success: true };
  }

  /**
   * Danh sách người dùng được cấp dưới giới thiệu
   */
  async getReferrals(userId: string, page = 1, limit = 10) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [total, referrals] = await Promise.all([
      this.prisma.user.count({ where: { referredById: userId } }),
      this.prisma.user.findMany({
        where: { referredById: userId },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          isVerified: true,
          isBanned: true,
          affiliateCommissionsGenerated: {
            where: { referrerId: userId, status: 'COMPLETED' },
            select: { commissionAmount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: ReferredUserDto[] = referrals.map((ref) => {
      const totalGen = ref.affiliateCommissionsGenerated.reduce(
        (sum, item) => sum + Number(item.commissionAmount),
        0,
      );
      return {
        id: ref.id,
        maskedEmail: this.maskEmail(ref.email),
        username: ref.username,
        createdAt: ref.createdAt.toISOString(),
        status: ref.isBanned ? 'banned' : ref.isVerified ? 'active' : 'unverified',
        isVerified: ref.isVerified,
        totalCommissionGenerated: totalGen,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Lịch sử nhận hoa hồng tiếp thị
   */
  async getCommissions(userId: string, page = 1, limit = 10) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [total, commissions] = await Promise.all([
      this.prisma.affiliateCommission.count({ where: { referrerId: userId } }),
      this.prisma.affiliateCommission.findMany({
        where: { referrerId: userId },
        include: {
          referredUser: {
            select: { email: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: AffiliateCommissionDto[] = commissions.map((comm) => ({
      id: comm.id,
      code: comm.code,
      referredUserEmail: this.maskEmail(comm.referredUser.email),
      sourceType: comm.sourceType,
      sourceId: comm.sourceId,
      orderAmount: Number(comm.orderAmount),
      rate: Number(comm.rate),
      commissionAmount: Number(comm.commissionAmount),
      status: comm.status,
      createdAt: comm.createdAt.toISOString(),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Tạo yêu cầu rút tiền số dư hoa hồng
   */
  async createPayoutRequest(userId: string, dto: CreatePayoutDto) {
    if (dto.amount < this.MIN_PAYOUT_THRESHOLD) {
      throw new BadRequestException(`Số tiền rút tối thiểu là ${this.MIN_PAYOUT_THRESHOLD.toLocaleString('vi-VN')} VNĐ`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, affiliateBalance: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const currentBalance = Number(user.affiliateBalance);
    if (currentBalance < dto.amount) {
      throw new BadRequestException(
        `Số dư hoa hồng không đủ (${currentBalance.toLocaleString('vi-VN')} VNĐ < ${dto.amount.toLocaleString('vi-VN')} VNĐ)`,
      );
    }

    // Sinh mã đơn rút tiền PAYOUT-xxxxx
    const payoutCode = `PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`;

    const payout = await this.prisma.$transaction(async (tx) => {
      // Trừ số dư affiliateBalance
      await tx.user.update({
        where: { id: userId },
        data: {
          affiliateBalance: { decrement: dto.amount },
        },
      });

      return tx.affiliatePayout.create({
        data: {
          code: payoutCode,
          userId,
          amount: dto.amount,
          bankName: dto.bankName.trim(),
          accountNumber: dto.accountNumber.trim(),
          accountHolder: dto.accountHolder.trim().toUpperCase(),
          status: 'PENDING',
        },
      });
    });

    this.logger.log(`[Affiliate] User ${user.email} gửi yêu cầu rút tiền #${payout.code} (${dto.amount.toLocaleString('vi-VN')}đ)`);

    // Gửi thông báo đến người dùng
    await this.notificationsService.create(
      `Yêu cầu rút tiền #${payout.code}`,
      `Yêu cầu rút ${dto.amount.toLocaleString('vi-VN')} VNĐ về ngân hàng ${dto.bankName} (${dto.accountNumber}) đã được ghi nhận và đang chờ Admin xét duyệt.`,
      `user:${userId}`,
    );


    return {
      success: true,
      message: 'Gửi yêu cầu rút tiền thành công',
      payout: {
        id: payout.id,
        code: payout.code,
        amount: Number(payout.amount),
        bankName: payout.bankName,
        accountNumber: payout.accountNumber,
        accountHolder: payout.accountHolder,
        status: payout.status,
        createdAt: payout.createdAt.toISOString(),
      },
    };
  }

  /**
   * Lịch sử các đơn yêu cầu rút tiền của User
   */
  async getPayouts(userId: string, page = 1, limit = 10) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [total, payouts] = await Promise.all([
      this.prisma.affiliatePayout.count({ where: { userId } }),
      this.prisma.affiliatePayout.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: AffiliatePayoutDto[] = payouts.map((p) => ({
      id: p.id,
      code: p.code,
      userId: p.userId,
      amount: Number(p.amount),
      bankName: p.bankName,
      accountNumber: p.accountNumber,
      accountHolder: p.accountHolder,
      status: p.status as any,
      adminNote: p.adminNote,
      processedAt: p.processedAt ? p.processedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Tự động tính & cộng hoa hồng khi giao dịch của cấp dưới hoàn tất
   */
  async processCommission(referredUserId: string, sourceType: string, sourceId: string | null, orderAmount: number) {
    if (!orderAmount || orderAmount <= 0) return;

    const user = await this.prisma.user.findUnique({
      where: { id: referredUserId },
      select: { id: true, email: true, username: true, referredById: true },
    });

    if (!user || !user.referredById) {
      return; // Không có người giới thiệu
    }

    const referrerId = user.referredById;
    const rate = this.DEFAULT_COMMISSION_RATE;
    const commissionAmount = Math.round((orderAmount * rate) / 100);

    if (commissionAmount <= 0) return;

    const commCode = `COMM-${Math.floor(100000 + Math.random() * 900000)}`;

    await this.prisma.$transaction(async (tx) => {
      // 1. Tạo ghi nhận AffiliateCommission
      await tx.affiliateCommission.create({
        data: {
          code: commCode,
          referrerId,
          referredUserId,
          sourceType,
          sourceId,
          orderAmount,
          rate,
          commissionAmount,
          status: 'COMPLETED',
        },
      });

      // 2. Cộng số dư hoa hồng cho Referrer
      await tx.user.update({
        where: { id: referrerId },
        data: {
          affiliateBalance: { increment: commissionAmount },
        },
      });
    });

    this.logger.log(
      `[Affiliate Commission] Cộng +${commissionAmount.toLocaleString('vi-VN')}đ (${rate}%) cho Referrer ${referrerId} từ đơn của ${user.email}`,
    );

    // Thông báo cho Referrer
    await this.notificationsService.create(
      `Hoa hồng tiếp thị +${commissionAmount.toLocaleString('vi-VN')} VNĐ`,
      `Bạn nhận được +${commissionAmount.toLocaleString('vi-VN')} VNĐ hoa hồng tiếp thị từ giao dịch của thành viên cấp dưới (${this.maskEmail(user.email)}).`,
      `user:${referrerId}`,
    );
  }

  // ==========================================
  // ADMIN API ENDPOINTS
  // ==========================================

  /**
   * Admin: Xem toàn bộ danh sách đơn rút tiền
   */
  async getAdminPayouts(status?: string, page = 1, limit = 20) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [total, payouts] = await Promise.all([
      this.prisma.affiliatePayout.count({ where }),
      this.prisma.affiliatePayout.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: AffiliatePayoutDto[] = payouts.map((p) => ({
      id: p.id,
      code: p.code,
      userId: p.userId,
      userEmail: p.user.email,
      username: p.user.username,
      amount: Number(p.amount),
      bankName: p.bankName,
      accountNumber: p.accountNumber,
      accountHolder: p.accountHolder,
      status: p.status as any,
      adminNote: p.adminNote,
      processedAt: p.processedAt ? p.processedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Admin: Duyệt (Approve) hoặc Từ chối (Reject) đơn rút tiền
   */
  async updatePayoutStatus(payoutId: string, dto: AdminUpdatePayoutDto, adminId: string) {
    const payout = await this.prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: { user: true },
    });

    if (!payout) {
      throw new NotFoundException('Không tìm thấy yêu cầu rút tiền');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException(`Đơn rút tiền #${payout.code} đã xử lý trước đó (${payout.status})`);
    }

    const amount = Number(payout.amount);

    if (dto.status === PayoutStatusAction.APPROVED) {
      await this.prisma.$transaction(async (tx) => {
        await tx.affiliatePayout.update({
          where: { id: payoutId },
          data: {
            status: 'APPROVED',
            adminNote: dto.adminNote || 'Đã chuyển khoản thành công',
            processedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: payout.userId },
          data: {
            affiliateWithdrawn: { increment: amount },
          },
        });
      });

      this.logger.log(`[Affiliate Admin] Admin ${adminId} đã DUYỆT đơn rút tiền #${payout.code} (${amount}đ) của ${payout.user.email}`);

      await this.notificationsService.create(
        `Đã chuyển khoản rút tiền #${payout.code}`,
        `Yêu cầu rút tiền ${amount.toLocaleString('vi-VN')} VNĐ của bạn đã được Admin duyệt và chuyển khoản thành công.`,
        `user:${payout.userId}`,
      );

      await this.auditLogsService.createLog({
        userId: adminId,
        userEmail: payout.user.email,
        username: payout.user.username || undefined,
        userRole: payout.user.role,
        action: 'APPROVE_AFFILIATE_PAYOUT',
        module: 'AFFILIATE',
        payload: JSON.stringify({ payoutId, amount, code: payout.code }),
      });

      return { success: true, message: `Đã duyệt đơn rút tiền #${payout.code}` };
    } else {
      // REJECTED: Hoàn lại tiền về số dư affiliateBalance
      await this.prisma.$transaction(async (tx) => {
        await tx.affiliatePayout.update({
          where: { id: payoutId },
          data: {
            status: 'REJECTED',
            adminNote: dto.adminNote || 'Từ chối rút tiền, hoàn lại số dư',
            processedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: payout.userId },
          data: {
            affiliateBalance: { increment: amount },
          },
        });
      });

      this.logger.log(`[Affiliate Admin] Admin ${adminId} TỪ CHỐI đơn rút tiền #${payout.code} (${amount}đ) của ${payout.user.email}`);

      await this.notificationsService.create(
        `Từ chối đơn rút tiền #${payout.code}`,
        `Yêu cầu rút tiền ${amount.toLocaleString('vi-VN')} VNĐ của bạn bị từ chối. Lý do: ${dto.adminNote || 'Không hợp lệ'}. Số tiền đã được hoàn lại vào tài khoản.`,
        `user:${payout.userId}`,
      );

      await this.auditLogsService.createLog({
        userId: adminId,
        userEmail: payout.user.email,
        username: payout.user.username || undefined,
        userRole: payout.user.role,
        action: 'REJECT_AFFILIATE_PAYOUT',
        module: 'AFFILIATE',
        payload: JSON.stringify({ payoutId, amount, code: payout.code, note: dto.adminNote }),
      });

      return { success: true, message: `Đã từ chối đơn rút tiền #${payout.code} và hoàn tiền lại cho user` };
    }
  }

  /**
   * Admin: Thống kê Affiliate toàn hệ thống
   */
  async getAdminStats(): Promise<AdminAffiliateStatsDto> {
    const [totalClicks, totalReferredUsers, paidSum, pendingSum, pendingCount] = await Promise.all([
      this.prisma.affiliateClick.count(),
      this.prisma.user.count({ where: { referredById: { not: null } } }),
      this.prisma.affiliatePayout.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      this.prisma.affiliatePayout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.affiliatePayout.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalReferralClicks: totalClicks,
      totalReferredUsers,
      totalCommissionsPaid: Number(paidSum._sum.amount || 0),
      totalPendingPayoutsAmount: Number(pendingSum._sum.amount || 0),
      pendingPayoutsCount: pendingCount,
    };
  }
}
