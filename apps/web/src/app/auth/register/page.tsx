'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '../../../components/AuthLayout';
import { authApi } from '../../../lib/api';

type Step = 'register' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(email, password);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, otp);
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
    <AuthLayout title="Register" subtitle={step === 'register' ? 'Create your account' : 'Check your email for OTP'}>
      {step === 'register' ? (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Sending OTP...' : 'Create Account'}
          </button>
          <div style={{ textAlign: 'center', fontSize: '13px' }}>
            <a href="/auth/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Already have an account?</a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '8px 0' }}>
            We sent a 6-digit code to <strong style={{ color: '#f8fafc' }}>{email}</strong>
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              maxLength={6}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
            />
          </div>
          <button type="submit" disabled={loading || otp.length !== 6} style={btnStyle}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}
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
