'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
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
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="EIGU Logo" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 12 }} />
          <h1>EIGU Platform</h1>
          <p>Anti-Detect Automation Engine</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>
          <div className="form-group">
            <label>Email hoặc tên đăng nhập</label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <label className="checkbox-row" style={{ margin: '-4px 0 4px', fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span>Nhớ tài khoản</span>
          </label>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <div className="auth-link">
            Chưa có tài khoản? <a href="/auth/register">Đăng ký</a>
            &nbsp;·&nbsp; <a href="/auth/forgot-password">Quên mật khẩu</a>
          </div>
        </form>
      </div>
    </div>
  );
}
