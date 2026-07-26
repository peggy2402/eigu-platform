import { ProjectService } from './project.service';
import { RenderJob } from '../../eigu-file/eigu-types';
import { LocalQueue } from '../../eigu-file/local-queue';
import { ProviderAdapterFactory } from '../adapters/provider.adapter';
import { processVideoWithFFmpeg } from '../../../services/ffmpeg-processor.service';

export class RenderService {
  private projectService = ProjectService.getInstance();
  private localQueue: LocalQueue | null = null;

  private getQueue(): LocalQueue {
    if (!this.localQueue) {
      this.localQueue = new LocalQueue(this.projectService.getManager());
    }
    return this.localQueue;
  }

  public enqueueRender(sceneId: string, providerName?: string, model?: string): RenderJob {
    const mgr = this.projectService.getManager();
    const job = mgr.enqueueRender(sceneId, providerName || 'veo', model || 'veo3');
    const queue = this.getQueue();
    queue.enqueue(job);
    return job;
  }

  public cancelRender(jobId: string): boolean {
    const queue = this.getQueue();
    return queue.cancel(jobId);
  }

  public retryRender(jobId: string): boolean {
    const mgr = this.projectService.getManager();
    const retried = mgr.retryJob(jobId);
    if (retried) {
      const current = mgr.getCurrent();
      const job = current.eigu?.project.renderQueue.jobs.find(j => j.id === jobId);
      if (job) {
        this.getQueue().enqueue(job);
      }
    }
    return retried;
  }

  public getQueueStats() {
    return this.projectService.getManager().getQueueStats();
  }

  public async renderSceneWithAdapter(prompt: string, providerId: string, model: string): Promise<string> {
    const adapter = ProviderAdapterFactory.getAdapter(providerId);
    const result = await adapter.generateVideo({ prompt, model });
    if (result.status === 'failed' || !result.videoUrl) {
      throw new Error(result.error || 'Render failed on provider adapter');
    }
    return result.videoUrl;
  }
}
