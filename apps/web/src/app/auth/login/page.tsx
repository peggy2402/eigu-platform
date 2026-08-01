'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import BackToHomeButton from '../../../components/layout/BackToHomeButton';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eigu_saved_email');
    if (saved) { setIdentifier(saved); setRemember(true); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) { setError('Vui lòng nhập email hoặc tên đăng nhập và mật khẩu'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(identifier, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (remember) {
        localStorage.setItem('eigu_saved_email', identifier);
      } else {
        localStorage.removeItem('eigu_saved_email');
      }
      sessionStorage.setItem('eigu_toast_notice', JSON.stringify({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn quay trở lại EIGU Platform',
        type: 'success'
      }));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
      showToast('Đăng nhập thất bại', err.message || 'Vui lòng kiểm tra lại thông tin đăng nhập', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <BackToHomeButton />
      <div className="auth-split-card">
        {/* Left Hero Banner Side */}
        <div className="auth-left-banner">
          <div className="auth-banner-header" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="EIGU Logo" />
            <span>EIGU Platform</span>
          </div>

          <div className="auth-banner-body">
            <div className="auth-banner-badge">
              <Sparkles size={15} />
              <span>SaaS MMO Automation Engine</span>
            </div>
            <h2 className="auth-banner-title">
              Tự Động Hóa Video AI <br />
              & Bứt Phá Doanh Số MMO
            </h2>
            <p className="auth-banner-desc">
              Hệ thống 6 mô-đun chuyên sâu tích hợp Puppeteer Stealth Anti-Detect, FFmpeg GPU Rendering & AI Video Generator dành cho Creator.
            </p>
          </div>

          <div className="auth-banner-footer">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                100,000+ Nhà Sáng Tạo Tin Dùng
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                Bảo mật vân tay trình duyệt & Supabase Cloud Gateway
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-right-form">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              Chào Mừng Quay Trở Lại!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Đăng nhập tài khoản EIGU Platform để bắt đầu quản lý
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error show">{error}</div>}

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} style={{ color: 'var(--accent)' }} />
                <span>Email hoặc Tên đăng nhập</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com hoặc username"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} style={{ color: 'var(--accent)' }} />
                <span>Mật khẩu</span>
              </label>
              <div className="pw-wrapper">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 8px' }}>
              <label className="checkbox-row" style={{ fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <a
                href="/auth/forgot-password"
                style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="auth-btn" disabled={loading} style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800 }}>
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="auth-link" style={{ marginTop: 20 }}>
              Chưa có tài khoản?{' '}
              <a href="/auth/register" style={{ fontWeight: 700 }}>
                Đăng ký tài khoản mới
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
