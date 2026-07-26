import { Injectable, Logger } from '@nestjs/common'

export interface DirectorAnalysis {
  contentType: string
  pacing: 'fast' | 'medium' | 'slow'
  totalDuration: number
  suggestedScenes: number
  emotionArc: { scene: number; emotion: string }[]
  cameraStyles: string[]
  lightingMood: string
}

export interface StoryStructure {
  totalDuration: number
  scenes: { index: number; duration: number; emotion: string; camera: string }[]
  transitions: string[]
  musicCues: { at: number; mood: string }[]
}

@Injectable()
export class AIDirectorService {
  private readonly logger = new Logger(AIDirectorService.name)

  async analyze(input: string, contentType?: string): Promise<DirectorAnalysis> {
    const detectedType = contentType || this.detectContentType(input)
    const rules = DirectorRules.getRules(detectedType)

    return {
      contentType: detectedType,
      pacing: rules.pacing as 'fast' | 'medium' | 'slow',
      totalDuration: (rules.sceneDuration.min + rules.sceneDuration.max) * 4,
      suggestedScenes: 4,
      emotionArc: [
        { scene: 0, emotion: rules.emotionArc[0] || 'neutral' },
        { scene: 1, emotion: rules.emotionArc[1] || 'neutral' },
        { scene: 2, emotion: rules.emotionArc[2] || 'neutral' },
        { scene: 3, emotion: rules.emotionArc[3] || 'neutral' },
      ],
      cameraStyles: rules.camera,
      lightingMood: rules.lighting[0],
    }
  }

  async planStoryStructure(analysis: DirectorAnalysis): Promise<StoryStructure> {
    const scenes = Array.from({ length: analysis.suggestedScenes }, (_, i) => ({
      index: i,
      duration: analysis.pacing === 'fast' ? 4 : analysis.pacing === 'slow' ? 10 : 6,
      emotion: analysis.emotionArc[i]?.emotion || 'neutral',
      camera: analysis.cameraStyles[i % analysis.cameraStyles.length],
    }))
    return {
      totalDuration: scenes.reduce((a, s) => a + s.duration, 0),
      scenes,
      transitions: scenes.map(() => 'cut'),
      musicCues: scenes.map((_, i) => ({ at: i * 5, mood: 'neutral' })),
    }
  }

  private detectContentType(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('review') || lower.includes('đánh giá')) return 'review'
    if (lower.includes('học') || lower.includes('education') || lower.includes('tutorial')) return 'education'
    if (lower.includes('bán') || lower.includes('mua') || lower.includes('sale') || lower.includes('commercial')) return 'commercial'
    if (lower.includes('câu chuyện') || lower.includes('story')) return 'storytelling'
    return 'tiktok'
  }
}

export class DirectorRules {
  static getRules(contentType: string) {
    const rules: Record<string, any> = {
      tiktok: { pacing: 'fast', sceneDuration: { min: 2, max: 8 }, transitions: ['cut', 'slide'], camera: ['closeup', 'medium', 'POV'], lighting: ['bright', 'neon'], emotionArc: ['hook', 'engagement', 'CTA'] },
      storytelling: { pacing: 'medium', sceneDuration: { min: 5, max: 15 }, transitions: ['fade', 'dissolve'], camera: ['wide', 'medium', 'closeup', 'aerial'], lighting: ['natural', 'golden-hour', 'dramatic'], emotionArc: ['intro', 'rising-action', 'climax', 'resolution'] },
      education: { pacing: 'slow', sceneDuration: { min: 8, max: 20 }, transitions: ['cut', 'fade'], camera: ['medium', 'closeup', 'over-shoulder'], lighting: ['studio', 'bright'], emotionArc: ['problem', 'explanation', 'solution', 'summary'] },
      review: { pacing: 'medium', sceneDuration: { min: 4, max: 12 }, transitions: ['cut', 'slide'], camera: ['closeup', 'extreme-closeup', 'medium'], lighting: ['studio', 'bright'], emotionArc: ['intro', 'pros', 'cons', 'verdict'] },
      commercial: { pacing: 'fast', sceneDuration: { min: 1, max: 5 }, transitions: ['cut', 'zoom', 'slide'], camera: ['closeup', 'extreme-closeup', 'macro'], lighting: ['studio', 'dramatic', 'neon'], emotionArc: ['problem', 'solution', 'benefit', 'CTA'] },
    }
    return rules[contentType] || rules.tiktok
  }
}
