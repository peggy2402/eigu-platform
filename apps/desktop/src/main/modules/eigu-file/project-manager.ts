import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { app, dialog, BrowserWindow } from 'electron'
import { EiguReader } from './eigu-reader'
import { EiguWriter } from './eigu-writer'
import {
  EiguProject, EiguFile, ProjectMeta, Scene, Character,
  Asset, BrandKit, RenderJob, ProjectStatus, SceneStatus, JobStatus,
} from './eigu-types'
import { MainLogger } from '../../utils/logger.utils'

export interface ProjectSummary {
  filePath: string
  name: string
  status: ProjectStatus
  updatedAt: string
  sceneCount: number
  duration: number
  isMissing?: boolean
}

const RECENT_PROJECTS_KEY = 'recentProjects'

export class ProjectManager {
  private reader = new EiguReader()
  private writer = new EiguWriter()
  private currentFile: EiguFile | null = null
  private currentFilePath: string | null = null

  private configPath: string

  constructor() {
    const userData = (app && typeof app.getPath === 'function') ? app.getPath('userData') : process.cwd()
    this.configPath = path.join(userData, 'config.json')
  }

  // === File Operations ===

  async createNew(name: string, saveDir: string, aspectRatio = '16:9', reqId = 'req_' + Math.random().toString(36).substring(2, 9)): Promise<string> {
    console.log(`[EIGU:E2E][${reqId}][MANAGER] CREATE_NEW_START`, { name, saveDir, aspectRatio })
    const sanitizedName = name.replace(/[<>:"/\\|?*]/g, '_')
    let resolvedDir = saveDir ? saveDir.trim() : ''
    const fallbackDownloads = (app && typeof app.getPath === 'function') ? app.getPath('downloads') : path.join(process.env.HOME || process.env.USERPROFILE || process.cwd(), 'Downloads')
    if (!resolvedDir || resolvedDir === 'Downloads' || !path.isAbsolute(resolvedDir)) {
      resolvedDir = fallbackDownloads
    }
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true })
    }

    try {
      fs.accessSync(resolvedDir, fs.constants.W_OK)
      console.log(`[EIGU:E2E][${reqId}][FS] DIRECTORY_EXISTS=true DIRECTORY_WRITABLE=true`)
    } catch (e: any) {
      console.error(`[EIGU:E2E][${reqId}][FS] DIRECTORY_CHECK_FAILED:`, e.message)
      throw new Error(`Thư mục lưu không có quyền ghi: ${resolvedDir}`)
    }

    let filePath = path.join(resolvedDir, `${sanitizedName}.eigu`)
    console.log(`[EIGU:E2E][${reqId}][MANAGER] OUTPUT_PATH_RESOLVED:`, filePath)

    // Handle duplicate filename
    if (fs.existsSync(filePath)) {
      let counter = 1
      while (fs.existsSync(path.join(resolvedDir, `${sanitizedName}-${counter}.eigu`))) {
        counter++
      }
      filePath = path.join(resolvedDir, `${sanitizedName}-${counter}.eigu`)
    }

    const now = new Date().toISOString()
    const res = aspectRatio.split(':').map(Number)
    const [aw, ah] = res.length === 2 ? res : [16, 9]
    const baseWidth = 1920
    const baseHeight = Math.round(baseWidth * ah / aw)

    const project: EiguProject = {
      project: {
        name: sanitizedName,
        description: '',
        status: 'draft',
        language: 'vi',
        category: 'general',
        aspectRatio,
        resolution: { width: baseWidth, height: baseHeight },
        fps: 30,
        duration: 0,
        thumbnail: null,
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
      scenes: [],
      characters: [],
      assets: [],
      brandKit: null,
      storyboard: null,
      timeline: null,
      renderQueue: { jobs: [] },
      providers: [],
      versionHistory: [{ version: 1, reason: 'Initial creation', createdAt: now, snapshotFile: null }],
      comments: [],
      approvalHistory: [],
      knowledgeRefs: [],
    }

    await this.writer.writeProject({ outputPath: filePath, project })
    this.currentFile = { manifest: null as any, project, assetBuffers: new Map(), thumbnailBuffers: new Map() }
    this.currentFilePath = filePath
    this.addRecentProject(filePath)
    return filePath
  }

  async createNewInMemory(name: string, aspectRatio = '16:9'): Promise<null> {
    const sanitizedName = name.replace(/[<>:"/\\|?*]/g, '_')
    const now = new Date().toISOString()
    const res = aspectRatio.split(':').map(Number)
    const [aw, ah] = res.length === 2 ? res : [16, 9]
    const baseWidth = 1920
    const baseHeight = Math.round(baseWidth * ah / aw)

    const project: EiguProject = {
      project: {
        name: sanitizedName,
        description: '',
        status: 'draft',
        language: 'vi',
        category: 'general',
        aspectRatio,
        resolution: { width: baseWidth, height: baseHeight },
        fps: 30,
        duration: 0,
        thumbnail: null,
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
      scenes: [],
      characters: [],
      assets: [],
      brandKit: null,
      storyboard: null,
      timeline: null,
      renderQueue: { jobs: [] },
      providers: [],
      versionHistory: [{ version: 1, reason: 'Initial creation', createdAt: now, snapshotFile: null }],
      comments: [],
      approvalHistory: [],
      knowledgeRefs: [],
    }

    this.currentFile = { manifest: null as any, project, assetBuffers: new Map(), thumbnailBuffers: new Map() }
    this.currentFilePath = null
    return null
  }

  async openFile(filePath: string): Promise<EiguFile> {
    const eigu = await this.reader.readFile(filePath)
    this.currentFile = eigu
    this.currentFilePath = filePath
    this.addRecentProject(filePath)
    return eigu
  }

  async save(payload?: any): Promise<string> {
    if (!this.currentFilePath) {
      throw new Error('No project path set. Use saveAs.')
    }
    this._syncPayload(payload)
    if (!this.currentFile) {
      throw new Error('No project data to save.')
    }
    const result = await this.writer.updateProjectSave(this.currentFilePath, this.currentFile.project)
    this.currentFile.project.project.updatedAt = new Date().toISOString()
    return result
  }

  async saveAs(newPath: string, payload?: any): Promise<string> {
    this._syncPayload(payload)
    if (!this.currentFile) throw new Error('No project data to save.')
    this.currentFile.project.project.updatedAt = new Date().toISOString()
    await this.writer.writeProject({ outputPath: newPath, project: this.currentFile.project })
    this.currentFilePath = newPath
    this.addRecentProject(newPath)
    return newPath
  }

  private _syncPayload(payload?: any) {
    if (!payload || !payload.project) return
    const now = new Date().toISOString()
    if (!this.currentFile) {
      this.currentFile = {
        manifest: {
          formatVersion: '1.0.0',
          appVersion: '1.0.0',
          createdAt: now,
          updatedAt: now,
          engine: 'eigu-desktop',
          assetCount: (payload.assets || []).length,
          totalAssetSize: 0,
        },
        project: {
          project: {
            name: payload.project.name || 'Untitled Project',
            description: payload.project.description || '',
            status: payload.project.status || 'draft',
            language: 'vi',
            category: 'ai-video',
            aspectRatio: payload.project.aspectRatio || '9:16',
            resolution: payload.project.resolution || { width: 1080, height: 1920 },
            fps: payload.project.fps || 30,
            duration: payload.project.duration || 0,
            thumbnail: null,
            tags: [],
            createdAt: payload.project.createdAt || now,
            updatedAt: now,
          },
          scenes: payload.scenes || [],
          storyboard: { scenes: (payload.scenes || []).map((s: any) => s.id), transitions: [] },
          characters: payload.characters || [],
          assets: payload.assets || [],
          brandKit: payload.brandKit || null,
          timeline: null,
          renderQueue: { jobs: [] },
          providers: [],
          versionHistory: [],
          comments: [],
          approvalHistory: [],
          knowledgeRefs: []
        },
        assetBuffers: new Map(),
        thumbnailBuffers: new Map()
      }
    } else {
      this.currentFile.project.project = { ...this.currentFile.project.project, ...payload.project, updatedAt: now }
      if (payload.scenes) this.currentFile.project.scenes = payload.scenes
      if (payload.characters) this.currentFile.project.characters = payload.characters
      if (payload.assets) this.currentFile.project.assets = payload.assets
      if (payload.brandKit) this.currentFile.project.brandKit = payload.brandKit
    }
  }

  close(): void {
    this.currentFile = null
    this.currentFilePath = null
  }

  getCurrent(): { filePath: string | null; eigu: EiguFile | null } {
    return { filePath: this.currentFilePath, eigu: this.currentFile }
  }

  isOpen(): boolean {
    return this.currentFile !== null
  }

  // === Recent Projects Watcher ===
  private fileWatchers: Map<string, fs.FSWatcher> = new Map()
  private pollTimer: NodeJS.Timeout | null = null

  private syncWatchers(paths: string[]): void {
    MainLogger.info(`[File Watcher] syncWatchers đang theo dõi danh sách tệp (${paths.length}): [${paths.join(', ')}]`, {
      correlationId: 'FILE_WATCHER_SYNC'
    })

    // Unwatch paths no longer in list
    for (const [watchedPath, watcher] of Array.from(this.fileWatchers.entries())) {
      if (!paths.includes(watchedPath)) {
        try { watcher.close() } catch (e) {}
        this.fileWatchers.delete(watchedPath)
      }
    }

    // Watch new valid paths
    for (const p of paths) {
      if (this.fileWatchers.has(p)) continue
      if (!fs.existsSync(p)) continue
      try {
        const watcher = fs.watch(p, (eventType) => {
          MainLogger.info(`[File Watcher] Sự kiện fs.watch phát hiện eventType="${eventType}" cho tệp: ${p}`, {
            correlationId: 'FILE_WATCHER_EVENT',
            projectPath: p
          })
          if (!fs.existsSync(p)) {
            this.handleFileMissingDetected(p)
          }
        })
        this.fileWatchers.set(p, watcher)
      } catch (err) {
        MainLogger.error(`[File Watcher] Lỗi khởi tạo fs.watch cho tệp: ${p}`, err, {
          correlationId: 'FILE_WATCHER_ERROR',
          projectPath: p
        })
      }
    }

    this.startPollingWatcher()
  }

  private startPollingWatcher(): void {
    if (this.pollTimer) return
    this.pollTimer = setInterval(() => {
      for (const [watchedPath] of Array.from(this.fileWatchers.entries())) {
        if (!fs.existsSync(watchedPath)) {
          MainLogger.info(`[File Watcher] Polling 1s phát hiện tệp bị xóa trên đĩa: ${watchedPath}`, {
            correlationId: 'FILE_WATCHER_POLL_MISSING',
            projectPath: watchedPath
          })
          this.handleFileMissingDetected(watchedPath)
        }
      }
    }, 1000)
  }

  private handleFileMissingDetected(filePath: string): void {
    const watcher = this.fileWatchers.get(filePath)
    if (watcher) {
      try { watcher.close() } catch (e) {}
      this.fileWatchers.delete(filePath)
    }

    const isCurrentActive = this.currentFilePath === filePath || 
      (this.currentFilePath && path.resolve(this.currentFilePath) === path.resolve(filePath))

    if (isCurrentActive) {
      const activeName = this.currentFile?.project?.project?.name || path.basename(filePath, '.eigu')
      this.close()

      MainLogger.warn(`[File Watcher] Dự án ĐANG MỞ bị xóa ngoài đĩa! Đóng phiên làm việc: ${filePath}`, {
        correlationId: 'ACTIVE_PROJECT_DELETED',
        projectPath: filePath
      })

      if (typeof BrowserWindow !== 'undefined' && BrowserWindow && typeof BrowserWindow.getAllWindows === 'function') {
        BrowserWindow.getAllWindows().forEach(w => {
          if (!w.isDestroyed()) {
            w.webContents.send('active-project:file-deleted', { filePath, name: activeName })
          }
        })
      }
    }

    MainLogger.info(`[File Watcher] Gửi sự kiện IPC recent-project:file-missing tới Renderer cho tệp: ${filePath}`, {
      correlationId: 'FILE_WATCHER_EMIT',
      projectPath: filePath
    })

    if (typeof BrowserWindow !== 'undefined' && BrowserWindow && typeof BrowserWindow.getAllWindows === 'function') {
      BrowserWindow.getAllWindows().forEach(w => {
        if (!w.isDestroyed()) {
          w.webContents.send('recent-project:file-missing', { filePath, isMissing: true })
        }
      })
    }
  }

  public closeAllWatchers(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
    for (const watcher of this.fileWatchers.values()) {
      try { watcher.close() } catch (e) {}
    }
    this.fileWatchers.clear()
  }

  async getRecentProjects(): Promise<ProjectSummary[]> {
    const paths = this.readConfig(this.getRecentKey(), []) as string[]
    this.syncWatchers(paths)
    const projects: ProjectSummary[] = []
    for (const p of paths) {
      if (!fs.existsSync(p)) {
        const baseName = path.basename(p, '.eigu')
        projects.push({
          filePath: p,
          name: baseName,
          status: 'draft',
          updatedAt: new Date().toISOString(),
          sceneCount: 0,
          duration: 0,
          isMissing: true
        })
        continue
      }
      try {
        const manifest = await this.reader.readManifest(p)
        const eigu = await this.reader.readProjectJson(p)
        projects.push({
          filePath: p,
          name: eigu.project.name,
          status: eigu.project.status,
          updatedAt: manifest.updatedAt,
          sceneCount: eigu.scenes.length,
          duration: eigu.project.duration,
          isMissing: false
        })
      } catch {
        const baseName = path.basename(p, '.eigu')
        projects.push({
          filePath: p,
          name: baseName,
          status: 'draft',
          updatedAt: new Date().toISOString(),
          sceneCount: 0,
          duration: 0,
          isMissing: true
        })
      }
    }
    return projects
  }

  private activeUserId = 'default_user'

  public setActiveUser(userId: string): void {
    this.activeUserId = userId || 'default_user'
  }

  private getRecentKey(): string {
    return `recentProjects_${this.activeUserId}`
  }

  public removeRecentProject(filePath: string): void {
    const watcher = this.fileWatchers.get(filePath)
    if (watcher) {
      try { watcher.close() } catch (e) {}
      this.fileWatchers.delete(filePath)
    }
    let recent = this.readConfig(this.getRecentKey(), []) as string[]
    recent = recent.filter(p => p !== filePath)
    this.writeConfig(this.getRecentKey(), recent)
  }

  private addRecentProject(filePath: string): void {
    let recent = this.readConfig(this.getRecentKey(), []) as string[]
    recent = recent.filter(p => p !== filePath)
    recent.unshift(filePath)
    if (recent.length > 20) recent = recent.slice(0, 20)
    this.writeConfig(this.getRecentKey(), recent)
    this.syncWatchers(recent)

    if (typeof BrowserWindow !== 'undefined' && BrowserWindow && typeof BrowserWindow.getAllWindows === 'function') {
      BrowserWindow.getAllWindows().forEach(w => {
        if (!w.isDestroyed()) {
          w.webContents.send('recent-project:updated')
        }
      })
    }
  }

  // === Scene Operations ===

  addScene(patch?: Partial<Scene>): Scene {
    if (!this.currentFile) throw new Error('No project open')
    const project = this.currentFile.project
    const scene: Scene = {
      id: `scene_${crypto.randomUUID().slice(0, 8)}`,
      index: project.scenes.length,
      status: 'draft',
      prompt: patch?.prompt || 'New scene',
      negativePrompt: patch?.negativePrompt || '',
      duration: patch?.duration || 5,
      camera: patch?.camera || { angle: 'medium', movement: 'static' },
      lens: patch?.lens || '50mm',
      lighting: patch?.lighting || 'natural',
      emotion: patch?.emotion || 'neutral',
      transition: patch?.transition || 'cut',
      characterIds: patch?.characterIds || [],
      voiceId: patch?.voiceId || null,
      subtitleTrackId: patch?.subtitleTrackId || null,
      musicTrackId: patch?.musicTrackId || null,
      providerId: patch?.providerId || null,
      model: patch?.model || null,
      seed: patch?.seed || null,
      thumbnail: patch?.thumbnail || null,
      output: patch?.output || null,
      error: patch?.error || null,
      cost: patch?.cost || 0,
      renderTime: patch?.renderTime || null,
      lockFace: patch?.lockFace || false,
      lockStyle: patch?.lockStyle || false,
      lockOutfit: patch?.lockOutfit || false,
      lockSeed: patch?.lockSeed || false,
      voiceLine: patch?.voiceLine || null,
      musicMood: patch?.musicMood || null,
    }
    project.scenes.push(scene)
    return scene
  }

  updateScene(sceneId: string, patch: Partial<Scene>): Scene | null {
    if (!this.currentFile) return null
    const idx = this.currentFile.project.scenes.findIndex(s => s.id === sceneId)
    if (idx === -1) return null
    this.currentFile.project.scenes[idx] = { ...this.currentFile.project.scenes[idx], ...patch }
    return this.currentFile.project.scenes[idx]
  }

  removeScene(sceneId: string): boolean {
    if (!this.currentFile) return false
    const len = this.currentFile.project.scenes.length
    this.currentFile.project.scenes = this.currentFile.project.scenes.filter(s => s.id !== sceneId)
    return this.currentFile.project.scenes.length < len
  }

  reorderScenes(fromIndex: number, toIndex: number): void {
    if (!this.currentFile) return
    const scenes = [...this.currentFile.project.scenes]
    const [moved] = scenes.splice(fromIndex, 1)
    scenes.splice(toIndex, 0, moved)
    this.currentFile.project.scenes = scenes.map((s, i) => ({ ...s, index: i }))
  }

  // === Character Operations ===

  addCharacter(character: Character): Character {
    if (!this.currentFile) throw new Error('No project open')
    this.currentFile.project.characters.push(character)
    return character
  }

  updateCharacter(charId: string, patch: Partial<Character>): Character | null {
    if (!this.currentFile) return null
    const idx = this.currentFile.project.characters.findIndex(c => c.id === charId)
    if (idx === -1) return null
    this.currentFile.project.characters[idx] = { ...this.currentFile.project.characters[idx], ...patch }
    return this.currentFile.project.characters[idx]
  }

  removeCharacter(charId: string): boolean {
    if (!this.currentFile) return false
    const len = this.currentFile.project.characters.length
    this.currentFile.project.characters = this.currentFile.project.characters.filter(c => c.id !== charId)
    return this.currentFile.project.characters.length < len
  }

  // === Asset Operations ===

  async importAsset(sourcePath: string): Promise<{ asset: Asset; buffer: Buffer }> {
    const result = await this.writer.importAsset(sourcePath)
    const asset = result.asset as Asset
    if (!this.currentFile) throw new Error('No project open')
    this.currentFile.project.assets.push(asset)
    if (result.embedded) {
      this.currentFile.assetBuffers.set(asset.filename.replace('assets/', ''), result.buffer)
    }
    return { asset, buffer: result.buffer }
  }

  removeAsset(assetId: string): boolean {
    if (!this.currentFile) return false
    const asset = this.currentFile.project.assets.find(a => a.id === assetId)
    if (!asset) return false
    this.currentFile.project.assets = this.currentFile.project.assets.filter(a => a.id !== assetId)
    if (asset.embedded) {
      this.currentFile.assetBuffers.delete(asset.filename.replace('assets/', ''))
    }
    return true
  }

  getMissingExternalAssets(): Asset[] {
    if (!this.currentFile) return []
    return this.currentFile.project.assets.filter(a => {
      if (a.embedded) return false
      return !this.reader.locateExternalAsset(a)
    })
  }

  locateMissingAsset(assetId: string, newPath: string): boolean {
    if (!this.currentFile) return false
    const asset = this.currentFile.project.assets.find(a => a.id === assetId)
    if (!asset) return false
    asset.externalPath = newPath
    return true
  }

  // === Render Queue ===

  enqueueRender(sceneId: string, provider: string, model: string): RenderJob {
    if (!this.currentFile) throw new Error('No project open')
    const job: RenderJob = {
      id: `job_${crypto.randomUUID().slice(0, 8)}`,
      sceneId,
      type: 'video_render',
      status: 'queued',
      provider,
      model,
      progress: 0,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      output: null,
      error: null,
      cost: 0,
      priority: 0,
    }
    this.currentFile.project.renderQueue.jobs.push(job)
    this.updateScene(sceneId, { status: 'queued' })
    return job
  }

  updateJob(jobId: string, patch: Partial<RenderJob>): RenderJob | null {
    if (!this.currentFile) return null
    const idx = this.currentFile.project.renderQueue.jobs.findIndex(j => j.id === jobId)
    if (idx === -1) return null
    this.currentFile.project.renderQueue.jobs[idx] = { ...this.currentFile.project.renderQueue.jobs[idx], ...patch }
    return this.currentFile.project.renderQueue.jobs[idx]
  }

  cancelJob(jobId: string): boolean {
    const job = this.updateJob(jobId, { status: 'cancelled' })
    if (job) {
      this.updateScene(job.sceneId, { status: 'draft' })
      return true
    }
    return false
  }

  retryJob(jobId: string): boolean {
    const job = this.updateJob(jobId, { status: 'queued', retryCount: 0, error: null })
    if (job) {
      this.updateScene(job.sceneId, { status: 'queued', error: null })
      return true
    }
    return false
  }

  getQueueStats(): { pending: number; active: number; completed: number; failed: number; cancelled: number; total: number } {
    if (!this.currentFile) return { pending: 0, active: 0, completed: 0, failed: 0, cancelled: 0, total: 0 }
    const jobs = this.currentFile.project.renderQueue.jobs
    return {
      pending: jobs.filter(j => j.status === 'queued').length,
      active: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length,
      total: jobs.length,
    }
  }

  // === Brand Kit ===

  updateBrandKit(patch: Partial<BrandKit>): BrandKit | null {
    if (!this.currentFile) return null
    if (!this.currentFile.project.brandKit) {
      this.currentFile.project.brandKit = {
        logo: null, colors: { primary: '#6366f1', secondary: '#22c55e' },
        typography: { font: null }, intro: null, outro: null,
        cta: '', voiceId: null, visualStyle: 'modern',
        watermark: false, watermarkPosition: 'bottom-right',
        snapshotVersion: 1, ...patch,
      }
    } else {
      this.currentFile.project.brandKit = { ...this.currentFile.project.brandKit, ...patch }
    }
    return this.currentFile.project.brandKit
  }

  // === Config ===

  private readConfig(key: string, defaultValue: any): any {
    try {
      if (!fs.existsSync(this.configPath)) return defaultValue
      const data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
      return data[key] !== undefined ? data[key] : defaultValue
    } catch {
      return defaultValue
    }
  }

  private writeConfig(key: string, value: any): void {
    try {
      let data: Record<string, any> = {}
      if (fs.existsSync(this.configPath)) {
        data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
      }
      data[key] = value
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) {
      console.error('[ProjectManager] Error writing config:', e)
    }
  }
}
