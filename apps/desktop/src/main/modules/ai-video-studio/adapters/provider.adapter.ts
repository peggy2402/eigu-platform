export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  aspectRatio?: string;
  duration?: number;
  seed?: number;
  imageUrl?: string;
}

export interface VideoJobResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export interface AIProviderAdapter {
  id: string;
  name: string;
  generateVideo(params: VideoGenerationParams): Promise<VideoJobResult>;
  checkJobStatus(jobId: string): Promise<VideoJobResult>;
  listModels(): string[];
}

import { ApiKeyStore } from '../../../services/api-key-store.service';
import { VeoProviderAdapter } from './veo.adapter';
import { RunwayProviderAdapter } from './runway.adapter';
import { KlingProviderAdapter } from './kling.adapter';

export class ProviderAdapterFactory {
  private static adapters: Map<string, AIProviderAdapter> = new Map();

  public static getAdapter(providerId: string): AIProviderAdapter {
    const id = providerId.toLowerCase();
    if (!this.adapters.has(id)) {
      switch (id) {
        case 'veo':
        case 'google-veo':
          this.adapters.set(id, new VeoProviderAdapter());
          break;
        case 'runway':
        case 'runwayml':
          this.adapters.set(id, new RunwayProviderAdapter());
          break;
        case 'kling':
        case 'klingai':
          this.adapters.set(id, new KlingProviderAdapter());
          break;
        default:
          this.adapters.set(id, new VeoProviderAdapter());
          break;
      }
    }
    return this.adapters.get(id)!;
  }
}
