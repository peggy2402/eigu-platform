// .eigu file format type definitions

export interface EiguManifest {
  formatVersion: string
  appVersion: string
  createdAt: string
  updatedAt: string
  engine: string
  assetCount: number
  totalAssetSize: number
}

export interface SceneCostDetails {
  providerCost: number;
  modelCost: number;
  voiceCost: number;
  compositionCost: number;
  estimatedCost: number;
  actualCost: number;
}

export interface ProjectMeta {
  name: string
  description: string
  status: ProjectStatus
  language: string
  category: string
  aspectRatio: string
  resolution: { width: number; height: number }
  fps: number
  duration: number
  thumbnail: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  budgetLimit?: number
  perJobLimit?: number
  cost?: number
}

export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'rendering' | 'completed' | 'failed' | 'cancelled' | 'archived'

export interface Scene {
  id: string
  index: number
  status: SceneStatus
  prompt: string
  negativePrompt: string
  duration: number
  camera: CameraConfig
  lens: string
  lighting: string
  emotion: string
  transition: string
  characterIds: string[]
  voiceId: string | null
  subtitleTrackId: string | null
  musicTrackId: string | null
  providerId: string | null
  model: string | null
  seed: number | null
  thumbnail: string | null
  output: string | null
  error: string | null
  cost: number
  costDetails?: SceneCostDetails
  renderTime: number | null
  lockFace: boolean
  lockStyle: boolean
  lockOutfit: boolean
  lockSeed: boolean
  voiceLine: string | null
  musicMood: string | null
}

export type SceneStatus = 'draft' | 'ready' | 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled'

export interface CameraConfig {
  angle: string
  movement: string
}

export interface Storyboard {
  scenes: string[]
  transitions: StoryboardTransition[]
}

export interface StoryboardTransition {
  from: string
  to: string
  type: string
}

export interface Character {
  id: string
  name: string
  appearance: string
  clothing: string
  style: string
  personality: string
  voiceId: string | null
  referenceImages: string[]
  generationSettings: Record<string, any>
  lockedAttributes: string[]
  version: number
  age?: string
}

export interface Asset {
  id: string
  type: AssetType
  filename: string
  originalName: string
  mimeType: string
  size: number
  sha256: string
  width: number | null
  height: number | null
  embedded: boolean
  externalPath: string | null
  fallbackPaths: string[]
}

export type AssetType = 'image' | 'video' | 'audio' | 'music' | 'voice' | 'font' | 'logo' | 'intro' | 'outro' | 'cta' | 'overlay'

export interface BrandKit {
  logo: string | null
  colors: { primary: string; secondary: string }
  typography: { font: string | null }
  intro: string | null
  outro: string | null
  cta: string
  voiceId: string | null
  visualStyle: string
  watermark: boolean
  watermarkPosition: string
  snapshotVersion: number
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  brandVoice?: string
  brandStyle?: string
}

export interface Timeline {
  tracks: TimelineTrack[]
}

export interface TimelineTrack {
  id: string
  type: 'video' | 'voice' | 'music' | 'sfx' | 'subtitle' | 'overlay'
  clips: TimelineClip[]
}

export interface TimelineClip {
  sceneId: string
  assetId?: string
  start: number
  duration: number
  trim: { in: number; out: number }
  fade: { in: number; out: number }
  volume?: number
}

export interface RenderJob {
  id: string
  sceneId: string
  type: RenderJobType
  status: JobStatus
  provider: string
  model: string
  progress: number
  retryCount: number
  maxRetries: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  output: string | null
  error: string | null
  cost: number
  priority: number
}

export type RenderJobType = 'story_generation' | 'storyboard_generation' | 'scene_generation' | 'image_generation' | 'video_render' | 'voice_generation' | 'subtitle_generation' | 'composition' | 'quality_check' | 'publish'

export type JobStatus = 'created' | 'queued' | 'processing' | 'completed' | 'failed' | 'retrying' | 'cancelled'

export interface VersionEntry {
  version: number
  reason: string
  createdAt: string
  snapshotFile: string | null
}

export interface EiguProject {
  project: ProjectMeta
  scenes: Scene[]
  characters: Character[]
  assets: Asset[]
  brandKit: BrandKit | null
  storyboard: Storyboard | null
  timeline: Timeline | null
  renderQueue: { jobs: RenderJob[] }
  providers: ProviderConfig[]
  versionHistory: VersionEntry[]
  comments: Comment[]
  approvalHistory: ApprovalEntry[]
  knowledgeRefs: string[]
}

export interface ProviderConfig {
  id: string
  name: string
  displayName: string
  model: string
  capability: string[]
  available: boolean
}

export interface Comment {
  id: string
  sceneId: string | null
  author: string
  text: string
  createdAt: string
  resolved: boolean
}

export interface ApprovalEntry {
  status: string
  reviewer: string
  comment: string
  createdAt: string
}

export interface EiguFile {
  manifest: EiguManifest
  project: EiguProject
  assetBuffers: Map<string, Buffer>
  thumbnailBuffers: Map<string, Buffer>
}
