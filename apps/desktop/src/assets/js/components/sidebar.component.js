const SidebarComponent = `
<aside id="sidebar" class="sidebar">
  <div class="sidebar-header" onclick="toggleSidebar()" style="cursor:pointer; position:relative;" title="Đóng/Mở sidebar (Ctrl/Cmd + /)">
    <div class="sidebar-logo-container">
      <img src="img/logo.png" alt="EIGU Logo" class="sidebar-logo-img" style="width: 36px; height: 36px; object-fit: contain; flex-shrink: 0;">
      <span class="sidebar-title" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        EIGU Platform
        <span id="app-version-badge" style="font-size: 10px; background: rgba(255,255,255,0.1); color: var(--text-secondary); padding: 2px 6px; border-radius: 10px; font-weight: 600;">v1.0.8</span>
        <button id="update-badge-btn" class="update-badge-btn hidden" onclick="handleAppUpdateClick(event)" title="Có bản cập nhật mới! Click để nâng cấp & tự động khởi động lại.">
          Update
        </button>
      </span>
    </div>
    <span class="nav-icon toggle-icon" data-icon="chevronLeft" style="font-size: 20px; color: var(--text-secondary); transition: transform 0.3s; position: absolute; right: 16px;" title="Ctrl/Cmd + /"></span>
  </div>
  <nav class="sidebar-nav">
    <!-- Tab Dashboard Admin dành riêng cho Admin (NẰM TRÊN HỒ SƠ) -->
    <div class="nav-item admin-only hidden" data-view="admin-dashboard" onclick="switchView('admin-dashboard', this, null, event)">
      <span class="nav-icon" data-icon="dashboard"></span>
      <span class="nav-label" data-i18n="admin_dashboard">Dashboard Admin</span>
    </div>
    <div class="nav-item active" data-view="ho-so" onclick="switchView('ho-so', this, null, event)">
      <span class="nav-icon" data-icon="user"></span>
      <span class="nav-label" data-i18n="profile">Hồ sơ</span>
    </div>
    <div class="nav-item" data-view="transaction-history" onclick="switchView('transaction-history', this, null, event)">
      <span class="nav-icon" data-icon="wallet"></span>
      <span class="nav-label" data-i18n="transaction_history">Lịch sử giao dịch</span>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="cong-cu" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="zap"></span>
        <span class="nav-label" data-i18n="tools">Công cụ</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item cong-cu" data-sub="cut" onclick="switchView('cut', document.querySelector('[data-view=cong-cu]'), 'cut', event)"><span data-icon="scissors" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_cut">Tự động cắt</span></div>
        <div class="nav-sub-item cong-cu" data-sub="ai-video" onclick="switchView('ai-video', document.querySelector('[data-view=cong-cu]'), 'ai-video', event)"><span data-icon="zap" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_ai_video">Tạo video AI</span></div>
        <div class="nav-sub-item cong-cu" data-sub="reup" onclick="switchView('reup', document.querySelector('[data-view=cong-cu]'), 'reup', event)"><span data-icon="upload" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_reup">Tạo video Reup</span></div>
        <div class="nav-sub-item cong-cu" data-sub="hot-niche" onclick="switchView('hot-niche', document.querySelector('[data-view=cong-cu]'), 'hot-niche', event)"><span data-icon="trendingUp" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_hot_niche">Tìm ngách hot</span></div>
        <div class="nav-sub-item cong-cu" data-sub="bulk-download" onclick="switchView('bulk-download', document.querySelector('[data-view=cong-cu]'), 'bulk-download', event)"><span data-icon="downloadCloud" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_bulk_download">Tải video hàng loạt</span></div>
      </div>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="tu-dong-hoa" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="refreshCw"></span>
        <span class="nav-label" data-i18n="automation">Tự động hóa</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item tu-dong-hoa" data-sub="workflow" onclick="switchView('workflow', document.querySelector('[data-view=tu-dong-hoa]'), 'workflow', event)"><span data-icon="refreshCw" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_workflow">Tạo workflow</span></div>
        <div class="nav-sub-item tu-dong-hoa" data-sub="record" onclick="switchView('record', document.querySelector('[data-view=tu-dong-hoa]'), 'record', event)"><span data-icon="mic" style="vertical-align:middle;margin-right:4px;"></span> <span data-i18n="sub_record">Ghi thao tác</span></div>
      </div>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="tai-khoan" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="users"></span>
        <span class="nav-label" data-i18n="accounts">Tài khoản</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item tai-khoan" data-sub="tk-tiktok" onclick="switchView('tk-tiktok', document.querySelector('[data-view=tai-khoan]'), 'tk-tiktok', event)"><span data-icon="tiktok" style="vertical-align:middle;margin-right:4px;"></span> TikTok</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-facebook" onclick="switchView('tk-facebook', document.querySelector('[data-view=tai-khoan]'), 'tk-facebook', event)"><span data-icon="facebook" style="vertical-align:middle;margin-right:4px;"></span> Facebook</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-youtube" onclick="switchView('tk-youtube', document.querySelector('[data-view=tai-khoan]'), 'tk-youtube', event)"><span data-icon="youtube" style="vertical-align:middle;margin-right:4px;"></span> YouTube</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-x" onclick="switchView('tk-x', document.querySelector('[data-view=tai-khoan]'), 'tk-x', event)"><span data-icon="twitter" style="vertical-align:middle;margin-right:4px;"></span> X (Twitter)</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-instagram" onclick="switchView('tk-instagram', document.querySelector('[data-view=tai-khoan]'), 'tk-instagram', event)"><span data-icon="instagram" style="vertical-align:middle;margin-right:4px;"></span> Instagram</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-threads" onclick="switchView('tk-threads', document.querySelector('[data-view=tai-khoan]'), 'tk-threads', event)"><span data-icon="threads" style="vertical-align:middle;margin-right:4px;"></span> Threads</div>
      </div>
    </div>
    
    <!-- Tab Chat Support dành cho Staff & Admin -->
    <div class="nav-item staff-only hidden" data-view="chat-support" onclick="switchView('chat-support', this, null, event)">
      <span class="nav-icon" data-icon="messageSquare"></span>
      <span class="nav-label" data-i18n="chat_support">Chat Support</span>
    </div>

    <!-- Tab Quản lý dành cho Admin -->
    <div class="nav-item admin-only hidden" data-view="user-management" onclick="switchView('user-management', this, null, event)">
      <span class="nav-icon" data-icon="userCheck"></span>
      <span class="nav-label" data-i18n="user_management">Quản lý User/Staff</span>
    </div>
    <div class="nav-item admin-only hidden" data-view="create-notification" onclick="switchView('create-notification', this, null, event)">
      <span class="nav-icon" data-icon="bell"></span>
      <span class="nav-label" data-i18n="create_notification">Tạo thông báo</span>
    </div>
    <div class="nav-item admin-only hidden" data-view="feedback-management" onclick="switchView('feedback-management', this, null, event)">
      <span class="nav-icon" data-icon="helpCircle"></span>
      <span class="nav-label" data-i18n="feedback_management">Quản lý Feedback</span>
    </div>
    <div class="nav-item admin-only hidden" data-view="pricing-management" onclick="switchView('pricing-management', this, null, event)">
      <span class="nav-icon" data-icon="tag"></span>
      <span class="nav-label" data-i18n="pricing_management">Quản lý Bảng giá</span>
    </div>
    <div class="nav-item admin-only hidden" data-view="theme-event-management" onclick="switchView('theme-event-management', this, null, event)">
      <span class="nav-icon" data-icon="sun"></span>
      <span class="nav-label" data-i18n="theme_event_management">Giao diện & Sự kiện</span>
    </div>
    <div class="nav-item admin-only hidden" data-view="transaction-management" onclick="switchView('transaction-management', this, null, event)">
      <span class="nav-icon" data-icon="creditCard"></span>
      <span class="nav-label" data-i18n="transaction_management">Quản lý Giao dịch</span>
    </div>

    <div class="nav-item" data-view="tiep-thi" onclick="switchView('tiep-thi', this, null, event)">
      <span class="nav-icon" data-icon="link"></span>
      <span class="nav-label" data-i18n="affiliate">Tiếp thị liên kết</span>
    </div>
    <div class="nav-item" data-view="doi-nhom" onclick="switchView('doi-nhom', this, null, event)">
      <span class="nav-icon" data-icon="users"></span>
      <span class="nav-label" data-i18n="team">Đội nhóm</span>
    </div>
    <div class="nav-item" data-view="tien-ich" onclick="switchView('tien-ich', this, null, event)">
      <span class="nav-icon" data-icon="grid"></span>
      <span class="nav-label" data-i18n="utilities">Tiện ích</span>
    </div>
    <!-- Tab Báo cáo Thống kê dành riêng cho Admin (NẰM DƯỚI TIỆN ÍCH) -->
    <div class="nav-item admin-only hidden" data-view="analytics-reports" onclick="switchView('analytics-reports', this, null, event)">
      <span class="nav-icon" data-icon="trendingUp"></span>
      <span class="nav-label" data-i18n="analytics_reports">Báo cáo Thống kê</span>
    </div>
    <div class="nav-item" data-view="guide" onclick="switchView('guide', this, null, event)">
      <span class="nav-icon" data-icon="book"></span>
      <span class="nav-label" data-i18n="user_guide">Hướng dẫn sử dụng</span>
    </div>
    <div class="nav-item" data-view="user-activity-logs" onclick="switchView('user-activity-logs', this, null, event)">
      <span class="nav-icon" data-icon="fileText"></span>
      <span class="nav-label" data-i18n="activity_logs">Nhật ký hoạt động</span>
    </div>
  </nav>
</aside>
`;

function renderSidebar() {
  const root = document.getElementById('sidebar-root');
  if (root) {
    root.outerHTML = SidebarComponent;
    if (typeof ICONS !== 'undefined') {
      document.querySelectorAll('#sidebar [data-icon]').forEach(e => {
        const iconName = e.dataset.icon;
        if (ICONS[iconName]) {
          e.innerHTML = ICONS[iconName];
          e.removeAttribute('data-icon');
        }
      });
    }
  }
}
