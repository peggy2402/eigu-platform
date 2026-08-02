'use client';

import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, CheckCircle2, Clock, XCircle, Copy, Check } from 'lucide-react';
import { paymentApi } from '../../lib/api';
import DepositModal from './DepositModal';

export default function TransactionHistoryView() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getMyTransactions();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error('[PaymentHistory] Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
            <CheckCircle2 size={12} /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
            <Clock size={12} /> Đang chờ
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
            <XCircle size={12} /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        @media (min-width: 769px) {
          .tx-desktop-table { display: block !important; }
          .tx-mobile-cards { display: none !important; }
        }
        @media (max-width: 768px) {
          .tx-desktop-table { display: none !important; }
          .tx-mobile-cards { display: flex !important; }
        }
      `}</style>

      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => fetchTransactions()}
        />
      )}

      {/* Header section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet style={{ color: 'var(--accent)' }} /> Lịch sử Nạp tiền SePay
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Quản lý và đối soát tự động toàn bộ giao dịch ngân hàng VietQR của bạn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={fetchTransactions}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>

          <button
            onClick={() => setShowDepositModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'var(--accent)', color: '#ffffff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)' }}
          >
            + Nạp tiền ngay
          </button>
        </div>
      </div>

      {/* Loading / Empty / Data */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải lịch sử giao dịch...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
          <Wallet size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>Chưa có giao dịch nạp tiền nào</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
            Bấm nút "Nạp tiền ngay" để tạo mã QR SePay và bắt đầu sử dụng dịch vụ.
          </p>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Nạp tiền ngay
          </button>
        </div>
      ) : (
        <>
          {/* 1. DESKTOP TABLE VIEW */}
          <div className="tx-desktop-table" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Mã đơn</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Nội dung chuyển khoản</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Số tiền</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Ngân hàng</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        #{item.code}
                        <button onClick={() => copyCode(item.code)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                          {copiedCode === item.code ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                        </button>
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>
                      {item.fullContent}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: item.status === 'COMPLETED' ? '#22c55e' : 'var(--text-primary)' }}>
                      +{item.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {item.bankName}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE CARD LIST VIEW */}
          <div className="tx-mobile-cards" style={{ flexDirection: 'column', gap: 12 }}>
            {transactions.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header: Order Code & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                    <span>#{item.code}</span>
                    <button
                      onClick={() => copyCode(item.code)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                    >
                      {copiedCode === item.code ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {/* Amount & Bank */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Số tiền nạp</span>
                    <strong style={{ fontSize: 16, fontWeight: 800, color: item.status === 'COMPLETED' ? '#22c55e' : 'var(--accent)' }}>
                      +{item.amount.toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Ngân hàng</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.bankName || 'ACB'}</span>
                  </div>
                </div>

                {/* Transfer Note & Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cú pháp:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{item.fullContent}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Thời gian:</span>
                    <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
