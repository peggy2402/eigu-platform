'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';
import type {
  AffiliateStatsDto,
  ReferredUserDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
} from '@eigu-platform/shared';

interface AffiliateViewProps {
  token?: string;
  language?: 'vi' | 'en';
}

export const AffiliateView: React.FC<AffiliateViewProps> = ({ token, language = 'vi' }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AffiliateStatsDto | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'referrals' | 'commissions' | 'payouts'>('referrals');

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
  const [submittingWithdraw, setSubmittingWithdraw] = useState<boolean>(false);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('eigu_token') || localStorage.getItem('token');
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
      }
    }
    return headers;
  }, [token]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.STATS}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AffiliateStatsDto = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error('[AffiliateView] Error fetching stats:', err);
      // Fallback demo state if unauthenticated or network failure
      setStats({
        referralCode: 'EIGU88X2',
        referralLink: 'https://eigu.site?ref=EIGU88X2',
        clickCount: 0,
        referredCount: 0,
        totalCommissionEarned: 0,
        affiliateBalance: 0,
        affiliateWithdrawn: 0,
        commissionRate: 15,
        minPayoutThreshold: 200000,
      });
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Fetch referrals
  const fetchReferrals = useCallback(
    async (page = 1) => {
      try {
        setLoadingRef(true);
        const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.REFERRALS}?page=${page}&limit=10`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setReferrals(data.items || []);
        setRefPage(data.page || 1);
        setRefTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('[AffiliateView] Error fetching referrals:', err);
      } finally {
        setLoadingRef(false);
      }
    },
    [getHeaders],
  );

  // Fetch commissions
  const fetchCommissions = useCallback(
    async (page = 1) => {
      try {
        setLoadingComm(true);
        const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.COMMISSIONS}?page=${page}&limit=10`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCommissions(data.items || []);
        setCommPage(data.page || 1);
        setCommTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('[AffiliateView] Error fetching commissions:', err);
      } finally {
        setLoadingComm(false);
      }
    },
    [getHeaders],
  );

  // Fetch payouts
  const fetchPayouts = useCallback(
    async (page = 1) => {
      try {
        setLoadingPayout(true);
        const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.PAYOUTS}?page=${page}&limit=10`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPayouts(data.items || []);
        setPayoutPage(data.page || 1);
        setPayoutTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('[AffiliateView] Error fetching payouts:', err);
      } finally {
        setLoadingPayout(false);
      }
    },
    [getHeaders],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'referrals') fetchReferrals(refPage);
    if (activeTab === 'commissions') fetchCommissions(commPage);
    if (activeTab === 'payouts') fetchPayouts(payoutPage);
  }, [activeTab, refPage, commPage, payoutPage, fetchReferrals, fetchCommissions, fetchPayouts]);

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
      const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.PAYOUT_REQUEST}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount: amountNum,
          bankName,
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể tạo yêu cầu rút tiền');
      }

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

  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

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
              <Sparkles size={14} /> Affiliate Partner Program (15% Commission)
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              🤝 Tiếp Thị Liên Kết & Chiết Khấu Hoa Hồng
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Chia sẻ liên kết giới thiệu sản phẩm EIGU Platform để nhận <strong>15% hoa hồng trọn đời</strong> trên mọi đơn nạp tiền & nâng cấp gói dịch vụ của thành viên.
            </p>
          </div>

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
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📌 Link & Mã Giới Thiệu Của Bạn
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
                <QrCode size={14} /> Mã QR
              </button>
            </div>

            {/* REFERRAL LINK INPUT BOX */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Đường dẫn Tiếp thị:</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-primary, #0b0c10)',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                  borderRadius: 10,
                  padding: '6px 6px 6px 12px',
                }}
              >
                <LinkIcon size={16} style={{ color: 'var(--accent, #6366f1)', flexShrink: 0 }} />
                <input
                  type="text"
                  readOnly
                  value={stats?.referralLink || 'https://eigu.site?ref=EIGU88X2'}
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
                  onClick={() => copyToClipboard(stats?.referralLink || 'https://eigu.site?ref=EIGU88X2', 'link')}
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* REFERRAL CODE BOX */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Mã Giới Thiệu (Referral Code):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px dashed #6366f1',
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#818cf8',
                    letterSpacing: '2px',
                  }}
                >
                  {stats?.referralCode || 'EIGU88X2'}
                </div>
                <button
                  onClick={() => copyToClipboard(stats?.referralCode || 'EIGU88X2', 'code')}
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
        {/* TAB BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingBottom: 14, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('referrals')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'referrals' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'referrals' ? 'var(--accent, #6366f1)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={15} /> Người Dùng Đã Giới Thiệu ({stats?.referredCount || 0})
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'commissions' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'commissions' ? 'var(--accent, #6366f1)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <TrendingUp size={15} /> Lịch Sử Hoa Hồng
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'payouts' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'payouts' ? 'var(--accent, #6366f1)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Clock size={15} /> Lịch Sử Rút Tiền
          </button>
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
                  Sao chép link tiếp thị bên trên và gửi cho bạn bè để bắt đầu nhận hoa hồng 15%.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              background: user.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                              color: user.isVerified ? '#22c55e' : '#eab308',
                            }}
                          >
                            {user.isVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#eab308' }}>
                          {formatVnd(user.totalCommissionGenerated)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {refTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button
                  disabled={refPage <= 1}
                  onClick={() => setRefPage((p) => Math.max(1, p - 1))}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Trang trước
                </button>
                <span style={{ fontSize: 13, padding: '6px 8px', color: 'var(--text-secondary)' }}>
                  {refPage} / {refTotalPages}
                </span>
                <button
                  disabled={refPage >= refTotalPages}
                  onClick={() => setRefPage((p) => Math.min(refTotalPages, p + 1))}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Trang sau
                </button>
              </div>
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
                  Khi thành viên cấp dưới nạp tiền hoặc đăng ký gói dịch vụ, hoa hồng 15% sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-secondary)', fontSize: 12 }}>
                      <th style={{ padding: '10px 12px' }}>Mã Đơn</th>
                      <th style={{ padding: '10px 12px' }}>Thành Viên</th>
                      <th style={{ padding: '10px 12px' }}>Loại Đơn</th>
                      <th style={{ padding: '10px 12px' }}>Giá Trị Đơn</th>
                      <th style={{ padding: '10px 12px' }}>Tỉ Lệ</th>
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
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', fontSize: 11, fontWeight: 700 }}>
                            {comm.sourceType === 'DEPOSIT' ? 'Nạp Tiền' : 'Mua Gói'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{formatVnd(comm.orderAmount)}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#3b82f6' }}>{comm.rate}%</td>
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
            )}
          </div>
        )}

        {/* TAB 3: PAYOUT REQUESTS TABLE */}
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
                  Khi đạt số dư tối thiểu 200.000 VNĐ, bạn có thể tạo yêu cầu rút tiền về tài khoản ngân hàng.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-secondary)', fontSize: 12 }}>
                      <th style={{ padding: '10px 12px' }}>Mã Đơn Rút</th>
                      <th style={{ padding: '10px 12px' }}>Số Tiền</th>
                      <th style={{ padding: '10px 12px' }}>Thông Tin Ngân Hàng</th>
                      <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                      <th style={{ padding: '10px 12px' }}>Ghi Chú Admin</th>
                      <th style={{ padding: '10px 12px' }}>Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                        <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent, #6366f1)' }}>#{p.code}</td>
                        <td style={{ padding: '12px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatVnd(p.amount)}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WITHDRAWAL REQUEST MODAL */}
      {showWithdrawModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Rút Tiền Hoa Hồng</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Số dư khả dụng: <span style={{ color: '#22c55e', fontWeight: 900 }}>{formatVnd(stats?.affiliateBalance || 0)}</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>VNĐ</span>
                  <input
                    type="number"
                    step="10000"
                    min="200000"
                    max={stats?.affiliateBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 16, fontWeight: 800 }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>* Tối thiểu 200.000 VNĐ cho mỗi lần rút</div>
              </div>

              {/* QUICK AMOUNT BUTTONS */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {['200000', '500000', '1000000', '2000000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: withdrawAmount === amt ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: withdrawAmount === amt ? '#818cf8' : 'var(--text-secondary)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {(Number(amt) / 1000).toLocaleString('vi-VN')}K
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(stats?.affiliateBalance || 0))}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: 8,
                    border: '1px solid #22c55e',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Tất cả
                </button>
              </div>

              {/* BANK DETAILS FORM */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={14} /> Ngân hàng nhận tiền:
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary, #0b0c10)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  {['MBBank', 'Vietcombank', 'Techcombank', 'VPBank', 'ACB', 'BIDV', 'VietinBank', 'TPBank', 'Sacombank', 'MoMo / ViettelMoney'].map((b) => (
                    <option key={b} value={b} style={{ background: '#13141f', color: '#fff' }}>
                      {b}
                    </option>
                  ))}
                </select>
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCheck size={14} /> Tên chủ tài khoản (Viết hoa không dấu):
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
                    fontWeight: 600,
                    outline: 'none',
                    textTransform: 'uppercase',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingWithdraw}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
                }}
              >
                {submittingWithdraw ? <RefreshCw size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                {submittingWithdraw ? 'Đang gửi yêu cầu...' : 'Xác Nhận Gửi Yêu Cầu Rút Tiền'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL PREVIEW */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card, #13141f)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: 20,
              maxWidth: 360,
              width: '100%',
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Mã QR Giới Thiệu</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Quét mã QR bằng camera điện thoại để truy cập link tiếp thị.</p>

            <div style={{ background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block', marginBottom: 16 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stats?.referralLink || 'https://eigu.site?ref=EIGU88X2')}`}
                alt="Referral QR Code"
                width={180}
                height={180}
                style={{ display: 'block' }}
              />
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 20 }}>Mã: {stats?.referralCode}</div>

            <button
              onClick={() => setShowQrModal(false)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary, rgba(255,255,255,0.1))',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: 10,
                padding: '10px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
