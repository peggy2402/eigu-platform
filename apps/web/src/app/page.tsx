'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Bell, Scissors, Sparkles, TrendingUp, RefreshCw, Mic, Users, Link, Grid, User, BookOpen, ChevronDown, Settings, LogOut, Bug } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import type { ViewType } from '../components/layout/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import ActivitySection from '../components/dashboard/ActivitySection';
import WorkflowFlow from '../components/dashboard/WorkflowFlow';
import AutomationView from '../components/automation/AutomationView';
import ProfileView from '../components/profile/ProfileView';
import SettingsView from '../components/settings/SettingsView';
import FeedbackView from '../components/feedback/FeedbackView';
import GuideView from '../components/guide/GuideView';
import BackofficeView from '../components/backoffice/BackofficeView';
import SearchPopup from '../components/search/SearchPopup';

const viewTitles: Record<ViewType, [string, string]> = {
  'backoffice': ['Trung tâm Vận hành', 'Quản lý người dùng, bảo trì và hỗ trợ vận hành hệ thống'],
  'ho-so': ['Hồ sơ', 'Thông tin cá nhân'],
  'cut': ['Tự động cắt', 'Cắt và xử lý video tự động'],
  'ai-video': ['Tạo video AI', 'Sinh video bằng trí tuệ nhân tạo'],
  'hot-niche': ['Tìm ngách hot', 'Phân tích xu hướng thị trường'],
  'bulk-download': ['Tải video hàng loạt', 'Tải danh sách video hàng loạt từ nhiều nguồn'],
  'workflow': ['Tạo workflow', 'Thiết kế luồng xử lý tự động'],
  'record': ['Ghi thao tác', 'Ghi lại các thao tác trình duyệt'],
  'tai-khoan': ['Tài khoản', 'Quản lý tài khoản TikTok'],
  'tiep-thi': ['Tiếp thị liên kết', 'Quản lý affiliate marketing'],
  'doi-nhom': ['Đội nhóm', 'Quản lý thành viên và phân quyền'],
  'tien-ich': ['Tiện ích', 'Các tiện ích bổ sung'],
  'guide': ['Hướng dẫn sử dụng', 'Các tính năng của EIGU Platform'],
  'settings': ['Cài đặt', 'Cấu hình ứng dụng'],
  'feedback': ['Góp ý / Báo lỗi', 'Gửi ý kiến đóng góp hoặc báo lỗi hệ thống'],
};

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ opacity: 0.3, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token, user, logout, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('ho-so');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [congCuOpen, setCongCuOpen] = useState(false);
  const [tuDongHoaOpen, setTuDongHoaOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-wrapper')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    document.addEventListener('click', clickHandler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.removeEventListener('click', clickHandler);
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.href = '/auth/login';
  }, [logout]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Đang tải hệ thống...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src="/logo.png" alt="EIGU Logo" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 12 }} />
            <h1>EIGU Platform</h1>
            <p>Anti-Detect Automation Engine</p>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Vui lòng <a href="/auth/login" style={{ color: 'var(--accent)' }}>dang nhap</a> hoac{' '}
            <a href="/auth/register" style={{ color: 'var(--accent)' }}>dang ky</a> de tiep tuc.
          </p>
        </div>
      </div>
    );
  }

  const displayName = user?.username || (user?.email ? user.email.split('@')[0] : 'User');

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    if (['cut', 'ai-video', 'hot-niche'].includes(view)) {
      setCongCuOpen(true);
      setTuDongHoaOpen(false);
    } else if (['workflow', 'record'].includes(view)) {
      setTuDongHoaOpen(true);
      setCongCuOpen(false);
    } else {
      setCongCuOpen(false);
      setTuDongHoaOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {searchOpen && (
        <SearchPopup
          onClose={() => setSearchOpen(false)}
          onNavigate={handleViewChange}
        />
      )}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        congCuOpen={congCuOpen}
        onCongCuToggle={() => {
          setCongCuOpen(!congCuOpen);
          setTuDongHoaOpen(false);
          if (sidebarCollapsed) setSidebarCollapsed(false);
        }}
        tuDongHoaOpen={tuDongHoaOpen}
        onTuDongHoaToggle={() => {
          setTuDongHoaOpen(!tuDongHoaOpen);
          setCongCuOpen(false);
          if (sidebarCollapsed) setSidebarCollapsed(false);
        }}
        onLogout={handleLogout}
      />
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-header">
          <div className="main-header-left">
            <h2>{viewTitles[activeView][0]}</h2>
            <p>{viewTitles[activeView][1]}</p>
          </div>
          <div className="main-header-right">
            <div className="search-mini" onClick={() => setSearchOpen(true)}>
              <Search size={14} />
              <span>Tìm công cụ...</span>
              <kbd>Ctrl+K</kbd>
            </div>
            <button className="notif-btn" onClick={() => alert('Chức năng thông báo sẽ được phát triển sau.')}>
              <Bell size={18} />
            </button>
            <div className={`profile-menu-wrapper ${profileMenuOpen ? 'open' : ''}`}>
              <div className="profile-menu-trigger" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen); }}>
                <span id="greeting-text">Xin chào, {displayName}</span>
                <ChevronDown className="chevron-icon" size={14} />
              </div>
              <div className="profile-menu-dropdown" id="profile-dropdown">
                <div className="profile-menu-item" onClick={() => { setActiveView('settings'); setProfileMenuOpen(false); }}>
                  <Settings size={14} /> Cài đặt
                </div>
                <div className="profile-menu-item" onClick={() => { setActiveView('feedback'); setProfileMenuOpen(false); }}>
                  <Bug size={14} /> Góp ý / Báo lỗi
                </div>
                <div className="profile-menu-divider"></div>
                <div className="profile-menu-item danger" onClick={handleLogout}>
                  <LogOut size={14} /> Đăng xuất
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="main-content">
          {activeView === 'backoffice' && <BackofficeView />}
          {activeView === 'ho-so' && user && <ProfileView user={user} />}
          {activeView === 'cut' && <AutomationView />}
          {activeView === 'ai-video' && <PlaceholderView icon={<Sparkles size={48} />} title="Tạo video AI" />}
          {activeView === 'hot-niche' && <PlaceholderView icon={<TrendingUp size={48} />} title="Tìm ngách hot" />}
          {activeView === 'workflow' && <PlaceholderView icon={<RefreshCw size={48} />} title="Tạo workflow" />}
          {activeView === 'record' && <PlaceholderView icon={<Mic size={48} />} title="Ghi thao tác" />}
          {activeView === 'tai-khoan' && <PlaceholderView icon={<Users size={48} />} title="Tài khoản" />}
          {activeView === 'tiep-thi' && <PlaceholderView icon={<Link size={48} />} title="Tiếp thị liên kết" />}
          {activeView === 'doi-nhom' && <PlaceholderView icon={<Users size={48} />} title="Đội nhóm" />}
          {activeView === 'tien-ich' && <PlaceholderView icon={<Grid size={48} />} title="Tiện ích" />}
          {activeView === 'guide' && <GuideView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'feedback' && <FeedbackView />}
        </div>
      </div>
    </div>
  );
}
