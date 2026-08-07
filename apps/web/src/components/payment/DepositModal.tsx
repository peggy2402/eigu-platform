'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, QrCode, ShieldCheck, RefreshCw, Sparkles, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import { paymentApi, authApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface DepositModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialDepositData?: any;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function DepositModal({ onClose, onSuccess, initialDepositData }: DepositModalProps) {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>('200000');
  const [loading, setLoading] = useState<boolean>(false);
  const [depositData, setDepositData] = useState<any | null>(initialDepositData || null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'EXPIRED'>('PENDING');
  const [pollCount, setPollCount] = useState<number>(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialDepositData) {
      setDepositData(initialDepositData);
      setStatus('PENDING');
    }
  }, [initialDepositData]);

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

          // Trigger balance refresh in user context immediately
          if (refreshUser) {
            refreshUser();
          } else if ((window as any).__EIGU_REFRESH_USER__) {
            (window as any).__EIGU_REFRESH_USER__();
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
  }, [depositData, status, onSuccess, refreshUser]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!mounted || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 158, 11, 0.25)',
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
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Ngân hàng VietQR • Khớp lệnh tức thì 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: 10,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT STEP 1: Select Amount */}
        {!depositData ? (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Chọn nhanh số tiền nạp:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
              {PRESET_AMOUNTS.map(amt => {
                const isSel = selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => handleSelectPreset(amt)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: '1px solid',
                      borderColor: isSel ? 'var(--accent)' : 'var(--border-color)',
                      background: isSel ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      color: isSel ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: isSel ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {amt.toLocaleString('vi-VN')}đ
                  </button>
                );
              })}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Hoặc nhập số tiền tùy chỉnh (đ):
            </label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="text"
                value={customAmount ? parseInt(customAmount, 10).toLocaleString('vi-VN') : ''}
                onChange={e => handleCustomChange(e.target.value)}
                placeholder="Ví dụ: 200.000"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 16,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                VNĐ
              </span>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={handleCreateDeposit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px var(--accent-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Đang tạo mã thanh toán QR...
                </>
              ) : (
                <>
                  Tạo mã VietQR Thanh toán <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* STEP 2: Show QR & Bank Info */
          <div>
            {status === 'COMPLETED' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={36} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', margin: 0 }}>Nạp Tiền Thành Công!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
                  Hệ thống đã khớp lệnh tự động thành công +{(depositData.amount || selectedAmount).toLocaleString('vi-VN')}đ vào tài khoản của bạn.
                </p>
                <button
                  onClick={onClose}
                  style={{
                    marginTop: 20,
                    padding: '12px 32px',
                    borderRadius: 12,
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            ) : (
              <>
                {/* Status Bar */}
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={13} className="animate-spin" /> Đang chờ chuyển khoản... (Đang kiểm tra 24/7)
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>Cập nhật mỗi 3s</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, alignItems: 'center' }}>
                  {/* Left QR Image */}
                  <div style={{ textAlign: 'center', background: '#ffffff', padding: 16, borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {depositData.qrCodeUrl ? (
                      <img
                        src={depositData.qrCodeUrl}
                        alt="SePay VietQR Code"
                        style={{ width: '100%', maxWidth: 220, height: 'auto', borderRadius: 8, display: 'block', margin: '0 auto' }}
                      />
                    ) : (
                      <div style={{ padding: 40, color: '#000' }}>Không thể tải mã QR</div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <QrCode size={12} /> Quét bằng App Ngân Hàng
                    </div>
                  </div>

                  {/* Right Bank Transfer Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Ngân hàng nhận</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{depositData.bankName || 'ACB'}</strong>
                        <button onClick={() => copyToClipboard(depositData.bankName || 'ACB', 'Ngân hàng')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 2 }}>
                          {copiedField === 'Ngân hàng' ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Số tài khoản</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'monospace' }}>{depositData.accountNumber || 'LOCSPAY000339797'}</strong>
                        <button onClick={() => copyToClipboard(depositData.accountNumber || 'LOCSPAY000339797', 'Số tài khoản')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 2 }}>
                          {copiedField === 'Số tài khoản' ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Chủ tài khoản</span>
                      <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{depositData.accountHolder || 'EIGU PLATFORM'}</strong>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Số tiền chuyển khoản</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: 16, color: '#22c55e', fontWeight: 800 }}>{(depositData.amount || selectedAmount).toLocaleString('vi-VN')}đ</strong>
                        <button onClick={() => copyToClipboard(String(depositData.amount || selectedAmount), 'Số tiền')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 2 }}>
                          {copiedField === 'Số tiền' ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'block' }}>NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1.5px dashed #f59e0b', borderRadius: 8 }}>
                        <strong style={{ fontSize: 14, color: '#f59e0b', fontFamily: 'monospace' }}>{depositData.fullContent}</strong>
                        <button onClick={() => copyToClipboard(depositData.fullContent, 'Nội dung')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                          {copiedField === 'Nội dung' ? 'Đã chép ✓' : 'Sao chép'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setDepositData(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← Chọn lại số tiền
                  </button>

                  <button
                    onClick={onClose}
                    style={{ padding: '8px 20px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
