'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, MessageSquare, Wrench, Bug, MessageCircle,
  RefreshCw, Search, Lock, UserCheck, UserX, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiBaseUrl } from '@eigu-platform/shared';

export default function BackofficeView() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'maintenance' | 'telemetry' | 'feedback'>('users');
  
  // Users Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // System Config State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minAppVersion, setMinAppVersion] = useState('1.0.0');
  const [obfPrefix, setObfPrefix] = useState('v2-sec-2026');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // Telemetry & Feedback State
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  // Load Real Users Data
  const loadUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const baseUrl = getApiBaseUrl();
      const query = new URLSearchParams();
      if (userSearch) query.append('search', userSearch);
      if (roleFilter !== 'all') query.append('role', roleFilter);

      const res = await fetch(`${baseUrl}/users?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách Users Backoffice:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Bootstrap System Config
  const loadSystemConfig = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/system-config/bootstrap`);
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(!!data.maintenanceMode);
        setMinAppVersion(data.minAppVersion || '1.0.0');
        if (data.apiPrefix) {
          const match = data.apiPrefix.match(/\/api\/(.+)$/);
          setObfPrefix(match ? match[1] : data.apiPrefix);
        }
      }
    } catch (e) {
      console.warn('Lỗi tải SystemConfig Backoffice:', e);
    }
  };

  // Load Real Feedback
  const loadFeedback = async () => {
    if (!token) return;
    setLoadingFeedback(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(Array.isArray(data) ? data : data.feedback || []);
      }
    } catch (e) {
      console.warn('Lỗi tải Feedback Backoffice:', e);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'maintenance') loadSystemConfig();
    if (activeTab === 'feedback') loadFeedback();
  }, [activeTab]);

  // Save Maintenance Config
  const handleSaveMaintenance = async () => {
    if (!token || !isAdmin) return;
    setSavingConfig(true);
    setConfigMessage('');
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/system-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'MAINTENANCE_MODE', value: String(maintenanceMode), description: 'Trạng thái bảo trì hệ thống' })
      });

      await fetch(`${baseUrl}/system-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'MIN_APP_VERSION', value: minAppVersion, description: 'Phiên bản ứng dụng tối thiểu' })
      });

      setConfigMessage(maintenanceMode ? '🔴 Đã BẬT bảo trì hệ thống!' : '🟢 Đã TẮT bảo trì hệ thống!');
    } catch (e: any) {
      setConfigMessage(`Lỗi: ${e.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Toggle Ban User
  const handleToggleBan = async (targetUser: any) => {
    if (!token || !isAdmin) return;
    const isBanned = !!targetUser.isBanned;
    const actionText = isBanned ? 'Mở khóa' : 'Khóa (Ban)';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản ${targetUser.email}?`)) return;

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/users/${targetUser.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isBanned: !isBanned,
          banReason: !isBanned ? 'Vi phạm quy định vận hành' : null
        })
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (e) {
      alert('Lỗi thao tác Ban user');
    }
  };

  return (
    <div className="settings-container" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Banner Backoffice Enterprise */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              Trung Tâm Vận Hành (Operations Backoffice Console)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Dành riêng cho Đội ngũ Vận hành & QTV (Role: <strong style={{ color: 'var(--accent)' }}>{user?.role?.toUpperCase() || 'STAFF'}</strong>). Giám sát hệ thống, quản lý tài khoản & hỗ trợ người dùng.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            background: isAdmin ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)',
            color: isAdmin ? '#22c55e' : '#38bdf8',
            border: `1px solid ${isAdmin ? 'rgba(34,197,94,0.3)' : 'rgba(56,189,248,0.3)'}`
          }}>
            {isAdmin ? '🛡️ Quyền Admin Toàn Hệ Thống' : '⚡ Quyền Staff Vận Hành'}
          </span>
        </div>
      </div>

      {/* Tabs Menu Backoffice */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'users' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'users' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : 'none'
          }}
        >
          <Users size={16} /> Quản Lý Người Dùng ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'maintenance' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'maintenance' ? '#eab308' : 'var(--text-secondary)',
            fontWeight: activeTab === 'maintenance' ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: activeTab === 'maintenance' ? '2px solid #eab308' : 'none'
          }}
        >
          <Wrench size={16} /> Quản Lý Bảo Trì System
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'feedback' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'feedback' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'feedback' ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: activeTab === 'feedback' ? '2px solid var(--accent)' : 'none'
          }}
        >
          <MessageCircle size={16} /> Báo Lỗi & Phản Hồi ({feedbackList.length})
        </button>
      </div>

      {/* Tab 1: User Management Backoffice */}
      {activeTab === 'users' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Danh Sách Tài Khoản Người Dùng (Real Supabase DB)
            </h3>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Tìm theo Email/Username..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && loadUsers()}
                style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13 }}
              />

              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setTimeout(loadUsers, 100); }}
                style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13 }}
              >
                <option value="all">Tất cả Role</option>
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <button className="btn-primary" onClick={loadUsers} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} /> Lọc
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textLeft: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                  <th style={{ padding: 12 }}>User / Email</th>
                  <th style={{ padding: 12 }}>Vai trò (Role)</th>
                  <th style={{ padding: 12 }}>Trạng thái</th>
                  <th style={{ padding: 12 }}>Ngày tạo</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Thao tác Backoffice</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Đang tải dữ liệu người dùng...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Chưa tìm thấy người dùng nào.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username || u.email?.split('@')[0]}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : u.role === 'staff' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: u.role === 'admin' ? '#ef4444' : u.role === 'staff' ? '#38bdf8' : 'var(--text-secondary)'
                        }}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {u.isBanned ? (
                          <span style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <UserX size={14} /> Banned
                          </span>
                        ) : (
                          <span style={{ color: '#22c55e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <UserCheck size={14} /> Active
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 12, color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        {isAdmin && u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(u)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              border: `1px solid ${u.isBanned ? '#22c55e' : '#ef4444'}`,
                              color: u.isBanned ? '#22c55e' : '#ef4444',
                              background: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            {u.isBanned ? 'Unban' : 'Ban User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Maintenance Management Backoffice */}
      {activeTab === 'maintenance' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#eab308', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={20} /> Quản Lý Bật / Tắt Bảo Trì System (Real-time DB)
            </h3>
            <span style={{
              background: maintenanceMode ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
              color: maintenanceMode ? '#ef4444' : '#22c55e',
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12
            }}>
              {maintenanceMode ? '🔴 Đang Bảo Trì (Maintenance Active)' : '🟢 Đang Hoạt Động (Normal System)'}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Điều chỉnh trạng thái bảo trì hệ thống thời gian thực. Khi bật chế độ bảo trì, người dùng thông thường (Role: User) sẽ dừng truy cập ứng dụng. Admin và Staff vẫn tiếp tục truy cập kiểm thử bình thường.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <label htmlFor="web-maintenance-toggle" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Chế độ Bảo Trì (Maintenance Mode):
              </label>
              <input
                type="checkbox"
                id="web-maintenance-toggle"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                disabled={!isAdmin}
                style={{ width: 22, height: 22, cursor: isAdmin ? 'pointer' : 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Phiên bản App Tối thiểu (MIN_APP_VERSION):</label>
              <input
                type="text"
                value={minAppVersion}
                onChange={e => setMinAppVersion(e.target.value)}
                disabled={!isAdmin}
                style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>

            {isAdmin ? (
              <button
                onClick={handleSaveMaintenance}
                disabled={savingConfig}
                className="btn-primary"
                style={{ padding: '12px 24px', borderRadius: 8, fontWeight: 700, background: '#eab308', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                {savingConfig ? 'Đang lưu...' : 'Lưu Cấu Hình Bảo Trì'}
              </button>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                * Chỉ Admin mới có quyền điều chỉnh chế độ bảo trì hệ thống.
              </div>
            )}

            {configMessage && (
              <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
                {configMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Feedback Management Backoffice */}
      {activeTab === 'feedback' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Danh Sách Báo Lỗi & Phản Hồi Từ Khách Hàng (Real DB)
            </h3>
            <button className="btn-primary" onClick={loadFeedback} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Tải lại
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingFeedback ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Đang tải báo cáo phản hồi...</div>
            ) : feedbackList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Chưa có báo cáo phản hồi nào.</div>
            ) : (
              feedbackList.map((f: any) => (
                <div key={f.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{f.user?.email || f.email || 'Người dùng'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(f.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--text-primary)' }}>{f.message}</p>
                  {f.imageUrl && (
                    <a href={f.imageUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'underline' }}>
                      Xem ảnh đính kèm 🖼️
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
