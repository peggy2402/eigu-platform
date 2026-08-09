'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Users,
  MousePointerClick,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';
import type { AffiliatePayoutDto, AdminAffiliateStatsDto } from '@eigu-platform/shared';

interface AdminAffiliatePayoutsViewProps {
  token?: string;
}

export const AdminAffiliatePayoutsView: React.FC<AdminAffiliatePayoutsViewProps> = ({ token }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [payouts, setPayouts] = useState<AffiliatePayoutDto[]>([]);
  const [stats, setStats] = useState<AdminAffiliateStatsDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal Action state
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayoutDto | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

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

  const fetchStats = useCallback(async () => {
    try {
      const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.ADMIN_STATS}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) return;
      const data: AdminAffiliateStatsDto = await res.json();
      setStats(data);
    } catch (err) {
      console.error('[AdminAffiliatePayoutsView] Error fetching admin stats:', err);
    }
  }, [getHeaders]);

  const fetchPayouts = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.ADMIN_PAYOUTS}?status=${statusFilter}&page=${p}&limit=15`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPayouts(data.items || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error('[AdminAffiliatePayoutsView] Error fetching admin payouts:', err);
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, statusFilter],
  );

  useEffect(() => {
    fetchStats();
    fetchPayouts(page);
  }, [fetchStats, fetchPayouts, page, statusFilter]);

  const handleActionClick = (payout: AffiliatePayoutDto, type: 'APPROVED' | 'REJECTED') => {
    setSelectedPayout(payout);
    setActionType(type);
    setAdminNote(type === 'APPROVED' ? 'Đã chuyển khoản qua VietQR MBBank' : 'Từ chối rút tiền, hoàn lại số dư');
  };

  const handleConfirmAction = async () => {
    if (!selectedPayout || !actionType) return;

    try {
      setProcessing(true);
      const url = `${getApiBaseUrl()}${API_ENDPOINTS.AFFILIATE.ADMIN_PAYOUT_STATUS(selectedPayout.id)}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: actionType,
          adminNote: adminNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái');
      }

      showToast(
        actionType === 'APPROVED' ? 'Đã duyệt chuyển khoản' : 'Đã từ chối đơn rút tiền',
        `Đơn #${selectedPayout.code} (${selectedPayout.amount.toLocaleString('vi-VN')} VNĐ) đã được cập nhật.`,
        actionType === 'APPROVED' ? 'success' : 'warning',
      );

      setSelectedPayout(null);
      setActionType(null);
      fetchStats();
      fetchPayouts(page);
    } catch (err: any) {
      showToast('Lỗi xử lý', err.message || 'Vui lòng thử lại', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER & ADMIN STATS GRID */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🛡️ Quản Lý Yêu Cầu Rút Tiền Affiliate (Backoffice Console)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Xem và phê duyệt các yêu cầu rút tiền hoa hồng tiếp thị liên kết từ người dùng toàn hệ thống.
            </p>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchPayouts(page);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* 4 ADMIN METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Chờ Duyệt Rút Tiền</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#eab308', marginTop: 4 }}>
              {stats?.pendingPayoutsCount || 0} đơn ({formatVnd(stats?.totalPendingPayoutsAmount || 0)})
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Hoa Hồng Đã Chi Trả</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', marginTop: 4 }}>
              {formatVnd(stats?.totalCommissionsPaid || 0)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Thành Viên Giới Thiệu</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#818cf8', marginTop: 4 }}>
              {stats?.totalReferredUsers.toLocaleString('vi-VN') || 0} user
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Lượt Click Link</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>
              {stats?.totalReferralClicks.toLocaleString('vi-VN') || 0} clicks
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'PENDING', label: 'Chờ Duyệt' },
              { id: 'APPROVED', label: 'Đã Duyệt' },
              { id: 'REJECTED', label: 'Từ Chối' },
              { id: 'all', label: 'Tất Cả' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setStatusFilter(f.id);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid var(--border-color)',
                  background: statusFilter === f.id ? 'var(--accent, #6366f1)' : 'transparent',
                  color: statusFilter === f.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* PAYOUTS TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Đang tải danh sách đơn rút tiền...</div>
          </div>
        ) : payouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <Wallet size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>Không tìm thấy đơn rút tiền nào</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 12 }}>
                  <th style={{ padding: '10px 12px' }}>Mã Đơn</th>
                  <th style={{ padding: '10px 12px' }}>Người Yêu Cầu</th>
                  <th style={{ padding: '10px 12px' }}>Số Tiền</th>
                  <th style={{ padding: '10px 12px' }}>Ngân Hàng & STK</th>
                  <th style={{ padding: '10px 12px' }}>Tên Chủ TK</th>
                  <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 12px' }}>Ghi Chú</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent, #6366f1)' }}>#{p.code}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.userEmail}</div>
                      {p.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{p.username}</div>}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 900, color: '#22c55e' }}>{formatVnd(p.amount)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.bankName}</div>
                      <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 800, fontFamily: 'monospace' }}>{p.accountNumber}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, textTransform: 'uppercase' }}>{p.accountHolder}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
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
                        {p.status === 'APPROVED' ? 'Đã duyệt' : p.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: 12 }}>{p.adminNote || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {p.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleActionClick(p, 'APPROVED')}
                            style={{
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Duyệt Rút
                          </button>
                          <button
                            onClick={() => handleActionClick(p, 'REJECTED')}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Từ Chối
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIN ACTION CONFIRM MODAL */}
      {selectedPayout && actionType && (
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
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
              {actionType === 'APPROVED' ? '✅ Duyệt Đơn Rút Tiền' : '❌ Từ Chối Đơn Rút Tiền'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Bạn đang {actionType === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'} đơn <strong>#{selectedPayout.code}</strong> số tiền{' '}
              <strong style={{ color: '#22c55e' }}>{formatVnd(selectedPayout.amount)}</strong> cho user{' '}
              <strong>{selectedPayout.userEmail}</strong>.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Ghi chú xử lý (Admin Note):</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: 10,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
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
                type="button"
                disabled={processing}
                onClick={handleConfirmAction}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  background: actionType === 'APPROVED' ? '#22c55e' : '#ef4444',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {processing ? 'Đang xử lý...' : actionType === 'APPROVED' ? 'Xác Nhận Duyệt' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
