'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../../lib/api';

export default function ForgotPasswordPage() {
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
    if (!email) { setError('Vui lòng nhập email'); return; }
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
    if (code.length !== 6 || !newPassword) { setError('Nhập đủ OTP và mật khẩu mới'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep('done');
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

        {step === 'email' && (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </button>
            <div className="auth-link"><a href="/auth/login">Quay lại đăng nhập</a></div>
          </form>
        )}

        {step === 'reset' && (
          <div className="auth-form">
            <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Nhập OTP và mật khẩu mới</p>
            <div className="otp-inputs" style={{ marginBottom: 16 }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} />
              ))}
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <div className="pw-wrapper">
                <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button className="auth-btn" onClick={handleReset} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
            <div className="auth-link"><a href="/auth/login">Quay lại đăng nhập</a></div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}><CheckCircle2 size={48} color="var(--success)" /></div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Đặt lại mật khẩu thành công!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Bạn có thể đăng nhập với mật khẩu mới.</p>
            <a href="/auth/login" className="auth-btn" style={{ display: 'inline-flex', marginTop: 24, width: 'auto', padding: '12px 32px', textDecoration: 'none' }}>
              Đăng nhập
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
