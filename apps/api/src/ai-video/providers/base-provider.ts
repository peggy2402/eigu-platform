import { Logger } from '@nestjs/common'

export interface GenerateVideoParams {
  prompt: string
  negativePrompt?: string
  duration: number
  aspectRatio: string
  resolution?: string
  seed?: number
  characterReference?: string
  imageReference?: string
}

export interface GenerateVideoResult {
  url: string
  duration: number
  seed: number
  cost: number
  provider: string
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'down'
  latency: number
  creditsRemaining?: number
}

export abstract class BaseVideoProvider {
  protected logger: Logger
  abstract id: string
  abstract name: string

  maxDuration: number = 30
  supportedResolutions: string[] = ['1080p']
  supportedAspectRatios: string[] = ['9:16', '16:9', '1:1']
  creditCost: number = 1
  speed: number = 50
  quality: number = 50
  isAvailable: boolean = true
  maxRetries: number = 3

  protected _apiKey: string = ''
  protected _apiEndpoint: string = ''

  setApiKey(key: string) { this._apiKey = key }
  setApiEndpoint(ep: string) { this._apiEndpoint = ep }
  get apiKey(): string { return this._apiKey }
  get apiEndpoint(): string { return this._apiEndpoint }

  constructor() {
    this.logger = new Logger('BaseVideoProvider')
  }

  protected initLogger(name: string) {
    this.logger = new Logger(`${name}Provider`)
  }

  abstract generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult>

  abstract cancelGeneration(taskId: string): Promise<void>

  abstract healthCheck(): Promise<ProviderHealth>

  async getBalance(): Promise<number> {
    return -1
  }

  protected validateParams(params: GenerateVideoParams): void {
    if (params.duration > this.maxDuration) {
      throw new Error(`Duration ${params.duration}s exceeds provider max ${this.maxDuration}s`)
    }
    if (params.aspectRatio && !this.supportedAspectRatios.includes(params.aspectRatio)) {
      throw new Error(`Aspect ratio ${params.aspectRatio} not supported by ${this.name}`)
    }
  }

  protected async callWithRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn()
    } catch (err: any) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        this.logger.warn(`Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms: ${err.message}`)
        await new Promise(r => setTimeout(r, delay))
        return this.callWithRetry(fn, attempt + 1)
      }
      throw err
    }
  }
}
