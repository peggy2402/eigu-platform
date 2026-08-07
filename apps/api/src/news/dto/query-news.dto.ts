import { IsOptional, IsString, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import type { NewsStatus } from '@eigu-platform/shared';

export class QueryNewsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  tagId?: string;

  @IsOptional()
  @IsString()
  status?: NewsStatus | string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'oldest' | 'views' | 'likes' | 'comments';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
