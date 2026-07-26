import { Injectable } from '@nestjs/common'

export interface ProviderEndpoint {
  baseUrl: string
  keyEnvVar: string
}

@Injectable()
export class ProviderConfigService {
  private endpoints: Record<string, ProviderEndpoint> = {
    veo: {
      baseUrl: 'https://us-central1-aiplatform.googleapis.com',
      keyEnvVar: 'GEMINI_API_KEY',
    },
    kling: {
      baseUrl: 'https://api.klingai.com',
      keyEnvVar: 'KLING_API_KEY',
    },
    sora: {
      baseUrl: 'https://api.openai.com/v1',
      keyEnvVar: 'OPENAI_API_KEY',
    },
    runway: {
      baseUrl: 'https://api.runwayml.com/v1',
      keyEnvVar: 'RUNWAY_API_KEY',
    },
    pika: {
      baseUrl: 'https://api.pika.art/v1',
      keyEnvVar: 'PIKA_API_KEY',
    },
    luma: {
      baseUrl: 'https://api.lumalabs.ai/v1',
      keyEnvVar: 'LUMA_API_KEY',
    },
    pixverse: {
      baseUrl: 'https://api.pixverse.ai/v1',
      keyEnvVar: 'PIXVERSE_API_KEY',
    },
    hailuo: {
      baseUrl: 'https://api.hailuo.ai/v1',
      keyEnvVar: 'HAILUO_API_KEY',
    },
    wan: {
      baseUrl: 'https://api.wan.video/v1',
      keyEnvVar: 'WAN_API_KEY',
    },
  }

  getEndpoint(providerId: string): string {
    return this.endpoints[providerId]?.baseUrl || ''
  }

  getApiKey(providerId: string): string {
    const ep = this.endpoints[providerId]
    if (!ep) return ''
    return process.env[ep.keyEnvVar] || ''
  }

  getAllEndpoints(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [id, ep] of Object.entries(this.endpoints)) {
      result[id] = ep.baseUrl
    }
    return result
  }

  registerEndpoint(providerId: string, endpoint: ProviderEndpoint) {
    this.endpoints[providerId] = endpoint
  }
}
