import { AIProviderAdapter, VideoGenerationParams, VideoJobResult } from './provider.adapter';
import { ApiKeyStore } from '../../../services/api-key-store.service';
import { AIVideoPipeline } from '../../../services/ai-video-pipeline.service';

export class VeoProviderAdapter implements AIProviderAdapter {
  public id = 'veo';
  public name = 'Google Veo';

  private pipeline = new AIVideoPipeline();

  public listModels(): string[] {
    return ['veo3', 'veo-ultra', 'veo-fast'];
  }

  public async generateVideo(params: VideoGenerationParams): Promise<VideoJobResult> {
    const apiKey = ApiKeyStore.getKey('GEMINI_API_KEY') || ApiKeyStore.getKey('VEO_API_KEY');
    console.log(`[VeoAdapter] Generating video for prompt: "${params.prompt}" (Model: ${params.model || 'veo3'})`);
    
    try {
      const videoPath = await this.pipeline.generateVideoWithAI(params.prompt, params.model || 'veo3', 1);
      return {
        jobId: 'veo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        status: 'completed',
        videoUrl: videoPath,
        progress: 100,
      };
    } catch (err: any) {
      return {
        jobId: 'veo_err_' + Date.now(),
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
