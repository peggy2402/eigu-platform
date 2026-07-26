import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator'

export class CreateCharacterDto {
  @IsOptional()
  @IsString()
  projectId?: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  face?: string

  @IsOptional()
  @IsString()
  hair?: string

  @IsOptional()
  @IsString()
  body?: string

  @IsOptional()
  @IsString()
  outfit?: string

  @IsOptional()
  @IsString()
  age?: string

  @IsOptional()
  @IsString()
  style?: string

  @IsOptional()
  @IsString()
  personality?: string

  @IsOptional()
  @IsString()
  prompt?: string

  @IsOptional()
  @IsString()
  negativePrompt?: string

  @IsOptional()
  @IsString()
  voiceId?: string

  @IsOptional()
  @IsString()
  voiceProvider?: string

  @IsOptional()
  @IsNumber()
  seed?: number

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImages?: string[]
}
