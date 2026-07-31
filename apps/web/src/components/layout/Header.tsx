'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  activePath?: string;
  onNavigate: (path: string) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
}

export default function Header({ activePath = '/', onNavigate, onOpenSettings, onOpenFeedback }: HeaderProps) {
  const { token, loading } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t('nav_home') },
    { path: '/about', label: t('nav_about') },
    { path: '/pricing', label: t('nav_pricing') },
    { path: '/news', label: t('nav_news') },
    { path: '/faq', label: t('nav_faq') },
    { path: '/contact', label: t('nav_contact') },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 11, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand Logo & Title */}
      <div
        onClick={() => onNavigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        <img src="/logo.png" alt="EIGU Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EIGU Platform
        </span>
      </div>

      {/* Main Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {navItems.map(item => {
          const isActive = activePath === item.path;
          return (
            <span
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </span>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LanguageSwitcher />

        {!loading && token ? (
          <UserDropdown
            onOpenSettings={onOpenSettings}
            onOpenFeedback={onOpenFeedback}
            onNavigate={onNavigate}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => onNavigate('/auth/login')}
              className="btn-header-login"
            >
              {t('nav_login')}
            </button>
            <button
              onClick={() => onNavigate('/auth/register')}
              className="btn-header-register"
            >
              {t('nav_register')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
