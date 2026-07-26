import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator'

export class CreateSceneDto {
  @IsNumber()
  @Min(0)
  index: number

  @IsString()
  prompt: string

  @IsOptional()
  @IsString()
  negativePrompt?: string

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  duration?: number

  @IsOptional()
  @IsString()
  transition?: string

  @IsOptional()
  @IsString()
  camera?: string

  @IsOptional()
  @IsString()
  lens?: string

  @IsOptional()
  @IsString()
  lighting?: string

  @IsOptional()
  @IsString()
  emotion?: string

  @IsOptional()
  @IsString()
  voiceLine?: string

  @IsOptional()
  @IsString()
  characterId?: string

  @IsOptional()
  @IsNumber()
  seed?: number

  @IsOptional()
  @IsBoolean()
  lockCharacter?: boolean

  @IsOptional()
  @IsBoolean()
  lockFace?: boolean

  @IsOptional()
  @IsBoolean()
  lockStyle?: boolean

  @IsOptional()
  @IsBoolean()
  lockOutfit?: boolean

  @IsOptional()
  @IsBoolean()
  lockSeed?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImages?: string[]
}
