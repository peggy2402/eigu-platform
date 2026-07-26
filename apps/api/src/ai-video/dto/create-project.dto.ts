import { IsString, IsOptional, IsArray, IsNumber, IsEnum, Min } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  workspaceId?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsString()
  aspectRatio?: string

  @IsOptional()
  @IsString()
  resolution?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  fps?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number
}
