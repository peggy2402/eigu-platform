import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingModuleDto, PricingTierDto, PricingBadgeDto } from '@eigu-platform/shared';
import { CreateModuleDto, UpdateModuleDto, CreateTierDto, UpdateTierDto, CreateBadgeDto } from './dto/create-pricing.dto';

const FALLBACK_MODULES: PricingModuleDto[] = [
  {
    id: 'fb-cut',
    slug: 'cut',
    name: 'Tự động cắt video',
    tagline: 'Tự động phân đoạn video 1-20 phút và tối ưu 9:16',
    icon: 'Scissors',
    isActive: true,
    sortOrder: 0,
    tiers: [
      {
        id: 'fb-cut-trial',
        code: 'trial',
        label: 'Trial',
        tagline: 'Gói trải nghiệm miễn phí 7 ngày',
        price: 0,
        originalPrice: 0,
        discount: 0,
        formattedPrice: 'Miễn phí',
        formattedOriginalPrice: null,
        billingPeriod: 'trial',
        trialDays: 7,
        machines: 1,
        threads: 2,
        resolution: '720p',
        badge: 'TRẢI NGHIỆM MIỄN PHÍ',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Cắt video 1-20 phút', 'Silence Detection', 'Định dạng 9:16'],
      },
      {
        id: 'fb-cut-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho Creator & Reuper chuyên nghiệp',
        price: 350000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '350.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tối ưu GPU Hardware', 'Export 1080p/2K/4K', 'Hỗ trợ ưu tiên 24/7'],
      },
    ],
  },
  {
    id: 'fb-ai-video',
    slug: 'ai-video',
    name: 'Tạo video AI',
    tagline: 'Tạo video chuyên nghiệp từ ý tưởng bằng AI',
    icon: 'Sparkles',
    isActive: true,
    sortOrder: 1,
    tiers: [
      {
        id: 'fb-ai-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho người chuyên nghiệp',
        price: 450000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '450.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tạo video từ ý tưởng/hình ảnh', 'Mẫu video có sẵn', 'Hỗ trợ 24/7'],
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
}
