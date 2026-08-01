import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateThemeEventDto {
  @IsOptional()
  @IsString()
  season?: string; // 'autumn', 'spring', 'summer', 'winter', 'default'

  @IsOptional()
  @IsString()
  seasonTitle?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  badgeText?: string;

  @IsOptional()
  @IsBoolean()
  isEventActive?: boolean;

  @IsOptional()
  @IsString()
  eventTitle?: string;

  @IsOptional()
  @IsString()
  eventSubtitle?: string;

  @IsOptional()
  @IsString()
  eventBannerUrl?: string;

  @IsOptional()
  @IsString()
  eventButtonText?: string;

  @IsOptional()
  @IsString()
  eventButtonLink?: string;

  @IsOptional()
  @IsString()
  eventNotice?: string;

  @IsOptional()
  @IsString()
  bgStyle?: string; // 'particles', 'tech-grid', 'aurora-glow', 'custom-image'

  @IsOptional()
  @IsString()
  bgImageUrl?: string;
}
