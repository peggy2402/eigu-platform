const SystemAdminViews = `
<!-- Settings View -->
<div id="view-settings" class="view" style="width: 100%; box-sizing: border-box;">
  <div class="settings-card-section">
    <h3 style="margin-bottom:16px;" data-i18n="app_appearance">Giao diện ứng dụng</h3>
    <div class="theme-options">
      <div class="theme-option" data-theme="light"><span data-icon="sun"></span> <span data-i18n="theme_light">Sáng</span></div>
      <div class="theme-option" data-theme="dark"><span data-icon="moon"></span> <span data-i18n="theme_dark">Tối</span></div>
      <div class="theme-option" data-theme="system"><span data-icon="monitor"></span> <span data-i18n="theme_system">Hệ thống</span></div>
    </div>
  </div>

  <!-- Phân Hệ Ngôn Ngữ Ứng Dụng (Chỉ có VI / EN) -->
  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;" data-i18n="app_language">Ngôn ngữ ứng dụng (Language)</h3>
    <p class="settings-hint" data-i18n="app_language_hint">Lựa chọn ngôn ngữ hiển thị giao diện mặc định cho ứng dụng EIGU Desktop Client (Hệ thống hỗ trợ Tiếng Việt & English).</p>
    <div style="display:flex; gap:12px; margin-top:14px; flex-wrap:wrap;">
      <button type="button" id="lang-btn-vi" class="btn-outline active" onclick="changeAppLanguage('vi')" style="padding:10px 24px; border-radius:8px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:8px; margin:0;">
        Tiếng Việt (VI)
      </button>
      <button type="button" id="lang-btn-en" class="btn-outline" onclick="changeAppLanguage('en')" style="padding:10px 24px; border-radius:8px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:8px; margin:0;">
        English (EN)
      </button>
    </div>
  </div>

  <!-- Cấu hình Tiền tố API Server & Obfuscation Code (Admin Obfuscation Key Management) -->
  <div id="admin-api-prefix-settings-section" class="settings-card-section" style="margin-top:20px; display: none;">
    <h3 style="margin-bottom:8px;" data-i18n="admin_obf_title">🔒 Cấu Hình Mã Tiền Tố Động (Admin Custom Obfuscation Prefix)</h3>
    <p class="settings-hint" data-i18n="admin_obf_hint">Điều chỉnh chuỗi mã hóa bảo mật (<code>obf_code</code> / <code>API_PREFIX</code>) để bảo vệ các endpoints hệ thống khỏi các công cụ tự động quét route (Scan Bot / Hacker).</p>
    
    <div style="display:flex; gap:12px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
      <label style="font-weight: 600; font-size: 13px; min-width: 140px; color: var(--text-secondary);" data-i18n="obf_code_label">Mã Mã Hóa (<code>obf_code</code>):</label>
      <input type="text" id="admin-custom-api-prefix" placeholder="v2-sec-2026" style="flex:1; min-width: 240px; padding: 10px 14px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: monospace; font-size: 13px;" oninput="updateApiRoutePreview()" />
      <button class="btn-primary" onclick="saveAdminApiConfig()" style="padding: 10px 24px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; min-width: 130px; margin: 0;" data-i18n="save_obf_btn">Lưu Mã Tiền Tố</button>
    </div>

    <!-- Hiển thị xem trước Đường dẫn Server URL Hoàn Chỉnh -->
    <div style="margin-top: 12px; padding: 10px 14px; background: var(--bg-primary); border-radius: 8px; border: 1px dashed var(--border-color); font-size: 12px;">
      <span style="color: var(--text-muted);" data-i18n="preview_server_url">Đường dẫn Server xem trước:</span>
      <code id="admin-api-url-preview" style="color: var(--accent); font-weight: 700; font-family: monospace; margin-left: 6px;">http://localhost:3001/api/v2-sec-2026</code>
    </div>

    <p id="admin-api-url-status" class="settings-hint" style="margin-top: 8px; color: var(--accent); display: none;"></p>
  </div>

  <!-- Quản Lý Bật / Tắt Bảo Trì System & Version (CHỈ ADMIN MỚI ĐƯỢC XEM) -->
  <div id="admin-maintenance-settings-section" class="settings-card-section" style="margin-top:20px; border: 1px solid rgba(234, 179, 8, 0.4); background: rgba(234, 179, 8, 0.05); display: none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap: wrap; gap: 8px;">
      <h3 style="color: #eab308; margin:0; display:inline-flex; align-items:center; gap:6px;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        <span data-i18n="maintenance_title">Quản Lý Bật / Tắt Bảo Trì System</span>
      </h3>
      <span id="maintenance-status-badge" style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 4px 10px; border-radius: 6px; font-weight:700; font-size:12px;" data-i18n="status_active">Đang Hoạt Động (Normal)</span>
    </div>
    <p class="settings-hint" data-i18n="maintenance_hint">Admin chủ động Bật/Tắt chế độ Bảo trì hệ thống thời gian thực. Khi bật Bảo trì, tất cả ứng dụng Client (Role User) sẽ dừng truy cập cho tới khi Bảo trì hoàn tất.</p>

    <div style="display:flex; gap:16px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
      <div style="display:flex; align-items:center; gap:10px; background:var(--bg-primary); padding:10px 16px; border-radius:8px; border:1px solid var(--border-color);">
        <label for="admin-maintenance-toggle" style="font-weight: 600; font-size: 13px; color: var(--text-primary); cursor:pointer;" data-i18n="maint_mode_label">Chế Độ Bảo Trì (Maintenance Mode):</label>
        <input type="checkbox" id="admin-maintenance-toggle" style="width:20px; height:20px; cursor:pointer;" onchange="updateMaintenanceBadgePreview()" />
      </div>

      <div style="display:flex; align-items:center; gap:10px; background:var(--bg-primary); padding:10px 16px; border-radius:8px; border:1px solid var(--border-color); flex:1; min-width:220px;">
        <label style="font-weight: 600; font-size: 13px; color: var(--text-secondary); white-space:nowrap;" data-i18n="min_ver_label">Phiên Bản App Tối Thiểu:</label>
        <input type="text" id="admin-min-version-input" placeholder="1.0.0" style="flex:1; padding: 6px 10px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-family: monospace; font-size: 13px;" />
      </div>

      <button class="btn-primary" onclick="saveAdminMaintenanceConfig()" style="padding: 10px 20px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; min-width: 140px; margin: 0; background: #eab308; color: #000; font-weight:700;" data-i18n="save_maint_btn">Lưu Cấu Hình Bảo Trì</button>
    </div>
  </div>

  <!-- Dashboard Theo Dõi Bug, Stack Trace & Performance Telemetry (CHỈ ADMIN MỚI ĐƯỢC XEM) -->
  <div id="system-telemetry-section" class="settings-card-section" style="margin-top:20px; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); display: none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap: wrap; gap: 8px;">
      <h3 style="color: #ef4444; margin:0; display:inline-flex; align-items:center; gap:6px;" data-i18n="telemetry_title"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3 3 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg> <span data-i18n="telemetry_title_text">Theo Dõi Bug, Stack Trace & Performance Dashboard</span></h3>
      <button class="btn-outline" onclick="if(window.EIGU_TELEMETRY) window.EIGU_TELEMETRY.clearLogs();" style="padding:4px 12px; font-size:12px; border-color:#ef4444; color:#ef4444; border-radius: 6px;" data-i18n="telemetry_clear_btn">Xóa Logs</button>
    </div>
    <p class="settings-hint" data-i18n="telemetry_desc">Tự động ghi nhận 100% Stack Trace, Mã lỗi HTTP, Session Replay Action Trail và độ trễ mạng theo thời gian thực.</p>
    
    <div id="telemetry-logs-list" style="margin-top: 14px; max-height: 320px; overflow-y: auto;">
      <div style="text-align:center; padding: 20px; color: var(--text-muted);" data-i18n="telemetry_empty">Chưa ghi nhận lỗi hệ thống nào.</div>
    </div>
  </div>

  <div id="secure-api-settings-section" class="settings-card-section" style="margin-top:20px; display: none;">
    <h3 style="margin-bottom:8px;" data-i18n="api_keys_title">Trạng Thái & Cài Đặt AI Provider</h3>
    <p class="settings-hint" data-i18n="api_keys_hint">Quản lý cấu hình API Key, trạng thái kết nối và Model cụ thể cho các AI Engine (Kịch bản & Render Video).</p>
    
    <!-- Bảng Trạng thái Provider Engine Matrix -->
    <div id="provider-matrix-container" style="margin-top: 14px; margin-bottom: 20px;">
      <!-- JavaScript renderProviderMatrix() sẽ điền thông tin vào đây -->
    </div>
    
    <!-- Form thêm Key -->
    <div style="display:flex; gap:10px; margin-bottom: 14px; margin-top: 14px; flex-wrap: wrap;">
      <select id="new-key-type" style="width: 150px; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;">
        <option value="GEMINI_API_KEY">Gemini API</option>
        <option value="OPENAI_API_KEY">OpenAI API</option>
        <option value="FAL_KEY">Fal.ai API</option>
        <option value="VEO_API_KEY">Google Veo API</option>
        <option value="RUNWAY_API_KEY">Runway API</option>
        <option value="KLING_API_KEY">Kling API</option>
      </select>
      <div style="flex:1; min-width: 220px; position: relative; display: flex; align-items: center;">
        <input type="password" id="new-key-value" placeholder="Dán API Key vào đây..." style="width: 100%; padding: 10px 36px 10px 12px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;" />
        <button type="button" onclick="toggleInputEye('new-key-value', this)" title="Hiện Key" style="position: absolute; right: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </div>
      <input type="text" id="new-key-note" placeholder="Ghi chú" style="width: 140px; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;" />
      <button class="btn-primary" onclick="addNewApiKey()" style="padding: 10px 20px; border-radius: 8px; margin: 0; white-space: nowrap;" data-i18n="add_key_btn">Thêm Key</button>
    </div>

    <!-- Danh sách Key hiện tại -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 12px;" data-i18n="col_type">Loại</th>
            <th style="padding: 12px;" data-i18n="col_key">Key (Ẩn)</th>
            <th style="padding: 12px;" data-i18n="col_note">Ghi chú</th>
            <th style="padding: 12px; width: 80px; text-align:center;" data-i18n="col_action">Hành động</th>
          </tr>
        </thead>
        <tbody id="api-keys-list-body">
          <!-- Render danh sách key ở đây -->
        </tbody>
      </table>
    </div>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;" data-i18n="cache_title">Cache & Dữ liệu bộ nhớ đệm</h3>
    <p class="settings-hint" data-i18n="cache_hint">Quản lý bộ nhớ đệm, xoá dữ liệu workflow tạm thời, cấu hình thư mục đầu ra mặc định.</p>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;" data-i18n="proxy_title">Proxy & Bảo Mật Mạng</h3>
    <p class="settings-hint" data-i18n="proxy_hint">Cấu hình SOCKS5 / Residential proxy cho Anti-Detect Browser, chặn rò rỉ WebRTC UDP/STUN.</p>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;" data-i18n="workflow_defaults_title">Workflow & Anti-Detect Mặc Định</h3>
    <p class="settings-hint" data-i18n="workflow_defaults_hint">Cài đặt mặc định cho xử lý video, tỉ lệ khung hình, lật ảnh, dải tần âm thanh và xóa metadata.</p>
  </div>
</div>

<!-- Feedback View -->
<div id="view-feedback" class="view">
  <div class="settings-card-section" style="margin-top:16px; border: 1px solid var(--accent); background: var(--accent-glow);">
    <h3 style="margin-bottom:12px; color: var(--accent);" data-i18n="feedback_title">Góp ý / Báo lỗi</h3>
    <p class="settings-hint" style="margin-bottom: 16px;" data-i18n="feedback_hint">Mọi ý kiến đóng góp hoặc báo lỗi của bạn sẽ giúp chúng tôi phát triển EIGU tốt hơn. (Giới hạn: 3 lần/ngày)</p>
    
    <form id="feedback-form" onsubmit="submitFeedback(event)">
      <textarea 
        id="feedback-message"
        placeholder="Mô tả lỗi hoặc góp ý của bạn..."
        rows="4"
        style="width: 100%; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; resize: vertical; box-sizing: border-box;"
      ></textarea>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; color: var(--text-secondary);" data-i18n="attach_image">Đính kèm hình ảnh (nếu có):</label>
        <label for="feedback-file" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; border: 2px dashed var(--border-color); border-radius: 8px; cursor: pointer; background: var(--bg-primary); color: var(--text-secondary); transition: all 0.2s;">
          <span data-icon="image" style="margin-bottom: 8px;"></span>
          <span style="font-size: 13px;" data-i18n="click_select_image">Nhấp để chọn ảnh hoặc kéo thả vào đây</span>
          <span id="desktop-file-name" style="font-size: 12px; color: var(--accent); margin-top: 8px;"></span>
        </label>
        <input type="file" id="feedback-file" accept="image/*" style="display: none;" onchange="document.getElementById('desktop-file-name').innerText = this.files[0] ? this.files[0].name : ''" />
      </div>
      <button id="feedback-submit-btn" type="submit" class="btn-primary" style="width: 100%; padding: 10px;" data-i18n="feedback_submit">Gửi Báo Cáo</button>
    </form>
  </div>
</div>

<!-- Chat Support View (Staff & Admin Console) -->
<div id="view-chat-support" class="view" style="height: 100%; width: 100%; box-sizing: border-box; overflow: hidden;">
  <div id="chat-support-container" class="chat-support-container show-list">
    <!-- List phiên chat bên trái -->
    <div class="chat-support-sidebar">
      <div style="padding: 12px 14px 8px; border-bottom: 1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <span style="font-weight: 700; font-size: 14px; color: var(--text-primary);" data-i18n="chat_customer_inbox">Hộp thoại Khách hàng</span>
        <button class="btn-outline" style="padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;" onclick="loadStaffChatConsole()" title="Tải lại danh sách"><span data-icon="refreshCw"></span> <span data-i18n="reload_btn">Tải lại</span></button>
      </div>

      <!-- Thanh Tìm Kiếm & Bộ Lọc Messenger -->
      <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); background: var(--bg-primary); flex-shrink: 0; display: flex; flex-direction: column; gap: 8px;">
        <div style="position: relative; display: flex; align-items: center;">
          <span style="position: absolute; left: 10px; color: var(--text-muted); display: inline-flex; pointer-events: none;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="staff-chat-search-input" placeholder="Tìm kiếm đoạn chat / email..." style="width: 100%; padding: 6px 10px 6px 30px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 12px; outline: none;" oninput="onStaffChatSearchInput(this.value)" data-i18n-placeholder="chat_sidebar_search_placeholder" />
        </div>

        <!-- Bộ Lọc Nút Pill -->
        <div id="staff-chat-filter-pills" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;">
          <button type="button" class="chat-filter-pill active" onclick="setStaffChatFilter('all', this)" data-i18n="filter_all">Tất cả</button>
          <button type="button" class="chat-filter-pill" onclick="setStaffChatFilter('needs_staff', this)" data-i18n="filter_needs_support">Cần hỗ trợ</button>
          <button type="button" class="chat-filter-pill" onclick="setStaffChatFilter('in_progress', this)" data-i18n="filter_in_progress">Đang hỗ trợ</button>
          <button type="button" class="chat-filter-pill" onclick="setStaffChatFilter('resolved', this)" data-i18n="filter_resolved">Đã xong</button>
        </div>
      </div>

      <div id="staff-chat-list" style="flex:1; min-height:0; overflow-y:auto; padding: 6px; display: flex; flex-direction: column; gap: 6px;">
        <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;" data-i18n="chat_header_loading">Đang tải danh sách cuộc trò chuyện...</div>
      </div>
    </div>

    <!-- Cột Kéo Rút Điều Chỉnh Độ Rộng (Resizer Bar) -->
    <div id="chat-sidebar-resizer" class="chat-resizer" title="Kéo chuột sang trái/phải để thay đổi kích thước" data-i18n-title="chat_resizer_title"></div>

    <!-- Cửa sổ Chat tương tác bên phải -->
    <div class="chat-support-main">
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); gap: 8px; flex-shrink: 0; min-height: 52px; box-sizing: border-box;">
        <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
          <button id="staff-chat-back-btn" class="btn-outline" style="padding: 4px 8px; font-size: 11px; display: none; flex-shrink: 0;" onclick="toggleStaffChatMobilePanel('list')" data-i18n="chat_back_btn">← Danh sách</button>
          <div style="min-width:0; flex:1;">
            <div id="staff-chat-target-name" style="font-weight: 700; font-size: 13px; color: var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" data-i18n="chat_default_name">Chọn cuộc trò chuyện để bắt đầu chat</div>
            <div id="staff-chat-target-email" style="font-size: 11px; color: var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" data-i18n="chat_default_email">Vui lòng chọn một phiên chat ở danh sách bên trái</div>
          </div>
        </div>
        <button id="staff-resolve-btn" class="btn-outline" style="padding: 4px 12px; font-size: 11px; flex-shrink: 0; white-space: nowrap;" onclick="resolveCurrentStaffChat()" data-i18n="resolve_support">Hoàn tất Hỗ trợ</button>
      </div>
      <div id="staff-chat-messages" style="flex:1; min-height:0; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-primary);">
        <div style="text-align:center; padding:40px; color:var(--text-muted); font-size:13px;" data-i18n="chat_default_select_user">Chọn người dùng ở cột bên trái để trao đổi thông tin trực tiếp.</div>
      </div>
      <!-- Quote Reply Preview Bar -->
      <div id="staff-chat-reply-preview" style="display:none; padding: 6px 16px; background: var(--bg-card); border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary); align-items: center; justify-content: space-between;">
        <div style="min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <span style="font-weight:700; color:var(--accent);" id="staff-reply-target-name" data-i18n="chat_reply_prefix">Đang trả lời:</span>
          <span id="staff-reply-target-text" style="margin-left:4px; opacity:0.85;">...</span>
        </div>
        <button type="button" onclick="cancelStaffReplyQuote()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px; padding:0 4px;">✕</button>
      </div>

      <div style="padding: 10px 14px; background: var(--bg-card); border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px; position: relative; flex-shrink: 0;">
        <!-- Mention Auto-complete Menu -->
        <div id="staff-mention-dropdown" class="mention-dropdown-menu hidden" style="bottom: 60px; left: 16px;">
          <div class="mention-item" onclick="insertStaffMention('@Eigu AI ')">
            <img src="img/logo.png" class="mention-avatar" style="background:#6366f1; padding:2px;" alt="AI" />
            <div class="mention-info">
              <div class="mention-title">@Eigu AI</div>
              <div class="mention-sub" data-i18n="chat_mention_ai_sub">Đặt câu hỏi cho Trợ lý AI</div>
            </div>
          </div>
          <div class="mention-item" onclick="insertStaffMention('@Khách hàng ')">
            <img src="https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_14_60037b48e5.jpg" class="mention-avatar" alt="Client" />
            <div class="mention-info">
              <div class="mention-title">@Khách hàng</div>
              <div class="mention-sub" data-i18n="chat_mention_customer_sub">Nhắc đến Khách hàng</div>
            </div>
          </div>
          <div class="mention-item" onclick="insertStaffMention('@mọi người ')">
            <div class="mention-avatar" style="background:var(--bg-card-hover); display:flex; align-items:center; justify-content:center; font-size:14px;">👥</div>
            <div class="mention-info">
              <div class="mention-title">@mọi người</div>
              <div class="mention-sub" data-i18n="chat_mention_everyone_sub">Nhắc đến toàn bộ hệ thống</div>
            </div>
          </div>
        </div>

        <button type="button" class="btn-outline" style="padding: 8px 12px; font-size: 16px; border-radius: 20px; border-color: var(--border-color);" onclick="toggleStaffEmojiPicker(event)" title="Emoji" data-i18n="chat_emoji_btn">😊</button>
        
        <!-- Popover Emoji Picker -->
        <div id="staff-emoji-picker" style="display:none; position: absolute; bottom: 60px; left: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 8px; grid-template-columns: repeat(5, 1fr); gap: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 9999;">
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('😊')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">😊</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('👍')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">👍</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('❤️')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">❤️</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('😂')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">😂</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('🔥')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">🔥</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('🎉')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">🎉</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('🙏')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">🙏</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('😍')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">😍</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('😮')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">😮</button>
          <button type="button" class="emoji-btn" onclick="insertStaffEmoji('💯')" style="font-size:18px; border:none; background:none; cursor:pointer; padding:4px;">💯</button>
        </div>

        <div id="staff-chat-input" class="chat-input-editable" contenteditable="true" data-placeholder="Gửi tin nhắn..." data-i18n-placeholder="chat_input_placeholder" oninput="handleStaffMentionInput(event)" onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); event.stopPropagation(); sendStaffChatMessage(event); }"></div>
        <button type="button" class="btn-primary" style="width: auto !important; min-width: 90px; flex-shrink: 0; padding: 10px 24px; border-radius: 20px; margin: 0;" onclick="sendStaffChatMessage(event)" data-i18n="send_btn">Gửi</button>
      </div>
    </div>
  </div>
</div>

<!-- User / Staff Management View (Admin) -->
<div id="view-user-management" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div>
        <h3 style="margin-bottom:4px;">Quản lý Người dùng & Nhân viên (Dữ liệu Thực)</h3>
        <p class="settings-hint">Theo dõi địa chỉ IP, Hệ điều hành, Thiết bị, Phân quyền Role, Khóa tài khoản (Block/Ban) và Phân quyền Tab.</p>
      </div>
      <button class="btn-primary" onclick="loadRealUserData()" style="padding: 8px 16px; border-radius:6px; font-size:13px;">
        <span data-icon="refreshCw" style="vertical-align:middle; margin-right:4px;"></span> Tải lại Dữ liệu
      </button>
    </div>

    <!-- Thanh Tìm kiếm, Bộ lọc & Sắp xếp -->
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; margin-top:16px; background:var(--bg-primary); padding:12px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" id="user-search-input" placeholder="Tìm theo Email hoặc Username..." style="flex:1; min-width:200px; padding:8px 12px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onkeyup="if(event.key==='Enter') loadRealUserData()" />
      
      <select id="user-role-filter" style="width:140px; padding:8px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onchange="loadRealUserData()">
        <option value="all">Tất cả Role</option>
        <option value="user">Role: User</option>
        <option value="staff">Role: Staff</option>
        <option value="admin">Role: Admin</option>
      </select>

      <select id="user-sort-filter" style="width:140px; padding:8px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onchange="loadRealUserData()">
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="email">Theo Email</option>
      </select>

      <button class="btn-outline" onclick="loadRealUserData()" style="padding:8px 14px; border-radius:6px; font-size:13px;">Lọc</button>
    </div>

    <!-- Bảng hiển thị Dữ liệu Thực (Desktop Table View) -->
    <div class="user-mgmt-table-wrapper">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px; white-space: nowrap;">User</th>
            <th style="padding: 10px; white-space: nowrap;">Địa chỉ IP</th>
            <th style="padding: 10px; white-space: nowrap;">HĐH / Thiết bị</th>
            <th style="padding: 10px; white-space: nowrap;">Ngày tạo</th>
            <th style="padding: 10px; white-space: nowrap;">Trạng thái</th>
            <th style="padding: 10px; white-space: nowrap;">Vai trò (Role)</th>
            <th style="padding: 10px; text-align:center; white-space: nowrap;">Hành động (Ban / Phân Tab)</th>
          </tr>
        </thead>
        <tbody id="user-mgmt-table-body">
          <tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Đang kết nối tới Supabase Database để tải dữ liệu thật...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Card View (Tự động chuyển đổi khi thu nhỏ cửa sổ < 900px) -->
    <div id="user-mgmt-cards-container" class="user-mgmt-cards-wrapper">
    </div>
  </div>
</div>

<!-- Create & Manage Notification View (Admin) -->
<div id="view-create-notification" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div>
        <h3 id="admin-notif-form-title" style="margin-bottom:4px;">Tạo & Quản lý Thông báo (Dữ liệu Thực)</h3>
        <p class="settings-hint">Gửi thông báo tới Client/Staff, xem Lịch sử thông báo, Tìm kiếm, Sửa & Xóa thông báo realtime.</p>
      </div>
      <button class="btn-primary" onclick="loadAdminNotificationHistory()" style="padding: 8px 16px; border-radius:6px; font-size:13px; width:auto; display:inline-flex; align-items:center; gap:6px;">
        <span data-icon="refreshCw"></span> Tải lại Lịch sử
      </button>
    </div>

    <!-- Form Tạo / Edit Thông báo -->
    <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <input type="hidden" id="admin-notif-edit-id" value="" />
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Tiêu đề thông báo</label>
          <input type="text" id="admin-notif-title" placeholder="VD: Khuyến mãi tính năng AI Video..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;" />
        </div>
        <div>
          <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Đối tượng nhận</label>
          <select id="admin-notif-target" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;">
            <option value="all">Tất cả người dùng (All Client)</option>
            <option value="user">Chỉ Role User</option>
            <option value="staff">Chỉ Role Staff</option>
          </select>
        </div>
        <div>
          <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Hạn dùng (Tự động xóa)</label>
          <select id="admin-notif-ttl" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;">
            <option value="1h">1 Tiếng</option>
            <option value="12h">12 Tiếng</option>
            <option value="24h" selected>24 Tiếng (1 Ngày)</option>
            <option value="7d">7 Ngày</option>
            <option value="30d">30 Ngày</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Nội dung thông báo</label>
        <textarea id="admin-notif-content" rows="3" placeholder="Nhập chi tiết nội dung thông báo..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; resize: vertical;"></textarea>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="admin-notif-submit-btn" class="btn-primary" style="padding: 8px 20px; border-radius: 6px; font-size: 13px; width: auto;" onclick="broadcastAdminNotification()">Phát Thông Báo Ngay</button>
        <button id="admin-notif-cancel-btn" class="btn-outline hidden" style="padding: 8px 16px; border-radius: 6px; font-size: 13px;" onclick="cancelEditNotification()">Hủy Chỉnh Sửa</button>
      </div>
    </div>

    <!-- Thanh Tìm kiếm & Bộ lọc Lịch sử Thông báo -->
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; background:var(--bg-primary); padding:12px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" id="notif-search-input" placeholder="Tìm kiếm Tiêu đề / Nội dung thông báo..." style="flex:1; min-width:200px; padding:8px 12px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onkeyup="if(event.key==='Enter') loadAdminNotificationHistory()" />
      
      <select id="notif-target-filter" style="width:140px; padding:8px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onchange="loadAdminNotificationHistory()">
        <option value="all">Tất cả Đối tượng</option>
        <option value="user">Role: User</option>
        <option value="staff">Role: Staff</option>
      </select>

      <select id="notif-sort-filter" style="width:140px; padding:8px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onchange="loadAdminNotificationHistory()">
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="title">Theo Tiêu đề</option>
      </select>

      <button class="btn-outline" onclick="loadAdminNotificationHistory()" style="padding:8px 14px; border-radius:6px; font-size:13px;">Lọc</button>
    </div>

    <!-- Bảng Lịch sử Thông báo (Desktop View) -->
    <div class="admin-notif-table-wrapper">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px; white-space: nowrap;">Tiêu đề</th>
            <th style="padding: 10px; white-space: nowrap;">Nội dung</th>
            <th style="padding: 10px; white-space: nowrap;">Đối tượng</th>
            <th style="padding: 10px; white-space: nowrap;">Hạn dùng</th>
            <th style="padding: 10px; white-space: nowrap;">Ngày tạo</th>
            <th style="padding: 10px; text-align:center; white-space: nowrap;">Hành động (Sửa / Xóa)</th>
          </tr>
        </thead>
        <tbody id="admin-notif-table-body">
          <tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp Lịch sử Thông báo từ Supabase Database...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Card View (Tự động chuyển đổi khi thu nhỏ cửa sổ < 900px) -->
    <div id="admin-notif-cards-container" class="admin-notif-cards-wrapper">
    </div>
  </div>
</div>

<!-- Tab Configuration Modal -->
<div id="tab-config-modal" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; width: 440px; max-width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
    <h3 style="margin-bottom: 8px; font-size:16px;">Phân Quyền Tab Màn Hình</h3>
    <p class="settings-hint" style="margin-bottom: 16px;">Tích chọn các Tab được phép hiển thị cho tài khoản này — các tab bị bỏ tích sẽ bị ẩn khỏi giao diện người dùng:</p>

    <div id="tab-config-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 360px; overflow-y: auto; padding: 12px 16px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 16px;">
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-outline" style="padding: 8px 16px; font-size:13px; border-radius:6px;" onclick="closeTabConfigModal()">Hủy</button>
      <button class="btn-primary" style="padding: 8px 20px; width: auto; font-size:13px; border-radius:6px;" onclick="saveTabConfigModal()">Lưu Cấu Hình</button>
    </div>
  </div>
</div>

<!-- Temporary Ban Modal -->
<div id="ban-modal" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; width: 460px; max-width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
    <h3 style="margin-bottom: 6px; font-size:16px; color:#ef4444; display:flex; align-items:center; gap:8px;">🛑 Khóa / Block Tài khoản (Ban Tạm Thời)</h3>
    <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Tài khoản: <strong id="ban-target-user" style="color:var(--text-primary);">—</strong></p>

    <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size:12px; color:var(--text-muted); font-weight:600; display:block; margin-bottom:4px;">THỜI ĐIỂM BẮT ĐẦU BAN (HIỆN TẠI)</label>
        <div id="ban-start-time-text" style="font-size:13px; font-weight:600; color:var(--accent); font-family:var(--font-mono);">—</div>
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-muted); font-weight:600; display:block; margin-bottom:6px;">CHỌN THỜI ĐIỂM HẾT HẠN BAN (GIỜ / PHÚT / NGÀY / THÁNG / NĂM)</label>
        <input type="datetime-local" id="ban-until-input" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:13px; outline:none;" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:6px;">Lựa chọn nhanh:</label>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          <button type="button" class="btn-outline" style="padding:3px 8px; font-size:11px; border-radius:4px;" onclick="setBanPreset(1, 'hour')">+1 Giờ</button>
          <button type="button" class="btn-outline" style="padding:3px 8px; font-size:11px; border-radius:4px;" onclick="setBanPreset(1, 'day')">+1 Ngày</button>
          <button type="button" class="btn-outline" style="padding:3px 8px; font-size:11px; border-radius:4px;" onclick="setBanPreset(7, 'day')">+7 Ngày</button>
          <button type="button" class="btn-outline" style="padding:3px 8px; font-size:11px; border-radius:4px;" onclick="setBanPreset(30, 'day')">+30 Ngày</button>
          <button type="button" class="btn-outline" style="padding:3px 8px; font-size:11px; border-radius:4px; color:#ef4444; border-color:#ef4444;" onclick="setBanPreset(0, 'permanent')">Vĩnh Viễn</button>
        </div>
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-muted); font-weight:600; display:block; margin-bottom:6px;">LÝ DO KHÓA TÀI KHOẢN (HIỂN THỊ CHO USER):</label>
        <textarea id="ban-reason-input" rows="2" placeholder="Ví dụ: Vi phạm điều khoản dịch vụ, Thao tác bất thường..." style="width:100%; padding:8px 10px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:12px; outline:none; resize:vertical;"></textarea>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-outline" style="padding: 8px 16px; font-size:13px; border-radius:6px;" onclick="closeBanModal()">Hủy</button>
      <button class="btn-danger" style="padding: 8px 20px; width: auto; font-size:13px; border-radius:6px; background:#ef4444;" onclick="confirmBanUser()">Xác Nhận Ban</button>
    </div>
  </div>
</div>

<!-- Feedback Management View (Admin) -->
<div id="view-feedback-management" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div>
        <h3 style="margin-bottom:4px;">Quản lý Phản hồi & Báo lỗi (Feedback Dữ liệu Thực)</h3>
        <p class="settings-hint">Theo dõi các phản hồi từ người dùng, xem thông tin Email, Username, Nội dung góp ý và quản lý xử lý.</p>
      </div>
      <button class="btn-primary" onclick="loadRealFeedbackData()" style="padding: 8px 16px; border-radius:6px; font-size:13px; width:auto; display:inline-flex; align-items:center; gap:6px;">
        <span data-icon="refreshCw"></span> Tải lại Dữ liệu
      </button>
    </div>

    <!-- Thanh Tìm kiếm Feedback -->
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; background:var(--bg-primary); padding:12px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" id="feedback-search-input" placeholder="Tìm theo Email, Username hoặc Nội dung..." style="flex:1; min-width:240px; padding:8px 12px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onkeyup="if(event.key==='Enter') loadRealFeedbackData()" />
      <button class="btn-outline" onclick="loadRealFeedbackData()" style="padding:8px 16px; border-radius:6px; font-size:13px;">Lọc</button>
    </div>

    <!-- Bảng hiển thị Dữ liệu Feedback Thực (Desktop View) -->
    <div class="feedback-mgmt-table-wrapper">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px; white-space: nowrap;">Người gửi (User)</th>
            <th style="padding: 10px; white-space: nowrap;">Nội dung phản hồi</th>
            <th style="padding: 10px; white-space: nowrap;">Thời gian gửi</th>
            <th style="padding: 10px; text-align:center; white-space: nowrap;">Hành động (Xóa)</th>
          </tr>
        </thead>
        <tbody id="feedback-mgmt-table-body">
          <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Đang kết nối tới Supabase Database để tải dữ liệu Feedback thực...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Card View (Tự động chuyển đổi khi thu nhỏ cửa sổ < 900px) -->
    <div id="feedback-mgmt-cards-container" class="feedback-mgmt-cards-wrapper">
    </div>
  </div>
</div>

<!-- User Activity Logs View (Lịch sử truy cập & Hoạt động cá nhân) -->
<div id="view-user-activity-logs" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; width: 100%; box-sizing: border-box; height: 100%; display: flex; flex-direction: column; overflow: hidden;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; flex-shrink:0;">
      <div>
        <h3 style="margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <span data-icon="fileText" style="color:var(--accent);"></span> Lịch sử truy cập & Hoạt động (Access & Activity Logs)
        </h3>
        <p class="settings-hint">Xem chi tiết lịch sử truy cập, các thao tác và sự kiện trên hệ thống của các tài khoản.</p>
      </div>
      <button class="btn-primary" onclick="loadRealUserActivityLogs()" style="padding: 8px 16px; border-radius:8px; font-size:13px; width:auto; display:inline-flex; align-items:center; gap:6px;">
        <span data-icon="refreshCw"></span> Tải lại dữ liệu
      </button>
    </div>

    <!-- Thanh Tìm kiếm & Bộ Lọc Nút Pill -->
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px; background:var(--bg-primary); padding:12px 14px; border-radius:10px; border:1px solid var(--border-color); flex-shrink:0;">
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <input type="text" id="activity-logs-search-input" placeholder="Tìm theo Email, Username, Hành động hoặc Chi tiết..." style="flex:1; min-width:240px; padding:8px 14px; border-radius:8px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px; outline:none;" onkeyup="if(event.key==='Enter') loadRealUserActivityLogs()" />
        <button class="btn-outline" onclick="loadRealUserActivityLogs()" style="padding:8px 18px; border-radius:8px; font-size:13px; margin:0;">Lọc</button>
      </div>

      <!-- Bộ lọc Pill theo Role -->
      <div id="activity-logs-role-pills" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;">
        <button type="button" class="chat-filter-pill active" onclick="setActivityLogsRoleFilter('all', this)">Tất cả Vai trò</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('admin', this)">Admin</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('staff', this)">Staff</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('user', this)">User</button>
      </div>
    </div>

    <!-- Bảng hiển thị Dữ liệu Audit Log Thực -->
    <div class="feedback-mgmt-table-wrapper" style="flex: 1; overflow-y: auto; overflow-x: auto; min-height: 0; width: 100%; border-radius: 8px; border: 1px solid var(--border-color);">
      <table style="width: 100%; min-width: 850px; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead style="position: sticky; top: 0; z-index: 2; background: var(--bg-card);">
          <tr style="border-bottom: 1px solid var(--border-color);">
            <th style="padding: 12px 10px; white-space: nowrap; color: var(--text-secondary);">Thời gian</th>
            <th style="padding: 12px 10px; white-space: nowrap; color: var(--text-secondary);">Tài khoản / Vai trò</th>
            <th style="padding: 12px 10px; white-space: nowrap; color: var(--text-secondary);">Hành động (Action)</th>
            <th style="padding: 12px 10px; white-space: nowrap; color: var(--text-secondary);">Phân hệ (Module)</th>
            <th style="padding: 12px 10px; color: var(--text-secondary);">Chi tiết thao tác</th>
            <th style="padding: 12px 10px; white-space: nowrap; color: var(--text-secondary);">IP & Thiết bị</th>
          </tr>
        </thead>
        <tbody id="activity-logs-table-body">
          <tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Đang kết nối hệ thống để tải Lịch sử truy cập...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Card View (Tự động chuyển đổi khi thu nhỏ cửa sổ < 900px) -->
    <div id="activity-logs-cards-container" class="feedback-mgmt-cards-wrapper" style="overflow-y: auto; margin-top: 10px;">
    </div>
  </div>
</div>

<!-- Admin Dashboard View (Bảng điều khiển dành riêng cho Admin) -->
<div id="view-admin-dashboard" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h3 style="margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <span data-icon="dashboard" style="color:var(--accent);"></span> <span data-i18n="admin_dash_title">Bảng điều khiển Admin (Executive Dashboard)</span>
        </h3>
        <p class="settings-hint" data-i18n="admin_dash_subtitle">Giám sát tổng quan chỉ số hệ thống, tài khoản, dịch vụ API Gateway và hiệu năng vận hành thời gian thực.</p>
      </div>
      <button class="btn-primary" onclick="loadAdminDashboardData()" style="padding: 8px 16px; border-radius:8px; font-size:13px; width:auto; display:inline-flex; align-items:center; gap:6px;">
        <span data-icon="refreshCw"></span> <span data-i18n="refresh_stats">Cập nhật chỉ số</span>
      </button>
    </div>

    <!-- Hàng thẻ Thống kê KPI -->
    <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
      <div class="stat-card" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:6px;" data-i18n="total_system_users">TỔNG TÀI KHOẢN HỆ THỐNG</div>
        <div id="admin-stat-total-users" style="font-size:26px; font-weight:800; color:var(--text-primary);">--</div>
        <div style="font-size:11px; color:var(--accent); margin-top:4px;">Supabase Database</div>
      </div>
      <div class="stat-card" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:6px;" data-i18n="staff_team_count">ĐỘI NGŨ NHÂN VIÊN (STAFF)</div>
        <div id="admin-stat-staff-count" style="font-size:26px; font-weight:800; color:#4ade80;">--</div>
        <div style="font-size:11px; color:#4ade80; margin-top:4px;">Hoạt động hỗ trợ</div>
      </div>
      <div class="stat-card" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:6px;" data-i18n="active_workflows_count">LUỒNG TỰ ĐỘNG HÓA</div>
        <div id="admin-stat-workflows" style="font-size:26px; font-weight:800; color:#f59e0b;">--</div>
        <div style="font-size:11px; color:#f59e0b; margin-top:4px;">Tiến trình xử lý Active</div>
      </div>
      <div class="stat-card" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:6px;" data-i18n="api_gateway_status">TRẠNG THÁI GATEWAY API</div>
        <div id="admin-stat-gateway-status" style="font-size:20px; font-weight:700; color:#10b981;">ONLINE</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Node.js NestJS Gateway</div>
      </div>
    </div>

    <!-- Khối Hoạt Động Gần Đây Real Database Audit Log -->
    <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px; margin-bottom:24px;">
      <h4 style="margin-bottom:12px; font-size:14px; font-weight:700; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center;">
        <span data-i18n="recent_db_events">Nhật Ký Thao Tác Mới Nhất (Real Database Events)</span>
        <span style="font-size:11px; font-weight:500; color:var(--text-muted);">Tự động đồng bộ từ Supabase</span>
      </h4>
      <div id="admin-dashboard-recent-activity">
        <div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">Đang kết nối Database để tải hoạt động thực tế...</div>
      </div>
    </div>

    <!-- Khối Phím Tắt Thao Tác Nhanh -->
    <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
      <h4 style="margin-bottom:12px; font-size:14px; font-weight:700; color:var(--text-primary);" data-i18n="quick_shortcuts">Thao Tác Quản Trị Nhanh (Quick Admin Shortcuts)</h4>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn-outline" onclick="switchView('user-management')" style="padding:10px 18px; border-radius:8px; font-size:13px; margin:0;" data-i18n="shortcut_permissions">Phân quyền User/Staff</button>
        <button class="btn-outline" onclick="switchView('analytics-reports')" style="padding:10px 18px; border-radius:8px; font-size:13px; margin:0;" data-i18n="shortcut_analytics">Xem Báo cáo Thống kê</button>
        <button class="btn-outline" onclick="switchView('user-activity-logs')" style="padding:10px 18px; border-radius:8px; font-size:13px; margin:0;" data-i18n="shortcut_logs">Nhật ký Hoạt động</button>
        <button class="btn-outline" onclick="switchView('settings')" style="padding:10px 18px; border-radius:8px; font-size:13px; margin:0;" data-i18n="shortcut_obfuscation">Cấu hình Obfuscation</button>
      </div>
    </div>
  </div>
</div>

<!-- Analytics & Reports View (Báo cáo Thống kê dành riêng cho Admin) -->
<div id="view-analytics-reports" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h3 style="margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <span data-icon="trendingUp" style="color:var(--accent);"></span> <span data-i18n="analytics_title">Báo cáo Thống kê System (Analytics & Reports)</span>
        </h3>
        <p class="settings-hint" data-i18n="analytics_subtitle">Phân tích dữ liệu thực tế từ Supabase Database về tăng trưởng người dùng và thao tác tác vụ.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn-outline" onclick="exportAnalyticsReport()" style="padding: 8px 16px; border-radius:8px; font-size:13px; margin:0;" data-i18n="export_csv">Xuất Báo Cáo (CSV)</button>
        <button class="btn-primary" onclick="loadAnalyticsReportsData()" style="padding: 8px 16px; border-radius:8px; font-size:13px;" data-i18n="refresh_stats">Cập nhật dữ liệu</button>
      </div>
    </div>

    <!-- Hàng Thống kê Tổng Thể Dữ liệu Thực -->
    <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
        <div style="font-size:11px; color:var(--text-muted); font-weight:600;" data-i18n="total_audit_logs">TỔNG AUDIT LOGS DB</div>
        <div id="analytics-total-audit-logs" style="font-size:24px; font-weight:800; color:var(--accent); margin-top:4px;">--</div>
      </div>
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
        <div style="font-size:11px; color:var(--text-muted); font-weight:600;" data-i18n="total_actual_users">TỔNG TÀI KHOẢN ĐÃ THỰC</div>
        <div id="analytics-total-users" style="font-size:24px; font-weight:800; color:#4ade80; margin-top:4px;">--</div>
      </div>
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
        <div style="font-size:11px; color:var(--text-muted); font-weight:600;" data-i18n="total_feedback_reports">TỔNG BÁO CÁO FEEDBACK</div>
        <div id="analytics-total-feedbacks" style="font-size:24px; font-weight:800; color:#f59e0b; margin-top:4px;">--</div>
      </div>
    </div>

    <!-- Thống kê Thao tác theo Module (Dữ liệu Thực) -->
    <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:18px;">
      <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px;" data-i18n="module_breakdown_title">Phân Bổ Thao Tác Theo Phân Hệ (Module Breakdown from DB)</h4>
      <div id="analytics-module-breakdown">
        <div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">Đang kết nối Database để tổng hợp phân bổ thao tác...</div>
      </div>
    </div>
  </div>
</div>
`;
