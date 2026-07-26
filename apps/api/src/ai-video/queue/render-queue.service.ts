import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { BusinessError, ErrorCodes } from '../../common/errors/business-error'
import { aiVideoEventBus } from '../events/ai-video-events'

export interface QueueJob {
  id: string
  projectId: string
  sceneId?: string
  type: 'scene_render' | 'voice_generation' | 'subtitle_gen' | 'concat' | 'export' | 'publish'
  provider: string
  payload: any
  priority: number
  dependencies: string[]
  costLimit: number
}

@Injectable()
export class RenderQueueService {
  private readonly logger = new Logger(RenderQueueService.name)

  constructor(private prisma: PrismaService) {}

  async submit(job: QueueJob): Promise<any> {
    this.logger.log(`[Queue] Submitting ${job.type} job ${job.id} for project ${job.projectId}`)

    const providerExists = await this.prisma.aIProvider.findUnique({
      where: { name: job.provider },
      select: { id: true, isActive: true },
    })

    if (!providerExists) {
      throw new BusinessError(ErrorCodes.PROVIDER_NOT_FOUND, `Video provider "${job.provider}" not found.`)
    }

    if (!providerExists.isActive) {
      throw new BusinessError(ErrorCodes.PROVIDER_INACTIVE, `Video provider "${job.provider}" is inactive.`)
    }

    return this.prisma.aIJob.create({
      data: {
        id: job.id,
        type: job.type,
        status: 'queued',
        priority: job.priority,
        projectId: job.projectId,
        sceneId: job.sceneId,
        providerId: providerExists.id,
        maxRetries: 3,
        dependencies: job.dependencies,
      },
    })
  }

  async submitBatch(jobs: QueueJob[]): Promise<any[]> {
    const results: any[] = []
    for (const job of jobs) {
      results.push(await this.submit(job))
    }
    return results
  }

  async getQueueStatus(projectId?: string) {
    const where: any = { project: { deletedAt: null } }
    if (projectId) where.projectId = projectId

    const [pending, active, completed, failed, cancelled] = await Promise.all([
      this.prisma.aIJob.count({ where: { ...where, status: 'queued' } }),
      this.prisma.aIJob.count({ where: { ...where, status: 'processing' } }),
      this.prisma.aIJob.count({ where: { ...where, status: 'completed' } }),
      this.prisma.aIJob.count({ where: { ...where, status: 'failed' } }),
      this.prisma.aIJob.count({ where: { ...where, status: 'cancelled' } }),
    ])
    return { pending, active, completed, failed, cancelled, total: pending + active + completed + failed + cancelled }
  }

  async listJobs(projectId?: string, status?: string, limit = 50) {
    const where: any = { project: { deletedAt: null } }
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    return this.prisma.aIJob.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      include: { provider: { select: { name: true, displayName: true } } },
    })
  }

  async getJob(jobId: string) {
    const job = await this.prisma.aIJob.findUnique({
      where: { id: jobId },
      include: { provider: { select: { name: true, displayName: true } } },
    })
    if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    return job
  }

  async cancelJob(jobId: string) {
    const job = await this.prisma.aIJob.findUnique({ where: { id: jobId } })
    if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    if (!['queued', 'processing'].includes(job.status)) {
      throw new BusinessError(ErrorCodes.JOB_CANCEL_FAILED, `Cannot cancel job in status "${job.status}"`)
    }
    return this.prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'cancelled' },
    })
  }

  async pauseQueue() {
    this.logger.log('Queue paused')
  }

  async resumeQueue() {
    this.logger.log('Queue resumed')
  }

  async retryJob(jobId: string) {
    const job = await this.prisma.aIJob.findUnique({ where: { id: jobId } })
    if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    if (job.status !== 'failed') {
      throw new BusinessError(ErrorCodes.RENDER_SUBMIT_FAILED, `Cannot retry job in status "${job.status}"`)
    }
    const result = await this.prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'queued', retryCount: 0, error: null },
    })
    aiVideoEventBus.emitJobEvent({
      jobId, projectId: job.projectId, sceneId: job.sceneId || undefined,
      type: job.type, status: 'queued', timestamp: new Date(),
    })
    return result
  }

  async updateJobProgress(jobId: string, progress: number, status: string, error?: string) {
    const updateData: any = { progress, status }
    if (status === 'processing') updateData.startedAt = new Date()
    if (status === 'completed') updateData.completedAt = new Date()
    if (error) updateData.error = error
    if (status === 'failed') updateData.retryCount = { increment: 1 }

    const job = await this.prisma.aIJob.update({
      where: { id: jobId },
      data: updateData,
    })

    aiVideoEventBus.emitJobEvent({
      jobId, projectId: job.projectId, sceneId: job.sceneId || undefined,
      type: job.type, status, progress, error, timestamp: new Date(),
    })

    return job
  }

  async markJobCompleted(jobId: string, outputUrl?: string) {
    const job = await this.prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'completed', completedAt: new Date(), progress: 100, outputUrl },
    })
    aiVideoEventBus.emitJobEvent({
      jobId, projectId: job.projectId, sceneId: job.sceneId || undefined,
      type: job.type, status: 'completed', progress: 100, timestamp: new Date(),
    })
    return job
  }

  async markJobFailed(jobId: string, error: string) {
    const job = await this.prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'failed', error, retryCount: { increment: 1 } },
    })
    aiVideoEventBus.emitJobEvent({
      jobId, projectId: job.projectId, sceneId: job.sceneId || undefined,
      type: job.type, status: 'failed', error, timestamp: new Date(),
    })
    return job
  }
}
