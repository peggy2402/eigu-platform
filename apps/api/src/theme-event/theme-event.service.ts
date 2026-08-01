import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeEventDto } from './dto/update-theme-event.dto';

const THEME_EVENT_CONFIG_KEY = 'THEME_EVENT_CONFIG';

const DEFAULT_THEME_EVENT_CONFIG = {
  season: 'autumn',
  seasonTitle: 'Giao diện Mùa Thu (Amber Autumn)',
  primaryColor: '#f59e0b',
  badgeText: 'Phiên bản Mùa Thu 3.0',
  isEventActive: true,
  eventTitle: 'Sự Kiện Mùa Thu - Tri Ân Khách Hàng EIGU Platform',
  eventSubtitle: 'Nhận ngay ưu đãi đặc biệt cho tất cả 6 mô-đun công cụ tự động hóa chuyên sâu.',
  eventBannerUrl: 'https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp',
  eventButtonText: 'Xem Bảng Giá Khuyến Mãi',
  eventButtonLink: '#pricing',
  eventNotice: 'Áp dụng cho tất cả tài khoản đăng ký mới & nâng cấp gói năm!',
  bgStyle: 'particles',
  bgImageUrl: '',
  updatedAt: new Date().toISOString(),
};

@Injectable()
export class ThemeEventService implements OnModuleInit {
  private readonly logger = new Logger(ThemeEventService.name);
  private currentConfig = { ...DEFAULT_THEME_EVENT_CONFIG };

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadInitialConfig();
  }

  private async loadInitialConfig() {
    try {
      const model = (this.prisma as any).systemConfig;
      if (!model) return;

      const dbConfig = await model.findUnique({
        where: { key: THEME_EVENT_CONFIG_KEY },
      });

      if (dbConfig && dbConfig.value) {
        const parsed = JSON.parse(dbConfig.value);
        this.currentConfig = { ...DEFAULT_THEME_EVENT_CONFIG, ...parsed };
      } else {
        await model.create({
          data: {
            key: THEME_EVENT_CONFIG_KEY,
            value: JSON.stringify(DEFAULT_THEME_EVENT_CONFIG),
            description: 'Cấu hình Giao diện Bốn Mùa & Popup Sự Kiện toàn hệ thống',
          },
        });
      }
      this.logger.log(`✅ Theme & Event Config loaded. Season: ${this.currentConfig.season}, Event Active: ${this.currentConfig.isEventActive}`);
    } catch (err: any) {
      this.logger.warn(`⚠️ Could not load ThemeEvent from DB, using defaults: ${err?.message}`);
    }
  }

  async getConfig() {
    return {
      success: true,
      data: this.currentConfig,
    };
  }

  async updateConfig(dto: UpdateThemeEventDto) {
    this.currentConfig = {
      ...this.currentConfig,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    try {
      const model = (this.prisma as any).systemConfig;
      if (model) {
        await model.upsert({
          where: { key: THEME_EVENT_CONFIG_KEY },
          update: {
            value: JSON.stringify(this.currentConfig),
            description: 'Cấu hình Giao diện Bốn Mùa & Popup Sự Kiện toàn hệ thống',
          },
          create: {
            key: THEME_EVENT_CONFIG_KEY,
            value: JSON.stringify(this.currentConfig),
            description: 'Cấu hình Giao diện Bốn Mùa & Popup Sự Kiện toàn hệ thống',
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to save ThemeEvent to DB: ${err?.message}`);
    }

    return {
      success: true,
      message: 'Đã cập nhật cấu hình Giao diện & Sự kiện thành công!',
      data: this.currentConfig,
    };
  }
}
