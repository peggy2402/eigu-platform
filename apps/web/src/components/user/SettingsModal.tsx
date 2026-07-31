'use client';

import { useState } from 'react';
import { X, Sun, Moon, Monitor, Globe, User, Lock, Trash2, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'theme' | 'language' | 'info' | 'password' | 'delete'>('theme');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const themeOptions: { mode: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun size={18} />, label: 'Sáng' },
    { mode: 'dark', icon: <Moon size={18} />, label: 'Tối' },
    { mode: 'system', icon: <Monitor size={18} />, label: 'Hệ thống' },
  ];

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu thông tin cá nhân', 'Thông tin của bạn đã được cập nhật thành công.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      return showToast('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận mật khẩu không giống nhau.', 'error');
    }
    showToast('Đổi mật khẩu thành công', 'Mật khẩu mới của bạn đã được cập nhật.', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Thao tác này không thể khôi phục.')) {
      showToast('Yêu cầu đã được gửi', 'Vui lòng liên hệ Admin để hoàn tất thủ tục xóa tài khoản.', 'warning');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Cài Đặt Tài Khoản</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Submenu Sidebar */}
          <div style={{ width: 180, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'theme', icon: <Sun size={16} />, label: 'Giao diện' },
              { id: 'language', icon: <Globe size={16} />, label: 'Ngôn ngữ' },
              { id: 'info', icon: <User size={16} />, label: 'Thay đổi thông tin' },
              { id: 'password', icon: <Lock size={16} />, label: 'Đổi mật khẩu' },
              { id: 'delete', icon: <Trash2 size={16} />, label: 'Xóa tài khoản' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--accent-glow)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Submenu Main Content */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {activeTab === 'theme' && (
              <div>
                <h4 style={{ marginBottom: 16, fontSize: 16 }}>Giao diện ứng dụng</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  {themeOptions.map(opt => (
                    <button
                      key={opt.mode}
                      onClick={() => setTheme(opt.mode)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        padding: '16px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: theme === opt.mode ? 'var(--accent-glow)' : 'var(--bg-primary)',
                        border: theme === opt.mode ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                        color: theme === opt.mode ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div>
                <h4 style={{ marginBottom: 16, fontSize: 16 }}>Ngôn ngữ hiển thị</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Tiếng Việt (VI)', 'English (EN)'].map((l, idx) => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="lang" defaultChecked={idx === 0} />
                      <span style={{ fontSize: 14 }}>{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ marginBottom: 4, fontSize: 16 }}>Thay đổi thông tin cá nhân</h4>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tên người dùng (Username)</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <button type="submit" style={{ padding: 10, borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Lưu thông tin</button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ marginBottom: 4, fontSize: 16 }}>Đổi mật khẩu</h4>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Mật khẩu hiện tại</label>
                  <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Mật khẩu mới</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Xác nhận mật khẩu mới</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <button type="submit" style={{ padding: 10, borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Cập nhật mật khẩu</button>
              </form>
            )}

            {activeTab === 'delete' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', marginBottom: 12 }}>
                  <ShieldAlert size={24} />
                  <h4 style={{ margin: 0, fontSize: 16 }}>Xóa vĩnh viễn tài khoản</h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Khi xóa tài khoản, tất cả dữ liệu cá nhân, số dư và lịch sử dịch vụ sẽ bị xóa hoàn toàn khỏi hệ thống và không thể khôi phục.
                </p>
                <button onClick={handleDeleteAccount} style={{ padding: '10px 18px', borderRadius: 8, background: 'var(--danger)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Xóa tài khoản của tôi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
