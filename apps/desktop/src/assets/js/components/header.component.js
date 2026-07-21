const HeaderComponent = `
<div class="main-header">
  <div class="main-header-left">
    <h2 id="view-title">Dashboard</h2>
    <p id="view-subtitle">Tổng quan hệ thống</p>
  </div>
  <div class="main-header-right">
    <div class="search-mini" onclick="openSearchPopup()">
      <span data-icon="search"></span>
      <input type="text" id="global-search-input" placeholder="Tìm công cụ..." readonly />
      <kbd>Ctrl+K</kbd>
    </div>
    <div class="notif-wrapper" style="position: relative;">
      <button class="notif-btn" onclick="toggleNotificationDrawer(event)">
        <span data-icon="bell"></span>
        <span id="notif-badge" class="notif-badge hidden">0</span>
      </button>
      <div id="notif-drawer" class="notif-drawer hidden" onclick="event.stopPropagation()">
        <div class="notif-drawer-header">
          <h4>Thông báo hệ thống</h4>
          <button class="notif-mark-read-btn" onclick="markAllNotificationsRead()">Đã đọc tất cả</button>
        </div>
        <div id="notif-drawer-list" class="notif-drawer-list">
          <!-- Notification items render here -->
        </div>
      </div>
    </div>
    <div class="profile-menu-wrapper" onclick="toggleProfileMenu(event)">
      <div class="profile-menu-trigger">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span id="greeting-text">Xin chào</span>
          <span id="role-badge" style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;width:fit-content;"></span>
        </div>
        <span data-icon="chevronDown" class="chevron-icon"></span>
      </div>
      <div class="profile-menu-dropdown" id="profile-dropdown">
        <div class="profile-menu-item" onclick="switchView('settings', null, null, event)">
          <span data-icon="settings"></span> Cài đặt
        </div>
        <div class="profile-menu-item" onclick="switchView('feedback', null, null, event)">
          <span data-icon="bug"></span> Góp ý / Báo lỗi
        </div>
        <div class="profile-menu-divider"></div>
        <div class="profile-menu-item danger" onclick="handleLogout()">
          <span data-icon="logout"></span> Đăng xuất
        </div>
      </div>
    </div>
  </div>
</div>
<!-- Search Popup -->
<div id="search-popup-overlay" class="popup-overlay hidden" onclick="closeSearchPopup(event)">
  <div class="search-popup" onclick="event.stopPropagation()">
    <div class="search-popup-header">
      <span data-icon="search"></span>
      <input type="text" id="search-popup-input" placeholder="Tìm kiếm công cụ..." autofocus />
      <button class="search-popup-close" onclick="closeSearchPopup()"><span data-icon="x"></span></button>
    </div>
    <div class="search-popup-body" id="search-popup-body">
      <div class="search-result" data-view="ho-so" onclick="closeSearchPopup();switchView('ho-so',document.querySelector('[data-view=ho-so]'), null, event)">
        <span data-icon="user"></span> Hồ sơ
      </div>
      <div class="search-result" data-view="cut" onclick="closeSearchPopup();switchView('cut', document.querySelector('[data-view=cong-cu]'), 'cut', event)">
        <span data-icon="scissors"></span> Tự động cắt
      </div>
      <div class="search-result" data-view="ai-video" onclick="closeSearchPopup();switchView('ai-video', document.querySelector('[data-view=cong-cu]'), 'ai-video', event)">
        <span data-icon="zap"></span> Tạo video AI
      </div>
      <div class="search-result" data-view="hot-niche" onclick="closeSearchPopup();switchView('hot-niche', document.querySelector('[data-view=cong-cu]'), 'hot-niche', event)">
        <span data-icon="trendingUp"></span> Tìm ngách hot
      </div>
      <div class="search-result" data-view="workflow" onclick="closeSearchPopup();switchView('workflow', document.querySelector('[data-view=tu-dong-hoa]'), 'workflow', event)">
        <span data-icon="refreshCw"></span> Tạo workflow
      </div>
      <div class="search-result" data-view="record" onclick="closeSearchPopup();switchView('record', document.querySelector('[data-view=tu-dong-hoa]'), 'record', event)">
        <span data-icon="mic"></span> Ghi thao tác
      </div>
      <div class="search-result" data-view="tk-tiktok" onclick="closeSearchPopup();switchView('tk-tiktok', document.querySelector('[data-view=tai-khoan]'), 'tk-tiktok', event)">
        <span data-icon="tiktok"></span> TikTok
      </div>
      <div class="search-result" data-view="tk-facebook" onclick="closeSearchPopup();switchView('tk-facebook', document.querySelector('[data-view=tai-khoan]'), 'tk-facebook', event)">
        <span data-icon="facebook"></span> Facebook
      </div>
      <div class="search-result" data-view="tk-youtube" onclick="closeSearchPopup();switchView('tk-youtube', document.querySelector('[data-view=tai-khoan]'), 'tk-youtube', event)">
        <span data-icon="youtube"></span> YouTube
      </div>
      <div class="search-result" data-view="tk-x" onclick="closeSearchPopup();switchView('tk-x', document.querySelector('[data-view=tai-khoan]'), 'tk-x', event)">
        <span data-icon="twitter"></span> X (Twitter)
      </div>
      <div class="search-result" data-view="tk-instagram" onclick="closeSearchPopup();switchView('tk-instagram', document.querySelector('[data-view=tai-khoan]'), 'tk-instagram', event)">
        <span data-icon="instagram"></span> Instagram
      </div>
      <div class="search-result" data-view="tk-threads" onclick="closeSearchPopup();switchView('tk-threads', document.querySelector('[data-view=tai-khoan]'), 'tk-threads', event)">
        <span data-icon="threads"></span> Threads
      </div>
      <div class="search-result" data-view="tiep-thi" onclick="closeSearchPopup();switchView('tiep-thi',document.querySelector('[data-view=tiep-thi]'), null, event)">
        <span data-icon="link"></span> Tiếp thị liên kết
      </div>
      <div class="search-result" data-view="doi-nhom" onclick="closeSearchPopup();switchView('doi-nhom',document.querySelector('[data-view=doi-nhom]'), null, event)">
        <span data-icon="users"></span> Đội nhóm
      </div>
      <div class="search-result" data-view="tien-ich" onclick="closeSearchPopup();switchView('tien-ich',document.querySelector('[data-view=tien-ich]'), null, event)">
        <span data-icon="grid"></span> Tiện ích
      </div>
      <div class="search-result" data-view="guide" onclick="closeSearchPopup();switchView('guide',document.querySelector('[data-view=guide]'), null, event)">
        <span data-icon="book"></span> Hướng dẫn sử dụng
      </div>
      <div class="search-result" data-view="settings" onclick="closeSearchPopup();switchView('settings',document.querySelector('[data-view=settings]'), null, event)">
        <span data-icon="settings"></span> Cài đặt
      </div>
    </div>
    <div class="search-popup-footer">Go to: <kbd>Enter</kbd> &middot; Close: <kbd>Esc</kbd></div>
  </div>
</div>
`;

function renderHeader() {
  const root = document.getElementById('header-root');
  if (root) {
    root.outerHTML = HeaderComponent;
  }
}
