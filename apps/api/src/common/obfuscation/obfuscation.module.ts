import { Module, Global } from '@nestjs/common';
import { ObfuscationConfigService } from './obfuscation-config.service';
import { RedisObfuscationCacheService } from './redis-cache.service';
import { ObfuscationPrefixMiddleware } from './obfuscation-prefix.middleware';

@Global()
@Module({
  providers: [ObfuscationConfigService, RedisObfuscationCacheService, ObfuscationPrefixMiddleware],
  exports: [ObfuscationConfigService, RedisObfuscationCacheService, ObfuscationPrefixMiddleware],
})
export class ObfuscationModule {}
