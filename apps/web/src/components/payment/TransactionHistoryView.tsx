'use client';

import { useEffect, useState } from 'react';
import { paymentApi } from '../../lib/api';
import { Wallet, RefreshCw, CheckCircle2, Clock, XCircle, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import DepositModal from './DepositModal';

export default function TransactionHistoryView() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.getMyTransactions();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (e) {
      console.warn('Lỗi nạp lịch sử giao dịch:', e);
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
            <CheckCircle2 size={13} /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
            <Clock size={13} className="animate-spin" /> Đang chờ
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
            <XCircle size={13} /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
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

      {/* Table & Cards container */}
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
        <div className="table-wrapper" style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
          <table style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
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
      )}
    </div>
  );
}
