/**
 * EIGU Platform - Shared Affiliate DTOs and Interfaces
 */

export interface AffiliateStatsDto {
  referralCode: string;
  referralLink: string;
  clickCount: number;
  referredCount: number;
  totalCommissionEarned: number;
  affiliateBalance: number;
  affiliateWithdrawn: number;
  commissionRate: number; // e.g. 15 (%)
  minPayoutThreshold: number; // e.g. 200000 (VNĐ)
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
}

export interface ReferredUserDto {
  id: string;
  maskedEmail: string;
  username: string | null;
  createdAt: string;
  status: string;
  isVerified: boolean;
  totalCommissionGenerated: number;
}

export interface AffiliateCommissionDto {
  id: string;
  code: string;
  referredUserEmail: string;
  sourceType: string;
  sourceId: string | null;
  orderAmount: number;
  rate: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export interface CreatePayoutRequestDto {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  saveAsDefault?: boolean;
}

export interface UserBankSettingsDto {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

export interface AffiliatePayoutDto {
  id: string;
  code: string;
  userId: string;
  userEmail?: string;
  username?: string | null;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNote?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface AdminUpdatePayoutDto {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

export interface AdminAffiliateStatsDto {
  totalReferralClicks: number;
  totalReferredUsers: number;
  totalCommissionsPaid: number;
  totalPendingPayoutsAmount: number;
  pendingPayoutsCount: number;
}

export interface AdminAffiliateConfigDto {
  commissionRate: number;
  minPayoutThreshold: number;
}

export interface UpdateAffiliateConfigDto {
  commissionRate?: number;
  minPayoutThreshold?: number;
}
