'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('eigu_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('eigu_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
      className="theme-toggle-btn"
      title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={17} style={{ color: '#f59e0b' }} />
      ) : (
        <Moon size={17} style={{ color: '#6366f1' }} />
      )}
    </button>
  );
}
