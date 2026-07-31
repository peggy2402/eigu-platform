'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '6px 12px',
        borderRadius: 20,
        color: 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <Globe size={14} />
      <span>{language.toUpperCase()}</span>
    </button>
  );
}
