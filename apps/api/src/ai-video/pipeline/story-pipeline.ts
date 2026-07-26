import { Injectable, Logger } from '@nestjs/common'

export interface StoryInput {
  type: 'idea' | 'copy' | 'script' | 'story' | 'image' | 'multi-image' | 'character'
    | 'pdf' | 'website' | 'blog' | 'news' | 'markdown' | 'json' | 'audio' | 'voice'
    | 'product' | 'template'
  text?: string
  url?: string
  filePath?: string
  imageUrls?: string[]
  characterId?: string
  templateId?: string
  productData?: any
  jsonData?: any
}

export interface StoryboardResult {
  scenes: { prompt: string; duration: number; transition: string; camera?: string }[]
  suggestions: { character?: string; voice?: string; music?: string }
}

@Injectable()
export class StoryPipeline {
  private readonly logger = new Logger(StoryPipeline.name)

  async generate(input: StoryInput): Promise<StoryboardResult> {
    this.logger.log(`Storyboard generation requested — type=${input.type}`)
    throw new Error('AI storyboard generation is not yet available. Please add scenes manually.')
  }
}
