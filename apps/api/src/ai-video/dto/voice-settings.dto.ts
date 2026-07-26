import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class VoiceSettingsDto {
  @IsOptional() @IsString()
  voiceId?: string

  @IsOptional() @IsString()
  voiceProvider?: string

  @IsOptional() @IsNumber() @Min(0.5) @Max(2.0)
  speed?: number

  @IsOptional() @IsNumber() @Min(0.5) @Max(2.0)
  pitch?: number

  @IsOptional() @IsString()
  emotion?: string

  @IsOptional() @IsString()
  language?: string

  @IsOptional() @IsString()
  accent?: string
}
