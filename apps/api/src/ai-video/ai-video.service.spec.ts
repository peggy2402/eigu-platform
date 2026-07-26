import { Test, TestingModule } from '@nestjs/testing'
import { AIVideoService } from './ai-video.service'
import { PrismaService } from '../prisma/prisma.service'
import { ProviderRegistry } from './providers/provider-registry'
import { RenderQueueService } from './queue/render-queue.service'
import { AuditService } from '../common/audit/audit.service'
import { BusinessError, ErrorCodes } from '../common/errors/business-error'

describe('AIVideoService', () => {
  let service: AIVideoService
  let prisma: any

  const mockPrisma = {
    aIProject: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    aIScene: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    aICharacter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    aIAsset: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    aIBrandKit: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    aIProvider: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    aIJob: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    aIComment: { deleteMany: jest.fn() },
    aIVersion: { deleteMany: jest.fn() },
    aISubtitle: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    aIQualityCheck: { deleteMany: jest.fn() },
    aIAnalytics: { deleteMany: jest.fn() },
    auditLog: { findMany: jest.fn(), create: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mockPrisma)),
  }

  const mockProviderRegistry = {}
  const mockRenderQueue = {
    cancelJob: jest.fn(),
    retryJob: jest.fn(),
    getQueueStatus: jest.fn(),
  }
  const mockAudit = { log: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma))

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIVideoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProviderRegistry, useValue: mockProviderRegistry },
        { provide: RenderQueueService, useValue: mockRenderQueue },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile()

    service = module.get<AIVideoService>(AIVideoService)
  })

  describe('createProject', () => {
    it('should create a project with unique name', async () => {
      mockPrisma.aIProject.findMany.mockResolvedValue([])
      mockPrisma.aIProject.findUnique.mockResolvedValue(null)
      mockPrisma.aIProject.create.mockResolvedValue({ id: 'proj-1', name: 'Test Project', scenes: [] })

      const result = await service.createProject('user-1', { name: 'Test Project' })

      expect(result.name).toBe('Test Project')
      expect(mockPrisma.aIProject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Test Project', userId: 'user-1' }),
        }),
      )
      expect(mockAudit.log).toHaveBeenCalled()
    })

    it('should auto-rename on duplicate name', async () => {
      mockPrisma.aIProject.findMany.mockResolvedValue([
        { name: 'Test Project' },
        { name: 'Test Project-1' },
      ])
      mockPrisma.aIProject.findUnique.mockResolvedValue(null)
      mockPrisma.aIProject.create.mockResolvedValue({ id: 'proj-2', name: 'Test Project-2', scenes: [] })

      const result = await service.createProject('user-1', { name: 'Test Project' })

      expect(result.name).toBe('Test Project-2')
    })

    it('should throw on race condition conflict', async () => {
      mockPrisma.aIProject.findMany.mockResolvedValue([])
      mockPrisma.aIProject.findUnique.mockResolvedValue({ id: 'existing', name: 'Test Project' })

      await expect(service.createProject('user-1', { name: 'Test Project' }))
        .rejects.toThrow(BusinessError)
    })
  })

  describe('getProject', () => {
    it('should return project when found', async () => {
      const mockProject = { id: 'proj-1', name: 'Test', deletedAt: null, scenes: [], characters: [], assets: [], brandKit: null, versions: [] }
      mockPrisma.aIProject.findFirst.mockResolvedValue(mockProject)

      const result = await service.getProject('proj-1')
      expect(result.id).toBe('proj-1')
    })

    it('should throw when project not found', async () => {
      mockPrisma.aIProject.findFirst.mockResolvedValue(null)

      await expect(service.getProject('nonexistent'))
        .rejects.toThrow(BusinessError)
    })
  })

  describe('softDeleteProject', () => {
    it('should set deletedAt', async () => {
      const mockProject = { id: 'proj-1', userId: 'user-1', deletedAt: null }
      mockPrisma.aIProject.findFirst.mockResolvedValue(mockProject)
      mockPrisma.aIProject.update.mockResolvedValue({ ...mockProject, deletedAt: new Date() })

      const result = await service.softDeleteProject('proj-1', 'user-1')
      expect(mockPrisma.aIProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })

    it('should throw for already deleted', async () => {
      mockPrisma.aIProject.findFirst.mockResolvedValue(null)

      await expect(service.softDeleteProject('proj-1', 'user-1'))
        .rejects.toThrow(BusinessError)
    })
  })

  describe('submitRender', () => {
    it('should throw when no scenes', async () => {
      mockPrisma.aIProject.findFirst.mockResolvedValue({ id: 'proj-1', userId: 'user-1', deletedAt: null })
      mockPrisma.aIProject.findUnique = jest.fn().mockResolvedValue({ id: 'proj-1', scenes: [] })
      mockPrisma.aIProject.findFirst.mockResolvedValue({ id: 'proj-1', scenes: [] })

      const svcWithSpy = service
      jest.spyOn(svcWithSpy, 'getProject').mockResolvedValue({ id: 'proj-1', scenes: [] } as any)

      await expect(service.submitRender('proj-1', {}, 'user-1'))
        .rejects.toThrow(BusinessError)
    })
  })

  describe('resolveProjectName', () => {
    it('should return base name when no conflicts', async () => {
      mockPrisma.aIProject.findMany.mockResolvedValue([])
      const result = await (service as any).resolveProjectName('user-1', 'my-project')
      expect(result).toBe('my-project')
    })

    it('should generate suffix -1, -2, etc.', async () => {
      mockPrisma.aIProject.findMany.mockResolvedValue([
        { name: 'my-project' },
        { name: 'my-project-1' },
        { name: 'my-project-3' },
      ])
      const result = await (service as any).resolveProjectName('user-1', 'my-project')
      expect(result).toBe('my-project-4')
    })
  })

  describe('listProviders', () => {
    it('should return only active providers', async () => {
      const mockProviders = [
        { id: '1', name: 'veo', displayName: 'Google Veo 3', isActive: true, maxDuration: 30, creditCost: 2, speed: 60, quality: 85 },
        { id: '2', name: 'kling', displayName: 'Kling AI', isActive: true, maxDuration: 10, creditCost: 1, speed: 75, quality: 70 },
      ]
      mockPrisma.aIProvider.findMany.mockResolvedValue(mockProviders)

      const result = await service.listProviders()
      expect(result).toHaveLength(2)
      expect(mockPrisma.aIProvider.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      )
    })
  })

  describe('getProviderHealth', () => {
    it('should return health status for all providers', async () => {
      const mockProviders = [
        { id: '1', name: 'veo', displayName: 'Google Veo 3', isActive: true, speed: 60, quality: 85, creditCost: 2, updatedAt: new Date() },
        { id: '2', name: 'kling', displayName: 'Kling AI', isActive: false, speed: 75, quality: 70, creditCost: 1, updatedAt: new Date() },
      ]
      mockPrisma.aIProvider.findMany.mockResolvedValue(mockProviders)

      const result = await service.getProviderHealth()
      expect(result).toHaveLength(2)
      expect(result[0].status).toBe('available')
      expect(result[1].status).toBe('disabled')
    })
  })

  describe('estimateCost', () => {
    it('should calculate estimates per provider', async () => {
      mockPrisma.aIProject.findFirst.mockResolvedValue({ id: 'proj-1', deletedAt: null })
      mockPrisma.aIProject.findUnique = jest.fn().mockResolvedValue({ id: 'proj-1', scenes: [{ id: 's1' }, { id: 's2' }] })

      jest.spyOn(service, 'getProject').mockResolvedValue({
        id: 'proj-1',
        scenes: [{ id: 's1' }, { id: 's2' }],
      } as any)

      mockPrisma.aIProvider.findMany.mockResolvedValue([
        { name: 'veo', creditCost: 2 },
        { name: 'kling', creditCost: 1 },
      ])

      const result = await service.estimateCost('proj-1', 'user-1')

      expect(result.sceneCount).toBe(2)
      expect(result.estimates).toHaveLength(2)
      expect(result.estimates.find((e: any) => e.provider === 'veo').estimatedCost).toBe(4)
      expect(result.estimates.find((e: any) => e.provider === 'kling').estimatedCost).toBe(2)
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should return aggregated counts', async () => {
      mockPrisma.aIProject.count.mockResolvedValue(5)
      mockPrisma.aIScene.count.mockResolvedValue(20)
      mockPrisma.aIProject.aggregate.mockResolvedValue({ _sum: { cost: 150 } })

      const result = await service.getAnalyticsSummary('user-1')

      expect(result.totalProjects).toBe(5)
      expect(result.totalScenes).toBe(20)
      expect(result.totalCost).toBe(150)
    })
  })

  describe('deleteScene', () => {
    it('should delete scene and decrement totalScenes', async () => {
      mockPrisma.aIScene.findUnique.mockResolvedValue({ id: 's1', projectId: 'proj-1' })
      mockPrisma.aIScene.delete.mockResolvedValue({ id: 's1' })
      mockPrisma.aIProject.update.mockResolvedValue({ id: 'proj-1' })

      const result = await service.deleteScene('s1')
      expect(result.id).toBe('s1')
      expect(mockPrisma.aIProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: { totalScenes: { decrement: 1 } },
        }),
      )
    })
  })
})
