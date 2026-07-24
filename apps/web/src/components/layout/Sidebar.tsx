'use client';

import {
  User, Zap, Scissors, Sparkles, TrendingUp, RefreshCw, Mic,
  Users, Link, Grid, BookOpen, Settings, LogOut, ChevronRight, DownloadCloud, ShieldCheck
} from 'lucide-react';

export type ViewType = 'ho-so' | 'cut' | 'ai-video' | 'hot-niche' | 'bulk-download' | 'workflow' | 'record' | 'tai-khoan' | 'tiep-thi' | 'doi-nhom' | 'tien-ich' | 'guide' | 'settings' | 'feedback' | 'backoffice';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggle: () => void;
  congCuOpen: boolean;
  onCongCuToggle: () => void;
  tuDongHoaOpen: boolean;
  onTuDongHoaToggle: () => void;
  onLogout: () => void;
}

const iconSize = 18;

export default function Sidebar({
  activeView, onViewChange, collapsed, onToggle,
  congCuOpen, onCongCuToggle, tuDongHoaOpen, onTuDongHoaToggle, onLogout,
}: SidebarProps) {
  const isActive = (v: ViewType) => activeView === v;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="EIGU Logo" className="sidebar-logo-img" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
        <span className="sidebar-title">EIGU Platform</span>
        <div className="sidebar-toggle" onClick={onToggle}><ChevronRight size={12} /></div>
      </div>
      <nav className="sidebar-nav">
        <div className={`nav-item ${isActive('backoffice') ? 'active' : ''}`}
             style={{ background: isActive('backoffice') ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 8 }}
             onClick={() => { onViewChange('backoffice'); }}>
          <span className="nav-icon" style={{ color: 'var(--accent)' }}><ShieldCheck size={iconSize} /></span>
          <span className="nav-label" style={{ fontWeight: 700, color: 'var(--accent)' }}>Trung tâm Vận hành</span>
        </div>

        <div className={`nav-item ${isActive('ho-so') ? 'active' : ''}`}
             onClick={() => { onViewChange('ho-so'); }}>
          <span className="nav-icon"><User size={iconSize} /></span>
          <span className="nav-label">Hồ sơ</span>
        </div>

        <div className={`nav-item ${congCuOpen ? 'open' : ''}`} onClick={onCongCuToggle}>
          <span className="nav-icon"><Zap size={iconSize} /></span>
          <span className="nav-label">Công cụ</span>
          <span className="dropdown-arrow"><ChevronRight size={10} /></span>
        </div>
        <div className="nav-sub" style={{ maxHeight: congCuOpen ? 200 : 0 }}>
          <span className={`nav-sub-item ${isActive('cut') ? 'active' : ''}`}
                onClick={() => { onViewChange('cut'); }}><Scissors size={14} style={{verticalAlign:'middle',marginRight:4}} /> Tự động cắt</span>
          <span className={`nav-sub-item ${isActive('ai-video') ? 'active' : ''}`}
                onClick={() => { onViewChange('ai-video'); }}><Sparkles size={14} style={{verticalAlign:'middle',marginRight:4}} /> Tạo video AI</span>
          <span className={`nav-sub-item ${isActive('hot-niche') ? 'active' : ''}`}
                onClick={() => { onViewChange('hot-niche'); }}><TrendingUp size={14} style={{verticalAlign:'middle',marginRight:4}} /> Tìm ngách hot</span>
          <span className={`nav-sub-item ${isActive('bulk-download') ? 'active' : ''}`}
                onClick={() => { onViewChange('bulk-download'); }}><DownloadCloud size={14} style={{verticalAlign:'middle',marginRight:4}} /> Tải video hàng loạt</span>
        </div>

        <div className={`nav-item ${tuDongHoaOpen ? 'open' : ''}`} onClick={onTuDongHoaToggle}>
          <span className="nav-icon"><RefreshCw size={iconSize} /></span>
          <span className="nav-label">Tự động hóa</span>
          <span className="dropdown-arrow"><ChevronRight size={10} /></span>
        </div>
        <div className="nav-sub" style={{ maxHeight: tuDongHoaOpen ? 200 : 0 }}>
          <span className={`nav-sub-item ${isActive('workflow') ? 'active' : ''}`}
                onClick={() => { onViewChange('workflow'); }}><RefreshCw size={14} style={{verticalAlign:'middle',marginRight:4}} /> Tạo workflow</span>
          <span className={`nav-sub-item ${isActive('record') ? 'active' : ''}`}
                onClick={() => { onViewChange('record'); }}><Mic size={14} style={{verticalAlign:'middle',marginRight:4}} /> Ghi thao tác</span>
        </div>

        <div className={`nav-item ${isActive('tai-khoan') ? 'active' : ''}`}
             onClick={() => { onViewChange('tai-khoan'); }}>
          <span className="nav-icon"><Users size={iconSize} /></span>
          <span className="nav-label">Tài khoản</span>
        </div>
        <div className={`nav-item ${isActive('tiep-thi') ? 'active' : ''}`}
             onClick={() => { onViewChange('tiep-thi'); }}>
          <span className="nav-icon"><Link size={iconSize} /></span>
          <span className="nav-label">Tiếp thị liên kết</span>
        </div>
        <div className={`nav-item ${isActive('doi-nhom') ? 'active' : ''}`}
             onClick={() => { onViewChange('doi-nhom'); }}>
          <span className="nav-icon"><Users size={iconSize} /></span>
          <span className="nav-label">Đội nhóm</span>
        </div>
        <div className={`nav-item ${isActive('tien-ich') ? 'active' : ''}`}
             onClick={() => { onViewChange('tien-ich'); }}>
          <span className="nav-icon"><Grid size={iconSize} /></span>
          <span className="nav-label">Tiện ích</span>
        </div>

        <div className={`nav-item ${isActive('guide') ? 'active' : ''}`}
             onClick={() => { onViewChange('guide'); }}>
          <span className="nav-icon"><BookOpen size={iconSize} /></span>
          <span className="nav-label">Hướng dẫn sử dụng</span>
        </div>
      </nav>
    </aside>
  );
}
