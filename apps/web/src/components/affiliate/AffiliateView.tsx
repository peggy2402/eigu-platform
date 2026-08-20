'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Users,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  Building2,
  CreditCard,
  UserCheck,
  AlertCircle,
  HelpCircle,
  MousePointerClick,
  Sparkles,
  ShieldCheck,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getApiBaseUrl, API_ENDPOINTS, VIETNAM_BANKS_DEFAULT } from '@eigu-platform/shared';
import type {
  AffiliateStatsDto,
  ReferredUserDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
  VietQRBank,
} from '@eigu-platform/shared';
import { AdminAffiliatePayoutsView } from './AdminAffiliatePayoutsView';

import { affiliateApi } from '../../lib/api';

interface AffiliateViewProps {
  token?: string;
  userRole?: string;
  language?: 'vi' | 'en';
}

export const AffiliateView: React.FC<AffiliateViewProps> = ({ token, userRole, language = 'vi' }) => {
  const { showToast } = useToast();

  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AffiliateStatsDto | null>(null);

  // VietQR Banks state & Bank Picker Modal
  const [bankList, setBankList] = useState<VietQRBank[]>(VIETNAM_BANKS_DEFAULT);
  const [showBankPickerModal, setShowBankPickerModal] = useState<boolean>(false);
  const [bankPickerTarget, setBankPickerTarget] = useState<'settings' | 'withdraw'>('settings');
  const [bankSearchQuery, setBankSearchQuery] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.code === '00' && Array.isArray(res.data) && res.data.length > 0) {
          setBankList(res.data);
        }
      })
      .catch(() => {
        // Fallback to static defaults
      });
  }, []);

  // Tabs state: 'referrals' | 'commissions' | 'payouts' | 'bank' | 'admin-payouts'
  const [activeTab, setActiveTab] = useState<'referrals' | 'commissions' | 'payouts' | 'bank' | 'admin-payouts'>('referrals');

  // Referred users state
  const [referrals, setReferrals] = useState<ReferredUserDto[]>([]);
  const [refPage, setRefPage] = useState<number>(1);
  const [refTotalPages, setRefTotalPages] = useState<number>(1);
  const [loadingRef, setLoadingRef] = useState<boolean>(false);

  // Commissions state
  const [commissions, setCommissions] = useState<AffiliateCommissionDto[]>([]);
  const [commPage, setCommPage] = useState<number>(1);
  const [commTotalPages, setCommTotalPages] = useState<number>(1);
  const [loadingComm, setLoadingComm] = useState<boolean>(false);

  // Payouts state
  const [payouts, setPayouts] = useState<AffiliatePayoutDto[]>([]);
  const [payoutPage, setPayoutPage] = useState<number>(1);
  const [payoutTotalPages, setPayoutTotalPages] = useState<number>(1);
  const [loadingPayout, setLoadingPayout] = useState<boolean>(false);

  // Copy states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Withdrawal Drawer/Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('200000');
  const [bankName, setBankName] = useState<string>('MBBank');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(true);
  const [submittingWithdraw, setSubmittingWithdraw] = useState<boolean>(false);

  // User Bank Settings form state
  const [userBankName, setUserBankName] = useState<string>('MBBank');
  const [userAccountNumber, setUserAccountNumber] = useState<string>('');
  const [userAccountHolder, setUserAccountHolder] = useState<string>('');
  const [savingBankSettings, setSavingBankSettings] = useState<boolean>(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showBankPickerModal || showWithdrawModal || showQrModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [showBankPickerModal, showWithdrawModal, showQrModal]);



  // Fetch stats
  const fetchStats = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data: AffiliateStatsDto = await affiliateApi.getStats();
      setStats(data);

      if (data.bankName) {
        setBankName(data.bankName);
        setUserBankName(data.bankName);
      }
      if (data.bankAccountNumber) {
        setAccountNumber(data.bankAccountNumber);
        setUserAccountNumber(data.bankAccountNumber);
      }
      if (data.bankAccountHolder) {
        setAccountHolder(data.bankAccountHolder);
        setUserAccountHolder(data.bankAccountHolder);
      }
      if (data.minPayoutThreshold) {
        setWithdrawAmount((prev) => (Number(prev) < data.minPayoutThreshold ? String(data.minPayoutThreshold) : prev));
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes('401')) {
        console.warn('[AffiliateView] Unauthorized stats fetch');
      } else {
        console.error('[AffiliateView] Error fetching stats:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch referred users
  const fetchReferrals = useCallback(
    async (page = 1) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setLoadingRef(false);
        return;
      }
      try {
        setLoadingRef(true);
        const data = await affiliateApi.getReferrals(page, 10);
        setReferrals(data.items || []);
        setRefPage(data.page || 1);
        setRefTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes('401')) {
          console.warn('[AffiliateView] Unauthorized referrals fetch');
        } else {
          console.error('[AffiliateView] Error fetching referrals:', err);
        }
      } finally {
        setLoadingRef(false);
      }
    },
    [],
  );

  // Fetch commissions history
  const fetchCommissions = useCallback(
    async (page = 1) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setLoadingComm(false);
        return;
      }
      try {
        setLoadingComm(true);
        const data = await affiliateApi.getCommissions(page, 10);
        setCommissions(data.items || []);
        setCommPage(data.page || 1);
        setCommTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes('401')) {
          console.warn('[AffiliateView] Unauthorized commissions fetch');
        } else {
          console.error('[AffiliateView] Error fetching commissions:', err);
        }
      } finally {
        setLoadingComm(false);
      }
    },
    [],
  );

  // Fetch payouts history
  const fetchPayouts = useCallback(
    async (page = 1) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setLoadingPayout(false);
        return;
      }
      try {
        setLoadingPayout(true);
        const data = await affiliateApi.getPayouts(page, 10);
        setPayouts(data.items || []);
        setPayoutPage(data.page || 1);
        setPayoutTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes('401')) {
          console.warn('[AffiliateView] Unauthorized payouts fetch');
        } else {
          console.error('[AffiliateView] Error fetching payouts:', err);
        }
      } finally {
        setLoadingPayout(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Tab change load
  useEffect(() => {
    if (activeTab === 'referrals') fetchReferrals(refPage);
    if (activeTab === 'commissions') fetchCommissions(commPage);
    if (activeTab === 'payouts') fetchPayouts(payoutPage);
  }, [activeTab, fetchReferrals, fetchCommissions, fetchPayouts, refPage, commPage, payoutPage]);

  const handleRefreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchReferrals(refPage),
        fetchCommissions(commPage),
        fetchPayouts(payoutPage),
      ]);
      showToast('Đã làm mới dữ liệu!', 'Số liệu và lịch sử hoa hồng tiếp thị liên kết đã được cập nhật.', 'success');
    } catch (err) {
      showToast('Làm mới thất bại', 'Vui lòng kiểm tra lại kết nối mạng', 'error');
    }
  }, [fetchStats, fetchReferrals, refPage, fetchCommissions, commPage, fetchPayouts, payoutPage, showToast]);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast('Đã sao chép link tiếp thị!', 'Dán và chia sẻ cho bạn bè để nhận hoa hồng.', 'success');
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast('Đã sao chép mã giới thiệu!', `Mã: ${text}`, 'success');
    }
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userBankName || !userAccountNumber.trim() || !userAccountHolder.trim()) {
      showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên ngân hàng, số tài khoản và tên chủ thẻ', 'warning');
      return;
    }

    try {
      setSavingBankSettings(true);
      await affiliateApi.saveBankSettings({
        bankName: userBankName,
        bankAccountNumber: userAccountNumber.trim(),
        bankAccountHolder: userAccountHolder.trim().toUpperCase(),
      });

      // Sync to withdrawal modal
      setBankName(userBankName);
      setAccountNumber(userAccountNumber.trim());
      setAccountHolder(userAccountHolder.trim().toUpperCase());

      showToast('Đã lưu tài khoản ngân hàng!', 'Thông tin sẽ được tự động điền khi bạn tạo đơn rút tiền.', 'success');
    } catch (err: any) {
      showToast('Lưu thất bại', err.message || 'Vui lòng thử lại', 'error');
    } finally {
      setSavingBankSettings(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    const minThreshold = stats?.minPayoutThreshold || 200000;

    if (!amountNum || amountNum < minThreshold) {
      showToast('Số tiền không hợp lệ', `Số tiền rút tối thiểu là ${minThreshold.toLocaleString('vi-VN')} VNĐ`, 'error');
      return;
    }
    if (stats && amountNum > stats.affiliateBalance) {
      showToast('Số dư không đủ', `Số dư hoa hồng khả dụng của bạn là ${stats.affiliateBalance.toLocaleString('vi-VN')} VNĐ`, 'error');
      return;
    }
    if (!accountNumber.trim() || !accountHolder.trim()) {
      showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản', 'warning');
      return;
    }

    try {
      setSubmittingWithdraw(true);
      await affiliateApi.requestPayout({
        amount: amountNum,
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
        saveAsDefault,
      });

      showToast('Gửi yêu cầu thành công!', 'Admin sẽ xác minh và chuyển khoản cho bạn sớm nhất.', 'success');
      setShowWithdrawModal(false);
      fetchStats();
      if (activeTab === 'payouts') fetchPayouts(1);
    } catch (err: any) {
      showToast('Rút tiền thất bại', err.message || 'Vui lòng thử lại sau', 'error');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const getSelectedBank = (name: string): VietQRBank | undefined => {
    if (!name) return undefined;
    const n = name.trim().toLowerCase();
    return bankList.find(
      (b) =>
        b.shortName.toLowerCase() === n ||
        b.name.toLowerCase() === n ||
        b.code.toLowerCase() === n ||
        n.includes(b.shortName.toLowerCase()) ||
        n.includes(b.code.toLowerCase()),
    );
  };

  const filteredBanks = bankList.filter((b: VietQRBank) => {
    if (!bankSearchQuery.trim()) return true;
    const q = bankSearchQuery.trim().toLowerCase();
    return (
      b.shortName.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.bin && b.bin.includes(q))
    );
  });

  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const isAdmin = userRole === 'admin';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.12) 50%, rgba(34, 197, 94, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '28px 24px',
          marginBottom: 24,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles size={14} /> Affiliate Partner Program
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Share2 size={26} style={{ color: 'var(--accent, #6366f1)' }} /> Tiếp Thị Liên Kết & Chiết Khấu Hoa Hồng <span style={{ color: '#22c55e', fontSize: 20 }}>({stats?.commissionRate || 15}%)</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Chia sẻ liên kết giới thiệu sản phẩm EIGU Platform để nhận hoa hồng <strong style={{ color: 'var(--accent, #818cf8)' }}>{stats?.commissionRate || 15}%</strong> trọn đời trên mọi đơn nạp tiền & nâng cấp gói dịch vụ của thành viên.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 12,
                background: 'var(--bg-secondary, rgba(255, 255, 255, 0.06))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>

      {/* REFERRAL LINK CARD & METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* REFERRAL LINK CARD */}
        <div
          style={{
            background: 'var(--bg-card, #13141f)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LinkIcon size={14} /> Link & Mã Giới Thiệu Của Bạn
              </span>
              <button
                onClick={() => setShowQrModal(true)}
                title="Xem mã QR Code"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: 'none',
                  color: '#818cf8',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <QrCode size={14} /> QR
              </button>
            </div>

            {/* URL INPUT & COPY */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Đường dẫn tiếp thị (Referral Link):
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-primary, #0b0c10)',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                  borderRadius: 10,
                  padding: '6px 8px 6px 12px',
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={stats?.referralLink || 'Đang tải link...'}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
                <button
                  onClick={() => stats?.referralLink && copyToClipboard(stats.referralLink, 'link')}
                  style={{
                    background: copiedLink ? '#22c55e' : 'var(--accent, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* REFERRAL CODE BOX */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Mã giới thiệu riêng:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px dashed var(--accent, #6366f1)',
                    fontSize: 16,
                    fontWeight: 900,
                    color: 'var(--accent, #6366f1)',
                    letterSpacing: '2px',
                  }}
                >
                  {stats?.referralCode || '...'}
                </span>
                <button
                  onClick={() => stats?.referralCode && copyToClipboard(stats.referralCode, 'code')}
                  style={{
                    background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    color: 'var(--text-primary)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {copiedCode ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                  Mã Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS METRICS 2x2 GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {/* STAT CARD 1: CLICKS */}
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Lượt Click Link</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MousePointerClick size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
              {stats?.clickCount.toLocaleString('vi-VN') || 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tổng lượt truy cập qua link</div>
          </div>

          {/* STAT CARD 2: REFERRED USERS */}
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Thành Viên Đã ĐK</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
              {stats?.referredCount.toLocaleString('vi-VN') || 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tài khoản cấp dưới</div>
          </div>

          {/* STAT CARD 3: TOTAL EARNED */}
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Hoa Hồng Tích Lũy</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#eab308' }}>
              {formatVnd(stats?.totalCommissionEarned || 0)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tổng hoa hồng phát sinh</div>
          </div>

          {/* STAT CARD 4: WITHDRAWABLE BALANCE */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Số Dư Khả Dụng</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={16} />
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#22c55e' }}>
              {formatVnd(stats?.affiliateBalance || 0)}
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                marginTop: 8,
                width: '100%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
            >
              <ArrowUpRight size={14} /> Rút Tiền Ngay
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION & TABLES */}
      <div
        style={{
          background: 'var(--bg-card, #13141f)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* TAB BUTTONS (RESPONSIVE HORIZONTAL SCROLL ON MOBILE) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            padding: '6px 4px 14px 4px',
            marginBottom: 20,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          <button
            onClick={() => setActiveTab('referrals')}
            className={`affiliate-tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
          >
            <Users size={15} /> Thành Viên ({stats?.referredCount || 0})
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`affiliate-tab-btn ${activeTab === 'commissions' ? 'active' : ''}`}
          >
            <TrendingUp size={15} /> Lịch Sử Hoa Hồng
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`affiliate-tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
          >
            <Clock size={15} /> Lịch Sử Rút Tiền
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`affiliate-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          >
            <CreditCard size={15} /> Cài Đặt Ngân Hàng
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-payouts')}
              className={`affiliate-tab-btn-admin ${activeTab === 'admin-payouts' ? 'active' : ''}`}
            >
              <ShieldCheck size={15} /> Quản Lý Đơn Rút <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(234, 179, 8, 0.25)', fontWeight: 800 }}>Admin</span>
            </button>
          )}
        </div>


        {/* TAB 1: REFERRED USERS TABLE */}
        {activeTab === 'referrals' && (
          <div>
            {loadingRef ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                <div>Đang tải danh sách thành viên...</div>
              </div>
            ) : referrals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <UserCheck size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Chưa có thành viên đăng ký</div>
                <p style={{ fontSize: 13, maxWidth: 400, margin: '6px auto 0 auto' }}>
                  Sao chép link tiếp thị bên trên và gửi cho bạn bè để bắt đầu nhận hoa hồng.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-secondary)', fontSize: 12 }}>
                        <th style={{ padding: '10px 12px' }}>Tài Khoản</th>
                        <th style={{ padding: '10px 12px' }}>Ngày Đăng Ký</th>
                        <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hoa Hồng Đã Tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.maskedEmail}</div>
                            {user.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</div>}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 10,
                                fontSize: 11,
                                fontWeight: 700,
                                background: user.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                color: user.isVerified ? '#22c55e' : '#eab308',
                              }}
                            >
                              {user.isVerified ? 'Đã xác thực email' : 'Chưa xác thực'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#eab308' }}>
                            {formatVnd(user.totalCommissionGenerated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / SMALL SCREEN CARD LIST */}
                <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {referrals.map((user) => (
                    <div key={user.id} style={{ background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{user.maskedEmail}</div>
                          {user.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</div>}
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: user.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: user.isVerified ? '#22c55e' : '#eab308' }}>
                          {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span style={{ fontWeight: 800, color: '#eab308', fontSize: 13 }}>{formatVnd(user.totalCommissionGenerated)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: COMMISSIONS TABLE */}
        {activeTab === 'commissions' && (
          <div>
            {loadingComm ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                <div>Đang tải lịch sử hoa hồng...</div>
              </div>
            ) : commissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Chưa có hoa hồng phát sinh</div>
                <p style={{ fontSize: 13, maxWidth: 400, margin: '6px auto 0 auto' }}>
                  Khi thành viên cấp dưới nạp tiền hoặc đăng ký gói dịch vụ, hoa hồng sẽ hiển thị ngay tại đây.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-secondary)', fontSize: 12 }}>
                        <th style={{ padding: '10px 12px' }}>Mã Giao Dịch</th>
                        <th style={{ padding: '10px 12px' }}>Thành Viên</th>
                        <th style={{ padding: '10px 12px' }}>Nguồn Giao Dịch</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Giá Trị Đơn</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>Tỉ Lệ</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hoa Hồng Nhận</th>
                        <th style={{ padding: '10px 12px' }}>Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((comm) => (
                        <tr key={comm.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                          <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent, #6366f1)' }}>#{comm.code}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{comm.referredUserEmail}</td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                background: comm.sourceType === 'DEPOSIT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                color: comm.sourceType === 'DEPOSIT' ? '#818cf8' : '#c084fc',
                              }}
                            >
                              {comm.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                            {formatVnd(comm.orderAmount)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>
                            {comm.rate}%
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>
                            +{formatVnd(comm.commissionAmount)}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>
                            {new Date(comm.createdAt).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / SMALL SCREEN CARD LIST */}
                <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {commissions.map((comm) => (
                    <div key={comm.id} style={{ background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--accent, #6366f1)', fontSize: 12 }}>#{comm.code}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{comm.referredUserEmail}</div>
                        </div>
                        <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: comm.sourceType === 'DEPOSIT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: comm.sourceType === 'DEPOSIT' ? '#818cf8' : '#c084fc' }}>
                          {comm.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatVnd(comm.orderAmount)} ({comm.rate}%)</div>
                        <div style={{ fontWeight: 900, color: '#22c55e', fontSize: 14 }}>+{formatVnd(comm.commissionAmount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: PAYOUTS TABLE */}
        {activeTab === 'payouts' && (
          <div>
            {loadingPayout ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                <div>Đang tải lịch sử rút tiền...</div>
              </div>
            ) : payouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <Wallet size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Chưa có yêu cầu rút tiền</div>
                <p style={{ fontSize: 13, maxWidth: 400, margin: '6px auto 0 auto' }}>
                  Khi số dư hoa hồng khả dụng đạt từ mức tối thiểu, bạn có thể tạo yêu cầu rút tiền về tài khoản ngân hàng.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-secondary)', fontSize: 12 }}>
                        <th style={{ padding: '10px 12px' }}>Mã Đơn Rút</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số Tiền Rút</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Phí Xử Lý</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thực Nhận</th>
                        <th style={{ padding: '10px 12px' }}>Ngân Hàng & STK</th>
                        <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                        <th style={{ padding: '10px 12px' }}>Ghi Chú Admin</th>
                        <th style={{ padding: '10px 12px' }}>Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => {
                        const fee = Number(p.fee || 0);
                        const netAmount = Number(p.netAmount || (Number(p.amount) - fee));
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                            <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent, #6366f1)' }}>#{p.code}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>{formatVnd(p.amount)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: fee > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                              {fee > 0 ? `-${formatVnd(fee)}` : 'Miễn phí'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>{formatVnd(netAmount)}</td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.bankName} - {p.accountNumber}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CTK: {p.accountHolder}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '4px 10px',
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background:
                                    p.status === 'APPROVED'
                                      ? 'rgba(34, 197, 94, 0.15)'
                                      : p.status === 'REJECTED'
                                        ? 'rgba(239, 68, 68, 0.15)'
                                        : 'rgba(234, 179, 8, 0.15)',
                                  color: p.status === 'APPROVED' ? '#22c55e' : p.status === 'REJECTED' ? '#ef4444' : '#eab308',
                                }}
                              >
                                {p.status === 'APPROVED' && <CheckCircle2 size={12} />}
                                {p.status === 'REJECTED' && <XCircle size={12} />}
                                {p.status === 'PENDING' && <Clock size={12} />}
                                {p.status === 'APPROVED' ? 'Đã duyệt (Đã chuyển)' : p.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: 12 }}>
                              {p.adminNote || '-'}
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>
                              {new Date(p.createdAt).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / SMALL SCREEN CARD LIST */}
                <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {payouts.map((p) => {
                    const fee = Number(p.fee || 0);
                    const netAmount = Number(p.netAmount || (Number(p.amount) - fee));
                    return (
                      <div key={p.id} style={{ background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--accent, #6366f1)', fontSize: 12 }}>#{p.code}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0' }}>{new Date(p.createdAt).toLocaleString('vi-VN')}</div>
                          </div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '3px 8px',
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background:
                                p.status === 'APPROVED'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : p.status === 'REJECTED'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(234, 179, 8, 0.15)',
                              color: p.status === 'APPROVED' ? '#22c55e' : p.status === 'REJECTED' ? '#ef4444' : '#eab308',
                            }}
                          >
                            {p.status === 'APPROVED' ? 'Đã duyệt' : p.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 8, fontSize: 11 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Số tiền rút:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatVnd(p.amount)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Phí xử lý:</span>
                            <span style={{ color: fee > 0 ? '#ef4444' : 'var(--text-muted)' }}>{fee > 0 ? `-${formatVnd(fee)}` : 'Miễn phí'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: 4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Thực nhận:</span>
                            <span style={{ fontWeight: 900, color: '#22c55e', fontSize: 13 }}>{formatVnd(netAmount)}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {p.bankName} - {p.accountNumber} ({p.accountHolder})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}


        {/* TAB 4: BANK SETTINGS FORM */}
        {activeTab === 'bank' && (
          <div style={{ maxWidth: 540, margin: '0 auto', padding: '10px 0' }}>
            <div style={{ background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Cài Đặt Tài Khoản Ngân Hàng Mặc Định
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Lưu sẵn thông tin để tự động điền khi rút tiền hoa hồng.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveBankSettings}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 size={14} /> Ngân hàng nhận tiền:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBankPickerTarget('settings');
                      setBankSearchQuery('');
                      setShowBankPickerModal(true);
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card, #13141f)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {getSelectedBank(userBankName)?.logo ? (
                        <img
                          src={getSelectedBank(userBankName)!.logo}
                          alt={userBankName}
                          style={{ height: 22, maxWidth: 64, objectFit: 'contain' }}
                        />
                      ) : (
                        <Building2 size={18} style={{ color: 'var(--accent, #6366f1)' }} />
                      )}
                      <span style={{ fontWeight: 700 }}>{userBankName || 'Chọn ngân hàng...'}</span>
                      {getSelectedBank(userBankName)?.code && (
                        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent, #818cf8)' }}>
                          {getSelectedBank(userBankName)!.code}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CreditCard size={14} /> Số tài khoản ngân hàng:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số tài khoản..."
                    value={userAccountNumber}
                    onChange={(e) => setUserAccountNumber(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg-card, #13141f)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Tên chủ tài khoản (Viết hoa không dấu):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={userAccountHolder}
                    onChange={(e) => setUserAccountHolder(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg-card, #13141f)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingBankSettings}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--accent, #6366f1)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Check size={16} />
                  {savingBankSettings ? 'Đang lưu...' : 'Lưu Cài Đặt Ngân Hàng'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN PAYOUTS BACKOFFICE CONSOLE */}
        {activeTab === 'admin-payouts' && isAdmin && (
          <div>
            <AdminAffiliatePayoutsView token={token} />
          </div>
        )}
      </div>

      {/* WITHDRAWAL REQUEST MODAL (PORTAL) */}
      {mounted && showWithdrawModal && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: 24,
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={18} style={{ color: '#22c55e' }} /> Rút Tiền Hoa Hồng Affiliate
              </h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  Số tiền rút (VNĐ):
                </label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-primary, #0b0c10)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 15,
                    fontWeight: 800,
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  * Tối thiểu {(stats?.minPayoutThreshold || 200000).toLocaleString('vi-VN')} VNĐ (Số dư: {(stats?.affiliateBalance || 0).toLocaleString('vi-VN')}đ)
                </div>

                {/* Real-time Calculation Breakdown */}
                {Number(withdrawAmount) > 0 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Số tiền yêu cầu:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatVnd(Number(withdrawAmount))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Phí xử lý ({stats?.payoutFeePercent || 0}%{stats?.payoutFeeFixed ? ` + ${formatVnd(stats.payoutFeeFixed)}` : ''}):</span>
                      <span style={{ color: (stats?.payoutFeePercent || stats?.payoutFeeFixed) ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                        {(() => {
                          const fee = Math.round(Number(withdrawAmount) * ((stats?.payoutFeePercent || 0) / 100)) + (stats?.payoutFeeFixed || 0);
                          return fee > 0 ? `-${formatVnd(fee)}` : 'Miễn phí (0đ)';
                        })()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Thực nhận về tài khoản:</span>
                      <span style={{ fontWeight: 900, color: '#22c55e', fontSize: 14 }}>
                        {(() => {
                          const fee = Math.round(Number(withdrawAmount) * ((stats?.payoutFeePercent || 0) / 100)) + (stats?.payoutFeeFixed || 0);
                          const net = Math.max(0, Number(withdrawAmount) - fee);
                          return formatVnd(net);
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={14} /> Ngân hàng nhận tiền:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBankPickerTarget('withdraw');
                    setBankSearchQuery('');
                    setShowBankPickerModal(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary, #0b0c10)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {getSelectedBank(bankName)?.logo ? (
                      <img
                        src={getSelectedBank(bankName)!.logo}
                        alt={bankName}
                        style={{ height: 22, maxWidth: 64, objectFit: 'contain' }}
                      />
                    ) : (
                      <Building2 size={18} style={{ color: 'var(--accent, #6366f1)' }} />
                    )}
                    <span style={{ fontWeight: 700 }}>{bankName || 'Chọn ngân hàng...'}</span>
                    {getSelectedBank(bankName)?.code && (
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent, #818cf8)' }}>
                        {getSelectedBank(bankName)!.code}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CreditCard size={14} /> Số tài khoản:
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-primary, #0b0c10)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  Tên chủ tài khoản (Viết hoa không dấu):
                </label>
                <input
                  type="text"
                  placeholder="VD: NGUYEN VAN A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-primary, #0b0c10)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                  />
                  Lưu làm tài khoản ngân hàng mặc định cho các lần rút sau
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {submittingWithdraw ? 'Đang gửi...' : 'Gửi Yêu Cầu Rút'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* BANK PICKER MODAL POPUP (CENTERED WITH SEARCH - PORTAL) */}
      {mounted && showBankPickerModal && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowBankPickerModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.18))',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Custom Scrollbar Style */}
            <style>{`
              .eigu-bank-scroll::-webkit-scrollbar {
                width: 5px;
              }
              .eigu-bank-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .eigu-bank-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
              }
              .eigu-bank-scroll::-webkit-scrollbar-thumb:hover {
                background: var(--accent, #6366f1);
              }
            `}</style>

            {/* Modal Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} style={{ color: 'var(--accent, #6366f1)' }} /> Chọn Ngân Hàng Nhận Tiền
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Hỗ trợ 65+ ngân hàng & ví điện tử tại Việt Nam (VietQR)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankPickerModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Box */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary, #0b0c10)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card, #13141f)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 12px' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm theo tên ngân hàng, mã (VD: MB, VCB, Quân Đội)..."
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
                {bankSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBankSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Bank List */}
            <div
              className="eigu-bank-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.2) transparent',
              }}
            >
              {filteredBanks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                  Không tìm thấy ngân hàng phù hợp với từ khóa <strong>"{bankSearchQuery}"</strong>
                </div>
              ) : (
                filteredBanks.map((b) => {
                  const currentSelected = bankPickerTarget === 'settings' ? userBankName : bankName;
                  const isSelected =
                    currentSelected === b.shortName ||
                    currentSelected === b.name ||
                    currentSelected === b.code;

                  return (
                    <button
                      key={b.id || b.code}
                      type="button"
                      onClick={() => {
                        if (bankPickerTarget === 'settings') {
                          setUserBankName(b.shortName);
                        } else {
                          setBankName(b.shortName);
                        }
                        setShowBankPickerModal(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: isSelected ? '1px solid var(--accent, #6366f1)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-primary, #0b0c10)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 54, height: 32, background: '#fff', borderRadius: 6, padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img
                            src={b.logo}
                            alt={b.shortName}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>
                              {b.shortName}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                              {b.code}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                            {b.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <Check size={13} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary, #0b0c10)', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowBankPickerModal(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* QR CODE MODAL (PORTAL) */}
      {mounted && showQrModal && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: 20,
              maxWidth: 380,
              width: '100%',
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Mã QR Giới Thiệu Của Bạn</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#fff', padding: 16, borderRadius: 14, display: 'inline-block', marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stats?.referralLink || '')}`}
                alt="QR Code"
                style={{ width: 180, height: 180, display: 'block' }}
              />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Quét mã QR bằng điện thoại để mở trực tiếp trang giới thiệu.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--accent, #6366f1)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
