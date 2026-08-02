const HeaderComponent = `
<div class="main-header">
  <div class="main-header-left">
    <h2 id="view-title">Dashboard</h2>
    <p id="view-subtitle">Tổng quan hệ thống</p>
  </div>
  <div class="main-header-right">
    <div class="search-mini" onclick="openSearchPopup()">
      <span data-icon="search"></span>
      <input type="text" id="global-search-input" data-i18n-placeholder="search_placeholder" placeholder="Tìm công cụ..." readonly />
      <kbd>Ctrl+K</kbd>
    </div>
    <div class="notif-wrapper" style="position: relative;">
      <button class="notif-btn" onclick="toggleNotificationDrawer(event)">
        <span data-icon="bell"></span>
        <span id="notif-badge" class="notif-badge hidden">0</span>
      </button>
      <div id="notif-drawer" class="notif-drawer hidden" onclick="event.stopPropagation()">
        <div class="notif-drawer-header">
          <h4 data-i18n="notif_drawer_title">Thông báo hệ thống</h4>
          <button class="notif-mark-read-btn" onclick="markAllNotificationsRead()" data-i18n="mark_read_all">Đã đọc tất cả</button>
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
        <!-- Balance Display Box & Deposit Button -->
        <div style="padding: 12px 14px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%); border-radius: 12px; margin-bottom: 10px; border: 1px solid var(--border-color);" onclick="event.stopPropagation()">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;" data-i18n="user_balance_label">Số dư tài khoản</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" title="Làm mới số dư real-time" onclick="refreshUserProfileDesktop(); event.stopPropagation();" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-muted); border-radius: 6px; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>
              <span style="font-size: 10px; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(34, 197, 94, 0.3);">VND</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div id="header-user-balance" style="font-size: 17px; font-weight: 900; color: #22c55e; letter-spacing: -0.3px;">0đ</div>
            <button type="button" onclick="openDepositModalDesktop(); event.stopPropagation();" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 8px; background: var(--accent); color: #ffffff; border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35); transition: all 0.2s;" data-i18n="deposit_btn_short">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Nạp tiền</span>
            </button>
          </div>
        </div>

        <div class="profile-menu-item" onclick="switchView('settings', null, null, event)">
          <span data-icon="settings"></span> <span data-i18n="settings">Cài đặt</span>
        </div>
        <div class="profile-menu-item" onclick="switchView('feedback', null, null, event)">
          <span data-icon="bug"></span> <span data-i18n="feedback">Góp ý / Báo lỗi</span>
        </div>
        <div class="profile-menu-divider"></div>
        <div class="profile-menu-item danger" onclick="handleLogout()">
          <span data-icon="logout"></span> <span data-i18n="logout">Đăng xuất</span>
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
