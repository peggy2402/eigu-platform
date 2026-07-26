import { BaseVideoProvider, GenerateVideoParams, GenerateVideoResult, ProviderHealth } from './base-provider'

export class VeoProvider extends BaseVideoProvider {
  id = 'veo'
  name = 'Google Veo 3'
  maxDuration = 30
  creditCost = 2
  speed = 60
  quality = 85
  supportedResolutions = ['1080p', '4k']
  supportedAspectRatios = ['9:16', '16:9', '1:1']

  async generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult> {
    this.validateParams(params)
    const endpoint = this.apiEndpoint || 'https://us-central1-aiplatform.googleapis.com'
    return this.callWithRetry(async () => {
      const response = await fetch(`${endpoint}/v1beta/models/veo-3:predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify({
          instances: [{ prompt: params.prompt }],
          parameters: {
            durationSeconds: params.duration,
            aspectRatio: params.aspectRatio.replace(':', ':'),
            sampleCount: 1,
            seed: params.seed,
            personGeneration: params.characterReference ? 'allow' : 'dont_allow',
          },
        }),
      })
      if (!response.ok) throw new Error(`Veo API error: ${response.status} ${await response.text()}`)
      const data = await response.json()
      return {
        url: data.predictions?.[0]?.video || data.predictions?.[0]?.output,
        duration: params.duration,
        seed: data.predictions?.[0]?.seed || Date.now(),
        cost: this.creditCost * params.duration,
        provider: this.id,
      }
    })
  }

  async cancelGeneration(taskId: string): Promise<void> {
    await fetch(`${this.apiEndpoint}/v1beta/models/veo-3:predict/${taskId}:cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now()
    try {
      const res = await fetch(`${this.apiEndpoint}/v1beta/models/veo-3`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      return {
        status: res.ok ? 'healthy' : 'degraded',
        latency: Date.now() - start,
      }
    } catch {
      return { status: 'down', latency: Date.now() - start }
    }
  }
}
