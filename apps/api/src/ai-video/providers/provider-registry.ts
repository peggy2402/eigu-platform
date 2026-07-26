import { Injectable, Logger } from '@nestjs/common'
import { BaseVideoProvider } from './base-provider'
import { ProviderConfigService } from './config/provider-config.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ProviderRegistry {
  private readonly logger = new Logger(ProviderRegistry.name)
  private providers: Map<string, BaseVideoProvider> = new Map()

  constructor(
    private prisma: PrismaService,
    private config: ProviderConfigService,
  ) {}

  register(provider: BaseVideoProvider) {
    provider.setApiEndpoint(this.config.getEndpoint(provider.id))
    provider.setApiKey(this.config.getApiKey(provider.id))
    this.providers.set(provider.id, provider)
    const keyStatus = provider.apiKey ? '✓ key set' : '✗ no key'
    this.logger.log(`Registered provider: ${provider.name} (${provider.id}) — ${keyStatus}`)
  }

  get(id: string): BaseVideoProvider | undefined {
    return this.providers.get(id)
  }

  getAll(): BaseVideoProvider[] {
    return Array.from(this.providers.values())
  }

  getAvailable(): BaseVideoProvider[] {
    return this.getAll().filter(p => p.isAvailable)
  }

  async selectBest(options: {
    maxDuration?: number
    preferredQuality?: number
    preferredSpeed?: number
    maxCost?: number
  }): Promise<BaseVideoProvider | null> {
    const available = this.getAvailable()
    if (available.length === 0) return null

    const scored = available.map(p => {
      let score = 0
      if (options.preferredQuality) score += p.quality * 0.4
      if (options.preferredSpeed) score += p.speed * 0.3
      if (options.maxCost) score += Math.max(0, 1 - p.creditCost / options.maxCost) * 0.3
      else score += (1 - p.creditCost / 10) * 0.3
      return { provider: p, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0].provider
  }

  async loadFromDatabase() {
    const records = await this.prisma.aIProvider.findMany({ where: { isActive: true } })
    for (const r of records) {
      // Lazy-register: mỗi provider sẽ được khởi tạo khi cần
    }
    this.logger.log(`Loaded ${records.length} providers from database`)
  }
}
