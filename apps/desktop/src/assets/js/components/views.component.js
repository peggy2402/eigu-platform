const ViewsComponent = `
<div id="view-ho-so" class="view active">
  <div class="profile-card">
    <div class="profile-field"><span class="field-label">Email</span><span class="field-value" id="profile-email">—</span></div>
    <div class="profile-field"><span class="field-label">Vai trò</span><span class="field-value" id="profile-role">—</span></div>
    <div class="profile-field"><span class="field-label">Đã xác thực</span><span class="field-value" id="profile-verified">—</span></div>
    <div class="profile-field"><span class="field-label">Ngày tạo</span><span class="field-value" id="profile-created">—</span></div>
  </div>
</div>

<!-- Cat View (Tu dong cat) -->
<div id="view-cut" class="view">
  <div class="automation-container">
    <div class="automation-grid">
      <div class="input-section">
        <div id="drop-zone" class="drop-zone" onclick="document.getElementById('file-input').click()">
          <div id="drop-content">
            <span class="drop-icon" data-icon="file"></span>
            <p>Kéo thả file .mp4 vào đây</p>
            <span>hoặc bấm để chọn file</span>
          </div>
          <div id="file-info" class="file-info">
            <span id="file-name" class="file-name"></span>
            <button class="file-clear" onclick="handleClearFile()">✕</button>
          </div>
        </div>
        <input type="file" id="file-input" accept=".mp4" style="display:none" />
        <div class="divider-text">HOẶC</div>
        <input type="text" id="youtube-input" class="yt-input" placeholder="Dán link YouTube (VD: https://youtu.be/...)" autocomplete="off" />
      </div>

      <div class="settings-card">
        <label>Chế độ cắt Video</label>
        <select id="split-mode">
          <option value="split_1">1 phút / video</option>
          <option value="split_2">2 phút / video</option>
          <option value="split_3">3 phút / video</option>
          <option value="split_5" selected>5 phút / video</option>
          <option value="split_10">10 phút / video</option>
          <option value="split_20">20 phút / video</option>
          <option value="custom">Tùy chỉnh</option>
        </select>
        <div id="custom-times" class="hidden" style="display:flex;gap:8px;align-items:center;">
          <input type="text" id="time-start" placeholder="00:00:00" style="flex:1;" />
          <span style="color:var(--text-muted);">→</span>
          <input type="text" id="time-end" placeholder="00:01:20" style="flex:1;" />
        </div>
        <label style="margin-top:8px;">Tỉ lệ khung hình</label>
        <select id="aspect-ratio">
          <option value="original">Giữ nguyên bản</option>
          <option value="9:16">9:16 (TikTok, Shorts)</option>
          <option value="16:9">16:9 (YouTube)</option>
          <option value="1:1">1:1 (Instagram)</option>
        </select>
        <label class="checkbox-row"><input type="checkbox" id="auto-part" checked />Tự động đánh số "Phần 1/N"</label>
        <hr />
        <label style="font-weight:600;color:#38bdf8;">Tính năng Anti-Detect</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-metadata" checked />Xóa siêu dữ liệu (Metadata Stripping)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-noise" />Nhiễu hạt & Cân bằng sáng (Noise & EQ)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-decimate" />Xóa khung hình tĩnh (Decimation)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-audio" />Đảo chiều âm thanh 3D (Spatial Panning)</label>
        <hr />
        <label style="font-weight:600;color:#a78bfa;">Chỉnh sửa nâng cao</label>

        <label>Lật video</label>
        <select id="opt-flip">
          <option value="none">Không lật</option>
          <option value="horizontal">Lật ngang (Horizontal)</option>
          <option value="vertical">Lật dọc (Vertical)</option>
        </select>

        <label>Màu sắc (EQ)</label>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Độ sáng</label>
            <input type="number" id="opt-brightness" value="1.00" step="0.05" min="0" max="2" style="width:100%;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);font-size:12px;" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Tương phản</label>
            <input type="number" id="opt-contrast" value="1.00" step="0.05" min="0" max="2" style="width:100%;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);font-size:12px;" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Độ bão hòa</label>
            <input type="number" id="opt-saturation" value="1.00" step="0.05" min="0" max="2" style="width:100%;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);font-size:12px;" />
          </div>
        </div>

        <label>Bẻ khung hình</label>
        <select id="opt-frame-bend">
          <option value="none">Không</option>
          <option value="rotate90">Xoay 90°</option>
          <option value="rotate180">Xoay 180°</option>
          <option value="vflip">Lật dọc</option>
        </select>

        <label>Giọng nói</label>
        <select id="opt-voice">
          <option value="none">Giữ nguyên</option>
          <option value="ffmpeg">FFmpeg (Thay đổi cao độ)</option>
          <option value="elevenlabs">ElevenLabs AI Voice</option>
          <option value="omnivoice">Omni Voice API</option>
          <option value="self-hosted">OmniVoice (Tự host)</option>
        </select>
        <div id="voice-ffmpeg-config" class="hidden" style="display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;gap:6px;">
            <div style="flex:1;">
              <label style="font-size:11px;color:var(--text-muted);">Cao độ (0.5-2.0)</label>
              <input type="number" id="voice-pitch" value="1.0" step="0.1" min="0.5" max="2.0" style="width:100%;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);font-size:12px;" />
            </div>
            <div style="flex:1;">
              <label style="font-size:11px;color:var(--text-muted);">Tốc độ (0.5-2.0)</label>
              <input type="number" id="voice-speed" value="1.0" step="0.1" min="0.5" max="2.0" style="width:100%;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);font-size:12px;" />
            </div>
          </div>
        </div>
        <div id="voice-api-config" class="hidden" style="display:flex;flex-direction:column;gap:6px;">
          <select id="voice-speaker">
            <option value="">Đang tải danh sách giọng nói...</option>
          </select>
          <p style="font-size:11px;color:var(--text-muted);">API key được quản lý tập trung trên server. Chọn giọng nói từ thư viện.</p>
        </div>
      </div>
    </div>

    <div class="output-row" style="margin-top:16px;">
      <span class="label">Thư mục lưu:</span>
      <span class="path" id="output-path">Mặc định (Downloads/eigu/outputs)</span>
      <button class="change-btn" onclick="selectOutputFolder()">Thay đổi</button>
    </div>

    <button id="start-btn" class="btn-primary" style="margin-top:16px;" disabled onclick="startWorkflow()"><span data-icon="play" style="margin-right:6px;vertical-align:middle;"></span> Bắt đầu xử lý</button>
    <button id="cancel-btn" class="btn-danger hidden" onclick="cancelWorkflow()"><span data-icon="x" style="margin-right:6px;vertical-align:middle;"></span> Hủy tiến trình</button>

    <div id="progress-section" class="progress-section hidden" style="margin-top:16px;">
      <div class="progress-header">
        <span id="status-text">Đang khởi tạo...</span>
        <div style="display:flex;gap:12px;align-items:center;">
          <span id="eta-display" style="color:var(--text-muted);font-size:12px;"></span>
          <span id="progress-percent">0%</span>
        </div>
      </div>
      <div class="progress-track"><div id="progress-fill" class="progress-fill"></div></div>
    </div>

    <details style="margin-top:16px;cursor:pointer;">
      <summary style="color:var(--text-primary);font-weight:600;font-size:14px;">Hiển thị chi tiết / Logs</summary>
      <div id="log-console" class="log-console" style="margin-top:10px;"></div>
    </details>
  </div>
</div>

<!-- Placeholder Views -->
<div id="view-ai-video" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="zap" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tạo video AI</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-hot-niche" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="trendingUp" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tìm ngách hot</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-bulk-download" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="downloadCloud" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tải video hàng loạt</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-reup" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="refreshCw" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tạo video Reup</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-workflow" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="refreshCw" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tạo workflow</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-record" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="mic" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Ghi thao tác</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<!-- Social Account Views -->
<div id="view-tk-tiktok" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="tiktok" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#ff0050;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">TikTok Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản TikTok — thêm, xóa, theo dõi trạng thái</p></div>
  </div>
</div>
<div id="view-tk-facebook" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="facebook" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#1877F2;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Facebook Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản Facebook & Fanpage</p></div>
  </div>
</div>
<div id="view-tk-youtube" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="youtube" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#FF0000;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">YouTube Channels</h3><p style="color:var(--text-muted);">Quản lý kênh YouTube & đăng tải tự động</p></div>
  </div>
</div>
<div id="view-tk-x" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="x" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">X (Twitter) Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản X & đăng Tweet tự động</p></div>
  </div>
</div>
<div id="view-tk-instagram" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="instagram" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#E4405F;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Instagram Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản Instagram & đăng bài tự động</p></div>
  </div>
</div>
<div id="view-tk-threads" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="threads" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Threads Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản Threads</p></div>
  </div>
</div>
<div id="view-tiep-thi" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="link" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tiếp thị liên kết</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-doi-nhom" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="users" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Đội nhóm</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-tien-ich" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="grid" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">Tiện ích</h3><p style="color:var(--text-muted);">Tính năng đang phát triển</p></div>
  </div>
</div>

<!-- Guide View -->
<div id="view-guide" class="view">
  <div class="guide-section">
    <h3 class="guide-heading">1. Dashboard</h3>
    <p>Trang tổng quan hiển thị số liệu video đã xử lý, đã upload TikTok, đang chờ và số tài khoản TikTok đang quản lý. Theo dõi hoạt động gần đây ở phía dưới.</p>
  </div>
  <div class="guide-section">
    <h3 class="guide-heading">2. Tự động hóa video</h3>
    <p><strong>Đầu vào:</strong> Kéo thả file .mp4 hoặc dán link YouTube để tải video về tự động.</p>
    <p><strong>Chế độ cắt:</strong> Chọn độ dài mỗi video (1-20 phút) hoặc tùy chỉnh thời gian cụ thể.</p>
    <p><strong>Tỉ lệ khung hình:</strong> 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram) hoặc giữ nguyên.</p>
    <p><strong>Anti-Detect:</strong> Xóa metadata, thêm nhiễu hạt, xóa khung hình tĩnh, đảo âm thanh 3D để tránh phát hiện nội dung không nguyên bản.</p>
    <p><strong>Đầu ra:</strong> Video đã xử lý được lưu vào thư mục đầu ra (mặc định hoặc tùy chỉnh).</p>
  </div>
  <div class="guide-section">
    <h3 class="guide-heading">3. Workflow</h3>
    <p>Thiết kế luồng xử lý tự động bằng cách kéo thả các node. Các node có sẵn: Lấy URL → Tải xuống → AI Xử lý (ASR + LLM) → FFmpeg → Nạp Hồ sơ → Tải lên TikTok. Kết nối các node bằng đường kéo để tạo pipeline hoàn chỉnh.</p>
  </div>
  <div class="guide-section">
    <h3 class="guide-heading">4. Quản lý hồ sơ</h3>
    <p>Xem thông tin tài khoản: Email, vai trò, trạng thái xác thực, ngày tạo. Mỗi tài khoản là một Browser Profile riêng biệt với Cookies và Proxy riêng.</p>
  </div>
  <div class="guide-section">
    <h3 class="guide-heading">5. Proxy & Mạng</h3>
    <p>Cấu hình SOCKS5/Residential Proxy cho từng Browser Profile. Tính năng khóa WebRTC ngăn rò rỉ địa chỉ IP thật qua UDP/STUN. Máy chủ trung gian nội bộ (127.0.0.1:9050) tự động xác thực proxy cho Chromium.</p>
  </div>
  <div class="guide-section">
    <h3 class="guide-heading">6. Cài đặt</h3>
    <p>Chọn giao diện Sáng/Tối/Hệ thống. Quản lý cache, cấu hình workflow mặc định, thiết lập proxy và trình duyệt.</p>
  </div>
</div>

<!-- Settings View -->
<div id="view-settings" class="view">
  <div class="settings-card-section">
    <h3 style="margin-bottom:16px;">Giao diện</h3>
    <div class="theme-options">
      <div class="theme-option" data-theme="light"><span data-icon="sun"></span> Sáng</div>
      <div class="theme-option" data-theme="dark"><span data-icon="moon"></span> Tối</div>
      <div class="theme-option" data-theme="system"><span data-icon="monitor"></span> Hệ thống</div>
    </div>
  </div>

  <div class="settings-card-section" style="margin-top:16px;">
    <h3 style="margin-bottom:8px;">Cache & Dữ liệu</h3>
    <p class="settings-hint">Quản lý bộ nhớ đệm, xoá dữ liệu workflow, cấu hình đầu ra mặc định.</p>
  </div>

  <div class="settings-card-section" style="margin-top:16px;">
    <h3 style="margin-bottom:8px;">Proxy & Mạng</h3>
    <p class="settings-hint">Cấu hình SOCKS5 / Residential proxy cho Anti-Detect Browser, chặn rò rỉ WebRTC.</p>
  </div>

  <div class="settings-card-section" style="margin-top:16px;">
    <h3 style="margin-bottom:8px;">Workflow Mặc định</h3>
    <p class="settings-hint">Cài đặt mặc định cho cắt ghép, tỉ lệ khung hình, xử lý Anti-Detect, metadata.</p>
  </div>

  <div class="settings-card-section" style="margin-top:16px;">
    <h3 style="margin-bottom:8px;">Trình duyệt & Hồ sơ</h3>
    <p class="settings-hint">Quản lý Chrome Profile isolation, Chromium data-dir, tự tự động nạp extensions.</p>
  </div>
</div>

<!-- Feedback View -->
<div id="view-feedback" class="view">
  <div class="settings-card-section" style="margin-top:16px; border: 1px solid var(--accent); background: var(--accent-glow);">
    <h3 style="margin-bottom:12px; color: var(--accent);">Góp ý / Báo lỗi</h3>
    <p class="settings-hint" style="margin-bottom: 16px;">Mọi ý kiến đóng góp hoặc báo lỗi của bạn sẽ giúp chúng tôi phát triển EIGU tốt hơn. (Giới hạn: 3 lần/ngày)</p>
    
    <form id="feedback-form" onsubmit="submitFeedback(event)">
      <textarea 
        id="feedback-message"
        placeholder="Mô tả lỗi hoặc góp ý của bạn..."
        rows="4"
        style="width: 100%; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; resize: vertical; box-sizing: border-box;"
      ></textarea>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; color: var(--text-secondary);">Đính kèm hình ảnh (nếu có):</label>
        <label for="feedback-file" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; border: 2px dashed var(--border-color); border-radius: 8px; cursor: pointer; background: var(--bg-primary); color: var(--text-secondary); transition: all 0.2s;">
          <span data-icon="image" style="margin-bottom: 8px;"></span>
          <span style="font-size: 13px;">Nhấp để chọn ảnh hoặc kéo thả vào đây</span>
          <span id="desktop-file-name" style="font-size: 12px; color: var(--accent); margin-top: 8px;"></span>
        </label>
        <input type="file" id="feedback-file" accept="image/*" style="display: none;" onchange="document.getElementById('desktop-file-name').innerText = this.files[0] ? this.files[0].name : ''" />
      </div>
      <button id="feedback-submit-btn" type="submit" class="btn-primary" style="width: 100%; padding: 10px;">Gửi Báo Cáo</button>
    </form>
  </div>
</div>
`;

function renderViews() {
  const root = document.getElementById('views-root');
  if (root) {
    root.outerHTML = '<div class="main-content">' + ViewsComponent + '</div>';
  }
}
