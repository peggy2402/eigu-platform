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
  Settings,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';
import type { AffiliatePayoutDto, AdminAffiliateStatsDto, AdminAffiliateConfigDto } from '@eigu-platform/shared';

import { affiliateApi } from '../../lib/api';

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

  // Config state
  const [configRate, setConfigRate] = useState<number>(15);
  const [configMinPayout, setConfigMinPayout] = useState<number>(200000);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Modal Action state
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayoutDto | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    try {
      const data: AdminAffiliateStatsDto = await affiliateApi.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('[AdminAffiliatePayoutsView] Error fetching admin stats:', err);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const data: AdminAffiliateConfigDto = await affiliateApi.getAdminConfig();
      if (data.commissionRate !== undefined) setConfigRate(data.commissionRate);
      if (data.minPayoutThreshold !== undefined) setConfigMinPayout(data.minPayoutThreshold);
    } catch (err) {
      console.error('[AdminAffiliatePayoutsView] Error fetching admin config:', err);
    }
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configRate < 1 || configRate > 90) {
      showToast('Tỷ lệ hoa hồng không hợp lệ', 'Tỷ lệ hoa hồng phải từ 1% đến 90%', 'warning');
      return;
    }
    if (configMinPayout < 50000) {
      showToast('Hạn mức rút không hợp lệ', 'Hạn mức rút tối thiểu phải từ 50.000 VNĐ', 'warning');
      return;
    }

    try {
      setSavingConfig(true);
      await affiliateApi.saveAdminConfig({
        commissionRate: Number(configRate),
        minPayoutThreshold: Number(configMinPayout),
      });

      showToast('Lưu cấu hình thành công!', `Hoa hồng: ${configRate}% | Rút tối thiểu: ${configMinPayout.toLocaleString('vi-VN')} VNĐ`, 'success');
    } catch (err: any) {
      showToast('Lỗi lưu cấu hình', err.message || 'Vui lòng thử lại', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchPayouts = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        const data = await affiliateApi.getAdminPayouts(p, 15, statusFilter);
        setPayouts(data.items || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error('[AdminAffiliatePayoutsView] Error fetching admin payouts:', err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchStats();
    fetchConfig();
    fetchPayouts(page);
  }, [fetchStats, fetchConfig, fetchPayouts, page, statusFilter]);

  const handleActionClick = (payout: AffiliatePayoutDto, type: 'APPROVED' | 'REJECTED') => {
    setSelectedPayout(payout);
    setActionType(type);
    setAdminNote(type === 'APPROVED' ? 'Đã chuyển khoản qua Internet Banking' : 'Từ chối rút tiền, hoàn lại số dư');
  };

  const handleConfirmAction = async () => {
    if (!selectedPayout || !actionType) return;

    try {
      setProcessing(true);
      await affiliateApi.updateAdminPayoutStatus(selectedPayout.id, actionType, adminNote.trim());

      showToast(
        actionType === 'APPROVED' ? 'Đã duyệt đơn rút tiền!' : 'Đã từ chối đơn rút tiền!',
        `Đơn #${selectedPayout.code} đã được xử lý.`,
        'success',
      );

      setSelectedPayout(null);
      setActionType(null);
      fetchStats();
      fetchPayouts(page);
    } catch (err: any) {
      showToast('Xử lý thất bại', err.message || 'Vui lòng thử lại', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div style={{ padding: '0 0 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER & ADMIN STATS GRID */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 12, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
              <ShieldCheck size={13} /> Admin Only • Financial Payout Console
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Quản Lý Yêu Cầu Rút Tiền Affiliate
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Kiểm tra thông tin tài khoản ngân hàng và phê duyệt chuyển khoản hoa hồng cho thành viên.
            </p>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchConfig();
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
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

        {/* ADMIN CONFIG CARD */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={16} /> Cấu Hình Tỷ Lệ Hoa Hồng & Hạn Mức Rút Tiền Hệ Thống
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Thay đổi sẽ áp dụng tức thì cho các đơn hàng và đơn rút mới.</p>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>% Hoa hồng:</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={configRate}
                  onChange={(e) => setConfigRate(Number(e.target.value))}
                  style={{ width: 70, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 800, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Rút tối thiểu:</label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  value={configMinPayout}
                  onChange={(e) => setConfigMinPayout(Number(e.target.value))}
                  style={{ width: 120, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 800, textAlign: 'right', outline: 'none' }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>VNĐ</span>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'var(--accent, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {savingConfig ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                Lưu Cấu Hình
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & PAYOUT TABLE */}
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
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === f.id ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                  color: statusFilter === f.id ? '#eab308' : 'var(--text-secondary)',
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
            <Wallet size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>Không tìm thấy yêu cầu rút tiền nào phù hợp.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 12 }}>
                  <th style={{ padding: '10px 12px' }}>Mã Đơn</th>
                  <th style={{ padding: '10px 12px' }}>Thành Viên</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số Tiền</th>
                  <th style={{ padding: '10px 12px' }}>Ngân Hàng & STK</th>
                  <th style={{ padding: '10px 12px' }}>Chủ Tài Khoản</th>
                  <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 12px' }}>Thời Gian</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent)' }}>#{p.code}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.userEmail || 'N/A'}</div>
                      {p.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{p.username}</div>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>
                      {formatVnd(p.amount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.bankName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.accountNumber}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {p.accountHolder}
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
                        {p.status === 'APPROVED' ? 'Đã duyệt' : p.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(p.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {p.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => handleActionClick(p, 'APPROVED')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid rgba(34, 197, 94, 0.4)',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={13} /> Duyệt
                          </button>
                          <button
                            onClick={() => handleActionClick(p, 'REJECTED')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <XCircle size={13} /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTION CONFIRMATION MODAL */}
      {selectedPayout && actionType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {actionType === 'APPROVED' ? (
                  <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
                ) : (
                  <XCircle size={24} style={{ color: '#ef4444' }} />
                )}
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {actionType === 'APPROVED' ? 'Phê Duyệt Đơn Rút Tiền' : 'Từ Chối Đơn Rút Tiền'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.6 }}>
              <div><strong>Mã đơn:</strong> #{selectedPayout.code}</div>
              <div><strong>Người rút:</strong> {selectedPayout.userEmail}</div>
              <div><strong>Số tiền rút:</strong> <span style={{ color: '#22c55e', fontWeight: 900 }}>{formatVnd(selectedPayout.amount)}</span></div>
              <div><strong>Ngân hàng:</strong> {selectedPayout.bankName} - <strong>STK:</strong> {selectedPayout.accountNumber}</div>
              <div><strong>Chủ tài khoản:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{selectedPayout.accountHolder}</span></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Ghi chú phê duyệt / Mã giao dịch ngân hàng:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập ghi chú gửi cho người dùng..."
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
