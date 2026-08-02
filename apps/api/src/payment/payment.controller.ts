import { Controller, Get, Post, Body, Param, UseGuards, Req, Headers, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  amount: number;
}

export class SepayWebhookDto {
  @IsOptional()
  id?: number | string;

  @IsOptional()
  gateway?: string;

  @IsOptional()
  transactionDate?: string;

  @IsOptional()
  accountNumber?: string;

  @IsOptional()
  subAccount?: string;

  @IsOptional()
  code?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  transferType?: string;

  @IsOptional()
  transferAmount?: number;

  @IsOptional()
  accumulated?: number;

  @IsOptional()
  accumulative?: number;

  @IsOptional()
  referenceCode?: string;

  @IsOptional()
  description?: string;
}

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-deposit')
  @ApiOperation({ summary: 'Tạo đơn nạp tiền PENDING & sinh mã VietQR SePay' })
  async createDeposit(@Req() req: any, @Body() dto: CreateDepositDto) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.paymentService.createDeposit(userId, Number(dto.amount));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-transactions')
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch nạp tiền của tôi' })
  async getMyTransactions(@Req() req: any) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.paymentService.getUserTransactions(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status/:code')
  @ApiOperation({ summary: 'Kiểm tra trạng thái đơn nạp tiền theo mã code' })
  async getTransactionStatus(@Req() req: any, @Param('code') code: string) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.paymentService.getTransactionStatus(userId, code);
  }

  @Post('sepay-webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  @ApiOperation({ summary: 'Endpoint công khai tiếp nhận Webhook thanh toán tự động từ SePay' })
  async handleSepayWebhook(
    @Body() payload: SepayWebhookDto,
    @Headers('authorization') authHeader?: string,
    @Headers('sepay-secret') sepaySecretHeader?: string,
  ) {
    const token = authHeader || sepaySecretHeader;
    return this.paymentService.handleSepayWebhook(payload as any, token);
  }
}
