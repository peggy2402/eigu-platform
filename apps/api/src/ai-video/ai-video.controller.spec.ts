import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AIVideoController } from './ai-video.controller'
import { AIVideoService } from './ai-video.service'
import { AuthGuard } from '@nestjs/passport'

describe('AIVideoController', () => {
  let app: INestApplication
  let controller: AIVideoController
  let mockService: any

  const mockUser = { id: 'user-1', email: 'test@test.com' }

  const mockRequest = {
    user: mockUser,
  }

  const mockAIVideoService = {
    createProject: jest.fn(),
    listProjects: jest.fn(),
    getProject: jest.fn(),
    updateProject: jest.fn(),
    softDeleteProject: jest.fn(),
    restoreProject: jest.fn(),
    hardDeleteProject: jest.fn(),
    duplicateProject: jest.fn(),
    listDeletedProjects: jest.fn(),
    addScene: jest.fn(),
    updateScene: jest.fn(),
    deleteScene: jest.fn(),
    reorderScenes: jest.fn(),
    createCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    uploadAsset: jest.fn(),
    listAssets: jest.fn(),
    deleteAsset: jest.fn(),
    getBrandKit: jest.fn(),
    updateBrandKit: jest.fn(),
    submitRender: jest.fn(),
    getQueueStatus: jest.fn(),
    cancelRender: jest.fn(),
    retryJob: jest.fn(),
    cancelJob: jest.fn(),
    listProviders: jest.fn(),
    getProviderHealth: jest.fn(),
    estimateCost: jest.fn(),
    getAnalyticsSummary: jest.fn(),
    getAuditLogs: jest.fn(),
    getSceneSubtitle: jest.fn(),
    upsertSubtitle: jest.fn(),
    deleteSubtitle: jest.fn(),
    generateSubtitleFromVoice: jest.fn(),
    getVoiceLibrary: jest.fn(),
    updateSceneVoice: jest.fn(),
    getMusicLibrary: jest.fn(),
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIVideoController],
      providers: [
        { provide: AIVideoService, useValue: mockAIVideoService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()

    controller = module.get<AIVideoController>(AIVideoController)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /ai-video/projects', () => {
    it('should create a project', async () => {
      const dto = { name: 'Test', aspectRatio: '16:9' }
      const expected = { id: 'proj-1', name: 'Test' }
      mockAIVideoService.createProject.mockResolvedValue(expected)

      const result = await controller.createProject(mockRequest as any, dto as any)

      expect(result).toEqual(expected)
      expect(mockAIVideoService.createProject).toHaveBeenCalledWith('user-1', dto)
    })
  })

  describe('GET /ai-video/projects', () => {
    it('should list projects', async () => {
      const expected = [{ id: 'proj-1', name: 'Test' }]
      mockAIVideoService.listProjects.mockResolvedValue(expected)

      const result = await controller.listProjects(mockRequest as any)

      expect(result).toEqual(expected)
      expect(mockAIVideoService.listProjects).toHaveBeenCalledWith('user-1', { status: undefined, category: undefined })
    })
  })

  describe('GET /ai-video/projects/:id', () => {
    it('should get a project', async () => {
      const expected = { id: 'proj-1', name: 'Test' }
      mockAIVideoService.getProject.mockResolvedValue(expected)

      const result = await controller.getProject('proj-1', mockRequest as any)
      expect(result).toEqual(expected)
    })
  })

  describe('PATCH /ai-video/projects/:id', () => {
    it('should update a project', async () => {
      const dto = { name: 'Updated' }
      const expected = { id: 'proj-1', name: 'Updated' }
      mockAIVideoService.updateProject.mockResolvedValue(expected)

      const result = await controller.updateProject('proj-1', dto as any, mockRequest as any)
      expect(result).toEqual(expected)
      expect(mockAIVideoService.updateProject).toHaveBeenCalledWith('proj-1', dto, 'user-1')
    })
  })

  describe('DELETE /ai-video/projects/:id', () => {
    it('should soft delete a project', async () => {
      mockAIVideoService.softDeleteProject.mockResolvedValue({ deletedAt: new Date() })

      const result = await controller.softDeleteProject('proj-1', mockRequest as any)
      expect(mockAIVideoService.softDeleteProject).toHaveBeenCalledWith('proj-1', 'user-1')
    })
  })

  describe('POST /ai-video/projects/:id/restore', () => {
    it('should restore a deleted project', async () => {
      mockAIVideoService.restoreProject.mockResolvedValue({ deletedAt: null })

      const result = await controller.restoreProject('proj-1', mockRequest as any)
      expect(mockAIVideoService.restoreProject).toHaveBeenCalledWith('proj-1', 'user-1')
    })
  })

  describe('POST /ai-video/projects/:id/scenes', () => {
    it('should add a scene', async () => {
      const dto = { index: 0, prompt: 'Test scene', duration: 5, transition: 'cut' }
      const expected = { id: 'scene-1', ...dto }
      mockAIVideoService.addScene.mockResolvedValue(expected)

      const result = await controller.addScene('proj-1', dto as any, mockRequest as any)
      expect(result).toEqual(expected)
    })
  })

  describe('PATCH /ai-video/projects/:id/scenes/:sid', () => {
    it('should update a scene', async () => {
      const dto = { prompt: 'Updated scene' }
      mockAIVideoService.updateScene.mockResolvedValue({ id: 'scene-1', prompt: 'Updated scene' })

      const result = await controller.updateScene('scene-1', dto as any)
      expect(mockAIVideoService.updateScene).toHaveBeenCalledWith('scene-1', dto)
    })
  })

  describe('POST /ai-video/render', () => {
    it('should submit render', async () => {
      const dto = { projectId: 'proj-1', provider: 'veo' }
      const expected = { projectId: 'proj-1', jobs: [{ id: 'job-1', type: 'scene_render' }] }
      mockAIVideoService.submitRender.mockResolvedValue(expected)

      const result = await controller.submitRender(mockRequest as any, dto as any)
      expect(result).toEqual(expected)
      expect(mockAIVideoService.submitRender).toHaveBeenCalledWith('proj-1', dto, 'user-1')
    })
  })

  describe('POST /ai-video/characters', () => {
    it('should create a character', async () => {
      const dto = { projectId: 'proj-1', name: 'Hero', prompt: 'A hero', style: 'realistic' }
      const expected = { id: 'char-1', name: 'Hero' }
      mockAIVideoService.createCharacter.mockResolvedValue(expected)

      const result = await controller.createCharacter(mockRequest as any, dto as any)
      expect(result).toEqual(expected)
      expect(mockAIVideoService.createCharacter).toHaveBeenCalledWith('user-1', 'proj-1', dto)
    })
  })

  describe('GET /ai-video/providers/health', () => {
    it('should return provider health', async () => {
      const expected = [{ name: 'veo', status: 'available' }]
      mockAIVideoService.getProviderHealth.mockResolvedValue(expected)

      const result = await controller.getProviderHealth()
      expect(result).toEqual(expected)
    })
  })

  describe('GET /ai-video/projects/:id/cost-estimate', () => {
    it('should return cost estimate', async () => {
      const expected = { projectId: 'proj-1', sceneCount: 2, estimates: [] }
      mockAIVideoService.estimateCost.mockResolvedValue(expected)

      const result = await controller.estimateCost('proj-1', mockRequest as any)
      expect(result).toEqual(expected)
    })
  })

  describe('GET /ai-video/analytics/summary', () => {
    it('should return analytics', async () => {
      const expected = { totalProjects: 5, totalScenes: 20, totalCost: 150 }
      mockAIVideoService.getAnalyticsSummary.mockResolvedValue(expected)

      const result = await controller.getAnalytics(mockRequest as any)
      expect(result).toEqual(expected)
    })
  })

  describe('POST /ai-video/jobs/:id/retry', () => {
    it('should retry a job', async () => {
      mockAIVideoService.retryJob.mockResolvedValue({ id: 'job-1', status: 'queued' })

      const result = await controller.retryJob('job-1', mockRequest as any)
      expect(mockAIVideoService.retryJob).toHaveBeenCalledWith('job-1', 'user-1')
    })
  })

  describe('POST /ai-video/jobs/:id/cancel', () => {
    it('should cancel a job', async () => {
      mockAIVideoService.cancelJob.mockResolvedValue({ id: 'job-1', status: 'cancelled' })

      const result = await controller.cancelJob('job-1', mockRequest as any)
      expect(mockAIVideoService.cancelJob).toHaveBeenCalledWith('job-1', 'user-1')
    })
  })

  describe('Voice/Subtitle/Music endpoints', () => {
    it('GET /ai-video/voice-library should return voices', async () => {
      mockAIVideoService.getVoiceLibrary.mockResolvedValue([{ id: 'male-1', name: 'Giọng Nam 1' }])

      const result = await controller.getVoiceLibrary()
      expect(result).toHaveLength(1)
    })

    it('GET /ai-video/music-library should return music', async () => {
      mockAIVideoService.getMusicLibrary.mockResolvedValue([{ id: 'upbeat', name: 'Upbeat' }])

      const result = await controller.getMusicLibrary()
      expect(result).toHaveLength(1)
    })

    it('PUT /ai-video/scenes/:sid/subtitle should upsert subtitle', async () => {
      const dto = { text: 'Hello', startTime: 0, endTime: 5 }
      mockAIVideoService.upsertSubtitle.mockResolvedValue({ sceneId: 'scene-1', ...dto })

      const result = await controller.upsertSubtitle('scene-1', dto)
      expect(mockAIVideoService.upsertSubtitle).toHaveBeenCalledWith('scene-1', dto)
    })
  })
})
