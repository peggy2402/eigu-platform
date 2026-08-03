'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Clock,
  Zap,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  LogIn,
  User,
} from 'lucide-react';
import type { PricingTierDto } from '@eigu-platform/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { paymentApi, pricingApi } from '../../lib/api';

interface CheckoutViewProps {
  selectedCheckout: {
    tier: PricingTierDto;
    moduleSlug: string;
    moduleId?: string;
    moduleName?: string;
    payableDiffAmount?: number;
  };
  onBack: () => void;
  onSuccess?: () => void;
}

export default function CheckoutView({ selectedCheckout, onBack, onSuccess }: CheckoutViewProps) {
  const { user, token, refreshUser } = useAuth();
  const { language } = useLanguage();

  const tier = selectedCheckout.tier;
  const moduleSlug = selectedCheckout.moduleSlug;
  const listPrice = tier.price || 0;
  const isUpgrade = (selectedCheckout.payableDiffAmount || 0) > 0;
  const upgradeFee = isUpgrade ? selectedCheckout.payableDiffAmount! : listPrice;
  const currentBalance = Number(user?.balance || 0);

  const deductedBalance = Math.min(currentBalance, upgradeFee);
  const vietQRAmount = Math.max(0, upgradeFee - currentBalance);
  const isFullBalance = vietQRAmount === 0;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [depositTx, setDepositTx] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [cancelled, setCancelled] = useState(false);

  // Countdown 150 seconds (2m 30s)
  const [countdown, setCountdown] = useState<number>(150);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(language === 'en' ? `Copied ${fieldName}: ${text}` : `Đã sao chép ${fieldName}: ${text}`, 'success');
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // 1. Initialize Deposit VietQR Transaction
  const initDeposit = useCallback(async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCountdown(150);

    if (isFullBalance) {
      setDepositTx({
        code: 'PAY-BAL-' + Math.floor(Math.random() * 899999 + 100000),
        fullContent: 'Kích hoạt bằng số dư',
        accountNumber: 'N/A',
        accountHolder: 'Thanh toán bằng số dư',
        bankName: 'Số dư tài khoản',
        isFullBalance: true,
        qrCodeUrl: '',
      });
      setLoading(false);
      return;
    }

    try {
      const res = await paymentApi.createDeposit(vietQRAmount);
      if (res && (res.data || res.qrCodeUrl)) {
        setDepositTx(res.data || res);
      } else {
        throw new Error(res.message || 'Không thể tạo đơn nạp VietQR');
      }
    } catch (err: any) {
      console.error('[CheckoutView] Deposit creation error:', err);
      setError(err.message || 'Lỗi kết nối cổng thanh toán SePay');
    } finally {
      setLoading(false);
    }
  }, [isFullBalance, vietQRAmount]);

  useEffect(() => {
    initDeposit();
  }, [initDeposit]);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (isFullBalance || !depositTx) return;

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [depositTx, isFullBalance]);

  // 3. Verify & Subscribe API Trigger
  const handleVerifyAndSubscribe = useCallback(async () => {
    setSubmitting(true);
    // showToast(language === 'en' ? 'Verifying and activating subscription...' : 'Đang kiểm tra và kích hoạt gói cước...', 'info');

    try {
      const targetModuleId = selectedCheckout.moduleId || (tier as any).moduleId || selectedCheckout.moduleSlug || tier.id;
      const res = await pricingApi.subscribe(targetModuleId, tier.id);
      if (res && (res.success || res.newBalance !== undefined)) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        showToast(res.message || (language === 'en' ? 'Subscription activated successfully!' : 'Kích hoạt gói cước thành công!'), 'success');

        await refreshUser();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onBack();
        }, 1500);
      }
    } catch (err: any) {
      console.error('[VerifySubscribe] Error:', err);
      const msg = err.message || String(err);
      if (msg.includes('Số dư không đủ') || msg.includes('nạp thêm tiền') || msg.includes('Cần thanh toán')) {
        showToast(language === 'en' ? 'Payment not received yet. Please scan QR to complete!' : 'Hệ thống chưa nhận được đủ tiền nạp. Vui lòng quét mã QR để hoàn tất!', 'warning');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }, [tier.id, selectedCheckout.moduleId, language, refreshUser, onSuccess, onBack]);

  // 4. Polling Loop every 4 seconds
  useEffect(() => {
    if (isFullBalance || !depositTx) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        await refreshUser();
        const latestBal = Number(user?.balance || 0);
        if (latestBal >= upgradeFee) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          await handleVerifyAndSubscribe();
        }
      } catch (err) {
        console.warn('[CheckoutPoll] Error:', err);
      }
    }, 4000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [depositTx, isFullBalance, upgradeFee, user?.balance, refreshUser, handleVerifyAndSubscribe]);

  const mins = Math.floor(Math.max(0, countdown) / 60).toString().padStart(2, '0');
  const secs = (Math.max(0, countdown) % 60).toString().padStart(2, '0');

  if (!token || !user) {
    return (
      <div style={{
        maxWidth: 520,
        margin: '60px auto',
        padding: 36,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--accent-glow, var(--border-color))',
        borderRadius: 24,
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Icon Avatar - màu theo theme */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          border: '1.5px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--accent)',
        }}>
          <User size={32} />
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          {language === 'en' ? 'Login Required to Continue' : 'Yêu cầu Đăng nhập để tiếp tục'}
        </h3>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          {language === 'en'
            ? `Please log in or create an EIGU Platform account to subscribe to Plan ${tier.label}.`
            : `Vui lòng đăng nhập hoặc đăng ký tài khoản EIGU Platform để hoàn tất thanh toán Gói ${tier.label} cho mô-đun ${selectedCheckout.moduleName || moduleSlug.toUpperCase()}.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Nút đăng nhập - màu chủ đạo động */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/auth/login?redirect=/checkout`;
              }
            }}
            style={{
              padding: '14px 24px',
              borderRadius: 12,
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover, var(--accent))'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
          >
            <LogIn size={18} />
            <span>{language === 'en' ? 'Log In Now' : 'Đăng nhập ngay'}</span>
          </button>

          {/* Nút đăng ký - viền theo màu theme */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/auth/register?redirect=/checkout`;
              }
            }}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              fontSize: 14,
              fontWeight: 700,
              border: '1.5px solid var(--accent)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-glow)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-glow)'; }}
          >
            {language === 'en' ? 'Create a New Account' : 'Đăng ký tài khoản mới'}
          </button>

          {/* Nút quay lại */}
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {language === 'en' ? 'Back to Pricing' : 'Quay lại Bảng giá'}
          </button>
        </div>
      </div>
    );
  }

  // === Màn hình Đã hủy thanh toán ===
  if (cancelled) {
    return (
      <div style={{
        maxWidth: 520,
        margin: '80px auto',
        padding: 40,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 24,
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Icon hủy */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ef4444',
        }}>
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          {language === 'en' ? 'Payment Cancelled' : 'Đã hủy thanh toán!'}
        </h3>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 28px 0' }}>
          {language === 'en'
            ? `Your payment session for Plan ${tier.label} has been cancelled. No charges were made to your account.`
            : `Phiên thanh toán Gói ${tier.label} đã bị hủy. Không có khoản tiền nào bị trừ khỏi tài khoản của bạn.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Nút thử lại - reset toàn bộ state */}
          <button
            type="button"
            onClick={() => {
              setCancelled(false);
              setCountdown(150);
              setDepositTx(null);
              setError(null);
              initDeposit();
            }}
            style={{
              padding: '13px 24px',
              borderRadius: 12,
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover, var(--accent))'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15.5-6L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15.5 6L3 16"/>
            </svg>
            <span>{language === 'en' ? 'Try Payment Again' : 'Thử thanh toán lại'}</span>
          </button>

          {/* Nút quay lại bảng giá */}
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
          >
            {language === 'en' ? 'Back to Pricing' : 'Quay lại Bảng giá'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className="checkout-toast-banner"
          style={{
            position: 'fixed',
            top: 88,
            right: 24,
            zIndex: 9999999,
            padding: '12px 20px',
            borderRadius: 12,
            background: toastMsg.type === 'success' ? '#166534' : (toastMsg.type === 'warning' ? '#854d0e' : (toastMsg.type === 'error' ? '#991b1b' : '#1e1b4b')),
            border: `1px solid ${toastMsg.type === 'success' ? '#22c55e' : (toastMsg.type === 'warning' ? '#f59e0b' : (toastMsg.type === 'error' ? '#ef4444' : '#6366f1'))}`,
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} color="#4ade80" /> : <AlertTriangle size={18} color="#f59e0b" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Toolbar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>{language === 'en' ? 'Back to pricing plans' : 'Quay lại Bảng giá'}</span>
        </button>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 11, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '3px 10px', borderRadius: 20, fontWeight: 800 }}>
            SEPAY CHECKOUT GATEWAY
          </span>
          {depositTx?.code && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {language === 'en' ? 'Order #' : 'Đơn hàng #'}
              {depositTx.code}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--accent)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {language === 'en' ? 'Generating SePay VietQR payment...' : 'Đang khởi tạo mã thanh toán QR...'}
          </div>
          <div style={{ fontSize: 13 }}>{language === 'en' ? 'Calculating balance deduction...' : 'Đang tính toán khấu trừ số dư & kết nối cổng SePay Gateway'}</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', maxWidth: 500, margin: '40px auto', background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16 }}>
          <h3 style={{ marginTop: 0 }}>Lỗi khởi tạo đơn hàng</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</p>
          <button type="button" onClick={initDeposit} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <RefreshCw size={14} style={{ display: 'inline', marginRight: 6 }} /> Thử lại
          </button>
        </div>
      ) : (
        /* Main Responsive Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
          {/* COLUMN 1: THÔNG TIN ĐƠN HÀNG (ORDER SUMMARY) */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {language === 'en' ? 'SERVICE MODULE' : 'MÔ-ĐUN DỊCH VỤ'}
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>
                {selectedCheckout.moduleName || moduleSlug.toUpperCase()}
              </h3>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{language === 'en' ? 'Plan Tier:' : 'Gói đăng ký:'}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#818cf8' }}>Gói {tier.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{language === 'en' ? 'Billing Period:' : 'Thời hạn:'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>30 Ngày (Tự động)</span>
              </div>
            </div>

            {/* Price Details breakdown */}
            <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{language === 'en' ? 'List Price:' : 'Giá gói niêm yết:'}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{listPrice.toLocaleString('vi-VN')}đ</span>
              </div>

              {isUpgrade && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{language === 'en' ? 'Old Tier Credit:' : 'Khấu trừ gói cũ:'}</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>-{(listPrice - upgradeFee).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px dotted rgba(255,255,255,0.1)', paddingTop: 6 }}>
                    <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{language === 'en' ? 'Upgrade Price Difference:' : 'Phí nâng cấp chênh lệch:'}</span>
                    <span style={{ fontWeight: 800, color: '#a5b4fc' }}>= {upgradeFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {language === 'en' ? `Deduct current balance (${currentBalance.toLocaleString('vi-VN')}đ):` : `Trừ số dư tài khoản hiện có (${currentBalance.toLocaleString('vi-VN')}đ):`}
                </span>
                <span style={{ fontWeight: 700, color: '#22c55e' }}>-{deductedBalance.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Total VietQR payable box */}
            <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1.5px solid rgba(34, 197, 94, 0.3)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                {isFullBalance
                  ? (language === 'en' ? 'PAYABLE AMOUNT (100% COVERED BY BALANCE)' : 'SỐ TIỀN CẦN THANH TOÁN (ĐÃ KHẤU TRỪ 100%)')
                  : (language === 'en' ? 'NET PAYABLE VIA VIETQR' : 'SỐ TIỀN THỰC TẾ CẦN QUÉT QR NẠP THÊM')}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', letterSpacing: '-0.5px' }}>{vietQRAmount.toLocaleString('vi-VN')}đ</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {isFullBalance ? (language === 'en' ? 'Your balance covers full subscription' : 'Số dư của bạn đủ để kích hoạt gói ngay lập tức') : (language === 'en' ? 'Auto-activated instantly upon scanning QR' : 'Hệ thống tự động cộng tiền & kích hoạt gói ngay khi quét QR')}
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
              <ShieldCheck size={16} color="#22c55e" />
              <span>{language === 'en' ? '100% secure payment via SePay Auto Bank Gateway.' : 'Giao dịch an toàn 100% qua SePay Auto Bank Gateway.'}</span>
            </div>
          </div>

          {/* COLUMN 2: VIETQR PAYLOAD OR BALANCE ACTIVATION */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            {isFullBalance ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#22c55e' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {language === 'en' ? 'Available balance covers full cost!' : 'Số dư khả dụng đủ thanh toán!'}
                </h4>
                <p style={{ margin: '8px 0 20px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {language === 'en' ? `Your current balance: ` : `Tài khoản của bạn đang có `}<strong>{currentBalance.toLocaleString('vi-VN')}đ</strong>.<br />
                  {language === 'en' ? `Total fee for ${tier.label}: ` : `Số tiền cần trả cho gói ${tier.label}: `}<strong>{upgradeFee.toLocaleString('vi-VN')}đ</strong>.<br />
                  {language === 'en' ? 'No extra QR deposit needed!' : 'Bạn không cần nạp thêm QR!'}
                </p>

                <button
                  type="button"
                  onClick={handleVerifyAndSubscribe}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 800,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: submitting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  {submitting ? (language === 'en' ? 'Activating...' : 'Đang kích hoạt...') : `${language === 'en' ? 'Activate Plan Now' : 'Kích hoạt gói ' + tier.label + ' ngay'} (-${upgradeFee.toLocaleString('vi-VN')}đ)`}
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {language === 'en' ? `Scan VietQR to deposit ${vietQRAmount.toLocaleString('vi-VN')}đ` : `Quét mã QR để nạp thêm ${vietQRAmount.toLocaleString('vi-VN')}đ`}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    {language === 'en' ? 'Open Banking App (MBBank, Vietcombank, TPBank...) to scan QR code below' : 'Mở ứng dụng Ngân hàng (MBBank, Vietcombank, TPBank...) để quét mã bên dưới'}
                  </p>
                </div>

                {/* COUNTDOWN TIMER BOX (02:30) */}
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1.5px solid rgba(245, 158, 11, 0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={18} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {language === 'en' ? 'QR Code Expiration' : 'Thời hạn giữ mã QR'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {language === 'en' ? 'Please complete payment before timer ends (2m 30s)' : 'Vui lòng thanh toán trong thời gian đếm ngược (2p 30s)'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: countdown <= 15 ? '#ef4444' : '#f59e0b', letterSpacing: '1.5px' }}>
                    {mins}:{secs}
                  </div>
                </div>

                {/* QR Image & Bank Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
                  {/* QR Image */}
                  <div style={{ textAlign: 'center', background: '#ffffff', padding: 8, borderRadius: 10, maxWidth: 200, margin: '0 auto' }}>
                    {depositTx?.qrCodeUrl ? (
                      <img src={depositTx.qrCodeUrl} alt="VietQR Code" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }} />
                    ) : (
                      <QrCode size={120} color="#000" style={{ margin: '20px auto' }} />
                    )}
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#0f172a', marginTop: 4, letterSpacing: '0.5px' }}>
                      VIETQR &bull; SEPAY GATEWAY
                    </div>
                  </div>

                  {/* Transfer details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, display: 'block' }}>BANK:</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 13 }}>{depositTx?.bankName || 'MBBank'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, display: 'block' }}>ACCOUNT NUMBER:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ color: '#38bdf8', fontWeight: 800, fontSize: 14, letterSpacing: '0.5px' }}>{depositTx?.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(depositTx?.accountNumber || '', 'Số tài khoản')}
                          style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', borderRadius: 6, width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          {copiedField === 'Số tài khoản' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, display: 'block' }}>ACCOUNT HOLDER:</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{depositTx?.accountHolder || 'EIGU PLATFORM'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, display: 'block' }}>TRANSFER MEMO (MUST BE EXACT):</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245, 158, 11, 0.12)', border: '1.5px solid rgba(245, 158, 11, 0.4)', padding: '6px 10px', borderRadius: 8, marginTop: 2 }}>
                        <strong style={{ color: '#f59e0b', fontWeight: 900, fontSize: 13, letterSpacing: '0.5px', wordBreak: 'break-all' }}>{depositTx?.fullContent}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(depositTx?.fullContent || '', 'Cú pháp')}
                          style={{ background: '#f59e0b', border: 'none', color: '#0b0f19', borderRadius: 6, width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' }}
                        >
                          {copiedField === 'Cú pháp' ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto Listening status */}
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {language === 'en' ? 'Auto-listening for transactions... Package will activate instantly upon payment!' : 'Hệ thống đang tự động lắng nghe giao dịch... Gói cước sẽ tự động kích hoạt ngay khi nhận tiền!'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleVerifyAndSubscribe}
                    disabled={submitting}
                    style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 800, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', cursor: submitting ? 'wait' : 'pointer', minWidth: 180 }}
                  >
                    {submitting ? (language === 'en' ? 'Verifying...' : 'Đang kiểm tra...') : (language === 'en' ? 'I Have Completed Payment' : '✓ Tôi đã chuyển khoản thành công')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // Dừng tất cả timers và polling trước khi huỷ
                      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
                      if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; }
                      if (depositTx?.code) {
                        try {
                          await paymentApi.cancelDeposit(depositTx.code);
                        } catch (e) {}
                      }
                      setCancelled(true);
                    }}
                    style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, borderRadius: 10, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {language === 'en' ? 'Cancel' : 'Hủy thanh toán'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
