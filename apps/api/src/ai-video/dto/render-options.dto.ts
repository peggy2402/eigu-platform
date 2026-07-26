import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min } from 'class-validator'

export class RenderOptionsDto {
  @IsOptional()
  @IsString()
  provider?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aTestProviders?: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  costLimit?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number

  @IsOptional()
  @IsBoolean()
  publish?: boolean

  @IsOptional()
  @IsString()
  webhookUrl?: string
}
