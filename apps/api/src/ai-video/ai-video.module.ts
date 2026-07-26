import { Module, Global } from '@nestjs/common'
import { AIVideoController } from './ai-video.controller'
import { AIVideoService } from './ai-video.service'
import { AIVideoGateway } from './ai-video.gateway'
import { ProviderRegistry } from './providers/provider-registry'
import { ProviderConfigService } from './providers/config/provider-config.service'
import { RenderQueueService } from './queue/render-queue.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuditService } from '../common/audit/audit.service'

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AIVideoController],
  providers: [
    AIVideoService,
    AIVideoGateway,
    ProviderRegistry,
    ProviderConfigService,
    RenderQueueService,
    AuditService,
  ],
  exports: [AIVideoService, ProviderRegistry, ProviderConfigService, RenderQueueService, AuditService, AIVideoGateway],
})
export class AIVideoModule {}
