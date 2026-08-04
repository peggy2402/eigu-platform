'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BackToHomeButton from '../../../components/layout/BackToHomeButton';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { language } = useLanguage();
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
    if (!identifier || !password) {
      setError(language === 'en' ? 'Please enter your email/username and password' : 'Vui lòng nhập email hoặc tên đăng nhập và mật khẩu');
      return;
    }
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
        title: language === 'en' ? 'Sign in successful!' : 'Đăng nhập thành công!',
        description: language === 'en' ? 'Welcome back to EIGU Platform' : 'Chào mừng bạn quay trở lại EIGU Platform',
        type: 'success'
      }));
      window.location.href = '/';
    } catch (err: any) {
      const errMsg = err.message || (language === 'en' ? 'Sign in failed' : 'Đăng nhập thất bại');
      const isUnverified = /chưa được xác thực|chưa xác minh|not verified|unverified|xác nhận|verify/i.test(errMsg);

      if (isUnverified) {
        // Use the real email from API response (handles case where user typed username instead of email)
        const emailForOtp = (err as any).email || identifier;
        showToast(
          language === 'en' ? 'Email Not Verified' : 'Tài Khoản Chưa Xác Thực Email',
          language === 'en' ? 'Redirecting to OTP verification page...' : 'Đang chuyển hướng sang màn hình nhập mã OTP...',
          'warning'
        );
        router.push(`/auth/register?email=${encodeURIComponent(emailForOtp)}&step=otp`);
        return;
      }

      setError(errMsg);
      showToast(
        language === 'en' ? 'Sign in failed' : 'Đăng nhập thất bại',
        errMsg,
        'error'
      );
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
              {language === 'en' ? (
                <>
                  AI Video Automation <br />
                  & MMO Growth Engine
                </>
              ) : (
                <>
                  Tự Động Hóa Video AI <br />
                  & Bứt Phá Doanh Số MMO
                </>
              )}
            </h2>
            <p className="auth-banner-desc">
              {language === 'en'
                ? '6 specialized modules integrated with Puppeteer Stealth Anti-Detect, FFmpeg GPU Rendering & AI Video Generator for Creators.'
                : 'Hệ thống 6 mô-đun chuyên sâu tích hợp Puppeteer Stealth Anti-Detect, FFmpeg GPU Rendering & AI Video Generator dành cho Creator.'}
            </p>
          </div>

          <div className="auth-banner-footer">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'en' ? '100,000+ Trusted Creators' : '100,000+ Nhà Sáng Tạo Tin Dùng'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {language === 'en' ? 'Browser fingerprint security & Supabase Cloud Gateway' : 'Bảo mật vân tay trình duyệt & Supabase Cloud Gateway'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-right-form">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {language === 'en' ? 'Welcome Back!' : 'Chào Mừng Quay Trở Lại!'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {language === 'en' ? 'Sign in to your EIGU Platform account to start managing' : 'Đăng nhập tài khoản EIGU Platform để bắt đầu quản lý'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error show">{error}</div>}

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} style={{ color: 'var(--accent)' }} />
                <span>{language === 'en' ? 'Email or Username' : 'Email hoặc Tên đăng nhập'}</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={language === 'en' ? 'you@example.com or username' : 'you@example.com hoặc username'}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} style={{ color: 'var(--accent)' }} />
                <span>{language === 'en' ? 'Password' : 'Mật khẩu'}</span>
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
                <span>{language === 'en' ? 'Remember login' : 'Ghi nhớ đăng nhập'}</span>
              </label>

              <a
                href="/auth/forgot-password"
                style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                {language === 'en' ? 'Forgot password?' : 'Quên mật khẩu?'}
              </a>
            </div>

            <button type="submit" className="auth-btn" disabled={loading} style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800 }}>
              <span>
                {loading
                  ? (language === 'en' ? 'Signing in...' : 'Đang đăng nhập...')
                  : (language === 'en' ? 'Sign In Now' : 'Đăng Nhập Ngay')}
              </span>
              <ArrowRight size={18} />
            </button>

            <div className="auth-link" style={{ marginTop: 20 }}>
              {language === 'en' ? "Don't have an account?" : 'Chưa có tài khoản?'}{' '}
              <a href="/auth/register" style={{ fontWeight: 700 }}>
                {language === 'en' ? 'Create new account' : 'Đăng ký tài khoản mới'}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
