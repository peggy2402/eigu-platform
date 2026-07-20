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
    <button class="notif-btn" onclick="alert('Chức năng thông báo sẽ được phát triển sau.')">
      <span data-icon="bell"></span>
    </button>
    <div class="profile-menu-wrapper" onclick="toggleProfileMenu(event)">
      <div class="profile-menu-trigger">
        <span id="greeting-text">Xin chào</span>
        <span data-icon="chevronDown" class="chevron-icon"></span>
      </div>
      <div class="profile-menu-dropdown" id="profile-dropdown">
        <div class="profile-menu-item" onclick="switchView('settings')">
          <span data-icon="settings"></span> Cài đặt
        </div>
        <div class="profile-menu-item" onclick="switchView('feedback')">
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
      <div class="search-result" data-view="ho-so" onclick="closeSearchPopup();switchView('ho-so',document.querySelector('[data-view=ho-so]'))">
        <span data-icon="user"></span> Hồ sơ
      </div>
      <div class="search-result" data-view="cut" onclick="closeSearchPopup();switchView('cut', document.querySelector('[data-view=cong-cu]'), 'cut')">
        <span data-icon="scissors"></span> Tự động cắt
      </div>
      <div class="search-result" data-view="ai-video" onclick="closeSearchPopup();switchView('ai-video', document.querySelector('[data-view=cong-cu]'), 'ai-video')">
        <span data-icon="zap"></span> Tạo video AI
      </div>
      <div class="search-result" data-view="hot-niche" onclick="closeSearchPopup();switchView('hot-niche', document.querySelector('[data-view=cong-cu]'), 'hot-niche')">
        <span data-icon="trendingUp"></span> Tìm ngách hot
      </div>
      <div class="search-result" data-view="workflow" onclick="closeSearchPopup();switchView('workflow', document.querySelector('[data-view=tu-dong-hoa]'), 'workflow')">
        <span data-icon="refreshCw"></span> Tạo workflow
      </div>
      <div class="search-result" data-view="record" onclick="closeSearchPopup();switchView('record', document.querySelector('[data-view=tu-dong-hoa]'), 'record')">
        <span data-icon="mic"></span> Ghi thao tác
      </div>
      <div class="search-result" data-view="tai-khoan" onclick="closeSearchPopup();switchView('tai-khoan',document.querySelector('[data-view=tai-khoan]'))">
        <span data-icon="users"></span> Tài khoản
      </div>
      <div class="search-result" data-view="tiep-thi" onclick="closeSearchPopup();switchView('tiep-thi',document.querySelector('[data-view=tiep-thi]'))">
        <span data-icon="link"></span> Tiếp thị liên kết
      </div>
      <div class="search-result" data-view="doi-nhom" onclick="closeSearchPopup();switchView('doi-nhom',document.querySelector('[data-view=doi-nhom]'))">
        <span data-icon="users"></span> Đội nhóm
      </div>
      <div class="search-result" data-view="tien-ich" onclick="closeSearchPopup();switchView('tien-ich',document.querySelector('[data-view=tien-ich]'))">
        <span data-icon="grid"></span> Tiện ích
      </div>
      <div class="search-result" data-view="guide" onclick="closeSearchPopup();switchView('guide',document.querySelector('[data-view=guide]'))">
        <span data-icon="book"></span> Hướng dẫn sử dụng
      </div>
      <div class="search-result" data-view="settings" onclick="closeSearchPopup();switchView('settings',document.querySelector('[data-view=settings]'))">
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
