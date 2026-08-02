import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SepayWebhookDto } from '@eigu-platform/shared';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Tạo giao dịch nạp tiền PENDING và trả về thông tin VietQR SePay
   */
  async createDeposit(userId: string, amount: number) {
    if (!amount || amount < 10000) {
      throw new BadRequestException('Số tiền nạp tối thiểu là 10.000 VNĐ');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, username: true },
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin tài khoản người dùng');
      }

      // Sinh mã đơn nạp ngẫu nhiên 5-6 số (VD: 88921)
      let code = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        code = Math.floor(10000 + Math.random() * 900000).toString();
        const existing = await this.prisma.depositTransaction.findUnique({
          where: { code },
        });
        if (!existing) isUnique = true;
        attempts++;
      }

      const displayUsername = user.username || user.email.split('@')[0];
      // Định dạng cú pháp chuyển khoản: EIGU {{username}} {{code}} (Ví dụ: EIGU peggy 88921)
      const fullContent = `EIGU ${displayUsername} ${code}`.trim();

      const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
      const accountNumber = process.env.SEPAY_ACCOUNT_NO || '0399999999';
      const accountHolder = process.env.SEPAY_ACCOUNT_HOLDER || 'EIGU PLATFORM';

      const transaction = await this.prisma.depositTransaction.create({
        data: {
          code,
          fullContent,
          userId: user.id,
          amount,
          status: 'PENDING',
          paymentMethod: 'sepay_bank',
          bankName,
          accountNumber,
        },
      });

      // Tạo link QR Code VietQR SePay điền sẵn thông tin
      const qrCodeUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankName)}&acc=${encodeURIComponent(accountNumber)}&template=compact&amount=${amount}&des=${encodeURIComponent(fullContent)}`;

      this.logger.log(`[Payment] Đã tạo đơn nạp PENDING #${code} (${amount}đ) cho User ${user.email}`);

      return {
        id: transaction.id,
        code: transaction.code,
        fullContent: transaction.fullContent,
        amount: Number(transaction.amount),
        status: transaction.status,
        bankName,
        accountNumber,
        accountHolder,
        qrCodeUrl,
        createdAt: transaction.createdAt.toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`[Payment] Lỗi tạo đơn nạp tiền cho user ${userId}:`, error?.stack || error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể tạo mã nạp tiền vào lúc này. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy lịch sử giao dịch nạp tiền của User
   */
  async getUserTransactions(userId: string) {
    try {
      const transactions = await this.prisma.depositTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
      const accountNumber = process.env.SEPAY_ACCOUNT_NO || '0399999999';

      return transactions.map(t => ({
        id: t.id,
        code: t.code,
        fullContent: t.fullContent,
        userId: t.userId,
        amount: Number(t.amount),
        status: t.status,
        paymentMethod: t.paymentMethod,
        sepayTransId: t.sepayTransId,
        bankName: t.bankName || bankName,
        accountNumber: t.accountNumber || accountNumber,
        content: t.content,
        qrCodeUrl: `https://qr.sepay.vn/img?bank=${encodeURIComponent(t.bankName || bankName)}&acc=${encodeURIComponent(t.accountNumber || accountNumber)}&template=compact&amount=${Number(t.amount)}&des=${encodeURIComponent(t.fullContent)}`,
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      }));
    } catch (error: any) {
      this.logger.error(`[Payment] Lỗi nạp lịch sử giao dịch user ${userId}:`, error?.stack || error);
      return [];
    }
  }

  /**
   * Kiểm tra trạng thái giao dịch theo mã code
   */
  async getTransactionStatus(userId: string, code: string) {
    try {
      const transaction = await this.prisma.depositTransaction.findFirst({
        where: { code, userId },
      });

      if (!transaction) {
        throw new NotFoundException('Không tìm thấy đơn nạp tiền');
      }

      return {
        code: transaction.code,
        status: transaction.status,
        amount: Number(transaction.amount),
        completedAt: transaction.completedAt ? transaction.completedAt.toISOString() : null,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`[Payment] Lỗi lấy trạng thái đơn #${code}:`, error?.stack || error);
      throw new InternalServerErrorException('Lỗi hệ thống khi kiểm tra trạng thái đơn nạp');
    }
  }

  /**
   * Xử lý Webhook tự động gửi từ SePay khi có biến động dư ngân hàng
   */
  async handleSepayWebhook(payload: SepayWebhookDto, authHeader?: string) {
    this.logger.log(`[SePay Webhook Received] Payload: ${JSON.stringify(payload)}`);

    try {
      // 1. Kiểm tra Secret Token nếu có cấu hình SEPAY_WEBHOOK_SECRET
      const expectedSecret = process.env.SEPAY_WEBHOOK_SECRET;
      if (expectedSecret) {
        const cleanHeader = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
        if (cleanHeader !== expectedSecret) {
          this.logger.warn(`[SePay Webhook] Invalid Webhook Secret Header: ${authHeader}`);
          throw new UnauthorizedException('Xác thực SePay Webhook thất bại');
        }
      }

      // 2. Chỉ xử lý giao dịch nạp tiền vào (transferType === 'in' hoặc transferAmount > 0)
      const transferAmount = Number(payload.transferAmount || payload.accumulated || payload.accumulative || 0);
      if (payload.transferType && payload.transferType !== 'in' && transferAmount <= 0) {
        return { success: true, message: 'Bỏ qua giao dịch tiền ra' };
      }

      const rawContent = (payload.content || payload.description || '').toUpperCase();
      const payloadCode = (payload.code || '').toUpperCase();

      // 3. Tìm giao dịch PENDING khớp mã code hoặc chứa mã đơn trong nội dung
      const pendingTransactions = await this.prisma.depositTransaction.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
      });

      let matchedTx = pendingTransactions.find(tx => {
        if (payloadCode && tx.code.toUpperCase() === payloadCode) return true;
        if (rawContent.includes(tx.code.toUpperCase())) return true;
        return false;
      });

      if (!matchedTx) {
        this.logger.warn(`[SePay Webhook] Không tìm thấy đơn PENDING nào khớp với content: "${rawContent}" (code: "${payloadCode}")`);
        return { success: false, message: 'Không tìm thấy đơn nạp tương ứng' };
      }

      const finalAmount = transferAmount > 0 ? transferAmount : Number(matchedTx.amount);

      // 4. Cập nhật trạng thái COMPLETED & Cộng số dư User bằng Prisma Transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.depositTransaction.update({
          where: { id: matchedTx.id },
          data: {
            status: 'COMPLETED',
            sepayTransId: String(payload.id || payload.referenceCode || Date.now()),
            bankName: payload.gateway || process.env.SEPAY_BANK_NAME || 'MBBank',
            accountNumber: payload.accountNumber || '',
            content: payload.content || payload.description || matchedTx.fullContent,
            completedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: matchedTx.userId },
          data: {
            balance: {
              increment: finalAmount,
            },
          },
        });
      });

      // 5. Gửi thông báo hệ thống & Ghi log
      const formattedAmt = finalAmount.toLocaleString('vi-VN') + 'đ';
      await this.notificationsService.create(
        'Nạp tiền thành công',
        `Tài khoản của bạn đã được cộng thành công +${formattedAmt} qua SePay (Đơn #${matchedTx.code}).`,
        'user',
        '24h',
      );

      await this.auditLogsService.createLog({
        userId: matchedTx.userId,
        userEmail: matchedTx.user.email,
        username: matchedTx.user.username || undefined,
        userRole: matchedTx.user.role,
        action: 'DEPOSIT_SUCCESS_SEPAY',
        module: 'PAYMENT',
        payload: JSON.stringify({ code: matchedTx.code, amount: finalAmount, sepayTransId: payload.id }),
      });

      this.logger.log(`[SePay Webhook Success] Đơn #${matchedTx.code} hoàn tất! Cộng +${formattedAmt} cho User ${matchedTx.user.email}`);

      return {
        success: true,
        message: 'Xử lý nạp tiền SePay thành công',
        code: matchedTx.code,
        amount: finalAmount,
      };
    } catch (error: any) {
      this.logger.error('[SePay Webhook Error]:', error?.stack || error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống xử lý SePay Webhook');
    }
  }
}
