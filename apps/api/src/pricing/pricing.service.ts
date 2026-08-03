import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingModuleDto, PricingTierDto, PricingBadgeDto } from '@eigu-platform/shared';
import { CreateModuleDto, UpdateModuleDto, CreateTierDto, UpdateTierDto, CreateBadgeDto } from './dto/create-pricing.dto';

const FALLBACK_MODULES: PricingModuleDto[] = [
  {
    id: 'fb-cut',
    slug: 'cut',
    name: 'Tự động cắt video',
    tagline: 'Cắt highlight và dựng clip TikTok/Reels tự động',
    icon: 'Scissors',
    isActive: true,
    sortOrder: 0,
    tiers: [
      {
        id: 'fb-cut-basic',
        code: 'basic',
        label: 'Basic',
        tagline: 'Cắt video cơ bản',
        price: 120000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '120.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 4,
        resolution: '720p',
        badge: null,
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Cắt phân đoạn 1-20 phút', 'Tải link YouTube', 'Xuất chuẩn 9:16'],
      },
      {
        id: 'fb-cut-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho Channel Rebuilder',
        price: 299000,
        originalPrice: 500000,
        discount: 40,
        formattedPrice: '299.000đ',
        formattedOriginalPrice: '500.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 2,
        threads: 10,
        resolution: '1080p',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Silence Detection (Nhận diện khoảng nghỉ)', 'Tiêm filter Anti-Detect MD5', 'Hỗ trợ Render GPU Hardware'],
      },
      {
        id: 'fb-cut-team',
        code: 'team',
        label: 'Team',
        tagline: 'Hệ thống cắt ghép tự động hóa',
        price: 990000,
        originalPrice: 1650000,
        discount: 40,
        formattedPrice: '990.000đ',
        formattedOriginalPrice: '1.650.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 5,
        threads: 25,
        resolution: '1080p/4K',
        badge: 'TIẾT KIỆM',
        badgeId: null,
        isActive: true,
        sortOrder: 2,
        features: ['Tạo Part 1/N tự động', 'Tích hợp Voice Subtitles (WhisperX)', 'Tải kênh hàng loạt'],
      },
      {
        id: 'fb-cut-enterprise',
        code: 'enterprise',
        label: 'Enterprise',
        tagline: 'Hệ thống Render Studio cho Agency',
        price: 2990000,
        originalPrice: 5000000,
        discount: 40,
        formattedPrice: '2.990.000đ',
        formattedOriginalPrice: '5.000.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 20,
        threads: 0,
        resolution: '4K',
        badge: 'GIẢM 40%',
        badgeId: null,
        isActive: true,
        sortOrder: 3,
        features: ['Render siêu tốc độ 60fps', 'Không giới hạn dung lượng', '24/7 Priority Support'],
      },
    ],
  },
  {
    id: 'fb-ai-video',
    slug: 'ai-video',
    name: 'Bảng Giá Tạo Video AI (nhanh)',
    tagline: 'Tạo video không giới hạn lượt trong thời hạn gói. Mở khóa toàn bộ 4 mode đỉnh cao.',
    icon: 'Sparkles',
    isActive: true,
    sortOrder: 1,
    tiers: [
      {
        id: 'fb-ai-basic',
        code: 'basic',
        label: 'Basic',
        tagline: 'Gói tạo video AI cơ bản',
        price: 150000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '150.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 4,
        resolution: '720p',
        badge: null,
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Tối đa 4 luồng song song', 'Độ phân giải 720p', 'Mở 2 mode: Copy Video & Ý Tưởng', 'Dùng trên 1 máy'],
      },
      {
        id: 'fb-ai-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho Channel Rebuilder',
        price: 450000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '450.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p / 2K / 4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tối đa 8 luồng song song', 'Độ phân giải 1080p / 2K / 4K', 'Full 4 mode (Copy, Ý tưởng, Ảnh, Mẫu)', 'Dùng trên 1 máy'],
      },
      {
        id: 'fb-ai-team',
        code: 'team',
        label: 'Team',
        tagline: 'Hệ thống Render AI chuyên nghiệp',
        price: 1800000,
        originalPrice: 3000000,
        discount: 40,
        formattedPrice: '1.800.000đ',
        formattedOriginalPrice: '3.000.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 5,
        threads: 20,
        resolution: '1080p / 2K / 4K',
        badge: 'GIẢM -40%',
        badgeId: null,
        isActive: true,
        sortOrder: 2,
        features: ['Tối đa 20 luồng song song', 'Độ phân giải 1080p / 2K / 4K', 'Full 4 mode', 'Dùng đồng thời 5 máy'],
      },
      {
        id: 'fb-ai-enterprise',
        code: 'enterprise',
        label: 'Enterprise',
        tagline: 'Giải pháp Doanh nghiệp / Agency',
        price: 5400000,
        originalPrice: 9000000,
        discount: 40,
        formattedPrice: '5.400.000đ',
        formattedOriginalPrice: '9.000.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 30,
        threads: 20,
        resolution: '4K+',
        badge: 'DOANH NGHIỆP',
        badgeId: null,
        isActive: true,
        sortOrder: 3,
        features: ['20 luồng trần tối đa', 'Độ phân giải 4K+', 'Full 4 mode', 'Dùng đồng thời 30 máy & 24/7 Priority Support'],
      },
    ],
  },
];

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Public GET: Lấy danh sách bảng giá các modules và tiers đã được normalize
   */
  async getPricing(moduleSlug?: string): Promise<PricingModuleDto[]> {
    try {
      const whereCondition: any = { isActive: true };
      if (moduleSlug && moduleSlug.trim() !== '') {
        whereCondition.slug = moduleSlug.trim();
      }

      const modules = await this.prisma.pricingModule.findMany({
        where: whereCondition,
        orderBy: { sortOrder: 'asc' },
        include: {
          tiers: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              badge: true,
              features: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });

      if (!modules || modules.length === 0) {
        return FALLBACK_MODULES;
      }

      return modules.map(m => this.normalizeModule(m));
    } catch (error) {
      console.error('[PricingService] Error fetching pricing from Database, using fallback data:', error);
      return FALLBACK_MODULES;
    }
  }

  /**
   * Admin GET: Lấy toàn bộ modules & tiers (kể cả inactive)
   */
  async getAdminPricing(): Promise<{ modules: PricingModuleDto[]; badges: PricingBadgeDto[] }> {
    const modules = await this.prisma.pricingModule.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        tiers: {
          orderBy: { sortOrder: 'asc' },
          include: {
            badge: true,
            features: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    const badges = await this.prisma.pricingBadge.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return {
      modules: modules.map(m => this.normalizeModule(m)),
      badges: badges.map(b => ({
        id: b.id,
        code: b.code,
        name: b.name,
        colorConfig: b.colorConfig || undefined,
        isActive: b.isActive,
      })),
    };
  }

  // --- MODULE ADMIN ACTIONS ---

  async createModule(dto: CreateModuleDto) {
    const existing = await this.prisma.pricingModule.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException(`Module với slug "${dto.slug}" đã tồn tại`);

    return this.prisma.pricingModule.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        tagline: dto.tagline,
        icon: dto.icon,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    const existing = await this.prisma.pricingModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Không tìm thấy module id ${id}`);

    return this.prisma.pricingModule.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteModule(id: string) {
    return this.prisma.pricingModule.delete({ where: { id } });
  }

  // --- TIER ADMIN ACTIONS ---

  async createTier(dto: CreateTierDto) {
    const moduleExists = await this.prisma.pricingModule.findUnique({ where: { id: dto.moduleId } });
    if (!moduleExists) throw new NotFoundException(`Không tìm thấy Module với id ${dto.moduleId}`);

    const existingTier = await this.prisma.pricingTier.findUnique({
      where: { moduleId_code: { moduleId: dto.moduleId, code: dto.code } },
    });
    if (existingTier) throw new BadRequestException(`Gói với code "${dto.code}" đã tồn tại trong module này`);

    const priceNum = Number(dto.price);
    const discountNum = dto.discount || 0;
    let originalPriceNum = Number(dto.originalPrice || 0);

    if (originalPriceNum === 0 && discountNum > 0) {
      originalPriceNum = Math.round(priceNum / (1 - discountNum / 100));
    }

    const tier = await this.prisma.pricingTier.create({
      data: {
        moduleId: dto.moduleId,
        code: dto.code,
        label: dto.label,
        tagline: dto.tagline,
        price: priceNum,
        originalPrice: originalPriceNum,
        discount: discountNum,
        machines: dto.machines ?? 1,
        threads: dto.threads ?? 4,
        resolution: dto.resolution ?? '1080p',
        billingPeriod: dto.billingPeriod ?? (dto.code === 'trial' ? 'trial' : 'monthly'),
        trialDays: dto.trialDays ?? (dto.code === 'trial' ? 7 : 0),
        badgeId: dto.badgeId || null,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        features: {
          create: (dto.features || []).map((text, idx) => ({
            text,
            sortOrder: idx,
          })),
        },
      },
      include: { features: true },
    });

    return tier;
  }

  async updateTier(id: string, dto: UpdateTierDto) {
    const existing = await this.prisma.pricingTier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Không tìm thấy Tier với id ${id}`);

    const priceNum = dto.price !== undefined ? Number(dto.price) : Number(existing.price);
    let originalPriceNum = dto.originalPrice !== undefined ? Number(dto.originalPrice) : Number(existing.originalPrice);
    let discountNum = dto.discount !== undefined ? dto.discount : existing.discount;

    if (originalPriceNum === 0 && discountNum > 0) {
      originalPriceNum = Math.round(priceNum / (1 - discountNum / 100));
    } else if (originalPriceNum > priceNum && discountNum === 0) {
      discountNum = Math.round((1 - priceNum / originalPriceNum) * 100);
    }

    const dataToUpdate: any = {
      label: dto.label,
      tagline: dto.tagline,
      price: priceNum,
      originalPrice: originalPriceNum,
      discount: discountNum,
      machines: dto.machines,
      threads: dto.threads,
      resolution: dto.resolution,
      billingPeriod: dto.billingPeriod,
      trialDays: dto.trialDays,
      badgeId: dto.badgeId !== undefined ? (dto.badgeId || null) : undefined,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
    };

    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    if (dto.features && Array.isArray(dto.features)) {
      // Re-create features
      await this.prisma.pricingTierFeature.deleteMany({ where: { tierId: id } });
      dataToUpdate.features = {
        create: dto.features.map((text, idx) => ({
          text,
          sortOrder: idx,
        })),
      };
    }

    return this.prisma.pricingTier.update({
      where: { id },
      data: dataToUpdate,
      include: { features: true },
    });
  }

  async deleteTier(id: string) {
    return this.prisma.pricingTier.delete({ where: { id } });
  }

  // --- BADGE ACTIONS ---

  async createBadge(dto: CreateBadgeDto) {
    const existing = await this.prisma.pricingBadge.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Badge với code "${dto.code}" đã tồn tại`);

    return this.prisma.pricingBadge.create({
      data: {
        code: dto.code,
        name: dto.name,
        colorConfig: dto.colorConfig,
      },
    });
  }

  // --- HELPER NORMALIZER ---

  private normalizeModule(m: any): PricingModuleDto {
    return {
      id: m.id,
      slug: m.slug,
      name: m.name,
      tagline: m.tagline,
      icon: m.icon,
      isActive: m.isActive,
      sortOrder: m.sortOrder,
      tiers: (m.tiers || []).map((t: any) => this.normalizeTier(t)),
    };
  }

  private normalizeTier(t: any): PricingTierDto {
    const priceNum = Number(t.price);
    let origNum = Number(t.originalPrice || 0);
    let disc = t.discount || 0;

    if (origNum === 0 && disc > 0) {
      origNum = Math.round(priceNum / (1 - disc / 100));
    } else if (origNum > priceNum && disc === 0) {
      disc = Math.round((1 - priceNum / origNum) * 100);
    }

    const formattedPrice = priceNum.toLocaleString('vi-VN') + 'đ';
    const formattedOriginalPrice = origNum > priceNum ? origNum.toLocaleString('vi-VN') + 'đ' : null;

    let badgeName = t.badge?.name || null;
    if (!badgeName && disc > 0) {
      badgeName = `GIẢM ${disc}%`;
    }

    return {
      id: t.id,
      code: t.code,
      label: t.label,
      tagline: t.tagline,
      price: priceNum,
      originalPrice: origNum,
      discount: disc,
      formattedPrice,
      formattedOriginalPrice,
      billingPeriod: t.billingPeriod || (t.code === 'trial' ? 'trial' : 'monthly'),
      trialDays: t.trialDays || (t.code === 'trial' ? 7 : 0),
      machines: t.machines,
      threads: t.threads,
      resolution: t.resolution || '-',
      badge: badgeName,
      badgeId: t.badgeId,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
      features: (t.features || []).map((f: any) => f.text),
    };
  }

  // --- USER SUBSCRIPTION ACTIONS ---

  /**
   * Lấy danh sách các gói dịch vụ active hiện tại của User theo từng module
   */
  async getUserSubscriptions(userId: string) {
    const subs = await (this.prisma as any).userSubscription.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        module: { select: { id: true, slug: true, name: true } },
        tier: { select: { id: true, code: true, label: true, price: true, machines: true, threads: true, resolution: true } },
      },
    });

    return (subs || []).map((s: any) => ({
      id: s.id,
      moduleId: s.moduleId,
      moduleSlug: s.module?.slug || '',
      moduleName: s.module?.name || '',
      tierId: s.tierId,
      tierCode: s.tier?.code || '',
      tierLabel: s.tier?.label || '',
      price: Number(s.tier?.price || 0),
      machines: s.machines,
      threads: s.threads,
      resolution: s.resolution,
      status: s.status,
      expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  /**
   * Admin: Lấy danh sách đăng ký gói cước dịch vụ của toàn bộ User trên hệ thống
   */
  async getAllUserSubscriptionsAdmin() {
    const subs = await (this.prisma as any).userSubscription.findMany({
      include: {
        user: { select: { id: true, email: true, username: true, balance: true } },
        module: { select: { id: true, slug: true, name: true } },
        tier: { select: { id: true, code: true, label: true, price: true, machines: true, threads: true, resolution: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return (subs || []).map((s: any) => ({
      id: s.id,
      userId: s.userId,
      userEmail: s.user?.email || 'N/A',
      username: s.user?.username || '',
      userBalance: Number(s.user?.balance || 0),
      moduleId: s.moduleId,
      moduleSlug: s.module?.slug || '',
      moduleName: s.module?.name || '',
      tierId: s.tierId,
      tierCode: s.tier?.code || '',
      tierLabel: s.tier?.label || '',
      price: Number(s.tier?.price || 0),
      machines: s.machines,
      threads: s.threads,
      resolution: s.resolution,
      status: s.status,
      expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : s.createdAt.toISOString(),
    }));
  }

  /**
   * Mua / Nâng cấp gói cước mô-đun bằng số dư tài khoản
   */
  async subscribeModuleTier(userId: string, moduleId: string, tierId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản người dùng');

    // Tự động tìm Tier theo tierId & moduleId (hoặc module slug)
    let tier = await this.prisma.pricingTier.findFirst({
      where: {
        id: tierId,
        isActive: true,
        OR: [
          { moduleId: moduleId },
          { module: { id: moduleId } },
          { module: { slug: moduleId } },
        ],
      },
      include: { module: true },
    });

    // Fallback: Tìm theo tierId nếu truyền nhầm moduleId
    if (!tier) {
      tier = await this.prisma.pricingTier.findFirst({
        where: { id: tierId, isActive: true },
        include: { module: true },
      });
    }

    if (!tier) throw new NotFoundException('Gói cước không tồn tại hoặc đã bị ẩn');

    const targetModuleId = tier.moduleId || moduleId;

    // Kiểm tra xem User đã có gói cước active nào thuộc mô-đun này chưa
    const existingSub = await (this.prisma as any).userSubscription.findFirst({
      where: { userId, moduleId: targetModuleId, status: 'ACTIVE' },
      include: { tier: true },
    });

    let payableAmount = Number(tier.price);
    let isUpgrade = false;

    if (existingSub && existingSub.tier) {
      const currentPrice = Number(existingSub.tier.price || 0);
      if (existingSub.tierId === tierId) {
        throw new BadRequestException('Bạn đang sử dụng gói này rồi!');
      }
      if (payableAmount > currentPrice) {
        // Nâng cấp lên gói cao hơn: Chỉ tính chênh lệch!
        payableAmount = payableAmount - currentPrice;
        isUpgrade = true;
      }
    }

    const userBalance = Number(user.balance || 0);

    if (userBalance < payableAmount) {
      throw new BadRequestException(
        `Số dư không đủ. Cần thanh toán ${payableAmount.toLocaleString('vi-VN')}đ${isUpgrade ? ' (tiền chênh lệch nâng cấp)' : ''}, số dư hiện tại của bạn là ${userBalance.toLocaleString('vi-VN')}đ. Vui lòng nạp thêm tiền!`,
      );
    }

    // Tính thời gian hết hạn (30 ngày cho gói tháng, 365 ngày cho gói năm)
    const now = new Date();
    const durationDays = tier.billingPeriod === 'yearly' ? 365 : (tier.billingPeriod === 'trial' ? (tier.trialDays || 7) : 30);
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    let updatedBalance = userBalance;
    let subscriptionRecord: any = null;

    await this.prisma.$transaction(async (db) => {
      // 1. Trừ số dư chênh lệch (nếu > 0)
      if (payableAmount > 0) {
        const updatedUser = await db.user.update({
          where: { id: userId },
          data: {
            balance: {
              decrement: payableAmount,
            },
          },
        });
        updatedBalance = Number(updatedUser.balance);
      }

      // 2. Tạo hoặc Cập nhật UserSubscription
      subscriptionRecord = await (db as any).userSubscription.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId,
          },
        },
        create: {
          userId,
          moduleId,
          tierId,
          status: 'ACTIVE',
          expiresAt,
          machines: tier.machines,
          threads: tier.threads,
          resolution: tier.resolution,
        },
        update: {
          tierId,
          status: 'ACTIVE',
          expiresAt,
          machines: tier.machines,
          threads: tier.threads,
          resolution: tier.resolution,
        },
      });

      // 3. Ghi log
      await db.auditLog.create({
        data: {
          userId,
          userEmail: user.email,
          username: user.username || undefined,
          userRole: user.role,
          action: 'SUBSCRIBE_MODULE_TIER',
          module: 'PRICING',
          payload: JSON.stringify({
            moduleSlug: tier.module.slug,
            tierCode: tier.code,
            price: Number(tier.price),
            payableAmount,
            isUpgrade,
            newBalance: updatedBalance,
          }),
        },
      });
    });

    return {
      success: true,
      message: isUpgrade 
        ? `Đã nâng cấp lên Gói ${tier.label} thành công (Chỉ trả thêm ${payableAmount.toLocaleString('vi-VN')}đ chênh lệch)!`
        : `Đã đăng ký thành công Gói ${tier.label} cho mô-đun "${tier.module.name}"!`,
      newBalance: updatedBalance,
      subscription: {
        id: subscriptionRecord.id,
        moduleSlug: tier.module.slug,
        tierCode: tier.code,
        tierLabel: tier.label,
        machines: tier.machines,
        threads: tier.threads,
        resolution: tier.resolution,
        expiresAt: expiresAt.toISOString(),
      },
    };
  }
}
