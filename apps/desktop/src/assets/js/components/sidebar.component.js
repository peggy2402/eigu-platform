const SidebarComponent = `
<aside id="sidebar" class="sidebar">
  <div class="sidebar-header" onclick="toggleSidebar()" style="cursor:pointer; position:relative;" title="Đóng/Mở sidebar (Command + /)">
    <div class="sidebar-logo-container">
      <img src="img/logo.png" alt="EIGU Logo" class="sidebar-logo-img" style="width: 36px; height: 36px; object-fit: contain; flex-shrink: 0;">
      <span class="sidebar-title">EIGU Platform</span>
    </div>
    <span class="nav-icon toggle-icon" data-icon="chevronLeft" style="font-size: 20px; color: var(--text-secondary); transition: transform 0.3s; position: absolute; right: 16px;" title="Command + /"></span>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-item active" data-view="ho-so" onclick="switchView('ho-so', this)">
      <span class="nav-icon" data-icon="user"></span>
      <span class="nav-label">Hồ sơ</span>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="cong-cu" onclick="toggleDropdown(this)">
        <span class="nav-icon" data-icon="zap"></span>
        <span class="nav-label">Công cụ</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item cong-cu" data-sub="cut" onclick="switchView('cut', document.querySelector('[data-view=cong-cu]'), 'cut')"><span data-icon="scissors" style="vertical-align:middle;margin-right:4px;"></span> Tự động cắt</div>
        <div class="nav-sub-item cong-cu" data-sub="ai-video" onclick="switchView('ai-video', document.querySelector('[data-view=cong-cu]'), 'ai-video')"><span data-icon="zap" style="vertical-align:middle;margin-right:4px;"></span> Tạo video AI</div>
        <div class="nav-sub-item cong-cu" data-sub="hot-niche" onclick="switchView('hot-niche', document.querySelector('[data-view=cong-cu]'), 'hot-niche')"><span data-icon="trendingUp" style="vertical-align:middle;margin-right:4px;"></span> Tìm ngách hot</div>
        <div class="nav-sub-item cong-cu" data-sub="bulk-download" onclick="switchView('bulk-download', document.querySelector('[data-view=cong-cu]'), 'bulk-download')"><span data-icon="downloadCloud" style="vertical-align:middle;margin-right:4px;"></span> Tải video hàng loạt</div>
      </div>
    </div>
    <div class="nav-item-wrapper">
      <div class="nav-item" data-view="tu-dong-hoa" onclick="toggleDropdown(this)">
        <span class="nav-icon" data-icon="refreshCw"></span>
        <span class="nav-label">Tự động hóa</span>
        <span class="dropdown-arrow" data-icon="chevronRight"></span>
      </div>
      <div class="nav-sub">
        <div class="nav-sub-item tu-dong-hoa" data-sub="workflow" onclick="switchView('workflow', document.querySelector('[data-view=tu-dong-hoa]'), 'workflow')"><span data-icon="refreshCw" style="vertical-align:middle;margin-right:4px;"></span> Tạo workflow</div>
        <div class="nav-sub-item tu-dong-hoa" data-sub="record" onclick="switchView('record', document.querySelector('[data-view=tu-dong-hoa]'), 'record')"><span data-icon="mic" style="vertical-align:middle;margin-right:4px;"></span> Ghi thao tác</div>
      </div>
    </div>
    <div class="nav-item" data-view="tai-khoan" onclick="switchView('tai-khoan', this)">
      <span class="nav-icon" data-icon="users"></span>
      <span class="nav-label">Tài khoản</span>
    </div>
    <div class="nav-item" data-view="tiep-thi" onclick="switchView('tiep-thi', this)">
      <span class="nav-icon" data-icon="link"></span>
      <span class="nav-label">Tiếp thị liên kết</span>
    </div>
    <div class="nav-item" data-view="doi-nhom" onclick="switchView('doi-nhom', this)">
      <span class="nav-icon" data-icon="users"></span>
      <span class="nav-label">Đội nhóm</span>
    </div>
    <div class="nav-item" data-view="tien-ich" onclick="switchView('tien-ich', this)">
      <span class="nav-icon" data-icon="grid"></span>
      <span class="nav-label">Tiện ích</span>
    </div>
    <div class="nav-item" data-view="guide" onclick="switchView('guide', this)">
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
