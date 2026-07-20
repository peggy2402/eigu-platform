'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Strength = { level: number; label: string; pct: number; color: string };

function getPasswordStrength(pw: string): Strength {
  if (!pw) return { level: 0, label: '', pct: 0, color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Yếu', pct: 25, color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Trung bình', pct: 50, color: '#f59e0b' };
  if (score <= 3) return { level: 3, label: 'Khá', pct: 75, color: '#10b981' };
  return { level: 4, label: 'Mạnh', pct: 100, color: '#6366f1' };
}

export default function RegisterPage() {
  const router = useRouter();
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

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) { setError('Vui lòng nhập tên đăng nhập, email và mật khẩu'); return; }
    if (username.length < 3) { setError('Tên đăng nhập ít nhất 3 ký tự'); return; }
    if (!EMAIL_RE.test(email)) { setError('Email không hợp lệ'); return; }
    if (password.length < 6) { setError('Mật khẩu ít nhất 6 ký tự'); return; }
    if (password !== confirmPw) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await authApi.register(username, email, password);
      setStep('otp');
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

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Nhập đủ 6 số OTP'); return; }
    setLoading(true);
    try {
      const data = await authApi.verifyEmail(email, code);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="EIGU Logo" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 12 }} />
          <h1>EIGU Platform</h1>
          <p>Anti-Detect Automation Engine</p>
        </div>

        {step === 'register' ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="VD: haruki2402" autoComplete="username" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="pw-wrapper">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {password && (
              <div className="password-strength">
                <div className="password-strength-bar"><div className="password-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }}></div></div>
                <div className="password-strength-label">{strength.label}</div>
              </div>
            )}
            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <div className="pw-wrapper">
                <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <div className="auth-link">Đã có tài khoản? <a href="/auth/login">Đăng nhập</a></div>
          </form>
        ) : (
          <div className="auth-form">
            <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Nhập mã OTP gửi đến<br /><strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            </p>
            <div className="otp-inputs">
              {otp.map((d, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} />
              ))}
            </div>
            <button className="auth-btn" style={{ marginTop: 16 }} onClick={handleVerify} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>
            <div className="auth-link"><a href="/auth/login">Quay lại đăng nhập</a></div>
          </div>
        )}
      </div>
    </div>
  );
}
