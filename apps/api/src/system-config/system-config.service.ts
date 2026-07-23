import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private readonly logger = new Logger(SystemConfigService.name);
  private memoryCache: Map<string, string> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialConfigs();
  }

  private async seedInitialConfigs() {
    try {
      const defaultPrefix = process.env.API_PREFIX || 'api';
      const initialConfigs = [
        { key: 'API_PREFIX', value: defaultPrefix, description: 'Mã tiền tố mã hóa Obfuscation Prefix' },
        { key: 'MIN_APP_VERSION', value: '1.0.0', description: 'Phiên bản ứng dụng tối thiểu' },
        { key: 'MAINTENANCE_MODE', value: 'false', description: 'Trạng thái bảo trì hệ thống' },
      ];

      const model = (this.prisma as any).systemConfig;
      if (!model) return;

      for (const item of initialConfigs) {
        const existing = await model.findUnique({ where: { key: item.key } });
        if (!existing) {
          await model.create({ data: item });
          this.memoryCache.set(item.key, item.value);
        } else {
          this.memoryCache.set(existing.key, existing.value);
        }
      }
      this.logger.log('✅ SystemConfig DB Bootstrap successfully loaded.');
    } catch (e: any) {
      this.logger.error('⚠️ Could not seed SystemConfig DB, using fallback memory defaults:', e?.message);
    }
  }

  async getBootstrapConfig() {
    const apiPrefix = this.memoryCache.get('API_PREFIX') || process.env.API_PREFIX || 'api';
    const minAppVersion = this.memoryCache.get('MIN_APP_VERSION') || '1.0.0';
    const maintenanceMode = (this.memoryCache.get('MAINTENANCE_MODE') || 'false') === 'true';

    return {
      apiPrefix,
      minAppVersion,
      maintenanceMode,
      timestamp: new Date().toISOString(),
    };
  }

  async setConfig(key: string, value: string, description?: string) {
    const model = (this.prisma as any).systemConfig;
    let updated = null;
    if (model) {
      updated = await model.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description },
      });
    }

    const oldVal = this.memoryCache.get(key);
    this.memoryCache.set(key, value);

    if (key === 'API_PREFIX') {
      process.env.API_PREFIX = value;
      this.logger.log(`🔒 API_PREFIX updated in DB to "${value}". Triggering graceful server restart...`);
      if (oldVal && oldVal !== value) {
        setTimeout(() => {
          process.exit(0);
        }, 300);
      }
    }
    return updated || { key, value, description };
  }

  async getConfig(key: string) {
    if (this.memoryCache.has(key)) return this.memoryCache.get(key);
    const model = (this.prisma as any).systemConfig;
    if (!model) return null;
    const item = await model.findUnique({ where: { key } });
    if (item) {
      this.memoryCache.set(item.key, item.value);
      return item.value;
    }
    return null;
  }
}
