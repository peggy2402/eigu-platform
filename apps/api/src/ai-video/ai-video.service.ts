import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProviderRegistry } from './providers/provider-registry'
import { RenderQueueService, QueueJob } from './queue/render-queue.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { CreateSceneDto } from './dto/create-scene.dto'
import { UpdateSceneDto } from './dto/update-scene.dto'
import { CreateCharacterDto } from './dto/create-character.dto'
import { ReorderScenesDto } from './dto/reorder-scenes.dto'
import { RenderOptionsDto } from './dto/render-options.dto'
import { BusinessError, ErrorCodes } from '../common/errors/business-error'
import { AuditService } from '../common/audit/audit.service'
import { aiVideoEventBus } from './events/ai-video-events'
import { v4 as uuid } from 'uuid'

@Injectable()
export class AIVideoService {
  private readonly logger = new Logger(AIVideoService.name)

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,
    private renderQueue: RenderQueueService,
    private audit: AuditService,
  ) {}

  // ===== PROJECTS =====

  private async resolveProjectName(userId: string, baseName: string): Promise<string> {
    const existing = await this.prisma.aIProject.findMany({
      where: { userId, name: { startsWith: baseName }, deletedAt: null },
      select: { name: true },
      orderBy: { name: 'asc' },
    })

    if (existing.length === 0) return baseName

    const maxSuffix = existing.reduce((max, p) => {
      if (p.name === baseName) return Math.max(max, 0)
      const suffix = parseInt(p.name.slice(baseName.length + 1), 10)
      return isNaN(suffix) ? max : Math.max(max, suffix)
    }, -1)

    return maxSuffix < 0 ? baseName : `${baseName}-${maxSuffix + 1}`
  }

  async createProject(userId: string, dto: CreateProjectDto) {
    const name = await this.resolveProjectName(userId, dto.name)

    const project = await this.prisma.$transaction(async (tx) => {
      const exists = await tx.aIProject.findUnique({
        where: { userId_name: { userId, name } },
      })
      if (exists) {
        throw new BusinessError(ErrorCodes.PROJECT_NAME_CONFLICT, `Project name "${name}" already exists.`)
      }

      return tx.aIProject.create({
        data: {
          name,
          description: dto.description,
          tags: dto.tags || [],
          userId,
          createdBy: userId,
          updatedBy: userId,
          workspaceId: dto.workspaceId,
          category: dto.category,
          language: dto.language,
          aspectRatio: dto.aspectRatio,
          resolution: dto.resolution,
          fps: dto.fps,
          priority: dto.priority,
        },
        include: { scenes: true },
      })
    })

    this.audit.log({ userId, action: 'PROJECT_CREATE', module: 'AI_VIDEO', resourceId: project.id, payload: { name } })
    aiVideoEventBus.emitProjectEvent({ projectId: project.id, userId, action: 'created', payload: { name }, timestamp: new Date() })
    return project
  }

  async listProjects(userId: string, filter?: { status?: string; category?: string }) {
    const where: any = { userId, deletedAt: null }
    if (filter?.status) where.status = filter.status
    if (filter?.category) where.category = filter.category
    return this.prisma.aIProject.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { scenes: true } } },
    })
  }

  async getProject(projectId: string, userId?: string) {
    const where: any = { id: projectId, deletedAt: null }
    if (userId) where.userId = userId
    const project = await this.prisma.aIProject.findFirst({
      where,
      include: {
        scenes: { orderBy: { index: 'asc' } },
        characters: true,
        assets: true,
        brandKit: true,
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')
    return project
  }

  async updateProject(projectId: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    if (dto.name && dto.name !== project.name) {
      const name = await this.resolveProjectName(userId, dto.name)
      dto.name = name
    }

    const updated = await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { ...dto, updatedBy: userId },
    })

    this.audit.log({ userId, action: 'PROJECT_UPDATE', module: 'AI_VIDEO', resourceId: projectId, payload: dto })
    return updated
  }

  async softDeleteProject(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const result = await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    })
    this.audit.log({ userId: userId || project.userId, action: 'PROJECT_DELETE', module: 'AI_VIDEO', resourceId: projectId })
    return result
  }

  async restoreProject(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: { not: null } },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Deleted project not found')

    const result = await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { deletedAt: null },
    })
    this.audit.log({ userId: userId || project.userId, action: 'PROJECT_RESTORE', module: 'AI_VIDEO', resourceId: projectId })
    return result
  }

  async hardDeleteProject(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    await this.prisma.$transaction(async (tx) => {
      await tx.aIJob.deleteMany({ where: { projectId } })
      await tx.aIComment.deleteMany({ where: { projectId } })
      await tx.aIVersion.deleteMany({ where: { projectId } })
      await tx.aIAsset.deleteMany({ where: { projectId } })
      await tx.aISubtitle.deleteMany({ where: { scene: { projectId } } })
      await tx.aIScene.deleteMany({ where: { projectId } })
      await tx.aICharacter.deleteMany({ where: { projectId } })
      await tx.aIBrandKit.deleteMany({ where: { projectId } })
      await tx.aIQualityCheck.deleteMany({ where: { projectId } })
      await tx.aIAnalytics.deleteMany({ where: { projectId } })
      await tx.aIProject.delete({ where: { id: projectId } })
    })

    this.audit.log({ userId: userId || project.userId, action: 'PROJECT_HARD_DELETE', module: 'AI_VIDEO', resourceId: projectId })
    return { deleted: true }
  }

  async listDeletedProjects(userId: string) {
    return this.prisma.aIProject.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    })
  }

  async duplicateProject(projectId: string, newName: string, userId: string) {
    const original = await this.getProject(projectId, userId)
    if (!original) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const name = await this.resolveProjectName(original.userId, newName || `${original.name} (Copy)`)

    const newProject = await this.prisma.aIProject.create({
      data: {
        name,
        description: original.description,
        userId: original.userId,
        category: original.category,
        aspectRatio: original.aspectRatio,
        resolution: original.resolution,
        fps: original.fps,
        language: original.language,
        tags: original.tags,
        createdBy: original.createdBy,
        updatedBy: original.updatedBy,
      },
    })

    for (const scene of original.scenes || []) {
      await this.prisma.aIScene.create({
        data: {
          projectId: newProject.id,
          index: scene.index,
          prompt: scene.prompt,
          negativePrompt: scene.negativePrompt,
          duration: scene.duration,
          transition: scene.transition,
          camera: scene.camera,
          seed: scene.seed,
        },
      })
    }

    this.audit.log({ userId: userId || original.userId, action: 'PROJECT_DUPLICATE', module: 'AI_VIDEO', resourceId: newProject.id, payload: { sourceId: projectId } })
    return newProject
  }

  // ===== SCENES =====

  async addScene(projectId: string, dto: CreateSceneDto, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.create({
      data: {
        ...dto,
        referenceImages: dto.referenceImages || [],
        projectId,
      },
    })

    await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { totalScenes: { increment: 1 } },
    })

    return scene
  }

  async updateScene(projectId: string, sceneId: string, dto: UpdateSceneDto, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.findFirst({ where: { id: sceneId, projectId } })
    if (!scene) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Scene not found')

    return this.prisma.aIScene.update({
      where: { id: sceneId },
      data: dto,
    })
  }

  async deleteScene(projectId: string, sceneId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.findFirst({ where: { id: sceneId, projectId } })
    if (!scene) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Scene not found')

    await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { totalScenes: { decrement: 1 } },
    })

    return this.prisma.aIScene.delete({ where: { id: sceneId } })
  }

  async reorderScenes(projectId: string, dto: ReorderScenesDto, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const updates = dto.items.map(item =>
      this.prisma.aIScene.update({
        where: { id: item.sceneId },
        data: { index: item.newIndex },
      }),
    )
    return Promise.all(updates)
  }

  // ===== CHARACTERS =====

  async createCharacter(userId: string, projectId: string, dto: CreateCharacterDto) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const character = await this.prisma.aICharacter.create({
      data: {
        ...dto,
        referenceImages: dto.referenceImages || [],
        prompt: dto.prompt || '',
        projectId,
        userId,
      },
    })

    this.audit.log({ userId, action: 'CHARACTER_CREATE', module: 'AI_VIDEO', resourceId: character.id, payload: { name: dto.name, projectId } })
    return character
  }

  async listCharacters(projectId?: string, userId?: string) {
    const where: any = {}
    if (projectId) {
      where.projectId = projectId
      where.project = { deletedAt: null, userId }
    }
    if (userId) {
      where.AND = [
        { OR: [{ userId }, { isGlobal: true }] }
      ]
    }
    return this.prisma.aICharacter.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })
  }

  async updateCharacter(characterId: string, dto: Partial<CreateCharacterDto>, userId: string) {
    const char = await this.prisma.aICharacter.findFirst({
      where: { id: characterId, OR: [{ userId }, { project: { userId } }] },
    })
    if (!char) throw new BusinessError(ErrorCodes.CHARACTER_NOT_FOUND, 'Character not found')
    return this.prisma.aICharacter.update({
      where: { id: characterId },
      data: dto,
    })
  }

  async deleteCharacter(characterId: string, userId: string) {
    const char = await this.prisma.aICharacter.findFirst({
      where: { id: characterId, OR: [{ userId }, { project: { userId } }] },
    })
    if (!char) throw new BusinessError(ErrorCodes.CHARACTER_NOT_FOUND, 'Character not found')
    return this.prisma.aICharacter.delete({ where: { id: characterId } })
  }

  // ===== RENDER =====

  async submitRender(projectId: string, options: RenderOptionsDto, userId: string) {
    const project = await this.getProject(projectId, userId)
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    if (!project.scenes || project.scenes.length === 0) {
      throw new BusinessError(ErrorCodes.RENDER_NO_SCENES, 'No scenes to render. Please add scenes first.')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BusinessError(ErrorCodes.USER_NOT_FOUND, 'User not found')

    const providerName = options.provider || 'veo'
    const provider = await this.prisma.aIProvider.findUnique({
      where: { name: providerName },
    })
    if (!provider) {
      throw new BusinessError(ErrorCodes.PROVIDER_NOT_FOUND, `Video provider "${providerName}" not found.`)
    }
    if (!provider.isActive) {
      throw new BusinessError(ErrorCodes.PROVIDER_INACTIVE, `Video provider "${providerName}" is inactive.`)
    }

    const requiredCredit = provider.creditCost || 1.0
    if (user.creditBalance < requiredCredit) {
      throw new BadRequestException(`Tài khoản của bạn chỉ còn ${user.creditBalance} credit, không đủ ${requiredCredit} credit để render. Vui lòng nạp thêm credit.`)
    }

    const jobs: QueueJob[] = []

    for (const scene of project.scenes) {
      jobs.push({
        id: uuid(),
        projectId,
        sceneId: scene.id,
        type: 'scene_render',
        provider: providerName,
        payload: { sceneId: scene.id, prompt: scene.prompt, duration: scene.duration },
        priority: options.priority ?? project.priority,
        dependencies: [],
        costLimit: options.costLimit ?? 100,
      })
      if (scene.voiceLine) {
        jobs.push({
          id: uuid(),
          projectId,
          sceneId: scene.id,
          type: 'voice_generation',
          provider: 'elevenlabs',
          payload: { sceneId: scene.id, text: scene.voiceLine },
          priority: options.priority ?? project.priority,
          dependencies: [],
          costLimit: 10,
        })
      }
    }

    const sceneJobIds = jobs.filter(j => j.type === 'scene_render').map(j => j.id)
    if (sceneJobIds.length > 1) {
      jobs.push({
        id: uuid(),
        projectId,
        type: 'concat',
        provider: providerName,
        payload: { sceneIds: sceneJobIds },
        priority: options.priority ?? project.priority,
        dependencies: sceneJobIds,
        costLimit: 5,
      })
    }

    const providerRecord = await this.prisma.aIProvider.findUnique({
      where: { name: providerName },
      select: { id: true },
    })

    let estimatedCost = 0
    await this.prisma.$transaction(async (tx) => {
      await tx.aIProject.update({
        where: { id: projectId },
        data: { status: 'rendering', provider: providerName },
      })

      for (const job of jobs) {
        const pId = job.provider === providerName
          ? providerRecord!.id
          : (await tx.aIProvider.findUnique({ where: { name: job.provider }, select: { id: true } }))?.id

        const created = await tx.aIJob.create({
          data: {
            id: job.id,
            type: job.type,
            status: 'queued',
            priority: job.priority,
            projectId: job.projectId,
            sceneId: job.sceneId,
            providerId: pId,
            maxRetries: 3,
            dependencies: job.dependencies,
            costLimit: job.costLimit,
          },
        })
        estimatedCost += job.costLimit
      }
    })

    const totalEstimatedCost = estimatedCost
    this.audit.log({ userId: userId || project.userId, action: 'RENDER_SUBMIT', module: 'AI_VIDEO', resourceId: projectId, payload: { provider: providerName, jobs: jobs.length, estimatedCost: totalEstimatedCost } })

    for (const job of jobs) {
      aiVideoEventBus.emitJobEvent({
        jobId: job.id, projectId, sceneId: job.sceneId,
        type: job.type, status: 'queued', timestamp: new Date(),
        metadata: { provider: providerName, priority: job.priority },
      })
    }

    return { projectId, estimatedCost: totalEstimatedCost, jobs: jobs.map(j => ({ id: j.id, type: j.type })) }
  }

  async getQueueStatus(projectId?: string, userId?: string) {
    if (projectId && userId) {
      const proj = await this.prisma.aIProject.findFirst({ where: { id: projectId, userId, deletedAt: null } })
      if (!proj) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')
    }
    return this.renderQueue.getQueueStatus(projectId)
  }

  async listJobs(projectId?: string, status?: string, limit = 50, userId?: string) {
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (userId) {
      where.project = { userId, deletedAt: null }
    }
    return this.prisma.aIJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getJob(jobId: string, userId?: string) {
    const where: any = { id: jobId }
    if (userId) {
      where.project = { userId, deletedAt: null }
    }
    const job = await this.prisma.aIJob.findFirst({ where })
    if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    return job
  }

  async cancelRender(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const jobs = await this.prisma.aIJob.findMany({
      where: { projectId, status: { in: ['queued', 'processing'] } },
    })
    await Promise.all(jobs.map(j => this.renderQueue.cancelJob(j.id)))
    await this.prisma.aIProject.update({
      where: { id: projectId },
      data: { status: 'draft' },
    })

    this.audit.log({ userId: userId || project.userId, action: 'RENDER_CANCEL', module: 'AI_VIDEO', resourceId: projectId, payload: { cancelled: jobs.length } })
    return { cancelled: jobs.length }
  }

  async retryJob(jobId: string, userId?: string) {
    if (userId) {
      const job = await this.prisma.aIJob.findFirst({ where: { id: jobId, project: { userId, deletedAt: null } } })
      if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    }
    const result = await this.renderQueue.retryJob(jobId)
    this.audit.log({ userId: userId || 'system', action: 'JOB_RETRY', module: 'AI_VIDEO', resourceId: jobId })
    return result
  }

  async cancelJob(jobId: string, userId?: string) {
    if (userId) {
      const job = await this.prisma.aIJob.findFirst({ where: { id: jobId, project: { userId, deletedAt: null } } })
      if (!job) throw new BusinessError(ErrorCodes.JOB_NOT_FOUND, 'Job not found')
    }
    const result = await this.renderQueue.cancelJob(jobId)
    this.audit.log({ userId: userId || 'system', action: 'JOB_CANCEL', module: 'AI_VIDEO', resourceId: jobId })
    return result
  }

  // ===== ASSETS =====

  async uploadAsset(projectId: string, file: any, type: string, name: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const asset = await this.prisma.aIAsset.create({
      data: {
        name,
        type,
        url: file.path || '',
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size || 0,
        projectId,
      },
    })
    return asset
  }

  async listAssets(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    return this.prisma.aIAsset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteAsset(projectId: string, assetId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const asset = await this.prisma.aIAsset.findFirst({ where: { id: assetId, projectId } })
    if (!asset) throw new BusinessError(ErrorCodes.ASSET_NOT_FOUND, 'Asset not found')
    return this.prisma.aIAsset.delete({ where: { id: assetId } })
  }

  // ===== BRAND KIT =====

  async getBrandKit(projectId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    let kit = await this.prisma.aIBrandKit.findUnique({ where: { projectId } })
    if (!kit) {
      kit = await this.prisma.aIBrandKit.create({
        data: { projectId },
      })
    }
    return kit
  }

  async updateBrandKit(projectId: string, dto: any, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    return this.prisma.aIBrandKit.upsert({
      where: { projectId },
      update: dto,
      create: { projectId, ...dto },
    })
  }

  // ===== SUBTITLES =====

  async getSceneSubtitle(projectId: string, sceneId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    return this.prisma.aISubtitle.findFirst({ where: { sceneId, scene: { projectId } } })
  }

  async upsertSubtitle(projectId: string, sceneId: string, dto: any, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.findFirst({ where: { id: sceneId, projectId } })
    if (!scene) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Scene not found')

    return this.prisma.aISubtitle.upsert({
      where: { sceneId },
      update: dto,
      create: { sceneId, ...dto },
    })
  }

  async deleteSubtitle(projectId: string, sceneId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const sub = await this.prisma.aISubtitle.findFirst({ where: { sceneId, scene: { projectId } } })
    if (!sub) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Subtitle not found')
    return this.prisma.aISubtitle.delete({ where: { sceneId } })
  }

  async generateSubtitleFromVoice(projectId: string, sceneId: string, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.findFirst({ where: { id: sceneId, projectId } })
    if (!scene) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Scene not found')
    if (!scene.voiceLine) throw new BadRequestException('Scene has no voice line to generate subtitle from')

    return this.prisma.aISubtitle.upsert({
      where: { sceneId },
      update: {
        text: scene.voiceLine,
        language: 'vi',
        startTime: 0,
        endTime: scene.duration || 5,
      },
      create: {
        sceneId,
        text: scene.voiceLine,
        language: 'vi',
        startTime: 0,
        endTime: scene.duration || 5,
      },
    })
  }

  // ===== VOICE SETTINGS =====

  async getVoiceLibrary() {
    return [
      { id: 'male-1', name: 'Giọng Nam 1', provider: 'elevenlabs', language: 'vi', emotion: ['neutral', 'happy', 'serious'] },
      { id: 'male-2', name: 'Giọng Nam 2', provider: 'elevenlabs', language: 'vi', emotion: ['neutral', 'warm'] },
      { id: 'female-1', name: 'Giọng Nữ 1', provider: 'elevenlabs', language: 'vi', emotion: ['neutral', 'happy', 'caring'] },
      { id: 'female-2', name: 'Giọng Nữ 2', provider: 'elevenlabs', language: 'vi', emotion: ['neutral', 'professional'] },
      { id: 'male-en-1', name: 'English Male', provider: 'elevenlabs', language: 'en', emotion: ['neutral', 'serious'] },
      { id: 'female-en-1', name: 'English Female', provider: 'elevenlabs', language: 'en', emotion: ['neutral', 'happy'] },
    ]
  }

  async updateSceneVoice(projectId: string, sceneId: string, dto: any, userId: string) {
    const project = await this.prisma.aIProject.findFirst({
      where: { id: projectId, userId, deletedAt: null },
    })
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const scene = await this.prisma.aIScene.findFirst({ where: { id: sceneId, projectId } })
    if (!scene) throw new BusinessError(ErrorCodes.SCENE_NOT_FOUND, 'Scene not found')

    return this.prisma.aIScene.update({
      where: { id: sceneId },
      data: {
        voiceLine: dto.voiceLine !== undefined ? dto.voiceLine : scene.voiceLine,
      },
    })
  }

  // ===== MUSIC =====

  async getMusicLibrary() {
    return [
      { id: 'upbeat', name: 'Upbeat', genre: 'pop', mood: 'happy', duration: 30 },
      { id: 'cinematic', name: 'Cinematic', genre: 'orchestral', mood: 'epic', duration: 60 },
      { id: 'calm', name: 'Calm Piano', genre: 'piano', mood: 'calm', duration: 30 },
      { id: 'corporate', name: 'Corporate', genre: 'electronic', mood: 'professional', duration: 30 },
      { id: 'ambient', name: 'Ambient', genre: 'ambient', mood: 'mysterious', duration: 60 },
      { id: 'motivation', name: 'Motivation', genre: 'rock', mood: 'energetic', duration: 30 },
    ]
  }

  // ===== PROVIDERS =====

  async listProviders() {
    return this.prisma.aIProvider.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        maxDuration: true,
        creditCost: true,
        speed: true,
        quality: true,
        isActive: true,
      },
    })
  }

  async getProviderHealth() {
    const providers = await this.prisma.aIProvider.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        isActive: true,
        speed: true,
        quality: true,
        creditCost: true,
        updatedAt: true,
      },
    })

    return providers.map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      status: p.isActive ? 'available' : 'disabled',
      speed: p.speed,
      quality: p.quality,
      creditCost: p.creditCost,
      lastChecked: p.updatedAt,
    }))
  }

  // ===== AUDIT LOGS =====

  async getAuditLogs(projectId?: string, userId?: string, limit = 50) {
    const where: any = { module: 'AI_VIDEO' }
    if (projectId) where.resourceId = projectId
    if (userId) where.userId = userId
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  // ===== COST ESTIMATE =====

  async estimateCost(projectId: string, userId: string) {
    const project = await this.getProject(projectId, userId)
    if (!project) throw new BusinessError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found')

    const providers = await this.prisma.aIProvider.findMany({
      where: { isActive: true },
      select: { name: true, creditCost: true },
    })

    const sceneCount = project.scenes?.length || 0
    const estimates = providers.map(p => ({
      provider: p.name,
      estimatedCost: sceneCount * p.creditCost,
      sceneCount,
      costPerScene: p.creditCost,
    }))

    return {
      projectId,
      sceneCount,
      estimates,
    }
  }

  // ===== ANALYTICS =====

  async getAnalyticsSummary(userId: string) {
    const [totalProjects, totalScenes, totalCost] = await Promise.all([
      this.prisma.aIProject.count({ where: { userId, deletedAt: null } }),
      this.prisma.aIScene.count({ where: { project: { userId, deletedAt: null } } }),
      this.prisma.aIProject.aggregate({ where: { userId, deletedAt: null }, _sum: { cost: true } }),
    ])
    return { totalProjects, totalScenes, totalCost: totalCost._sum.cost || 0 }
  }

  // ===== CREDIT & PROMPTS SAAS ENGINE =====

  async getUserCredit(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, creditBalance: true }
    })
    if (!user) throw new BusinessError(ErrorCodes.USER_NOT_FOUND, 'User not found')
    return user
  }

  async generatePromptsBackend(text: string, mode = 'idea', images: string[] = []) {
    const geminiKey = process.env.GEMINI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (!geminiKey && !openaiKey) {
      throw new BadRequestException('Chưa cấu hình API Key trên Server cho Gemini hoặc OpenAI.')
    }

    const systemPrompt = `You are a professional video prompt engineer. Create detailed video scene generation prompts for AI video models based on the user request. Respond in JSON array format containing strings for scenes. Example: ["Scene 1: ...", "Scene 2: ..."]`

    try {
      if (geminiKey) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Input (${mode}): ${text}` }] }]
            })
          })
          if (res.ok) {
            const data = await res.json()
            const resText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (resText) {
              const cleanJson = resText.replace(/```json/g, '').replace(/```/g, '').trim()
              return JSON.parse(cleanJson)
            }
          }
        } catch (e) {
          /* try fallback */
        }
      }

      if (openaiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Generate scenes for this ${mode}: ${text}` }
            ]
          })
        })
        if (res.ok) {
          const data = await res.json()
          const content = data.choices?.[0]?.message?.content || ''
          if (content) {
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(cleanContent)
          }
        }
      }

      // Default fallback scenes generated for the story
      return [
        `Scene 1: Cận cảnh ${text.slice(0, 30)}..., góc quay mượt mà 4K cinematic`,
        `Scene 2: Toàn cảnh diễn biến tiếp theo, bối cảnh sống động chi tiết 3D`,
        `Scene 3: Cảnh kết thúc đầy cảm xúc, hiệu ứng ánh sáng hoàng hôn ấm áp`
      ]
    } catch (err: any) {
      throw new BadRequestException(`Lỗi backend sinh kịch bản: ${err.message}`)
    }
  }

  async deductCreditOnSuccess(jobId: string) {
    const job = await this.prisma.aIJob.findUnique({
      where: { id: jobId },
      include: { project: true, provider: true }
    })
    if (!job || !job.project) return
    const cost = job.provider?.creditCost || 1.0

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: job.project.userId },
        data: { creditBalance: { decrement: cost } }
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId: job.project.userId,
          amount: -cost,
          type: 'DEDUCTION',
          jobId: job.id,
          providerId: job.providerId,
          description: `Trừ ${cost} credit cho render job ${job.id}`
        }
      })
    ])
  }
}
