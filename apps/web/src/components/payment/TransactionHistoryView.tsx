'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, CheckCircle2, Clock, XCircle, Copy, Check, ChevronLeft, ChevronRight, LogIn, Lock, Search } from 'lucide-react';
import { paymentApi } from '../../lib/api';
import DepositModal from './DepositModal';
import { useAuth } from '../../contexts/AuthContext';

export default function TransactionHistoryView() {
  const { token, loading: authLoading, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        fetchTransactions();
      } else {
        setLoading(false);
        setUnauthenticated(true);
      }
    }
  }, [token, authLoading, fetchTransactions]);

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
      {/* Left: Info */}
      <div style={{ color: 'var(--text-muted)' }}>
        Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong style={{ color: 'var(--text-primary)' }}>{endIndex}</strong> trên tổng <strong style={{ color: 'var(--accent)' }}>{totalItems}</strong> giao dịch
      </div>

      {/* Center: Page Size Selector */}
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

      {/* Right: Page Buttons (< 1 2 3 ... >) */}
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

        {/* Page numbers */}
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
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
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
          onSuccess={() => fetchTransactions()}
        />
      )}

      {/* Header section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet style={{ color: 'var(--accent)' }} /> Lịch sử Nạp tiền
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Quản lý và đối soát tự động toàn bộ giao dịch ngân hàng VietQR của bạn.
          </p>
        </div>

        {token && (
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
        )}
      </div>

      {/* Loading / Unauthenticated / Empty / Data */}
      {authLoading || loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải lịch sử giao dịch...</div>
        </div>
      ) : unauthenticated || !token ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
            <Lock size={26} />
          </div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>Yêu Cầu Đăng Nhập</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, maxWidth: 450, margin: '8px auto 20px' }}>
            Vui lòng đăng nhập tài khoản EIGU Platform của bạn để xem chi tiết lịch sử giao dịch và quản lý số dư nạp tiền tự động.
          </p>
          <button
            onClick={() => { window.location.href = '/auth/login'; }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
            }}
          >
            <LogIn size={16} /> Đăng nhập ngay
          </button>
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
          {/* SEARCH & FILTER BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            {/* Search Input */}
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

            {/* Filter Pills */}
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

          {/* MOBILE PAGINATION TOP BAR */}
          <div className="tx-mobile-pagination-top">
            {renderPaginationControls()}
          </div>

          {filteredTransactions.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-muted)' }}>
              Không tìm thấy giao dịch nào phù hợp với bộ lọc.
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. MOBILE CARD LIST VIEW */}
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

          {/* DESKTOP PAGINATION BOTTOM BAR */}
          <div className="tx-desktop-pagination-bottom">
            {renderPaginationControls()}
          </div>
        </>
      )}
    </div>
  );
}
