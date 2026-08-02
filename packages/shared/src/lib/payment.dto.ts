export interface CreateDepositDto {
  amount: number;
}

export interface DepositTransactionDto {
  id: string;
  code: string;
  fullContent: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  paymentMethod: string;
  sepayTransId?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  qrCodeUrl: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface SepayWebhookDto {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string;
  code?: string;
  content?: string;
  transferType?: 'in' | 'out' | string;
  transferAmount?: number;
  accumulated?: number;
  accumulative?: number;
  referenceCode?: string;
  description?: string;
}
