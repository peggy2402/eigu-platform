import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AdminUpdatePayoutDto, PayoutStatusAction } from './dto/admin-update-payout.dto';
import { UpdateBankSettingsDto } from './dto/update-bank-settings.dto';
import { UpdateAffiliateConfigDto } from './dto/admin-config.dto';
import {
  AffiliateStatsDto,
  ReferredUserDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
  AdminAffiliateStatsDto,
  AdminAffiliateConfigDto,
  UserBankSettingsDto,
} from '@eigu-platform/shared';

@Injectable()
export class AffiliateService implements OnModuleInit {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly DEFAULT_COMMISSION_RATE = 15; // 15%
  private readonly DEFAULT_MIN_PAYOUT = 200000; // 200,000 VNĐ
  private readonly DEFAULT_PAYOUT_FEE_PERCENT = 0; // 0%
  private readonly DEFAULT_PAYOUT_FEE_FIXED = 0; // 0 VNĐ

  // In-memory cache for system config
  private cachedCommissionRate: number | null = null;
  private cachedMinPayoutThreshold: number | null = null;
  private cachedPayoutFeePercent: number | null = null;
  private cachedPayoutFeeFixed: number | null = null;
  private configCacheExpiry = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async onModuleInit() {
    await this.syncAllUsersReferralCodes();
    await this.loadSystemConfig();
  }

  /**
   * Đọc cấu hình % hoa hồng, hạn mức rút tiền và phí rút từ bảng SystemConfig
   */
  private async loadSystemConfig(): Promise<{
    commissionRate: number;
    minPayoutThreshold: number;
    payoutFeePercent: number;
    payoutFeeFixed: number;
  }> {
    const now = Date.now();
    if (
      this.cachedCommissionRate !== null &&
      this.cachedMinPayoutThreshold !== null &&
      this.cachedPayoutFeePercent !== null &&
      this.cachedPayoutFeeFixed !== null &&
      now < this.configCacheExpiry
    ) {
      return {
        commissionRate: this.cachedCommissionRate,
        minPayoutThreshold: this.cachedMinPayoutThreshold,
        payoutFeePercent: this.cachedPayoutFeePercent,
        payoutFeeFixed: this.cachedPayoutFeeFixed,
      };
    }

    try {
      const [rateCfg, minPayoutCfg, feePercentCfg, feeFixedCfg] = await Promise.all([
        this.prisma.systemConfig.findUnique({ where: { key: 'AFFILIATE_COMMISSION_RATE' } }),
        this.prisma.systemConfig.findUnique({ where: { key: 'AFFILIATE_MIN_PAYOUT_THRESHOLD' } }),
        this.prisma.systemConfig.findUnique({ where: { key: 'AFFILIATE_PAYOUT_FEE_PERCENT' } }),
        this.prisma.systemConfig.findUnique({ where: { key: 'AFFILIATE_PAYOUT_FEE_FIXED' } }),
      ]);

      this.cachedCommissionRate = rateCfg ? Number(rateCfg.value) : this.DEFAULT_COMMISSION_RATE;
      this.cachedMinPayoutThreshold = minPayoutCfg ? Number(minPayoutCfg.value) : this.DEFAULT_MIN_PAYOUT;
      this.cachedPayoutFeePercent = feePercentCfg ? Number(feePercentCfg.value) : this.DEFAULT_PAYOUT_FEE_PERCENT;
      this.cachedPayoutFeeFixed = feeFixedCfg ? Number(feeFixedCfg.value) : this.DEFAULT_PAYOUT_FEE_FIXED;
      this.configCacheExpiry = now + 60000; // Cache 60s
    } catch (err: any) {
      this.logger.warn(`[AffiliateConfig] Error loading system configs, using defaults: ${err.message}`);
      this.cachedCommissionRate = this.DEFAULT_COMMISSION_RATE;
      this.cachedMinPayoutThreshold = this.DEFAULT_MIN_PAYOUT;
      this.cachedPayoutFeePercent = this.DEFAULT_PAYOUT_FEE_PERCENT;
      this.cachedPayoutFeeFixed = this.DEFAULT_PAYOUT_FEE_FIXED;
    }

    return {
      commissionRate: this.cachedCommissionRate,
      minPayoutThreshold: this.cachedMinPayoutThreshold,
      payoutFeePercent: this.cachedPayoutFeePercent,
      payoutFeeFixed: this.cachedPayoutFeeFixed,
    };
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
   * Lấy tổng quan số liệu Tiếp thị liên kết cá nhân (bao gồm thông tin ngân hàng đã lưu)
   */
  async getStats(userId: string): Promise<AffiliateStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        affiliateBalance: true,
        affiliateWithdrawn: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const referralCode = user.referralCode || (await this.ensureUserReferralCode(userId));
    const referralLink = `https://eigu.site?ref=${referralCode}`;
    const { commissionRate, minPayoutThreshold } = await this.loadSystemConfig();

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
      commissionRate,
      minPayoutThreshold,
      payoutFeePercent: this.cachedPayoutFeePercent ?? this.DEFAULT_PAYOUT_FEE_PERCENT,
      payoutFeeFixed: this.cachedPayoutFeeFixed ?? this.DEFAULT_PAYOUT_FEE_FIXED,
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
      bankAccountHolder: user.bankAccountHolder,
    };
  }

  /**
   * Lấy thông tin ngân hàng mặc định của user
   */
  async getBankSettings(userId: string): Promise<UserBankSettingsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { bankName: true, bankAccountNumber: true, bankAccountHolder: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản người dùng');

    return {
      bankName: user.bankName || '',
      bankAccountNumber: user.bankAccountNumber || '',
      bankAccountHolder: user.bankAccountHolder || '',
    };
  }

  /**
   * Cập nhật thông tin ngân hàng mặc định của user
   */
  async updateBankSettings(userId: string, dto: UpdateBankSettingsDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bankName: dto.bankName.trim(),
        bankAccountNumber: dto.bankAccountNumber.trim(),
        bankAccountHolder: dto.bankAccountHolder.trim().toUpperCase(),
      },
      select: {
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
      },
    });

    return {
      success: true,
      message: 'Cập nhật tài khoản ngân hàng nhận tiền thành công',
      data: updated,
    };
  }

  /**
   * Ghi nhận lượt nhấp đường dẫn tiếp thị công khai
   */
  async recordClick(referralCode: string, ipAddress?: string, userAgent?: string, currentUserId?: string) {
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

    // Nếu người dùng hiện tại đã đăng nhập nhưng chưa có người giới thiệu, tự động liên kết với Referrer
    if (currentUserId && currentUserId !== referrer.id) {
      try {
        const currentUser = await this.prisma.user.findUnique({
          where: { id: currentUserId },
          select: { id: true, referredById: true },
        });
        if (currentUser && !currentUser.referredById) {
          await this.prisma.user.update({
            where: { id: currentUserId },
            data: { referredById: referrer.id },
          });
          this.logger.log(`[Affiliate Click] Auto-linked logged-in user ${currentUserId} to Referrer ${referrer.id} via click ${cleanCode}`);
        }
      } catch (err: any) {
        this.logger.error(`[Affiliate Click] Error linking current user to referrer: ${err?.message}`);
      }
    }

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
   * Tạo yêu cầu rút tiền số dư hoa hồng (Tự động lưu mặc định nếu được yêu cầu hoặc chưa có)
   */
  async createPayoutRequest(userId: string, dto: CreatePayoutDto) {
    const { minPayoutThreshold } = await this.loadSystemConfig();

    if (dto.amount < minPayoutThreshold) {
      throw new BadRequestException(`Số tiền rút tối thiểu là ${minPayoutThreshold.toLocaleString('vi-VN')} VNĐ`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        affiliateBalance: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
      },
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

    const cfg = await this.loadSystemConfig();
    const fee = Math.round(dto.amount * (cfg.payoutFeePercent / 100)) + cfg.payoutFeeFixed;
    const netAmount = Math.max(0, dto.amount - fee);

    const payout = await this.prisma.$transaction(async (tx) => {
      // Trừ số dư affiliateBalance
      const userUpdateData: any = {
        affiliateBalance: { decrement: dto.amount },
      };

      // Tự động lưu/cập nhật thông tin ngân hàng mặc định nếu chưa có hoặc có cờ saveAsDefault
      if (dto.saveAsDefault || !user.bankName || !user.bankAccountNumber) {
        userUpdateData.bankName = dto.bankName.trim();
        userUpdateData.bankAccountNumber = dto.accountNumber.trim();
        userUpdateData.bankAccountHolder = dto.accountHolder.trim().toUpperCase();
      }

      await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });

      return tx.affiliatePayout.create({
        data: {
          code: payoutCode,
          userId,
          amount: dto.amount,
          fee,
          netAmount,
          bankName: dto.bankName.trim(),
          accountNumber: dto.accountNumber.trim(),
          accountHolder: dto.accountHolder.trim().toUpperCase(),
          status: 'PENDING',
        },
      });
    });

    this.logger.log(
      `[Affiliate] User ${user.email} gửi yêu cầu rút tiền #${payout.code} (Rút: ${dto.amount.toLocaleString('vi-VN')}đ | Phí: ${fee.toLocaleString('vi-VN')}đ | Thực nhận: ${netAmount.toLocaleString('vi-VN')}đ)`,
    );

    // Gửi thông báo đến người dùng
    await this.notificationsService.create(
      `Yêu cầu rút tiền #${payout.code}`,
      `Yêu cầu rút ${dto.amount.toLocaleString('vi-VN')} VNĐ (Thực nhận: ${netAmount.toLocaleString('vi-VN')} VNĐ) về ngân hàng ${dto.bankName} (${dto.accountNumber}) đã được ghi nhận và đang chờ Admin xét duyệt.`,
      `user:${userId}`,
    );

    return {
      success: true,
      message: 'Gửi yêu cầu rút tiền thành công',
      payout: {
        id: payout.id,
        code: payout.code,
        amount: Number(payout.amount),
        fee: Number(payout.fee),
        netAmount: Number(payout.netAmount),
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

    const items: AffiliatePayoutDto[] = payouts.map((p) => {
      const amount = Number(p.amount);
      const fee = Number(p.fee || 0);
      const netAmount = Number(p.netAmount || (amount - fee));
      return {
        id: p.id,
        code: p.code,
        userId: p.userId,
        amount,
        fee,
        netAmount,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountHolder: p.accountHolder,
        status: p.status as any,
        adminNote: p.adminNote,
        processedAt: p.processedAt ? p.processedAt.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
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
   * Tự động tính & cộng hoa hồng khi giao dịch của cấp dưới hoàn tất
   */
  async processCommission(referredUserId: string, sourceType: string, sourceId: string | null, orderAmount: number) {
    if (!orderAmount || orderAmount <= 0) return;

    const user = await this.prisma.user.findUnique({
      where: { id: referredUserId },
      select: { id: true, email: true, username: true, referredById: true },
    });

    if (!user || !user.referredById) return;

    const referrerId = user.referredById;
    const { commissionRate } = await this.loadSystemConfig();

    const commissionAmount = Math.round((orderAmount * commissionRate) / 100);
    if (commissionAmount <= 0) return;

    const commissionCode = `COMM-${Math.floor(100000 + Math.random() * 900000)}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.affiliateCommission.create({
        data: {
          code: commissionCode,
          referrerId,
          referredUserId,
          sourceType,
          sourceId,
          orderAmount,
          rate: commissionRate,
          commissionAmount,
          status: 'COMPLETED',
        },
      });

      await tx.user.update({
        where: { id: referrerId },
        data: {
          affiliateBalance: { increment: commissionAmount },
        },
      });
    });

    this.logger.log(
      `[Affiliate] Đã cộng +${commissionAmount.toLocaleString('vi-VN')} VNĐ (${commissionRate}%) hoa hồng cho user ${referrerId} từ đơn #${sourceId} (${orderAmount.toLocaleString('vi-VN')} VNĐ) của ${user.email}`,
    );

    // Thông báo cho Referrer
    await this.notificationsService.create(
      `Hoa hồng tiếp thị +${commissionAmount.toLocaleString('vi-VN')} VNĐ`,
      `Bạn nhận được +${commissionAmount.toLocaleString('vi-VN')} VNĐ hoa hồng tiếp thị từ giao dịch của thành viên cấp dưới (${this.maskEmail(user.email)}).`,
      `user:${referrerId}`,
    );
  }

  // ==========================================
  // ADMIN API ENDPOINTS (STRICT ADMIN ONLY)
  // ==========================================

  /**
   * Admin: Xem toàn bộ danh sách đơn rút tiền (Có hỗ trợ tìm kiếm theo Mã/Email/STK/Tên)
   */
  async getAdminPayouts(status?: string, page = 1, limit = 20, search?: string) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { accountNumber: { contains: q, mode: 'insensitive' } },
        { accountHolder: { contains: q, mode: 'insensitive' } },
        { bankName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { username: { contains: q, mode: 'insensitive' } } },
      ];
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

    const items: AffiliatePayoutDto[] = payouts.map((p) => {
      const amount = Number(p.amount);
      const fee = Number(p.fee || 0);
      const netAmount = Number(p.netAmount || (amount - fee));
      return {
        id: p.id,
        code: p.code,
        userId: p.userId,
        userEmail: p.user.email,
        username: p.user.username,
        amount,
        fee,
        netAmount,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountHolder: p.accountHolder,
        status: p.status as any,
        adminNote: p.adminNote,
        processedAt: p.processedAt ? p.processedAt.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
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
   * Admin: Tra cứu nguồn gốc dòng tiền & Bằng chứng hoa hồng (Audit Trail)
   */
  async getAdminPayoutAudit(payoutId: string) {
    const payout = await this.prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            referralCode: true,
            affiliateBalance: true,
            affiliateWithdrawn: true,
            createdAt: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Không tìm thấy đơn rút tiền');
    }

    // 1. Tổng hợp toàn bộ dòng tiền hoa hồng và doanh thu từ F1
    const [commissionAgg, commissions, previousPayouts] = await Promise.all([
      this.prisma.affiliateCommission.aggregate({
        where: { referrerId: payout.userId },
        _sum: { commissionAmount: true, orderAmount: true },
        _count: { id: true },
      }),
      this.prisma.affiliateCommission.findMany({
        where: { referrerId: payout.userId },
        include: {
          referredUser: {
            select: { id: true, email: true, username: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.affiliatePayout.findMany({
        where: {
          userId: payout.userId,
          status: 'APPROVED',
          id: { not: payout.id },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalOrderAmountByDownlines = Number(commissionAgg._sum.orderAmount || 0);
    const totalCommissionEarned = Number(commissionAgg._sum.commissionAmount || 0);
    const totalDownlineOrdersCount = commissionAgg._count.id;
    const totalPreviousWithdrawn = previousPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const payoutAmount = Number(payout.amount);
    const fee = Number(payout.fee || 0);
    const netAmount = Number(payout.netAmount || (payoutAmount - fee));
    const isLegitBalance = totalCommissionEarned >= (totalPreviousWithdrawn + payoutAmount);

    return {
      payout: {
        id: payout.id,
        code: payout.code,
        amount: payoutAmount,
        fee,
        netAmount,
        bankName: payout.bankName,
        accountNumber: payout.accountNumber,
        accountHolder: payout.accountHolder,
        status: payout.status,
        adminNote: payout.adminNote,
        createdAt: payout.createdAt.toISOString(),
      },
      user: {
        id: payout.user.id,
        email: payout.user.email,
        username: payout.user.username,
        referralCode: payout.user.referralCode,
        currentAffiliateBalance: Number(payout.user.affiliateBalance || 0),
        affiliateWithdrawn: Number(payout.user.affiliateWithdrawn || 0),
        totalCommissionEarned,
        createdAt: payout.user.createdAt.toISOString(),
      },
      summary: {
        totalDownlineOrdersCount,
        totalOrderAmountByDownlines,
        totalCommissionGenerated: totalCommissionEarned,
        totalPreviousWithdrawn,
        isLegitBalance,
      },
      commissions: commissions.map((c) => ({
        id: c.id,
        code: c.code,
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        orderAmount: Number(c.orderAmount),
        rate: Number(c.rate),
        commissionAmount: Number(c.commissionAmount),
        buyerEmail: this.maskEmail(c.referredUser?.email || ''),
        buyerUsername: c.referredUser?.username,
        createdAt: c.createdAt.toISOString(),
      })),
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

    const updatedPayout = await this.prisma.$transaction(async (tx) => {
      if (dto.status === 'APPROVED') {
        // Tăng affiliateWithdrawn
        await tx.user.update({
          where: { id: payout.userId },
          data: {
            affiliateWithdrawn: { increment: payout.amount },
          },
        });
      } else if (dto.status === 'REJECTED') {
        // Hoàn lại số dư affiliateBalance
        await tx.user.update({
          where: { id: payout.userId },
          data: {
            affiliateBalance: { increment: payout.amount },
          },
        });
      }

      return tx.affiliatePayout.update({
        where: { id: payoutId },
        data: {
          status: dto.status,
          adminNote: dto.adminNote?.trim() || null,
          processedAt: new Date(),
        },
      });
    });

    this.logger.log(`[Affiliate] Admin ${adminId} đã cập nhật đơn #${payout.code} -> ${dto.status}`);

    // Gửi thông báo đến User
    const statusText = dto.status === 'APPROVED' ? 'được phê duyệt thành công' : 'bị từ chối';
    const noteText = dto.adminNote ? ` (Ghi chú: ${dto.adminNote})` : '';
    await this.notificationsService.create(
      `Đơn rút tiền #${payout.code} ${statusText}`,
      `Yêu cầu rút ${(Number(payout.amount)).toLocaleString('vi-VN')} VNĐ của bạn đã ${statusText}.${noteText}`,
      `user:${payout.userId}`,
    );

    // Ghi Audit Log
    await this.auditLogsService.createLog({
      userId: adminId,
      action: `PAYOUT_${dto.status}`,
      module: 'AFFILIATE',
      payload: JSON.stringify({
        payoutId,
        code: payout.code,
        amount: Number(payout.amount),
        status: dto.status,
        adminNote: dto.adminNote,
      }),
    });

    return {
      success: true,
      message: dto.status === 'APPROVED' ? 'Đã duyệt đơn rút tiền' : 'Đã từ chối đơn rút tiền',
      payout: {
        id: updatedPayout.id,
        code: updatedPayout.code,
        status: updatedPayout.status,
        adminNote: updatedPayout.adminNote,
        processedAt: updatedPayout.processedAt?.toISOString(),
      },
    };
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

  /**
   * Admin: Lấy cấu hình hệ thống Affiliate
   */
  async getAdminConfig(): Promise<AdminAffiliateConfigDto> {
    const cfg = await this.loadSystemConfig();
    return {
      commissionRate: cfg.commissionRate,
      minPayoutThreshold: cfg.minPayoutThreshold,
      payoutFeePercent: cfg.payoutFeePercent,
      payoutFeeFixed: cfg.payoutFeeFixed,
    };
  }

  /**
   * Admin: Cập nhật cấu hình hệ thống Affiliate
   */
  async updateAdminConfig(dto: UpdateAffiliateConfigDto, adminId: string) {
    if (dto.commissionRate !== undefined) {
      await this.prisma.systemConfig.upsert({
        where: { key: 'AFFILIATE_COMMISSION_RATE' },
        update: { value: String(dto.commissionRate) },
        create: {
          key: 'AFFILIATE_COMMISSION_RATE',
          value: String(dto.commissionRate),
          description: '% Tỷ lệ hoa hồng tiếp thị liên kết hệ thống',
        },
      });
      this.cachedCommissionRate = dto.commissionRate;
    }

    if (dto.minPayoutThreshold !== undefined) {
      await this.prisma.systemConfig.upsert({
        where: { key: 'AFFILIATE_MIN_PAYOUT_THRESHOLD' },
        update: { value: String(dto.minPayoutThreshold) },
        create: {
          key: 'AFFILIATE_MIN_PAYOUT_THRESHOLD',
          value: String(dto.minPayoutThreshold),
          description: 'Hạn mức rút tiền hoa hồng tối thiểu (VNĐ)',
        },
      });
      this.cachedMinPayoutThreshold = dto.minPayoutThreshold;
    }

    if (dto.payoutFeePercent !== undefined) {
      await this.prisma.systemConfig.upsert({
        where: { key: 'AFFILIATE_PAYOUT_FEE_PERCENT' },
        update: { value: String(dto.payoutFeePercent) },
        create: {
          key: 'AFFILIATE_PAYOUT_FEE_PERCENT',
          value: String(dto.payoutFeePercent),
          description: '% Tỷ lệ phí rút tiền hoa hồng',
        },
      });
      this.cachedPayoutFeePercent = dto.payoutFeePercent;
    }

    if (dto.payoutFeeFixed !== undefined) {
      await this.prisma.systemConfig.upsert({
        where: { key: 'AFFILIATE_PAYOUT_FEE_FIXED' },
        update: { value: String(dto.payoutFeeFixed) },
        create: {
          key: 'AFFILIATE_PAYOUT_FEE_FIXED',
          value: String(dto.payoutFeeFixed),
          description: 'Phí rút tiền hoa hồng cố định (VNĐ)',
        },
      });
      this.cachedPayoutFeeFixed = dto.payoutFeeFixed;
    }

    this.configCacheExpiry = Date.now() + 60000;

    await this.auditLogsService.createLog({
      userId: adminId,
      action: 'UPDATE_AFFILIATE_CONFIG',
      module: 'AFFILIATE',
      payload: JSON.stringify(dto),
    });

    return {
      success: true,
      message: 'Cập nhật cấu hình tiếp thị liên kết thành công',
      config: {
        commissionRate: this.cachedCommissionRate,
        minPayoutThreshold: this.cachedMinPayoutThreshold,
        payoutFeePercent: this.cachedPayoutFeePercent,
        payoutFeeFixed: this.cachedPayoutFeeFixed,
      },
    };
  }
}

