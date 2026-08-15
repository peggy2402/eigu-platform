import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankSettingsDto {
  @ApiProperty({ example: 'MBBank', description: 'Tên ngân hàng' })
  @IsString()
  @MinLength(2)
  bankName: string;

  @ApiProperty({ example: '0399999999', description: 'Số tài khoản ngân hàng' })
  @IsString()
  @MinLength(6)
  bankAccountNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Tên chủ tài khoản (Viết hoa)' })
  @IsString()
  @MinLength(2)
  bankAccountHolder: string;
}
