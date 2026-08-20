'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  X,
  Search,
  FileSearch,
  ShieldCheck,
  User,
  ArrowRight,
  ArrowLeft,
  Settings,
  Info,
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Config state
  const [configRate, setConfigRate] = useState<number>(15);
  const [configMinPayout, setConfigMinPayout] = useState<number>(200000);
  const [configFeePercent, setConfigFeePercent] = useState<number>(0);
  const [configFeeFixed, setConfigFeeFixed] = useState<number>(0);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Modal Action state (Approve/Reject)
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayoutDto | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Modal Audit Trail state (Tra Cứu Dòng Tiền)
  const [auditData, setAuditData] = useState<any | null>(null);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditTab, setAuditTab] = useState<'summary' | 'orders'>('summary');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (data.payoutFeePercent !== undefined) setConfigFeePercent(data.payoutFeePercent);
      if (data.payoutFeeFixed !== undefined) setConfigFeeFixed(data.payoutFeeFixed);
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
    if (configFeePercent < 0 || configFeePercent > 50) {
      showToast('Phí rút tiền không hợp lệ', '% Phí rút phải từ 0% đến 50%', 'warning');
      return;
    }
    if (configFeeFixed < 0) {
      showToast('Phí cố định không hợp lệ', 'Phí cố định không được âm', 'warning');
      return;
    }

    try {
      setSavingConfig(true);
      await affiliateApi.saveAdminConfig({
        commissionRate: Number(configRate),
        minPayoutThreshold: Number(configMinPayout),
        payoutFeePercent: Number(configFeePercent),
        payoutFeeFixed: Number(configFeeFixed),
      });

      showToast(
        'Lưu cấu hình thành công!',
        `Hoa hồng: ${configRate}% | Rút tối thiểu: ${configMinPayout.toLocaleString('vi-VN')}đ | Phí: ${configFeePercent}% + ${configFeeFixed.toLocaleString('vi-VN')}đ`,
        'success',
      );
    } catch (err: any) {
      showToast('Lỗi lưu cấu hình', err.message || 'Vui lòng thử lại', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchPayouts = useCallback(
    async (p = 1, query = searchQuery) => {
      try {
        setLoading(true);
        const data = await affiliateApi.getAdminPayouts(p, 15, statusFilter, query);
        setPayouts(data.items || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error('[AdminAffiliatePayoutsView] Error fetching admin payouts:', err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchQuery],
  );

  const openAuditModal = async (payoutId: string) => {
    try {
      setLoadingAudit(true);
      setShowAuditModal(true);
      const res = await affiliateApi.getAdminPayoutAudit(payoutId);
      setAuditData(res);
    } catch (err: any) {
      showToast('Không thể tra cứu dòng tiền', err.message || 'Vui lòng thử lại sau', 'error');
      setShowAuditModal(false);
    } finally {
      setLoadingAudit(false);
    }
  };

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
            <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* 4 ADMIN METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Chờ Duyệt Rút Tiền</div>
            <div style={{ fontSize: 'clamp(16px, 3.2vw, 20px)', fontWeight: 900, color: '#eab308', marginTop: 4 }}>
              {stats?.pendingPayoutsCount || 0} đơn ({formatVnd(stats?.totalPendingPayoutsAmount || 0)})
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Hoa Hồng Đã Chi Trả</div>
            <div style={{ fontSize: 'clamp(16px, 3.2vw, 20px)', fontWeight: 900, color: '#22c55e', marginTop: 4 }}>
              {formatVnd(stats?.totalCommissionsPaid || 0)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Thành Viên Giới Thiệu</div>
            <div style={{ fontSize: 'clamp(16px, 3.2vw, 20px)', fontWeight: 900, color: '#818cf8', marginTop: 4 }}>
              {stats?.totalReferredUsers.toLocaleString('vi-VN') || 0} user
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Lượt Click Link</div>
            <div style={{ fontSize: 'clamp(16px, 3.2vw, 20px)', fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>
              {stats?.totalReferralClicks.toLocaleString('vi-VN') || 0} clicks
            </div>
          </div>
        </div>

        {/* ADMIN CONFIG CARD */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={15} /> Cấu Hình Tiếp Thị Liên Kết & Phí Rút Tiền Hệ Thống
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                Tùy chỉnh tỷ lệ chiết khấu, hạn mức rút tối thiểu và phí xử lý giao dịch.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%', maxWidth: 680 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 1 110px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>% Hoa hồng:</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={configRate}
                  onChange={(e) => setConfigRate(Number(e.target.value))}
                  style={{ width: '100%', maxWidth: 55, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 6px', color: 'var(--text-primary)', fontSize: 12, fontWeight: 800, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 1 140px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Rút tối thiểu:</label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  value={configMinPayout}
                  onChange={(e) => setConfigMinPayout(Number(e.target.value))}
                  style={{ width: '100%', maxWidth: 95, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 6px', color: 'var(--text-primary)', fontSize: 12, fontWeight: 800, textAlign: 'right', outline: 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>đ</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 1 100px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>% Phí rút:</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={configFeePercent}
                  onChange={(e) => setConfigFeePercent(Number(e.target.value))}
                  style={{ width: '100%', maxWidth: 50, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 6px', color: 'var(--text-primary)', fontSize: 12, fontWeight: 800, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 1 130px' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Phí cố định:</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={configFeeFixed}
                  onChange={(e) => setConfigFeeFixed(Number(e.target.value))}
                  style={{ width: '100%', maxWidth: 80, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 6px', color: 'var(--text-primary)', fontSize: 12, fontWeight: 800, textAlign: 'right', outline: 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>đ</span>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: 'var(--accent, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                {savingConfig ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                Lưu
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS, SEARCH & PAYOUT TABLE */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', padding: '4px 2px', WebkitOverflowScrolling: 'touch' }}>
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
                className={`affiliate-tab-btn-admin ${statusFilter === f.id ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: 11, borderRadius: 8 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tra cứu mã đơn, email, STK..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setPage(1);
                fetchPayouts(1, val);
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 10px 6px 30px',
                fontSize: 12,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
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
            <div>Không tìm thấy yêu cầu rút tiền nào phù hợp với từ khóa tra cứu.</div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 12 }}>
                    <th style={{ padding: '10px 12px' }}>Mã Đơn</th>
                    <th style={{ padding: '10px 12px' }}>Thành Viên</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số Tiền Rút</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Phí Rút</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thực Nhận</th>
                    <th style={{ padding: '10px 12px' }}>Ngân Hàng & STK</th>
                    <th style={{ padding: '10px 12px' }}>Chủ Tài Khoản</th>
                    <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                    <th style={{ padding: '10px 12px' }}>Thời Gian</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao Tác & Xác Minh</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const fee = Number(p.fee || 0);
                    const netAmount = Number(p.netAmount || (Number(p.amount) - fee));
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent)' }}>#{p.code}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.userEmail || 'N/A'}</div>
                          {p.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{p.username}</div>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {formatVnd(p.amount)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: fee > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {fee > 0 ? `-${formatVnd(fee)}` : '0đ (Miễn phí)'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>
                          {formatVnd(netAmount)}
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
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => openAuditModal(p.id)}
                              title="Tra cứu nguồn gốc tiền hoa hồng & F1"
                              style={{
                                padding: '5px 9px',
                                borderRadius: 8,
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--accent, #6366f1)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <FileSearch size={13} /> Tra cứu
                            </button>

                            {p.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleActionClick(p, 'APPROVED')}
                                  style={{
                                    padding: '5px 9px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    color: '#22c55e',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  <CheckCircle2 size={12} /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleActionClick(p, 'REJECTED')}
                                  style={{
                                    padding: '5px 9px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  <XCircle size={12} /> Từ chối
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE / SMALL SCREEN CARD LIST */}
            <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {payouts.map((p) => {
                const fee = Number(p.fee || 0);
                const netAmount = Number(p.netAmount || (Number(p.amount) - fee));
                return (
                  <div key={p.id} style={{ background: 'var(--bg-primary, #0b0c10)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13 }}>#{p.code}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(p.createdAt).toLocaleString('vi-VN')}</div>
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

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Số tiền rút:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{formatVnd(p.amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phí xử lý:</span>
                        <span style={{ fontSize: 12, color: fee > 0 ? '#ef4444' : 'var(--text-muted)' }}>{fee > 0 ? `-${formatVnd(fee)}` : 'Miễn phí'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Thực nhận về STK:</span>
                        <span style={{ fontWeight: 900, color: '#22c55e', fontSize: 16 }}>{formatVnd(netAmount)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}>
                        {p.userEmail || 'N/A'} {p.username && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>@{p.username}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <strong>{p.bankName}</strong>: {p.accountNumber} ({p.accountHolder})
                      </div>
                    </div>

                    {/* MOBILE ACTIONS: 2 ROWS (ROW 1: AUDIT FULL WIDTH, ROW 2: APPROVE/REJECT 50-50) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                      <button
                        onClick={() => openAuditModal(p.id)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 9,
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.35)',
                          color: 'var(--accent, #6366f1)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxSizing: 'border-box',
                        }}
                      >
                        <FileSearch size={14} /> Tra cứu dòng tiền (Audit Trail)
                      </button>

                      {p.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                          <button
                            onClick={() => handleActionClick(p, 'APPROVED')}
                            style={{
                              flex: 1,
                              padding: '9px 12px',
                              borderRadius: 9,
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <CheckCircle2 size={14} /> Duyệt
                          </button>
                          <button
                            onClick={() => handleActionClick(p, 'REJECTED')}
                            style={{
                              flex: 1,
                              padding: '9px 12px',
                              borderRadius: 9,
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#ef4444',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <XCircle size={14} /> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* AUDIT TRAIL MODAL (BẰNG CHỨNG & NGUỒN GỐC DÒNG TIỀN) */}
      {showAuditModal && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
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
              maxWidth: 760,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Quay Lại (Back) button on top left */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAuditModal(false);
                    setAuditData(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Bằng Chứng & Nguồn Gốc Dòng Tiền (Audit Trail)
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Xác minh tính minh bạch và nguồn tiền nạp thực tế từ F1
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAuditModal(false);
                  setAuditData(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingAudit ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                <div>Đang tra cứu dữ liệu kế toán và lịch sử giao dịch F1...</div>
              </div>
            ) : auditData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 2-TAB NAVIGATION HEADER */}
                <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 10, overflowX: 'auto', padding: '2px 2px 10px 2px' }}>
                  <button
                    type="button"
                    onClick={() => setAuditTab('summary')}
                    className={`affiliate-tab-btn ${auditTab === 'summary' ? 'active' : ''}`}
                    style={{ padding: '8px 14px', fontSize: 12, borderRadius: 10 }}
                  >
                    <Info size={14} /> 1. Thông Tin Chung
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditTab('orders')}
                    className={`affiliate-tab-btn ${auditTab === 'orders' ? 'active' : ''}`}
                    style={{ padding: '8px 14px', fontSize: 12, borderRadius: 10 }}
                  >
                    <FileSearch size={14} /> 2. Chi Tiết Đơn Hàng F1 ({auditData.commissions.length})
                  </button>
                </div>

                {/* TAB 1: THÔNG TIN CHUNG */}
                {auditTab === 'summary' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* User & Payout Summary Card */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Người yêu cầu rút:</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14, wordBreak: 'break-all' }}>{auditData.user.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>Mã ref: <strong>{auditData.user.referralCode}</strong></div>
                      </div>

                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Số tiền yêu cầu rút:</div>
                        <div style={{ fontWeight: 900, color: '#22c55e', fontSize: 18 }}>{formatVnd(auditData.payout.amount)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Phí: {auditData.payout.fee > 0 ? formatVnd(auditData.payout.fee) : 'Miễn phí'} | Thực nhận: <strong>{formatVnd(auditData.payout.netAmount || (auditData.payout.amount - (auditData.payout.fee || 0)))}</strong>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Tổng tiền F1 nạp thực tế:</div>
                        <div style={{ fontWeight: 900, color: '#3b82f6', fontSize: 18 }}>
                          {formatVnd(auditData.summary.totalOrderAmountByDownlines)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Từ {auditData.summary.totalDownlineOrdersCount} đơn hàng của F1
                        </div>
                      </div>
                    </div>

                    {/* Security Verification Verdict */}
                    <div style={{
                      background: auditData.summary.isLegitBalance ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${auditData.summary.isLegitBalance ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}>
                      <ShieldCheck size={20} style={{ color: auditData.summary.isLegitBalance ? '#22c55e' : '#ef4444', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: auditData.summary.isLegitBalance ? '#22c55e' : '#ef4444' }}>
                          {auditData.summary.isLegitBalance ? 'Xác Minh Dòng Tiền: HỢP LỆ (TIỀN THẬT 100%)' : 'CẢNH BÁO: CÓ DẤU HIỆU BẤT THƯỜNG'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                          Tổng hoa hồng tích lũy của tài khoản là <strong>{formatVnd(auditData.user.totalCommissionEarned)}</strong>, sinh ra từ doanh thu nạp thực tế <strong>{formatVnd(auditData.summary.totalOrderAmountByDownlines)}</strong> của tuyến dưới. Số tiền yêu cầu rút <strong>{formatVnd(auditData.payout.amount)}</strong> nằm hoàn toàn trong hạn mức được phép chi trả.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CHI TIẾT ĐƠN HÀNG CỦA F1 */}
                {auditTab === 'orders' && (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                      Chi Tiết Các Đơn Hàng Của F1 Tạo Ra Hoa Hồng Này:
                    </h4>
                    {auditData.commissions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-primary)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                        Không có lịch sử đơn hàng F1.
                      </div>
                    ) : (
                      <>
                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block" style={{ overflowX: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '8px 10px' }}>Mã HH</th>
                                <th style={{ padding: '8px 10px' }}>Thành Viên F1 Mua/Nạp</th>
                                <th style={{ padding: '8px 10px' }}>Nguồn</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right' }}>F1 Đã Trả</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center' }}>%</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Hoa Hồng</th>
                                <th style={{ padding: '8px 10px' }}>Thời Gian</th>
                              </tr>
                            </thead>
                            <tbody>
                              {auditData.commissions.map((c: any) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,250,0.05)' }}>
                                  <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--accent)' }}>#{c.code}</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.buyerEmail}</td>
                                  <td style={{ padding: '8px 10px' }}>
                                    <span style={{ padding: '2px 6px', borderRadius: 4, background: c.sourceType === 'DEPOSIT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: c.sourceType === 'DEPOSIT' ? '#818cf8' : '#c084fc', fontSize: 10, fontWeight: 700 }}>
                                      {c.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>{formatVnd(c.orderAmount)}</td>
                                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{c.rate}%</td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>+{formatVnd(c.commissionAmount)}</td>
                                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: 11 }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* MOBILE CARD LIST VIEW */}
                        <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {auditData.commissions.map((c: any) => (
                            <div
                              key={c.id}
                              style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 12,
                                padding: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13 }}>#{c.code}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ padding: '2px 6px', borderRadius: 4, background: c.sourceType === 'DEPOSIT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: c.sourceType === 'DEPOSIT' ? '#818cf8' : '#c084fc', fontSize: 10, fontWeight: 700 }}>
                                    {c.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
                                  </span>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </div>

                              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, wordBreak: 'break-all' }}>
                                <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span>{c.buyerEmail}</span>
                              </div>

                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>F1 nạp/mua ({c.rate}%):</div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{formatVnd(c.orderAmount)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hoa hồng:</div>
                                  <div style={{ fontSize: 14, fontWeight: 900, color: '#22c55e' }}>+{formatVnd(c.commissionAmount)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Footer Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuditModal(false);
                      setAuditData(null);
                    }}
                    style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Đóng
                  </button>

                  {auditData.payout.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuditModal(false);
                          handleActionClick(auditData.payout, 'REJECTED');
                        }}
                        style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <XCircle size={14} /> Từ Chối Đơn
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuditModal(false);
                          handleActionClick(auditData.payout, 'APPROVED');
                        }}
                        style={{ padding: '8px 16px', borderRadius: 8, background: '#22c55e', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <CheckCircle2 size={14} /> Duyệt Chi Ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      )}

      {/* ACTION CONFIRMATION MODAL */}
      {selectedPayout && actionType && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
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
              <div><strong>Số tiền rút:</strong> <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{formatVnd(selectedPayout.amount)}</span></div>
              <div><strong>Phí rút tiền:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>{selectedPayout.fee > 0 ? formatVnd(selectedPayout.fee) : '0đ (Miễn phí)'}</span></div>
              <div><strong>Thực nhận chuyển khoản:</strong> <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 15 }}>{formatVnd(selectedPayout.netAmount || (selectedPayout.amount - (selectedPayout.fee || 0)))}</span></div>
              <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border-color)' }}>
                <strong>Ngân hàng:</strong> {selectedPayout.bankName} - <strong>STK:</strong> {selectedPayout.accountNumber}
              </div>
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
        </div>,
        document.body
      )}
    </div>
  );
};


