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
  ) { }

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

      const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
      const accountNumber = process.env.SEPAY_ACCOUNT_NO || '0399999999';
      const accountHolder = process.env.SEPAY_ACCOUNT_HOLDER || 'EIGU PLATFORM';

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // 1. Tải lại đơn nạp PENDING vừa tạo (trong vòng 15 phút) cùng số tiền để TRÁNH SPAM DB
      const existingPending = await this.prisma.depositTransaction.findFirst({
        where: {
          userId: user.id,
          amount,
          status: 'PENDING',
          createdAt: { gte: fifteenMinutesAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPending) {
        const qrCodeUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(existingPending.bankName || bankName)}&acc=${encodeURIComponent(existingPending.accountNumber || accountNumber)}&template=compact&amount=${amount}&des=${encodeURIComponent(existingPending.fullContent)}`;
        this.logger.log(`[Payment] Tái sử dụng đơn nạp PENDING #${existingPending.code} (${amount}đ) cho User ${user.email}`);

        return {
          id: existingPending.id,
          code: existingPending.code,
          fullContent: existingPending.fullContent,
          amount: Number(existingPending.amount),
          status: existingPending.status,
          bankName: existingPending.bankName || bankName,
          accountNumber: existingPending.accountNumber || accountNumber,
          accountHolder,
          qrCodeUrl,
          createdAt: existingPending.createdAt,
        };
      }

      // 2. Dọn dẹp tự động chuyển trạng thái CANCELLED các đơn PENDING cũ hơn 15 phút
      await this.prisma.depositTransaction.updateMany({
        where: {
          userId: user.id,
          status: 'PENDING',
          createdAt: { lt: fifteenMinutesAgo },
        },
        data: { status: 'CANCELLED' },
      });

      // 3. Sinh mã đơn nạp mới ngẫu nhiên 5-6 số (VD: 88921)
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
      const fullContent = `EIGU ${displayUsername} ${code}`.trim();

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

      const qrCodeUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankName)}&acc=${encodeURIComponent(accountNumber)}&template=compact&amount=${amount}&des=${encodeURIComponent(fullContent)}`;

      this.logger.log(`[Payment] Đã tạo đơn nạp PENDING mới #${code} (${amount}đ) cho User ${user.email}`);

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

      const bankName = transaction.bankName || process.env.SEPAY_BANK_NAME || 'MBBank';
      const accountNumber = transaction.accountNumber || process.env.SEPAY_ACCOUNT_NO || '';
      const accountHolder = process.env.SEPAY_ACCOUNT_HOLDER || 'EIGU PLATFORM';
      const fullContent = transaction.fullContent;
      const amount = Number(transaction.amount);

      const qrCodeUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankName)}&acc=${encodeURIComponent(accountNumber)}&template=compact&amount=${amount}&des=${encodeURIComponent(fullContent)}`;

      return {
        code: transaction.code,
        status: transaction.status,
        amount,
        completedAt: transaction.completedAt ? transaction.completedAt.toISOString() : null,
        fullContent,
        bankName,
        accountNumber,
        accountHolder,
        qrCodeUrl,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`[Payment] Lỗi kiểm tra trạng thái đơn nạp #${code}:`, error?.stack || error);
      throw new InternalServerErrorException('Không thể lấy trạng thái đơn nạp.');
    }
  }

  /**
   * Hủy đơn nạp tiền PENDING của chính User
   */
  async cancelUserTransaction(userId: string, code: string) {
    const tx = await this.prisma.depositTransaction.findFirst({
      where: { code, userId },
    });
    if (!tx) {
      throw new NotFoundException('Không tìm thấy đơn nạp tiền');
    }
    if (tx.status !== 'PENDING') {
      return { success: true, message: `Đơn nạp #${code} hiện đã ở trạng thái ${tx.status}` };
    }
    await this.prisma.depositTransaction.update({
      where: { id: tx.id },
      data: { status: 'CANCELLED' },
    });
    this.logger.log(`[Payment] User ${userId} đã hủy đơn nạp PENDING #${code}`);
    return { success: true, message: `Đã hủy đơn nạp #${code} thành công` };
  }

  /**
   * Xử lý Webhook tự động gửi từ SePay khi có biến động dư ngân hàng
   */
  async handleSepayWebhook(payload: SepayWebhookDto, authHeader?: string) {
    this.logger.log(`[SePay Webhook Received] Payload: ${JSON.stringify(payload)}`);

    try {
      // 1. Kiểm tra Secret Token / API Key nếu có cấu hình SEPAY_WEBHOOK_SECRET hoặc SEPAY_API_KEY
      const expectedSecret = (process.env.SEPAY_WEBHOOK_SECRET || process.env.SEPAY_API_KEY || '').trim();
      if (expectedSecret) {
        const rawToken = (authHeader || '').trim();
        const cleanHeader = rawToken
          .replace(/^Bearer\s+/i, '')
          .replace(/^Apikey\s+/i, '')
          .replace(/^API-Key\s+/i, '')
          .trim();

        const isValid =
          cleanHeader === expectedSecret ||
          rawToken === expectedSecret ||
          rawToken.includes(expectedSecret);

        if (!isValid) {
          this.logger.warn(`[SePay Webhook] Xác thực thất bại. Header nhận: "${authHeader}", Secret kỳ vọng: "${expectedSecret.substring(0, 4)}***"`);
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
        `Tài khoản của bạn đã được cộng thành công +${formattedAmt} qua Ngân hàng (Đơn #${matchedTx.code}).`,
        matchedTx.userId,
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

  /**
   * [ADMIN] Lấy tất cả danh sách đơn nạp tiền hệ thống
   */
  async getAllTransactionsAdmin(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    datePreset?: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const take = Number(limit) || 10;
      const skip = (Number(page) - 1) * take;

      const where: any = {};

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { code: { contains: q, mode: 'insensitive' } },
          { fullContent: { contains: q, mode: 'insensitive' } },
          { bankName: { contains: q, mode: 'insensitive' } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
          { user: { username: { contains: q, mode: 'insensitive' } } },
        ];
      }

      // Date filtering logic
      let fromDate: Date | null = null;
      let toDate: Date | null = null;
      const now = new Date();

      if (datePreset && datePreset !== 'ALL') {
        if (datePreset === 'TODAY') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (datePreset === 'YESTERDAY') {
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          fromDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
          toDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
        } else if (datePreset === 'THIS_WEEK') {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          fromDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
        } else if (datePreset === 'THIS_MONTH') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        } else if (datePreset === 'LAST_MONTH') {
          fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
          toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (datePreset === 'THIS_QUARTER') {
          const qMonth = Math.floor(now.getMonth() / 3) * 3;
          fromDate = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0);
        } else if (datePreset === 'LAST_QUARTER') {
          const qMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
          fromDate = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0);
          toDate = new Date(now.getFullYear(), qMonth + 3, 0, 23, 59, 59);
        } else if (datePreset === 'THIS_YEAR') {
          fromDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        } else if (datePreset === 'CUSTOM') {
          if (startDate) fromDate = new Date(startDate + 'T00:00:00');
          if (endDate) toDate = new Date(endDate + 'T23:59:59');
        }
      }

      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = fromDate;
        if (toDate) where.createdAt.lte = toDate;
      }

      const [total, items, totalCompletedAgg, pendingCount, completedCount] = await Promise.all([
        this.prisma.depositTransaction.count({ where }),
        this.prisma.depositTransaction.findMany({
          where,
          include: {
            user: {
              select: { id: true, email: true, username: true, balance: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.depositTransaction.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.depositTransaction.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.depositTransaction.count({ where: { ...where, status: 'COMPLETED' } }),
      ]);

      const formattedItems = items.map(t => ({
        id: t.id,
        code: t.code,
        fullContent: t.fullContent,
        userId: t.userId,
        userEmail: t.user?.email || 'N/A',
        username: t.user?.username || t.user?.email?.split('@')[0] || 'N/A',
        userBalance: Number(t.user?.balance || 0),
        amount: Number(t.amount),
        status: t.status,
        paymentMethod: t.paymentMethod,
        sepayTransId: t.sepayTransId,
        bankName: t.bankName || 'ACB',
        accountNumber: t.accountNumber || '',
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      }));

      return {
        data: formattedItems,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        stats: {
          totalRevenue: Number(totalCompletedAgg._sum.amount || 0),
          totalCompletedCount: totalCompletedAgg._count || 0,
          totalTransactions: (totalCompletedAgg._count || 0) + pendingCount,
          pendingCount,
          completedCount,
        },
      };
    } catch (error: any) {
      this.logger.error('[PaymentAdmin] Lỗi lấy danh sách giao dịch admin:', error?.stack || error);
      throw new InternalServerErrorException('Không thể nạp danh sách giao dịch');
    }
  }

  /**
   * [ADMIN] Phê duyệt thủ công đơn nạp PENDING -> COMPLETED (+Cộng tiền User)
   */
  async approveTransactionAdmin(adminUserId: string, txId: string) {
    try {
      const txItem = await this.prisma.depositTransaction.findUnique({
        where: { id: txId },
        include: { user: true },
      });

      if (!txItem) {
        throw new NotFoundException('Không tìm thấy đơn nạp tiền');
      }

      if (txItem.status === 'COMPLETED') {
        throw new BadRequestException('Đơn nạp tiền này đã được hoàn tất trước đó!');
      }

      const amount = Number(txItem.amount);

      await this.prisma.$transaction(async (db) => {
        await db.depositTransaction.update({
          where: { id: txId },
          data: {
            status: 'COMPLETED',
            sepayTransId: `MANUAL_ADMIN_${Date.now()}`,
            completedAt: new Date(),
          },
        });

        await db.user.update({
          where: { id: txItem.userId },
          data: {
            balance: { increment: amount },
          },
        });
      });

      // Audit log & Notif
      const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId }, select: { email: true, username: true, role: true } });
      await this.notificationsService.create(
        'Nạp tiền thành công',
        `Đơn nạp #${txItem.code} (${amount.toLocaleString('vi-VN')}đ) của bạn đã được Admin phê duyệt thành công!`,
        txItem.userId,
        '24h',
      );

      await this.auditLogsService.createLog({
        userId: adminUserId,
        userEmail: adminUser?.email || 'admin@eigu.vn',
        username: adminUser?.username || 'Admin',
        userRole: adminUser?.role || 'ADMIN',
        action: 'ADMIN_APPROVE_DEPOSIT',
        module: 'PAYMENT',
        payload: JSON.stringify({ txId, code: txItem.code, amount, targetUser: txItem.user.email }),
      });

      return {
        success: true,
        message: `Đã duyệt thành công đơn #${txItem.code} và cộng +${amount.toLocaleString('vi-VN')}đ cho tài khoản ${txItem.user.email}!`,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      this.logger.error(`[PaymentAdmin] Lỗi duyệt đơn #${txId}:`, error?.stack || error);
      throw new InternalServerErrorException('Lỗi duyệt giao dịch');
    }
  }

  /**
   * [ADMIN] Hủy đơn nạp tiền
   */
  async cancelTransactionAdmin(adminUserId: string, txId: string) {
    try {
      const txItem = await this.prisma.depositTransaction.findUnique({
        where: { id: txId },
      });

      if (!txItem) {
        throw new NotFoundException('Không tìm thấy đơn nạp tiền');
      }

      await this.prisma.depositTransaction.update({
        where: { id: txId },
        data: { status: 'CANCELLED' },
      });

      return {
        success: true,
        message: `Đã chuyển trạng thái đơn #${txItem.code} sang Đã Hủy!`,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`[PaymentAdmin] Lỗi hủy đơn #${txId}:`, error?.stack || error);
      throw new InternalServerErrorException('Lỗi hủy giao dịch');
    }
  }
}
