import { EventEmitter } from 'events'
import { RenderJob } from './eigu-types'
import { ProjectManager } from './project-manager'
import { MainLogger } from '../../utils/logger.utils'

export interface QueueEvent {
  type: 'job:queued' | 'job:started' | 'job:progress' | 'job:completed' | 'job:failed'
  jobId: string
  sceneId: string
  progress?: number
  output?: string
  error?: string
}

export class LocalQueue extends EventEmitter {
  private maxConcurrency = 2
  private activeJobs: Map<string, RenderJob> = new Map()
  private cancelRequestedJobs: Set<string> = new Set()
  private projectManager: ProjectManager

  constructor(projectManager: ProjectManager) {
    super()
    this.projectManager = projectManager
  }

  public setConcurrency(limit: number): void {
    this.maxConcurrency = Math.max(1, Math.min(10, limit))
  }

  public getConcurrency(): number {
    return this.maxConcurrency
  }

  public getActiveCount(): number {
    return this.activeJobs.size
  }

  /**
   * Tự động khôi phục và tiếp tục chạy các job dở dang sau khi app restart / crash
   */
  public resumeUnfinishedJobs(): void {
    const mgr = this.projectManager as any
    const jobs: RenderJob[] = mgr.currentFile?.project?.renderQueue?.jobs || []
    let count = 0
    for (const j of jobs) {
      if (j.status === 'processing' || j.status === 'queued') {
        j.status = 'queued'
        j.progress = 0
        count++
      }
    }
    if (count > 0) {
      MainLogger.info(`[LocalQueue] Tự động khôi phục ${count} render jobs dở dang trong batch`, { correlationId: 'QUEUE_RESUME' })
      this.triggerQueue()
    }
  }

  async enqueue(job: RenderJob): Promise<void> {
    const manager = this.projectManager as any
    manager.updateJob(job.id, { status: 'queued' })
    this.emit('job:queued', { type: 'job:queued', jobId: job.id, sceneId: job.sceneId })
    this.triggerQueue()
  }

  public triggerQueue(): void {
    const mgr = this.projectManager as any
    const jobs: RenderJob[] = mgr.currentFile?.project?.renderQueue?.jobs || []
    
    while (this.activeJobs.size < this.maxConcurrency) {
      const nextJob = jobs.find((j: RenderJob) => j.status === 'queued' && !this.activeJobs.has(j.id))
      if (!nextJob) break
      
      this.runSingleJob(nextJob)
    }
  }

  private async runSingleJob(job: RenderJob): Promise<void> {
    const mgr = this.projectManager as any
    this.activeJobs.set(job.id, job)
    this.cancelRequestedJobs.delete(job.id)

    job.status = 'processing'
    job.startedAt = new Date().toISOString()
    
    MainLogger.info(`[LocalQueue] Bắt đầu Render Job ${job.id} (Scene: ${job.sceneId}) [Active: ${this.activeJobs.size}/${this.maxConcurrency}]`, {
      correlationId: 'JOB_START', jobId: job.id, sceneId: job.sceneId
    })
    
    this.emit('job:started', { type: 'job:started', jobId: job.id, sceneId: job.sceneId })

    try {
      const currentFilePath = mgr.currentFilePath
      if (!currentFilePath) {
        throw new Error('Dự án chưa được lưu trên đĩa (Ctrl+S). Vui lòng lưu dự án trước khi thực hiện Render.')
      }

      const { AIVideoPipeline } = require('../../services/ai-video-pipeline.service')
      const pipeline = new AIVideoPipeline(currentFilePath)

      const scene = mgr.currentFile?.project?.scenes?.find((s: any) => s.id === job.sceneId)
      const prompt = scene?.prompt || ''

      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt phân cảnh rỗng. Vui lòng nhập prompt hợp lệ trước khi Render.')
      }

      job.progress = 0

      const outputPath = await pipeline.generateVideoWithAI(
        prompt,
        job.model || 'fal-ai/hunyuan-video',
        job.sceneId || scene?.id || 1,
        (progress: number) => {
          if (this.cancelRequestedJobs.has(job.id)) {
            throw new Error('Cancelled')
          }
          job.progress = Math.round(progress)
          this.emit('job:progress', {
            type: 'job:progress', jobId: job.id, sceneId: job.sceneId,
            progress: job.progress,
          })
        }
      )

      job.status = 'completed'
      job.progress = 100
      job.completedAt = new Date().toISOString()
      job.output = outputPath
      
      MainLogger.info(`[LocalQueue] ✅ Render Job ${job.id} hoàn thành thành công: ${outputPath}`, {
        correlationId: 'JOB_COMPLETED', jobId: job.id, sceneId: job.sceneId
      })
      
      this.emit('job:completed', { type: 'job:completed', jobId: job.id, sceneId: job.sceneId, output: outputPath })
      mgr.updateScene(job.sceneId, { status: 'completed', output: outputPath })

    } catch (err: any) {
      if (err.message === 'Cancelled') {
        job.status = 'cancelled'
        this.emit('job:completed', { type: 'job:completed', jobId: job.id, sceneId: job.sceneId })
      } else {
        job.retryCount++
        if (job.retryCount >= job.maxRetries) {
          job.status = 'failed'
          job.error = err.message
          MainLogger.error(`[LocalQueue] ❌ Render Job ${job.id} thất bại vĩnh viễn (Error Isolation Active): ${err.message}`, err, {
            correlationId: 'JOB_FAILED_ISOLATION', jobId: job.id, sceneId: job.sceneId
          })
          this.emit('job:failed', { type: 'job:failed', jobId: job.id, sceneId: job.sceneId, error: err.message })
          mgr.updateScene(job.sceneId, { status: 'failed', error: err.message })
        } else {
          job.status = 'queued'
          this.emit('job:progress', { type: 'job:progress', jobId: job.id, sceneId: job.sceneId, progress: 0 })
        }
      }
    } finally {
      this.activeJobs.delete(job.id)
      this.cancelRequestedJobs.delete(job.id)
      // Tự động kích hoạt job tiếp theo trong queue
      setTimeout(() => this.triggerQueue(), 50)
    }
  }

  cancel(jobId: string): boolean {
    if (this.activeJobs.has(jobId)) {
      this.cancelRequestedJobs.add(jobId)
      return true
    }
    const mgr = this.projectManager as any
    mgr.cancelJob(jobId)
    return true
  }

  getCurrentJob(): RenderJob | null {
    return Array.from(this.activeJobs.values())[0] || null
  }

  getActiveJobs(): RenderJob[] {
    return Array.from(this.activeJobs.values())
  }

  isProcessing(): boolean {
    return this.activeJobs.size > 0
  }
}
