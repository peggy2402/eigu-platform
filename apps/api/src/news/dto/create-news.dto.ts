import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEnum, IsUrl } from 'class-validator';
import type { NewsStatus } from '@eigu-platform/shared';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail phải là URL hợp lệ (http:// hoặc https://)' })
  thumbnail?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(['draft', 'published', 'archived'], { message: 'Trạng thái phải là draft, published hoặc archived' })
  @IsOptional()
  status?: NewsStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  seoKeywords?: string;
}
