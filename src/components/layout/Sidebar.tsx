'use client';

import {
  User, Wallet, Link, Tag, History, BookOpen, HelpCircle, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type ViewType = 'ho-so' | 'lich-su' | 'affiliate' | 'bang-gia' | 'nhat-ky' | 'huong-dan' | 'tro-giup' | 'cut' | 'ai-video' | 'hot-niche' | 'bulk-download' | 'workflow' | 'record' | 'tai-khoan' | 'tiep-thi' | 'doi-nhom' | 'tien-ich' | 'guide' | 'settings' | 'feedback';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const iconSize = 18;

export default function Sidebar({
  activeView, onViewChange, collapsed, onToggle,
}: SidebarProps) {
  const { t } = useLanguage();
  const isActive = (v: ViewType) => activeView === v;

  const userMenuItems: { view: ViewType; icon: React.ReactNode; label: string }[] = [
    { view: 'ho-so', icon: <User size={iconSize} />, label: t('side_profile') },
    { view: 'lich-su', icon: <Wallet size={iconSize} />, label: t('side_history') },
    { view: 'affiliate', icon: <Link size={iconSize} />, label: t('side_affiliate') },
    { view: 'bang-gia', icon: <Tag size={iconSize} />, label: t('side_pricing') },
    { view: 'nhat-ky', icon: <History size={iconSize} />, label: t('side_logs') },
    { view: 'huong-dan', icon: <BookOpen size={iconSize} />, label: t('side_guide') },
    { view: 'tro-giup', icon: <HelpCircle size={iconSize} />, label: t('side_help') },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="EIGU Logo" className="sidebar-logo-img" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
        <span className="sidebar-title">EIGU Portal</span>
        <div className="sidebar-toggle" onClick={onToggle}><ChevronRight size={12} /></div>
      </div>
      <nav className="sidebar-nav">
        {userMenuItems.map(item => (
          <div
            key={item.view}
            className={`nav-item ${isActive(item.view) ? 'active' : ''}`}
            onClick={() => onViewChange(item.view)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
