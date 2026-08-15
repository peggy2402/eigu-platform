import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAffiliateConfigDto {
  @ApiPropertyOptional({ example: 15, description: '% Tỷ lệ hoa hồng tiếp thị liên kết (1 - 90)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  commissionRate?: number;

  @ApiPropertyOptional({ example: 200000, description: 'Hạn mức rút tiền hoa hồng tối thiểu (VNĐ)' })
  @IsOptional()
  @IsNumber()
  @Min(50000)
  minPayoutThreshold?: number;
}
