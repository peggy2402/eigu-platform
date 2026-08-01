'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Wallet, Settings, Bug, LogOut, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { useLanguage } from '../../contexts/LanguageContext';

interface UserDropdownProps {
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onNavigate: (path: string) => void;
}

export default function UserDropdown({ onOpenSettings, onOpenFeedback, onNavigate }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const displayName = user?.username || (user?.email ? user.email.split('@')[0] : 'User');
  const formattedBalance = (user?.balance || 0).toLocaleString('vi-VN') + 'đ';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '8px 14px',
          borderRadius: 20,
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span>{t('user_hello')}, <strong style={{ color: 'var(--accent)' }}>{displayName}</strong></span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 250,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 20px rgba(245, 158, 11, 0.2)',
            zIndex: 99999,
            overflow: 'hidden',
            padding: 8,
          }}
        >
          {/* Balance Section */}
          <div
            style={{
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wallet size={12} style={{ color: 'var(--accent)' }} /> {t('user_balance')}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {formattedBalance}
            </div>
          </div>

          {/* Actions Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button
              onClick={() => { setOpen(false); onNavigate('/dashboard/transactions'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="dropdown-item"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={14} /> {t('user_deposit')}
              </span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={() => { setOpen(false); onOpenSettings(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="dropdown-item"
            >
              <Settings size={14} /> {t('user_settings')}
            </button>

            <button
              onClick={() => { setOpen(false); onOpenFeedback(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="dropdown-item"
            >
              <Bug size={14} /> {t('user_feedback')}
            </button>

            <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="dropdown-item danger"
            >
              <LogOut size={14} /> {t('user_logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
