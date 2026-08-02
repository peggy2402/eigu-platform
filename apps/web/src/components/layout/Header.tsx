'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { useEffect, useState } from 'react';
import { Menu, X, Home, Info, CreditCard, Newspaper, HelpCircle, Mail, User, Wallet, Settings, Bug, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activePath?: string;
  onNavigate: (path: string) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onOpenDeposit?: () => void;
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': <Home size={16} />,
  '/about': <Info size={16} />,
  '/pricing': <CreditCard size={16} />,
  '/news': <Newspaper size={16} />,
  '/faq': <HelpCircle size={16} />,
  '/contact': <Mail size={16} />,
};

export default function Header({ activePath = '/', onNavigate, onOpenSettings, onOpenFeedback, onOpenDeposit }: HeaderProps) {
  const { user, token, loading, logout } = useAuth();
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
        <motion.header
          className="apple-nav"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Brand Logo & Title */}
          <motion.div
            onClick={() => handleNav('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
          </motion.div>

          {/* Desktop Nav Links with Sliding Active Glass Pill */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
            {navItems.map(item => {
              const isActive = activePath === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`header-nav-item ${isActive ? 'active' : ''}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  style={{ position: 'relative', WebkitFontSmoothing: 'antialiased' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGlassPill"
                      className="active-glass-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 9999,
                        zIndex: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      color: isActive ? '#ffffff' : undefined,
                      fontWeight: isActive ? 700 : 500,
                      transform: 'translateZ(0)',
                      display: 'inline-block',
                    }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="header-right-controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Desktop auth buttons / user dropdown */}
            {!loading && token ? (
              <div className="desktop-user-dropdown">
                <UserDropdown
                  onOpenSettings={onOpenSettings}
                  onOpenFeedback={onOpenFeedback}
                  onOpenDeposit={onOpenDeposit}
                  onNavigate={onNavigate}
                />
              </div>
            ) : (
              <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <motion.button
                  onClick={() => handleNav('/auth/login')}
                  className="btn-header-login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {t('nav_login')}
                </motion.button>
                <motion.button
                  onClick={() => handleNav('/auth/register')}
                  className="btn-header-register"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {t('nav_register')}
                </motion.button>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <motion.button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Mở menu"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </motion.header>
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
              <div className="mobile-drawer-user">
                <div className="mobile-user-card">
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="mobile-user-name">{user?.username || (user?.email ? user.email.split('@')[0] : 'User')}</div>
                      <div className="mobile-user-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="mobile-user-balance-box">
                    <div>
                      <span className="mobile-balance-label">{t('user_balance')}</span>
                      <div className="mobile-balance-val">{(user?.balance || 0).toLocaleString('vi-VN')}đ</div>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); if (onOpenDeposit) { onOpenDeposit(); } else { onNavigate('/dashboard/transactions'); } }}
                      className="mobile-deposit-btn"
                    >
                      <Wallet size={14} />
                      <span>{t('user_deposit')}</span>
                    </button>
                  </div>
                </div>

                <div className="mobile-user-actions">
                  <button
                    onClick={() => { setMobileOpen(false); onOpenSettings(); }}
                    className="mobile-action-btn"
                  >
                    <Settings size={16} />
                    <span>{t('user_settings')}</span>
                  </button>

                  <button
                    onClick={() => { setMobileOpen(false); onOpenFeedback(); }}
                    className="mobile-action-btn"
                  >
                    <Bug size={16} />
                    <span>{t('user_feedback')}</span>
                  </button>

                  <button
                    onClick={async () => { setMobileOpen(false); await logout(); window.location.href = '/auth/login'; }}
                    className="mobile-action-btn danger"
                  >
                    <LogOut size={16} />
                    <span>{t('user_logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
