'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BackToHomeButton from '../../../components/layout/BackToHomeButton';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Strength = { level: number; label: string; pct: number; color: string };

function getPasswordStrength(pw: string, language: 'vi' | 'en'): Strength {
  if (!pw) return { level: 0, label: '', pct: 0, color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: language === 'en' ? 'Weak' : 'Yếu', pct: 25, color: '#ef4444' };
  if (score <= 2) return { level: 2, label: language === 'en' ? 'Medium' : 'Trung bình', pct: 50, color: '#f59e0b' };
  if (score <= 3) return { level: 3, label: language === 'en' ? 'Good' : 'Khá', pct: 75, color: '#10b981' };
  return { level: 4, label: language === 'en' ? 'Strong' : 'Mạnh', pct: 100, color: '#6366f1' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (step === 'otp' && otpRefs.current[0]) otpRefs.current[0].focus(); }, [step]);

  const strength = getPasswordStrength(password, language);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError(language === 'en' ? 'Please enter username, email and password' : 'Vui lòng nhập tên đăng nhập, email và mật khẩu');
      return;
    }
    if (username.length < 3) {
      setError(language === 'en' ? 'Username must be at least 3 characters' : 'Tên đăng nhập ít nhất 3 ký tự');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(language === 'en' ? 'Invalid email format' : 'Email không hợp lệ');
      return;
    }
    if (password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters' : 'Mật khẩu ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPw) {
      setError(language === 'en' ? 'Confirmation password does not match' : 'Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(username, email, password);
      showToast(
        language === 'en' ? 'OTP Sent Successfully!' : 'Gửi OTP thành công!',
        language === 'en' ? `Verification code sent to email ${email}` : `Mã xác thực đã được gửi đến email ${email}`,
        'success'
      );
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
      showToast(
        language === 'en' ? 'Registration failed' : 'Đăng ký không thành công',
        err.message || (language === 'en' ? 'Please verify registration information' : 'Vui lòng kiểm tra lại thông tin đăng ký'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const newOtp = [...otp]; newOtp[idx] = val; setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError(language === 'en' ? 'Please enter all 6 OTP digits' : 'Nhập đủ 6 số OTP');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyEmail(email, code);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.removeItem('eigu_disclaimer_accepted');
      sessionStorage.setItem('eigu_toast_notice', JSON.stringify({
        title: language === 'en' ? 'Registration Successful!' : 'Đăng ký tài khoản thành công!',
        description: language === 'en' ? 'Your account is verified and ready for use.' : 'Tài khoản của bạn đã được xác thực và sẵn sàng sử dụng.',
        type: 'success'
      }));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      showToast(
        language === 'en' ? 'OTP Verification failed' : 'Xác thực OTP thất bại',
        err.message || (language === 'en' ? 'Invalid or expired OTP code' : 'Mã OTP không hợp lệ hoặc đã hết hạn'),
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
              <span>{language === 'en' ? 'Join 100,000+ Creators Community' : 'Gia Nhập Cộng Đồng 100,000+ Creators'}</span>
            </div>
            <h2 className="auth-banner-title">
              {language === 'en' ? (
                <>
                  Create Account & Enjoy <br />
                  7-Day Free Trial Full Features
                </>
              ) : (
                <>
                  Tạo Tài Khoản Trải Nghiệm <br />
                  Miễn Phí 7 Ngày Full Tính Năng
                </>
              )}
            </h2>
            <p className="auth-banner-desc">
              {language === 'en'
                ? 'Explore the power of auto short video clipping, copyright bypass, and fast channel scaling.'
                : 'Khám phá sức mạnh tự động cắt dựng video ngắn, bypass bản quyền và nhân bản quy mô kênh nhanh chóng.'}
            </p>
          </div>

          <div className="auth-banner-footer">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'No Credit Card Required' : 'Không Cần Thẻ Thanh Toán'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {language === 'en' ? 'Activate instantly in 30s via Email OTP verification' : 'Kích hoạt ngay trong 30 giây qua xác thực Email OTP'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-right-form">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {step === 'register'
                ? (language === 'en' ? 'Create an Account' : 'Đăng Ký Tài Khoản')
                : (language === 'en' ? 'OTP Verification' : 'Xác Thực Mã OTP')}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {step === 'register'
                ? (language === 'en' ? 'Fill out the details below to initialize your EIGU account' : 'Điền thông tin bên dưới để khởi tạo tài khoản EIGU')
                : (language === 'en' ? `6-digit code sent to ${email}` : `Mã 6 số đã được gửi tới email ${email}`)}
            </p>
          </div>

          {step === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              {error && <div className="auth-error show">{error}</div>}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Username' : 'Tên đăng nhập'}</span>
                </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. haruki2402" autoComplete="username" required />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} style={{ color: 'var(--accent)' }} />
                  <span>Email</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Password' : 'Mật khẩu'}</span>
                </label>
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? <EyeOff size={18} /> : <Eye size={18} opacity={0.8} />}</button>
                </div>
              </div>

              {password && (
                <div className="password-strength" style={{ '--ps-color': strength.color } as React.CSSProperties}>
                  <div className="password-strength-track">
                    <div className="password-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                  </div>
                  <div className="password-strength-meta">
                    <div className="password-strength-dots">
                      {[1, 2, 3, 4].map(l => (
                        <div key={l} className={`password-strength-dot ${strength.level >= l ? 'active' : ''}`} />
                      ))}
                    </div>
                    <span className="password-strength-label">{strength.label}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Confirm Password' : 'Nhập lại mật khẩu'}</span>
                </label>
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading} style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800, marginTop: 4 }}>
                <span>
                  {loading
                    ? (language === 'en' ? 'Sending OTP...' : 'Đang gửi mã OTP...')
                    : (language === 'en' ? 'Register Account' : 'Đăng Ký Tài Khoản')}
                </span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-link" style={{ marginTop: 16 }}>
                {language === 'en' ? 'Already have an account?' : 'Đã có tài khoản?'}{' '}
                <a href="/auth/login" style={{ fontWeight: 700 }}>
                  {language === 'en' ? 'Log In' : 'Đăng nhập'}
                </a>
              </div>
            </form>
          ) : (
            <div className="auth-form">
              {error && <div className="auth-error show">{error}</div>}

              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                {language === 'en' ? 'Please check your inbox and enter the 6-digit code:' : 'Vui lòng kiểm tra hòm thư và nhập 6 số xác thực:'}
              </p>

              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} />
                ))}
              </div>

              <button className="auth-btn" style={{ marginTop: 24, height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800 }} onClick={handleVerify} disabled={loading}>
                <span>
                  {loading
                    ? (language === 'en' ? 'Verifying...' : 'Đang xác thực...')
                    : (language === 'en' ? 'Verify & Sign In' : 'Xác Thực & Đăng Nhập')}
                </span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-link" style={{ marginTop: 16 }}>
                <a href="/auth/login" style={{ fontWeight: 700 }}>
                  {language === 'en' ? 'Back to Login page' : 'Quay lại trang Đăng nhập'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
