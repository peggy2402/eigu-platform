'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, RefreshCw, Sparkles, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import { paymentApi, authApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface DepositModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function DepositModal({ onClose, onSuccess }: DepositModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedAmount, setSelectedAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>('200000');
  const [loading, setLoading] = useState<boolean>(false);
  const [depositData, setDepositData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'EXPIRED'>('PENDING');
  const [pollCount, setPollCount] = useState<number>(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize preset with custom input
  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCustomAmount(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      setSelectedAmount(num);
    } else {
      setSelectedAmount(0);
    }
  };

  // 1. Send API to create deposit QR code
  const handleCreateDeposit = async () => {
    const amt = parseInt(customAmount, 10);
    if (!amt || amt < 10000) {
      setError('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await paymentApi.createDeposit(amt);
      if (res) {
        setDepositData(res);
        setStatus('PENDING');
      }
    } catch (err: any) {
      let msg = err.message || '';
      if (msg.includes('Prisma') || msg.includes('database') || msg.includes('invocation') || msg.includes('public.')) {
        msg = 'Hệ thống đang bảo trì kết nối CSDL. Vui lòng thử lại sau ít phút.';
      }
      setError(msg || 'Lỗi tạo mã thanh toán QR');
    } finally {
      setLoading(false);
    }
  };

  // 2. Real-time Status Polling (every 3 seconds)
  useEffect(() => {
    if (!depositData || status === 'COMPLETED') return;

    const checkPaymentStatus = async () => {
      try {
        const res = await paymentApi.checkStatus(depositData.code);
        if (res && res.status === 'COMPLETED') {
          setStatus('COMPLETED');
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);

          // Trigger balance refresh in user context
          try {
            const meRes = await authApi.getMe();
            if (meRes && meRes.user && (window as any).__EIGU_REFRESH_USER__) {
              (window as any).__EIGU_REFRESH_USER__();
            }
          } catch {
            // ignore
          }

          if (onSuccess) onSuccess();
        }
      } catch (e) {
        console.warn('Checking deposit status error:', e);
      }
    };

    pollTimerRef.current = setInterval(() => {
      setPollCount(c => c + 1);
      checkPaymentStatus();
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [depositData, status, onSuccess]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15)',
          padding: 24,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Nạp tiền tự động</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ngân hàng VietQR • Khớp lệnh tức thì 24/7</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= STEP 1: SELECT AMOUNT ================= */}
        {!depositData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                Chọn nhanh hạn mức nạp (VNĐ):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: selectedAmount === amt ? 'var(--accent)' : 'var(--bg-primary)',
                      color: selectedAmount === amt ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${selectedAmount === amt ? 'var(--accent)' : 'var(--border-color)'}`,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {amt.toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                Hoặc nhập số tiền tùy chỉnh:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={customAmount ? parseInt(customAmount, 10).toLocaleString('vi-VN') : ''}
                  onChange={e => handleCustomChange(e.target.value)}
                  placeholder="Ví dụ: 100.000"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    fontWeight: 800,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>VNĐ</span>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 13 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCreateDeposit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent), #f59e0b)',
                color: '#ffffff',
                border: 'none',
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 8px 24px var(--accent-glow)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Đang tạo mã VietQR...
                </>
              ) : (
                <>
                  Tạo mã VietQR nạp tiền <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= STEP 2: DISPLAY VIETQR & SEPAY INFO ================= */}
        {depositData && status !== 'COMPLETED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status indicator banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                <RefreshCw size={15} style={{ animation: 'spin 2s linear infinite' }} />
                <span>Đang chờ chuyển khoản... (Đang kiểm tra 24/7)</span>
              </div>
              <span style={{ fontSize: 11, opacity: 0.8 }}>Cập nhật mỗi 3s</span>
            </div>

            {/* QR Code + Bank Details Grid */}
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              {/* QR Image Box */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff', padding: 12, borderRadius: 16, border: '1px solid var(--border-color)' }}>
                <img
                  src={depositData.qrCodeUrl}
                  alt="VietQR SePay"
                  style={{ width: '100%', maxWidth: 210, aspectRatio: '1/1', objectFit: 'contain', borderRadius: 8 }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#000000', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <QrCode size={12} /> Quét bằng App Ngân Hàng
                </span>
              </div>

              {/* Bank Copy Details */}
              <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Bank Name */}
                <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ngân hàng nhận</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{depositData.bankName}</span>
                    <button onClick={() => copyToClipboard(depositData.bankName, 'bank')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                      {copiedField === 'bank' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Số tài khoản</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{depositData.accountNumber}</span>
                    <button onClick={() => copyToClipboard(depositData.accountNumber, 'acc')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                      {copiedField === 'acc' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Account Holder */}
                <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Chủ tài khoản</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{depositData.accountHolder}</div>
                </div>

                {/* Amount */}
                <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Số tiền chuyển khoản</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#22c55e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{depositData.amount.toLocaleString('vi-VN')}đ</span>
                    <button onClick={() => copyToClipboard(depositData.amount.toString(), 'amount')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                      {copiedField === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* TRANSFER CONTENT (EIGU{{username}}{{code}}) */}
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px 12px', borderRadius: 10, border: '2px dashed var(--accent)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800 }}>NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ letterSpacing: '0.5px' }}>{depositData.fullContent}</span>
                    <button
                      onClick={() => copyToClipboard(depositData.fullContent, 'content')}
                      style={{ background: 'var(--accent)', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {copiedField === 'content' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'content' ? 'Đã copy' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              ⚠️ Lưu ý: Quý khách vui lòng nhập đúng chính xác 100% <strong>Nội dung chuyển khoản</strong> để hệ thống SePay tự động cộng tiền sau 10-30 giây.
            </div>

            <button
              onClick={() => { setDepositData(null); setStatus('PENDING'); }}
              style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              ← Thay đổi số tiền nạp khác
            </button>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS CELEBRATION ================= */}
        {status === 'COMPLETED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 12px', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={36} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Nạp tiền thành công!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
                Giao dịch SePay tự động đã hoàn tất. Số dư tài khoản đã được cập nhật thành công.
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 14, width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mã đơn nạp: #{depositData?.code}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e', margin: '6px 0' }}>
                +{depositData?.amount?.toLocaleString('vi-VN')}đ
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Tài khoản: {user?.username || user?.email}</div>
            </div>

            <button
              onClick={onClose}
              style={{ width: '100%', maxWidth: 360, padding: '12px', borderRadius: 12, background: 'var(--accent)', color: '#ffffff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Hoàn tất & Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
