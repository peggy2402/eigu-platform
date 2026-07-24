import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'usr_123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({ example: 'john_doe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'user', required: false })
  @IsOptional()
  @IsString()
  userRole?: string;

  @ApiProperty({ example: 'CUT_VIDEO' })
  @IsString()
  action: string;

  @ApiProperty({ example: 'cut' })
  @IsString()
  module: string;

  @ApiProperty({ example: '127.0.0.1', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ example: 'Desktop macOS 15.2', required: false })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({ example: '{"filename":"video.mp4"}', required: false })
  @IsOptional()
  @IsString()
  payload?: string;
}
