'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Scissors, Sparkles, TrendingUp, RefreshCw, Mic, Users, Link, Grid, BookOpen, Settings } from 'lucide-react';
import type { ViewType } from '../layout/Sidebar';

const tools: { view: ViewType; icon: React.ReactNode; label: string }[] = [
  { view: 'ho-so', icon: <User size={18} />, label: 'Hồ sơ' },
  { view: 'cut', icon: <Scissors size={18} />, label: 'Tự động cắt' },
  { view: 'ai-video', icon: <Sparkles size={18} />, label: 'Tạo video AI' },
  { view: 'hot-niche', icon: <TrendingUp size={18} />, label: 'Tìm ngách hot' },
  { view: 'workflow', icon: <RefreshCw size={18} />, label: 'Tạo workflow' },
  { view: 'record', icon: <Mic size={18} />, label: 'Ghi thao tác' },
  { view: 'tai-khoan', icon: <Users size={18} />, label: 'Tài khoản' },
  { view: 'tiep-thi', icon: <Link size={18} />, label: 'Tiếp thị liên kết' },
  { view: 'doi-nhom', icon: <Users size={18} />, label: 'Đội nhóm' },
  { view: 'tien-ich', icon: <Grid size={18} />, label: 'Tiện ích' },
  { view: 'guide', icon: <BookOpen size={18} />, label: 'Hướng dẫn sử dụng' },
  { view: 'settings', icon: <Settings size={18} />, label: 'Cài đặt' },
];

export default function SearchPopup({ onClose, onNavigate }: { onClose: () => void; onNavigate: (view: ViewType) => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? tools.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
    : tools;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '12vh',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm công cụ..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              color: 'var(--text-primary)', fontSize: 16, outline: 'none',
              fontFamily: 'var(--font)',
            }}
          />
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 4,
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '8px 0', maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map(t => (
            <div key={t.label} onClick={() => { onNavigate(t.view); onClose(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 14,
              transition: 'all 0.1s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = ''; }}
            >
              {t.icon}
              {t.label}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Không tìm thấy công cụ nào
            </div>
          )}
        </div>
        <div style={{
          padding: '10px 20px', borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)', fontSize: 12,
        }}>
          Go to: <kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }}>Enter</kbd>
          &middot; Close: <kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }}>Esc</kbd>
        </div>
      </div>
    </div>
  );
}
