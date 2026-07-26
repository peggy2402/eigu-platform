export interface AIProject {
  id: string
  name: string
  description?: string
  workspaceId?: string
  category?: string
  status: 'draft' | 'storyboard' | 'rendering' | 'completed' | 'archived'
  language: string
  aspectRatio: string
  resolution: string
  fps: number
  duration?: number
  thumbnail?: string
  tags: string[]
  priority: number
  cost: number
  totalScenes: number
  provider?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AIScene {
  id: string
  index: number
  prompt: string
  negativePrompt?: string
  duration: number
  transition: string
  camera?: string
  lens?: string
  lighting?: string
  emotion?: string
  voiceLine?: string
  musicMood?: string
  seed?: number
  provider?: string
  referenceImages: string[]
  referenceVideo?: string
  characterId?: string
  lockCharacter: boolean
  lockFace: boolean
  lockStyle: boolean
  lockOutfit: boolean
  lockSeed: boolean
  projectId: string
  status: 'pending' | 'queued' | 'rendering' | 'completed' | 'failed' | 'cached'
  outputUrl?: string
  renderTime?: number
  cost: number
  error?: string
}

export interface AICharacter {
  id: string
  name: string
  description?: string
  face?: string
  hair?: string
  body?: string
  outfit?: string
  age?: string
  style?: string
  personality?: string
  prompt: string
  negativePrompt?: string
  voiceId?: string
  seed?: number
  referenceImages: string[]
  isGlobal: boolean
}

export interface AIAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'music' | 'logo' | 'font' | 'intro' | 'outro' | 'cta' | 'effect' | 'animation' | 'sticker' | 'overlay'
  url: string
  thumbnail?: string
  mimeType: string
  sizeBytes: number
  duration?: number
  width?: number
  height?: number
  tags: string[]
}

export interface AIBrandKit {
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  typography?: string
  watermark?: string
  watermarkPosition: string
  introUrl?: string
  outroUrl?: string
  ctaText?: string
  brandVoice?: string
  brandStyle?: string
}

export interface AIJob {
  id: string
  type: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: number
  progress: number
  cost: number
  error?: string
  outputUrl?: string
  createdAt: string
}

export interface TimelineTrack {
  sceneId: string
  startTime: number
  endTime: number
  duration: number
  transition: { type: string; duration: number }
}

export interface Timeline {
  duration: number
  fps: number
  tracks: {
    video: TimelineTrack[]
    audio: { sceneId?: string; type: string; src: string; startTime: number; endTime: number; volume: number }[]
    subtitle: { sceneId: string; text: string; startTime: number; endTime: number }[]
  }
}

export type ViewMode = 'storyboard' | 'timeline' | 'preview'

export type InputMethod =
  | 'idea' | 'copy' | 'image' | 'multi-image' | 'character' | 'story'
  | 'script' | 'pdf' | 'website' | 'blog' | 'news' | 'markdown'
  | 'json' | 'audio' | 'voice' | 'product' | 'template'
