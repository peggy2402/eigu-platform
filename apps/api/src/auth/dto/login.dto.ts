import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'macOS 15.2', required: false })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiProperty({ example: 'EIGU Desktop v1.0.0', required: false })
  @IsOptional()
  @IsString()
  device?: string;
}
