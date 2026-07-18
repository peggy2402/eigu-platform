'use client';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 50%, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EIGU Platform
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
