'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '../../../components/AuthLayout';
import { authApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <a href="/auth/register" style={{ color: '#818cf8', textDecoration: 'none' }}>Create account</a>
          <a href="/auth/forgot-password" style={{ color: '#94a3b8', textDecoration: 'none' }}>Forgot password?</a>
        </div>
      </form>
    </AuthLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
};
