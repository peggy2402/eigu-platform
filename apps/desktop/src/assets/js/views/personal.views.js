const PersonalViews = `
<div id="view-ho-so" class="view active">
  <div class="profile-card">
    <div class="profile-field"><span class="field-label" data-i18n="profile_email">Email</span><span class="field-value" id="profile-email">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_role">Vai trò</span><span class="field-value" id="profile-role">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_verified">Đã xác thực</span><span class="field-value" id="profile-verified">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_created">Ngày tạo</span><span class="field-value" id="profile-created">—</span></div>
  </div>
</div>

<div id="view-tiep-thi" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="link" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="affiliate">Tiếp thị liên kết</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>

<div id="view-doi-nhom" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="users" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="team">Đội nhóm</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>

<div id="view-tien-ich" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="grid" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="utilities">Tiện ích</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>

<!-- Guide View -->
<div id="view-guide" class="view" style="width: 100%; box-sizing: border-box;">
  <div class="guide-container">
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_section_1_heading_dashboard">📊 1. Dashboard</span>
        <span class="guide-badge" data-i18n="guide_badge_dashboard">Tổng quan</span>
      </div>
      <p data-i18n="guide_overview_desc">Trang tổng quan hiển thị số liệu video đã xử lý, đã upload TikTok, đang chờ và số tài khoản TikTok đang quản lý. Theo dõi hoạt động hệ thống thời gian thực.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_video_title">🎬 2. Tự động hóa Video</span>
        <span class="guide-badge" data-i18n="guide_badge_ai">Cắt ghép AI</span>
      </div>
      <p data-i18n="guide_video_desc_input"><strong>Đầu vào:</strong> Kéo thả file .mp4 hoặc dán link YouTube để tải video tự động.</p>
      <p data-i18n="guide_video_desc_cut"><strong>Chế độ cắt:</strong> Chọn độ dài mỗi video (1-20 phút) hoặc tùy chỉnh chi tiết.</p>
      <p data-i18n="guide_video_desc_ratio"><strong>Tỉ lệ khung hình:</strong> 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram).</p>
      <p data-i18n="guide_video_desc_antidetect"><strong>Anti-Detect:</strong> Xóa metadata, thêm nhiễu hạt, lật khung hình, đảo âm thanh 3D chống bản quyền.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_workflow_title">🔄 3. Visual Workflow Builder</span>
        <span class="guide-badge" data-i18n="guide_badge_auto">Luồng tự động</span>
      </div>
      <p data-i18n="guide_workflow_desc">Thiết kế luồng xử lý tự động bằng cách kéo thả các Node: Lấy URL ➔ Tải xuống ➔ AI Xử lý (ASR + LLM) ➔ FFmpeg ➔ Nạp Hồ sơ Browser ➔ Tải lên TikTok.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_proxy_title">🌐 4. Quản lý Hồ sơ & Proxy</span>
        <span class="guide-badge" data-i18n="guide_badge_antidetect">Anti-Detect</span>
      </div>
      <p data-i18n="guide_proxy_desc">Mỗi tài khoản là một Browser Profile riêng biệt với Cookies, Proxy SOCKS5/Residential riêng. Khóa WebRTC ngăn rò rỉ địa chỉ IP thật qua UDP/STUN.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_rbac_title">👥 5. Phân Quyền & Đội Nhóm</span>
        <span class="guide-badge" data-i18n="guide_badge_rbac">RBAC System</span>
      </div>
      <p data-i18n="guide_rbac_desc">Hệ thống phân quyền 3 cấp độ (Admin, Staff, User). Admin có quyền bật/tắt hiển thị từng Tab chức năng riêng biệt cho từng tài khoản nhân viên.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span data-i18n="guide_telemetry_title">🛠️ 6. Cấu Hình & Giám Sát Lỗi</span>
        <span class="guide-badge" data-i18n="guide_badge_telemetry">Telemetry</span>
      </div>
      <p data-i18n="guide_telemetry_desc">Tự động ghi nhận 100% Stack Trace, Mã lỗi HTTP, Session Replay Action Trail giúp đội ngũ phát triển phát hiện và xử lý sự cố tức thì.</p>
    </div>
  </div>
</div>
`;
