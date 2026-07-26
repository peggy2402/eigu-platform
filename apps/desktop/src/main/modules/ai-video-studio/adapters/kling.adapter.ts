import { AIProviderAdapter, VideoGenerationParams, VideoJobResult } from './provider.adapter';
import { ApiKeyStore } from '../../../services/api-key-store.service';
import { AIVideoPipeline } from '../../../services/ai-video-pipeline.service';

export class KlingProviderAdapter implements AIProviderAdapter {
  public id = 'kling';
  public name = 'Kling AI';

  private pipeline = new AIVideoPipeline();

  public listModels(): string[] {
    return ['1.5', '1.0-pro'];
  }

  public async generateVideo(params: VideoGenerationParams): Promise<VideoJobResult> {
    const apiKey = ApiKeyStore.getKey('KLING_API_KEY');
    console.log(`[KlingAdapter] Generating video for prompt: "${params.prompt}" (Model: ${params.model || '1.5'})`);
    
    try {
      const videoPath = await this.pipeline.generateVideoWithAI(params.prompt, params.model || '1.5', 1);
      return {
        jobId: 'kling_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        status: 'completed',
        videoUrl: videoPath,
        progress: 100,
      };
    } catch (err: any) {
      return {
        jobId: 'kling_err_' + Date.now(),
        status: 'failed',
        error: err.message,
      };
    }
  }

  public async checkJobStatus(jobId: string): Promise<VideoJobResult> {
    return {
      jobId,
      status: 'completed',
      progress: 100,
    };
  }
}
