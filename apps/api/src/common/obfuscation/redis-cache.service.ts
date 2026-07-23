import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ObfuscationConfigService } from './obfuscation-config.service';

@Injectable()
export class RedisObfuscationCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisObfuscationCacheService.name);
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(private readonly obfConfigService: ObfuscationConfigService) {}

  onModuleInit() {
    this.syncInterval = setInterval(() => {
      this.obfConfigService.syncConfigFromDb();
    }, 30000);
  }

  onModuleDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}
