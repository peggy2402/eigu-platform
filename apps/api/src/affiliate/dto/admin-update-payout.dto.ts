import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PayoutStatusAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class AdminUpdatePayoutDto {
  @ApiProperty({ enum: PayoutStatusAction, example: PayoutStatusAction.APPROVED })
  @IsEnum(PayoutStatusAction)
  status: PayoutStatusAction;

  @ApiProperty({ example: 'Đã chuyển khoản qua VietQR MBBank', required: false })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
