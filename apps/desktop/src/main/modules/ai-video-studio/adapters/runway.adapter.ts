import { AIProviderAdapter, VideoGenerationParams, VideoJobResult } from './provider.adapter';
import { ApiKeyStore } from '../../../services/api-key-store.service';
import { AIVideoPipeline } from '../../../services/ai-video-pipeline.service';

export class RunwayProviderAdapter implements AIProviderAdapter {
  public id = 'runway';
  public name = 'Runway ML';

  private pipeline = new AIVideoPipeline();

  public listModels(): string[] {
    return ['gen3', 'gen3-alpha', 'gen2'];
  }

  public async generateVideo(params: VideoGenerationParams): Promise<VideoJobResult> {
    const apiKey = ApiKeyStore.getKey('RUNWAY_API_KEY');
    console.log(`[RunwayAdapter] Generating video for prompt: "${params.prompt}" (Model: ${params.model || 'gen3'})`);
    
    try {
      const videoPath = await this.pipeline.generateVideoWithAI(params.prompt, params.model || 'gen3', 1);
      return {
        jobId: 'runway_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        status: 'completed',
        videoUrl: videoPath,
        progress: 100,
      };
    } catch (err: any) {
      return {
        jobId: 'runway_err_' + Date.now(),
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
