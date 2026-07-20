'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsView() {
  const { theme, setTheme } = useTheme();

  const options: { mode: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun size={18} />, label: 'Sáng' },
    { mode: 'dark', icon: <Moon size={18} />, label: 'Tối' },
    { mode: 'system', icon: <Monitor size={18} />, label: 'Hệ thống' },
  ];

  return (
    <>
      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Giao diện</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {options.map(opt => (
            <button
              key={opt.mode}
              onClick={() => setTheme(opt.mode)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: theme === opt.mode ? 'var(--accent-glow)' : 'var(--bg-primary)',
                border: theme === opt.mode ? '1.5px solid var(--accent)' : '1.5px solid var(--border-color)',
                color: theme === opt.mode ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Cache & Dữ liệu</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Quản lý bộ nhớ đệm, xoá dữ liệu workflow, cấu hình đầu ra mặc định.
        </p>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Workflow Mặc định</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Cài đặt mặc định cho cắt ghép, tỉ lệ khung hình, xử lý Anti-Detect, metadata.
        </p>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Proxy & Mạng</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Cấu hình SOCKS5 / Residential proxy cho Anti-Detect Browser, chặn rò rỉ WebRTC.
        </p>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Trình duyệt & Hồ sơ</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Quản lý Chrome Profile isolation, Chromium data-dir, tự động nạp extensions.
        </p>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Thông báo</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Cấu hình push notification, âm thanh thông báo khi workflow hoàn tất.
        </p>
      </div>
    </>
  );
}
