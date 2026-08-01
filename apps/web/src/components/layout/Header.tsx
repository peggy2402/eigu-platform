'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { useEffect, useState } from 'react';
import { Menu, X, Home, Info, CreditCard, Newspaper, HelpCircle, Mail } from 'lucide-react';

interface HeaderProps {
  activePath?: string;
  onNavigate: (path: string) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': <Home size={16} />,
  '/about': <Info size={16} />,
  '/pricing': <CreditCard size={16} />,
  '/news': <Newspaper size={16} />,
  '/faq': <HelpCircle size={16} />,
  '/contact': <Mail size={16} />,
};

export default function Header({ activePath = '/', onNavigate, onOpenSettings, onOpenFeedback }: HeaderProps) {
  const { token, loading } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-nav-drawer') && !target.closest('.mobile-menu-btn')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [mobileOpen]);

  // Prevent scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = [
    { path: '/', label: t('nav_home') },
    { path: '/about', label: t('nav_about') },
    { path: '/pricing', label: t('nav_pricing') },
    { path: '/news', label: t('nav_news') },
    { path: '/faq', label: t('nav_faq') },
    { path: '/contact', label: t('nav_contact') },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <div
        className={`apple-nav-wrapper${scrolled ? ' nav-scrolled' : ''}`}
        style={{ zIndex: 9999 }}
      >
        <header className="apple-nav">
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNav('/')}
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

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {navItems.map(item => {
              const isActive = activePath === item.path;
              return (
                <span
                  key={item.path}
                  onClick={() => handleNav(item.path)}
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

            {/* Desktop auth buttons */}
            {!loading && token ? (
              <UserDropdown
                onOpenSettings={onOpenSettings}
                onOpenFeedback={onOpenFeedback}
                onNavigate={onNavigate}
              />
            ) : (
              <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleNav('/auth/login')}
                  className="btn-header-login"
                >
                  {t('nav_login')}
                </button>
                <button
                  onClick={() => handleNav('/auth/register')}
                  className="btn-header-register"
                >
                  {t('nav_register')}
                </button>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Mở menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="EIGU Logo" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px var(--accent))' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>EIGU Platform</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="mobile-close-btn" aria-label="Đóng menu">
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="mobile-drawer-nav">
              {navItems.map(item => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="mobile-nav-icon">{NAV_ICONS[item.path]}</span>
                    <span>{item.label}</span>
                    {isActive && <span className="mobile-nav-dot" />}
                  </button>
                );
              })}
            </nav>

            {/* Auth Buttons in Drawer */}
            {!loading && !token && (
              <div className="mobile-drawer-auth">
                <button
                  onClick={() => handleNav('/auth/login')}
                  className="mobile-auth-login"
                >
                  {t('nav_login')}
                </button>
                <button
                  onClick={() => handleNav('/auth/register')}
                  className="mobile-auth-register"
                >
                  {t('nav_register')}
                </button>
              </div>
            )}

            {/* If logged in, show user info area in drawer */}
            {!loading && token && (
              <div style={{ padding: '0 16px 16px' }}>
                <UserDropdown
                  onOpenSettings={() => { onOpenSettings(); setMobileOpen(false); }}
                  onOpenFeedback={() => { onOpenFeedback(); setMobileOpen(false); }}
                  onNavigate={handleNav}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
