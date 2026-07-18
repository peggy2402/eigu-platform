'use client';

import { useState } from 'react';
import AuthLayout from '../../../components/AuthLayout';
import { authApi } from '../../../lib/api';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a reset code">
      {step === 'email' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>{error}</div>}
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Sending...' : 'Send OTP'}</button>
          <div style={{ textAlign: 'center', fontSize: '13px' }}>
            <a href="/auth/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Back to login</a>
          </div>
        </form>
      )}

      {(step === 'otp' || step === 'reset') && (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>{error}</div>}
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            OTP sent to <strong style={{ color: '#f8fafc' }}>{email}</strong>
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>OTP Code</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '6px' }} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading || otp.length !== 6 || newPassword.length < 6} style={btnStyle}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 500 }}>Password reset successfully!</p>
          <a href="/auth/login" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '14px', display: 'inline-block', marginTop: '16px' }}>
            Sign in with new password
          </a>
        </div>
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
