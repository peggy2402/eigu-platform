'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff, Mail, Lock, KeyRound, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { useLanguage } from '../../../contexts/LanguageContext';
import BackToHomeButton from '../../../components/layout/BackToHomeButton';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (step === 'reset' && otpRefs.current[0]) otpRefs.current[0].focus(); }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError(language === 'en' ? 'Please enter your email' : 'Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('reset');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const newOtp = [...otp]; newOtp[idx] = val; setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleReset = async () => {
    const code = otp.join('');
    setError('');
    if (code.length !== 6 || !newPassword) {
      setError(language === 'en' ? 'Please enter 6-digit OTP and new password' : 'Nhập đủ OTP và mật khẩu mới');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep('done');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
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
              <KeyRound size={15} />
              <span>{language === 'en' ? 'Secure Password Recovery' : 'Khôi Phục Mật Khẩu An Toàn'}</span>
            </div>
            <h2 className="auth-banner-title">
              {language === 'en' ? (
                <>
                  Account Security <br />
                  & Fast Recovery
                </>
              ) : (
                <>
                  Bảo Mật Tài Khoản <br />
                  & Khôi Phục Nhanh Chóng
                </>
              )}
            </h2>
            <p className="auth-banner-desc">
              {language === 'en'
                ? 'Enter registered email to receive OTP code and reset new password in simple steps.'
                : 'Nhập email đăng ký để nhận mã OTP xác thực và đặt lại mật khẩu mới chỉ trong vài bước đơn giản.'}
            </p>
          </div>

          <div className="auth-banner-footer">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'en' ? '24/7 Automated Support' : 'Hỗ Trợ Tự Động 24/7'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {language === 'en' ? 'Encrypted verification code sent directly to personal email' : 'Mã xác thực mã hóa gửi trực tiếp về email cá nhân'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-right-form">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {step === 'email'
                ? (language === 'en' ? 'Forgot Password' : 'Quên Mật Khẩu')
                : step === 'reset'
                ? (language === 'en' ? 'Reset Password' : 'Đặt Lại Mật Khẩu')
                : (language === 'en' ? 'Success' : 'Thành Công')}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {step === 'email'
                ? (language === 'en' ? 'Enter your registered EIGU Platform email' : 'Nhập email đã đăng ký tài khoản EIGU Platform')
                : step === 'reset'
                ? (language === 'en' ? `Enter OTP code sent to ${email} and new password` : `Nhập mã OTP gửi tới ${email} và mật khẩu mới`)
                : (language === 'en' ? 'Your password has been updated' : 'Mật khẩu của bạn đã được cập nhật')}
            </p>
          </div>

          {step === 'email' && (
            <form className="auth-form" onSubmit={handleSendOtp}>
              {error && <div className="auth-error show">{error}</div>}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Verification Email' : 'Email xác thực'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading} style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800, marginTop: 8 }}>
                <span>
                  {loading
                    ? (language === 'en' ? 'Sending OTP...' : 'Đang gửi mã OTP...')
                    : (language === 'en' ? 'Send OTP Code' : 'Gửi Mã OTP')}
                </span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-link" style={{ marginTop: 20 }}>
                <a href="/auth/login" style={{ fontWeight: 700 }}>
                  {language === 'en' ? 'Back to Login page' : 'Quay lại trang Đăng nhập'}
                </a>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <div className="auth-form">
              {error && <div className="auth-error show">{error}</div>}

              <div className="otp-inputs" style={{ marginBottom: 20 }}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} />
                ))}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'New Password' : 'Mật khẩu mới'}</span>
                </label>
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? <EyeOff size={18} /> : <Eye size={18} opacity={0.8} />}</button>
                </div>
              </div>

              <button className="auth-btn" onClick={handleReset} disabled={loading} style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800, marginTop: 12 }}>
                <span>
                  {loading
                    ? (language === 'en' ? 'Processing...' : 'Đang xử lý...')
                    : (language === 'en' ? 'Update Password' : 'Cập Nhật Mật Khẩu')}
                </span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-link" style={{ marginTop: 20 }}>
                <a href="/auth/login" style={{ fontWeight: 700 }}>
                  {language === 'en' ? 'Back to Login page' : 'Quay lại trang Đăng nhập'}
                </a>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#22c55e' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Password Reset Successful!' : 'Đặt Lại Mật Khẩu Thành Công!'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, fontWeight: 500 }}>
                {language === 'en'
                  ? 'Your password has been updated successfully. Please sign in again with your new password.'
                  : 'Mật khẩu của bạn đã được cập nhật thành công. Hãy đăng nhập lại bằng mật khẩu mới.'}
              </p>
              <a
                href="/auth/login"
                className="auth-btn"
                style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span>{language === 'en' ? 'Sign In Now' : 'Đăng Nhập Ngay'}</span>
                <ArrowRight size={18} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
