import { BaseVideoProvider, GenerateVideoParams, GenerateVideoResult, ProviderHealth } from './base-provider'

export class KlingProvider extends BaseVideoProvider {
  id = 'kling'
  name = 'Kling AI'
  maxDuration = 10
  creditCost = 1
  speed = 75
  quality = 70
  supportedResolutions = ['1080p']
  supportedAspectRatios = ['9:16', '16:9', '1:1']

  async generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult> {
    this.validateParams(params)
    const endpoint = this.apiEndpoint || 'https://api.klingai.com'
    return this.callWithRetry(async () => {
      const response = await fetch(`${endpoint}/v1/videos/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify({
          model_name: 'kling-v1-5',
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || '',
          duration: Math.round(params.duration),
          aspect_ratio: params.aspectRatio,
          seed: params.seed,
        }),
      })
      if (!response.ok) throw new Error(`Kling API error: ${response.status}`)
      const data = await response.json()
      return {
        url: data.data?.video_url || data.data?.task_id,
        duration: params.duration,
        seed: data.data?.seed || Date.now(),
        cost: this.creditCost * params.duration,
        provider: this.id,
      }
    })
  }

  async cancelGeneration(taskId: string): Promise<void> {
    await fetch(`${this.apiEndpoint}/v1/videos/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ task_id: taskId }),
    })
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now()
    try {
      const res = await fetch(`${this.apiEndpoint}/v1/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      return { status: res.ok ? 'healthy' : 'degraded', latency: Date.now() - start }
    } catch {
      return { status: 'down', latency: Date.now() - start }
    }
  }
}
