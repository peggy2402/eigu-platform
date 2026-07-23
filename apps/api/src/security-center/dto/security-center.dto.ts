import { IsString, IsOptional, Matches, Length, IsInt, Min, Max } from 'class-validator';

export class UpdateObfuscationDto {
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Mã Obfuscation chỉ được chứa chữ cái, chữ số, dấu gạch ngang (-) và gạch dưới (_)',
  })
  code: string;

  @IsOptional()
  @IsString()
  module?: string = 'AUTH';

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RotateObfuscationDto {
  @IsOptional()
  @IsString()
  module?: string = 'AUTH';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  gracePeriodMinutes?: number = 10;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class GenerateRandomDto {
  @IsOptional()
  @IsInt()
  length?: number = 12;
}

export class RollbackObfuscationDto {
  @IsOptional()
  @IsString()
  module?: string = 'AUTH';

  @IsOptional()
  @IsString()
  reason?: string;
}
