'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Home, Info, CreditCard, Newspaper, HelpCircle, Mail, User, Wallet, Settings, Bug, LogOut, History, Link as LinkIcon, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            className="header-brand-wrapper"
            onClick={() => handleNav('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
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
                flexShrink: 0,
                filter: 'drop-shadow(0 0 10px var(--accent, rgba(245, 158, 11, 0.6)))',
              }}
            />
            <span className="header-brand-title" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
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

      {/* Mobile Nav Drawer Portaled to document.body */}
      {mobileOpen && mounted && createPortal(
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="EIGU Logo" style={{ width: 26, height: 26, objectFit: 'contain', filter: 'drop-shadow(0 0 8px var(--accent))' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>EIGU Platform</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="mobile-close-btn" aria-label="Đóng menu" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* 1. TOP BLOCK: USER ACCOUNT CARD (If logged in) */}
            {!loading && token && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.username || (user?.email ? user.email.split('@')[0] : 'User')}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>{user?.email || ''}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); if (onOpenDeposit) { onOpenDeposit(); } else { onNavigate('/transactions'); } }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Wallet size={12} />
                    <span>Nạp tiền</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('user_balance')}</span>
                  <strong style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 800 }}>{(user?.balance || 0).toLocaleString('vi-VN')}đ</strong>
                </div>
              </div>
            )}

            {/* 2. USER ACTIONS GRID (2-Column Compact Grid) */}
            {!loading && token && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                <button onClick={() => handleNav('/transactions')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <History size={14} style={{ color: 'var(--accent)' }} /> {t('user_history')}
                </button>
                <button onClick={() => handleNav('/affiliate')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <LinkIcon size={14} style={{ color: 'var(--accent)' }} /> {t('user_affiliate')}
                </button>
                <button onClick={() => handleNav('/guide')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <BookOpen size={14} style={{ color: 'var(--accent)' }} /> {t('user_guide')}
                </button>
                <button onClick={() => handleNav('/audit-log')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <History size={14} style={{ color: 'var(--accent)' }} /> {t('user_logs')}
                </button>
                <button onClick={() => { setMobileOpen(false); onOpenSettings(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <Settings size={14} style={{ color: 'var(--text-secondary)' }} /> {t('user_settings')}
                </button>
                <button onClick={() => { setMobileOpen(false); onOpenFeedback(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <Bug size={14} style={{ color: 'var(--text-secondary)' }} /> {t('user_feedback')}
                </button>
              </div>
            )}

            {/* 3. SITE NAVIGATION (Vertical Stack Rows) */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingLeft: 2 }}>Điều hướng trang</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {navItems.map(item => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                      background: isActive ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {NAV_ICONS[item.path]}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 4. LOGOUT BUTTON */}
            {!loading && token && (
              <button
                onClick={async () => { setMobileOpen(false); await logout(); window.location.href = '/auth/login'; }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 'auto',
                }}
              >
                <LogOut size={16} />
                <span>{t('user_logout')}</span>
              </button>
            )}

            {/* Auth Buttons if not logged in */}
            {!loading && !token && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <button onClick={() => handleNav('/auth/login')} className="mobile-auth-login" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>
                  {t('nav_login')}
                </button>
                <button onClick={() => handleNav('/auth/register')} className="mobile-auth-register" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>
                  {t('nav_register')}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
