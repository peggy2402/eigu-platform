'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, CheckCircle2, Clock, XCircle, Copy, Check, ChevronLeft, ChevronRight, LogIn, Lock, Search, CreditCard, Box, Zap, Laptop, Monitor, ArrowRight } from 'lucide-react';
import { paymentApi, pricingApi } from '../../lib/api';
import DepositModal from './DepositModal';
import { useAuth } from '../../contexts/AuthContext';

export default function TransactionHistoryView() {
  const { token, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposits' | 'subscriptions'>('deposits');

  // Deposit Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPendingDeposit, setSelectedPendingDeposit] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Read URL query tab parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'subscriptions' || tabParam === 'subs') {
        setActiveTab('subscriptions');
      }
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setUnauthenticated(true);
      return;
    }
    try {
      setLoading(true);
      setUnauthenticated(false);
      const data = await paymentApi.getMyTransactions();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
      if (refreshUser) {
        refreshUser();
      }
    } catch (err: any) {
      console.warn('[PaymentHistory] Could not fetch transactions:', err?.message || err);
      if (err?.message === 'Unauthorized' || err?.message?.includes('Unauthorized')) {
        setUnauthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  }, [token, refreshUser]);

  const fetchSubscriptions = useCallback(async () => {
    if (!token) return;
    try {
      setSubLoading(true);
      const res = await pricingApi.getMySubscriptions();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSubscriptions(list);
    } catch (err: any) {
      console.warn('[Subscriptions] Could not fetch subscriptions:', err?.message || err);
    } finally {
      setSubLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        fetchTransactions();
        fetchSubscriptions();
      } else {
        setLoading(false);
        setUnauthenticated(true);
      }
    }
  }, [token, authLoading, fetchTransactions, fetchSubscriptions]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(item => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = (item.code || '').toLowerCase().includes(q);
      const matchContent = (item.fullContent || '').toLowerCase().includes(q);
      const matchBank = (item.bankName || '').toLowerCase().includes(q);
      if (!matchCode && !matchContent && !matchBank) {
        return false;
      }
    }
    return true;
  });

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

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

  const openPaymentForPending = (item: any) => {
    const qrData = {
      code: item.code,
      fullContent: item.fullContent,
      accountNumber: item.accountNumber || '0888999888',
      accountHolder: item.accountHolder || 'EIGU PLATFORM',
      bankName: item.bankName || 'ACB',
      amount: item.amount,
      qrCodeUrl: item.qrCodeUrl || `https://qr.sepay.vn/img?bank=${encodeURIComponent(item.bankName || 'ACB')}&acc=${encodeURIComponent(item.accountNumber || '0888999888')}&template=compact&amount=${item.amount}&des=${encodeURIComponent(item.fullContent)}`,
    };
    setSelectedPendingDeposit(qrData);
  };

  // Reusable Pagination Component
  const renderPaginationControls = () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        fontSize: 13,
      }}
    >
      <div style={{ color: 'var(--text-muted)' }}>
        Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong style={{ color: 'var(--text-primary)' }}>{endIndex}</strong> trên tổng <strong style={{ color: 'var(--accent)' }}>{totalItems}</strong> giao dịch
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
        <span>Hiển thị:</span>
        <select
          value={pageSize}
          onChange={e => handlePageSizeChange(Number(e.target.value))}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {[5, 10, 20, 50, 100].map(size => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={safeCurrentPage === 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: safeCurrentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === 1 ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            return (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - safeCurrentPage) <= 1
            );
          })
          .map((page, idx, array) => {
            const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
            return (
              <span key={page} style={{ display: 'flex', alignItems: 'center' }}>
                {showEllipsisBefore && (
                  <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                )}
                <button
                  onClick={() => setCurrentPage(page)}
                  style={{
                    minWidth: 32,
                    height: 32,
                    padding: '0 6px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: safeCurrentPage === page ? 'var(--accent)' : 'var(--border-color)',
                    background: safeCurrentPage === page ? 'var(--accent)' : 'var(--bg-primary)',
                    color: safeCurrentPage === page ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: safeCurrentPage === page ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {page}
                </button>
              </span>
            );
          })}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={safeCurrentPage === totalPages}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: safeCurrentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: safeCurrentPage === totalPages ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 1050, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        @media (min-width: 769px) {
          .tx-desktop-table { display: block !important; }
          .tx-mobile-cards { display: none !important; }
          .tx-mobile-pagination-top { display: none !important; }
          .tx-desktop-pagination-bottom { display: block !important; margin-top: 20px; }
        }
        @media (max-width: 768px) {
          .tx-desktop-table { display: none !important; }
          .tx-mobile-cards { display: flex !important; }
          .tx-mobile-pagination-top { display: block !important; margin-bottom: 16px; }
          .tx-desktop-pagination-bottom { display: none !important; }
        }
      `}</style>

      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => { fetchTransactions(); fetchSubscriptions(); }}
        />
      )}

      {selectedPendingDeposit && (
        <DepositModal
          initialDepositData={selectedPendingDeposit}
          onClose={() => setSelectedPendingDeposit(null)}
          onSuccess={() => { fetchTransactions(); fetchSubscriptions(); setSelectedPendingDeposit(null); }}
        />
      )}

      {/* TOP TAB NAVIGATION BAR (100% Match Desktop Screenshot) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('deposits')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid',
              borderColor: activeTab === 'deposits' ? 'var(--accent)' : 'var(--border-color)',
              background: activeTab === 'deposits' ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === 'deposits' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeTab === 'deposits' ? '0 4px 14px var(--accent-glow)' : 'none',
            }}
          >
            <CreditCard size={16} /> Lịch sử Nạp tiền QR (+)
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid',
              borderColor: activeTab === 'subscriptions' ? 'var(--accent)' : 'var(--border-color)',
              background: activeTab === 'subscriptions' ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === 'subscriptions' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeTab === 'subscriptions' ? '0 4px 14px var(--accent-glow)' : 'none',
            }}
          >
            <Box size={16} /> Gói cước Dịch vụ đang sử dụng (-)
          </button>
        </div>

        {token && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { fetchTransactions(); fetchSubscriptions(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <RefreshCw size={14} className={loading || subLoading ? 'animate-spin' : ''} /> Làm mới
            </button>

            <button
              onClick={() => setShowDepositModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'var(--accent)', color: '#ffffff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)' }}
            >
              + Nạp tiền ngay
            </button>
          </div>
        )}
      </div>

      {/* Main View Area */}
      {authLoading || (activeTab === 'deposits' ? loading : subLoading) ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải dữ liệu...</div>
        </div>
      ) : unauthenticated || !token ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
            <Lock size={26} />
          </div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>Yêu Cầu Đăng Nhập</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, maxWidth: 450, margin: '8px auto 20px' }}>
            Vui lòng đăng nhập tài khoản EIGU Platform của bạn để xem chi tiết lịch sử giao dịch và gói cước dịch vụ đang sử dụng.
          </p>
          <button
            onClick={() => { window.location.href = '/auth/login'; }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 12,
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--accent-glow)',
            }}
          >
            <LogIn size={16} /> Đăng nhập ngay
          </button>
        </div>
      ) : activeTab === 'subscriptions' ? (
        /* TAB 2: ACTIVE SUBSCRIPTIONS */
        subscriptions.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
            <Box size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>Chưa có gói cước dịch vụ nào đang sử dụng</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
              Hãy chọn gói cước phù hợp với nhu cầu tự động hóa video và reup MMO của bạn.
            </p>
            <button
              onClick={() => { window.location.href = '/#pricing'; }}
              style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Xem bảng giá dịch vụ <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Mô-đun dịch vụ</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Gói đăng ký</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Cấu hình gói</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Chi phí tháng</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Thời hạn sử dụng</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((item, idx) => {
                    const moduleName = item.moduleName || item.module?.name || item.moduleSlug || 'Dịch vụ tự động hóa';
                    const tierName = item.tierLabel || item.tier?.label || (item.tierId?.includes('pro') ? 'Gói Pro' : 'Gói Basic');
                    const price = item.price || item.tierPrice || item.tier?.price || 120000;
                    const formattedPrice = `-${price.toLocaleString('vi-VN')}đ`;
                    const threads = item.threads || item.tier?.threads || 4;
                    const machines = item.machines || item.tier?.machines || 1;
                    const resolution = item.resolution || item.tier?.resolution || '720p';
                    const expDateStr = item.expiresAt ? `Đến ${new Date(item.expiresAt).toLocaleDateString('vi-VN')}` : 'Không giới hạn';

                    return (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.14)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontWeight: 700, fontSize: 13 }}>
                            {moduleName}
                          </span>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 800 }}>{tierName}</strong>
                            <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: 11, fontWeight: 700 }}>
                              Gói hiện tại
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                              <Zap size={11} style={{ color: '#f59e0b' }} /> {threads} luồng
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                              <Laptop size={11} style={{ color: '#3b82f6' }} /> {machines} máy
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                              <Monitor size={11} style={{ color: '#a855f7' }} /> {resolution}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '16px', fontWeight: 800, color: '#ef4444', fontSize: 14 }}>
                          {formattedPrice}
                        </td>

                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                          {expDateStr}
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> Đang sử dụng
                          </span>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                            onClick={() => { window.location.href = '/#pricing'; }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 16px',
                              borderRadius: 10,
                              background: 'var(--accent)',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px var(--accent-glow)',
                              transition: 'all 0.2s',
                            }}
                          >
                            Gia hạn / Nâng cấp <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 13 }}>
              Tổng cộng <strong style={{ color: 'var(--text-primary)' }}>{subscriptions.length}</strong> gói cước dịch vụ đã mua
            </div>
          </div>
        )
      ) : (
        /* TAB 1: DEPOSIT TRANSACTIONS */
        transactions.length === 0 ? (
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
            {/* SEARCH & FILTER BAR */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hoặc cú pháp..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'COMPLETED', label: 'Thành công' },
                  { id: 'PENDING', label: 'Đang chờ' },
                  { id: 'CANCELLED', label: 'Đã hủy' },
                ].map(f => {
                  const isActive = statusFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setStatusFilter(f.id); setCurrentPage(1); }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: '1px solid',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                        background: isActive ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tx-mobile-pagination-top">
              {renderPaginationControls()}
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={{ padding: 36, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
                Không tìm thấy giao dịch nào phù hợp với bộ lọc.
              </div>
            ) : (
              <>
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
                        <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map(item => (
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
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {item.status === 'PENDING' ? (
                              <button
                                onClick={() => openPaymentForPending(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '6px 14px',
                                  borderRadius: 10,
                                  background: 'var(--accent)',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px var(--accent-glow)',
                                  transition: 'all 0.2s',
                                }}
                              >
                                Thanh toán →
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="tx-mobile-cards" style={{ flexDirection: 'column', gap: 12 }}>
                  {paginatedTransactions.map(item => (
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

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Cú pháp:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{item.fullContent}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                          <span>Thời gian:</span>
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        {item.status === 'PENDING' && (
                          <div style={{ marginTop: 6 }}>
                            <button
                              onClick={() => openPaymentForPending(item)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 10,
                                background: 'var(--accent)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px var(--accent-glow)',
                              }}
                            >
                              Thanh toán →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="tx-desktop-pagination-bottom">
              {renderPaginationControls()}
            </div>
          </>
        )
      )}
    </div>
  );
}
