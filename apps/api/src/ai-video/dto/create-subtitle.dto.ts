import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator'

export class CreateSubtitleDto {
  @IsString()
  text: string

  @IsOptional() @IsString()
  language?: string

  @IsNumber() @Min(0)
  startTime: number

  @IsNumber() @Min(0)
  endTime: number

  @IsOptional() @IsString()
  animation?: string

  @IsOptional() @IsString()
  style?: string

  @IsOptional() @IsBoolean()
  emoji?: boolean
}

export class UpdateSubtitleDto {
  @IsOptional() @IsString()
  text?: string

  @IsOptional() @IsString()
  language?: string

  @IsOptional() @IsNumber() @Min(0)
  startTime?: number

  @IsOptional() @IsNumber() @Min(0)
  endTime?: number

  @IsOptional() @IsString()
  animation?: string

  @IsOptional() @IsString()
  style?: string

  @IsOptional() @IsBoolean()
  emoji?: boolean
}
