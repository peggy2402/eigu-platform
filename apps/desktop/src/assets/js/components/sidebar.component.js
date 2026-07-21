const SidebarComponent = `
<aside id="sidebar" class="sidebar">
  <div class="sidebar-header" onclick="toggleSidebar()" style="cursor:pointer; position:relative;" title="Đóng/Mở sidebar (Ctrl/Cmd + /)">
    <div class="sidebar-logo-container">
      <img src="img/logo.png" alt="EIGU Logo" class="sidebar-logo-img" style="width: 36px; height: 36px; object-fit: contain; flex-shrink: 0;">
      <span class="sidebar-title">EIGU Platform</span>
    </div>
    <span class="nav-icon toggle-icon" data-icon="chevronLeft" style="font-size: 20px; color: var(--text-secondary); transition: transform 0.3s; position: absolute; right: 16px;" title="Ctrl/Cmd + /"></span>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-item active" data-view="ho-so" onclick="switchView('ho-so', this, null, event)">
      <span class="nav-icon" data-icon="user"></span>
      <span class="nav-label">Hồ sơ</span>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="cong-cu" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="zap"></span>
        <span class="nav-label">Công cụ</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item cong-cu" data-sub="cut" onclick="switchView('cut', document.querySelector('[data-view=cong-cu]'), 'cut', event)"><span data-icon="scissors" style="vertical-align:middle;margin-right:4px;"></span> Tự động cắt</div>
        <div class="nav-sub-item cong-cu" data-sub="ai-video" onclick="switchView('ai-video', document.querySelector('[data-view=cong-cu]'), 'ai-video', event)"><span data-icon="zap" style="vertical-align:middle;margin-right:4px;"></span> Tạo video AI</div>
        <div class="nav-sub-item cong-cu" data-sub="reup" onclick="switchView('reup', document.querySelector('[data-view=cong-cu]'), 'reup', event)"><span data-icon="upload" style="vertical-align:middle;margin-right:4px;"></span> Tạo video Reup</div>
        <div class="nav-sub-item cong-cu" data-sub="hot-niche" onclick="switchView('hot-niche', document.querySelector('[data-view=cong-cu]'), 'hot-niche', event)"><span data-icon="trendingUp" style="vertical-align:middle;margin-right:4px;"></span> Tìm ngách hot</div>
        <div class="nav-sub-item cong-cu" data-sub="bulk-download" onclick="switchView('bulk-download', document.querySelector('[data-view=cong-cu]'), 'bulk-download', event)"><span data-icon="downloadCloud" style="vertical-align:middle;margin-right:4px;"></span> Tải video hàng loạt</div>
      </div>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="tu-dong-hoa" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="refreshCw"></span>
        <span class="nav-label">Tự động hóa</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item tu-dong-hoa" data-sub="workflow" onclick="switchView('workflow', document.querySelector('[data-view=tu-dong-hoa]'), 'workflow', event)"><span data-icon="refreshCw" style="vertical-align:middle;margin-right:4px;"></span> Tạo workflow</div>
        <div class="nav-sub-item tu-dong-hoa" data-sub="record" onclick="switchView('record', document.querySelector('[data-view=tu-dong-hoa]'), 'record', event)"><span data-icon="mic" style="vertical-align:middle;margin-right:4px;"></span> Ghi thao tác</div>
      </div>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="tai-khoan" onclick="toggleDropdown(this, event)">
        <span class="nav-icon" data-icon="users"></span>
        <span class="nav-label">Tài khoản</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item tai-khoan" data-sub="tk-tiktok" onclick="switchView('tk-tiktok', document.querySelector('[data-view=tai-khoan]'), 'tk-tiktok', event)"><span data-icon="tiktok" style="vertical-align:middle;margin-right:4px;"></span> TikTok</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-facebook" onclick="switchView('tk-facebook', document.querySelector('[data-view=tai-khoan]'), 'tk-facebook', event)"><span data-icon="facebook" style="vertical-align:middle;margin-right:4px;"></span> Facebook</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-youtube" onclick="switchView('tk-youtube', document.querySelector('[data-view=tai-khoan]'), 'tk-youtube', event)"><span data-icon="youtube" style="vertical-align:middle;margin-right:4px;"></span> YouTube</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-x" onclick="switchView('tk-x', document.querySelector('[data-view=tai-khoan]'), 'tk-x', event)"><span data-icon="x" style="vertical-align:middle;margin-right:4px;"></span> X (Twitter)</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-instagram" onclick="switchView('tk-instagram', document.querySelector('[data-view=tai-khoan]'), 'tk-instagram', event)"><span data-icon="instagram" style="vertical-align:middle;margin-right:4px;"></span> Instagram</div>
        <div class="nav-sub-item tai-khoan" data-sub="tk-threads" onclick="switchView('tk-threads', document.querySelector('[data-view=tai-khoan]'), 'tk-threads', event)"><span data-icon="threads" style="vertical-align:middle;margin-right:4px;"></span> Threads</div>
      </div>
    </div>
    <div class="nav-item" data-view="tiep-thi" onclick="switchView('tiep-thi', this, null, event)">
      <span class="nav-icon" data-icon="link"></span>
      <span class="nav-label">Tiếp thị liên kết</span>
    </div>
    <div class="nav-item" data-view="doi-nhom" onclick="switchView('doi-nhom', this, null, event)">
      <span class="nav-icon" data-icon="users"></span>
      <span class="nav-label">Đội nhóm</span>
    </div>
    <div class="nav-item" data-view="tien-ich" onclick="switchView('tien-ich', this, null, event)">
      <span class="nav-icon" data-icon="grid"></span>
      <span class="nav-label">Tiện ích</span>
    </div>
    <div class="nav-item" data-view="guide" onclick="switchView('guide', this, null, event)">
      <span class="nav-icon" data-icon="book"></span>
      <span class="nav-label">Hướng dẫn sử dụng</span>
    </div>
  </nav>
</aside>
`;

function renderSidebar() {
  const root = document.getElementById('sidebar-root');
  if (root) {
    root.outerHTML = SidebarComponent;
  }
}
