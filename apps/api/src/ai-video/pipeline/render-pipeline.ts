import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ProviderRegistry } from '../providers/provider-registry'
import { RenderQueueService } from '../queue/render-queue.service'
import { v4 as uuid } from 'uuid'

@Injectable()
export class RenderPipeline {
  private readonly logger = new Logger(RenderPipeline.name)

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,
    private renderQueue: RenderQueueService,
  ) {}

  async execute(projectId: string, options: { provider?: string; priority?: number }) {
    const project = await this.prisma.aIProject.findUnique({
      where: { id: projectId },
      include: { scenes: { orderBy: { index: 'asc' } } },
    })
    if (!project || !project.scenes.length) throw new Error('No scenes to render')

    const provider = options.provider || (await this.providerRegistry.selectBest({}))?.id || 'veo'
    const jobs: any[] = []

    // Scene render jobs
    for (const scene of project.scenes) {
      const jobId = uuid()
      jobs.push({
        id: jobId,
        projectId,
        sceneId: scene.id,
        type: 'scene_render',
        provider,
        payload: { prompt: scene.prompt, duration: scene.duration, seed: scene.seed },
        priority: options.priority ?? 0,
        dependencies: [],
        costLimit: 100,
      })

      // Voice job nếu có
      if (scene.voiceLine) {
        const voiceId = uuid()
        jobs.push({
          id: voiceId,
          projectId,
          sceneId: scene.id,
          type: 'voice_generation',
          provider: 'elevenlabs',
          payload: { text: scene.voiceLine },
          priority: options.priority ?? 0,
          dependencies: [],
          costLimit: 10,
        })
      }
    }

    // Concat job
    const renderIds = jobs.filter(j => j.type === 'scene_render').map(j => j.id)
    if (renderIds.length > 1) {
      jobs.push({
        id: uuid(),
        projectId,
        type: 'concat',
        provider,
        payload: { sceneIds: renderIds },
        priority: options.priority ?? 0,
        dependencies: renderIds,
        costLimit: 5,
      })
    }

    await this.renderQueue.submitBatch(jobs)
    await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { status: 'rendering', provider },
    })

    return { projectId, jobCount: jobs.length }
  }
}
