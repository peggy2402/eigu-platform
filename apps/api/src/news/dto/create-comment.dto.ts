import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  userAvatar?: string;
}

export class CommentReactionDto {
  @IsString()
  @IsNotEmpty()
  type: 'like' | 'dislike';
}

export class CommentReportDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
