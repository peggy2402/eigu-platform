import { IsNumber, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayoutDto {
  @ApiProperty({ example: 200000, description: 'Số tiền rút (Tối thiểu 200.000 VNĐ)' })
  @IsNumber()
  @Min(200000, { message: 'Số tiền rút tối thiểu là 200.000 VNĐ' })
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
}
