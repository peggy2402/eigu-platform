import { IsNumber, IsString, Min, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayoutDto {
  @ApiProperty({ example: 70000, description: 'Số tiền rút' })
  @IsNumber()
  @Min(1000, { message: 'Số tiền rút không hợp lệ (tối thiểu 1.000 VNĐ)' })
  amount: number;

  @ApiProperty({ example: 'MBBank' })
  @IsString()
  @MinLength(2)
  bankName: string;

  @ApiProperty({ example: '0399999999' })
  @IsString()
  @MinLength(6)
  accountNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A' })
  @IsString()
  @MinLength(2)
  accountHolder: string;

  @ApiProperty({ example: true, required: false, description: 'Lưu thông tin ngân hàng này làm mặc định cho các lần sau' })
  @IsOptional()
  @IsBoolean()
  saveAsDefault?: boolean;
}

