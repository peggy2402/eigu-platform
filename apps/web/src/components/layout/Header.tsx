'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
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
    <div className="apple-nav-wrapper" style={{ zIndex: 9999 }}>
      <header className="apple-nav">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onNavigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            alt="EIGU Logo"
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px var(--accent, rgba(245, 158, 11, 0.6)))',
            }}
          />
          <span className="header-brand-title" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            EIGU Platform
          </span>
        </div>

        {/* Main Nav Links with Liquid Glass Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {navItems.map(item => {
            const isActive = activePath === item.path;
            return (
              <span
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`header-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </span>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="header-right-controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
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
    </div>
  );
}
