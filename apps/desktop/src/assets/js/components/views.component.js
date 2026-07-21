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
        
        <div class="download-options" style="margin-top: 4px; background: var(--bg-primary); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <label style="font-size: 13px; font-weight: 500; color: var(--text-secondary); display: block; margin-bottom: 8px;">Chất lượng tải xuống (YouTube)</label>
          <select id="yt-quality" style="width: 100%; padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 13px; outline: none; border: 1px solid var(--border-color);">
            <option value="auto">Tự động (Chất lượng cao nhất)</option>
            <option value="1080p">1080p (MP4)</option>
            <option value="720p">720p (MP4)</option>
            <option value="audio">Chỉ âm thanh (MP3)</option>
          </select>
        </div>
        
        <div id="video-preview-card" class="video-preview-card" style="margin-top: 4px; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); padding: 24px; background: var(--bg-primary); text-align: center; min-height: 180px; position: relative; overflow: hidden;">
          <span data-icon="youtube" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px; opacity: 0.5;"></span>
          <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500;">Thông tin Video</p>
          <span style="color: var(--text-muted); font-size: 12px; margin-top: 4px; max-width: 80%;">Thumbnail và thời lượng sẽ hiển thị tại đây khi bạn chọn file hoặc dán link.</span>
        </div>
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
          <option value="custom">Tùy chỉnh thời gian</option>
          <option value="ai_smart">AI Smart Cutter (Tự động 30-90s)</option>
        </select>
        <div id="custom-times" class="hidden" style="display:flex;gap:8px;align-items:center;">
          <input type="text" id="time-start" placeholder="00:00:00" style="flex:1;" />
          <span style="color:var(--text-muted);">→</span>
          <input type="text" id="time-end" placeholder="00:01:20" style="flex:1;" />
        </div>
        
        <label style="margin-top:8px;">Cách thức Cắt</label>
        <select id="cut-engine">
          <option value="fast" selected>🟢 Fast Mode (Siêu tốc, giữ nguyên chất lượng)</option>
          <option value="accurate">🟡 Accurate Mode (Chậm hơn, cắt cực chuẩn từng frame)</option>
        </select>
        
        <div id="quality-config" class="hidden" style="margin-top:8px;">
          <label>Chất lượng xuất (Re-encode)</label>
          <select id="cut-quality">
            <option value="auto">Tự động (H.264)</option>
            <option value="h264">H.264 (Tương thích tốt)</option>
            <option value="h265">H.265 / HEVC (Dung lượng thấp)</option>
            <option value="av1">AV1 (Chất lượng tốt nhất)</option>
          </select>
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
  <div class="automation-container">
    <div class="automation-grid">
      <div class="input-section">
        
        <!-- Toggle Chế độ -->
        <div style="display:flex; gap:8px; margin-bottom: 16px; background: var(--bg-primary); padding: 6px; border-radius: 8px; border: 1px solid var(--border-color);">
          <button id="mode-copy-btn" class="btn-primary" style="flex:1; padding: 8px; border-radius: 6px; font-weight: 500;" onclick="switchAiVideoMode('copy')">Copy Video</button>
          <button id="mode-idea-btn" class="btn-outline" style="flex:1; padding: 8px; border-radius: 6px; font-weight: 500;" onclick="switchAiVideoMode('idea')">Tạo từ Ý Tưởng</button>
        </div>

        <!-- Chế độ Copy (Dán link) -->
        <div id="ai-video-copy-section">
          <input type="text" id="ai-copy-url" class="yt-input" placeholder="Dán link TikTok/YouTube/Facebook..." autocomplete="off" />
          <button id="ai-analyze-btn" class="btn-outline" style="width: 100%; margin-top: 8px; padding: 10px; font-weight: 500;" onclick="startAiVideoAnalysis()">Phân tích Video & Lấy Kịch bản</button>
        </div>

        <!-- Chế độ Ý tưởng (Nhập Text) -->
        <div id="ai-video-idea-section" class="hidden">
          <textarea id="ai-idea-text" placeholder="Nhập ý tưởng của bạn... VD: Một video kể về hành trình thám hiểm vũ trụ, có người ngoài hành tinh..." rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); resize: vertical; margin-bottom: 8px;"></textarea>
          <button id="ai-generate-script-btn" class="btn-outline" style="width: 100%; padding: 10px; font-weight: 500;" onclick="startAiScriptGeneration()">Tạo Kịch bản chi tiết (Prompts)</button>
        </div>

        <!-- Kết quả kịch bản phân cảnh -->
        <div id="ai-script-result" class="hidden" style="margin-top: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); padding: 12px;">
          <h4 style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Kịch bản Phân cảnh (Prompts)</h4>
          <div id="ai-scenes-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
             <!-- Render scene prompts here -->
          </div>
        </div>
        
      </div>

      <div class="settings-card">
        <label>Mô hình tạo Video (Video Model)</label>
        <select id="ai-video-model">
          <option value="veo3">Veo 3 (8s/clip)</option>
          <option value="runway">Runway Gen-3 Alpha</option>
          <option value="luma">Luma Dream Machine</option>
          <option value="kling">Kling AI</option>
        </select>
        
        <label style="margin-top:8px;">Số lượng phân cảnh (Scenes)</label>
        <select id="ai-video-scenes-count">
          <option value="auto">Tự động (Dựa trên nội dung)</option>
          <option value="3">3 Cảnh (~24s)</option>
          <option value="5">5 Cảnh (~40s)</option>
          <option value="8">8 Cảnh (~1 phút)</option>
        </select>

        <label style="margin-top:8px;">Tỉ lệ khung hình (Aspect Ratio)</label>
        <select id="ai-video-ratio">
          <option value="9:16">9:16 (TikTok, Shorts)</option>
          <option value="16:9">16:9 (YouTube)</option>
        </select>
        
        <hr />
        
        <label style="font-weight:600;color:#38bdf8;">Âm thanh & Giọng nói</label>
        <label class="checkbox-row"><input type="checkbox" id="ai-video-keep-audio" checked />Giữ lại âm thanh gốc (Chỉ cho chế độ Copy)</label>
        
        <div id="ai-video-voice-options" class="hidden">
          <label>Lồng tiếng (AI Voice)</label>
          <select id="ai-video-voice-engine">
            <option value="elevenlabs">ElevenLabs</option>
            <option value="omnivoice">Omni Voice API</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Action Buttons -->
    <button id="ai-video-start-btn" class="btn-primary" style="margin-top:16px;" onclick="startAiVideoRender()"><span data-icon="zap" style="margin-right:6px;vertical-align:middle;"></span> Bắt đầu Render Hàng loạt</button>
    
    <!-- Progress Bar -->
    <div id="ai-video-progress-section" class="progress-section hidden" style="margin-top:16px;">
      <div class="progress-header">
        <span id="ai-video-status-text">Đang chuẩn bị...</span>
        <div style="display:flex;gap:12px;align-items:center;">
          <span id="ai-video-eta" style="color:var(--text-muted);font-size:12px;"></span>
          <span id="ai-video-progress-percent">0%</span>
        </div>
      </div>
      <div class="progress-track"><div id="ai-video-progress-fill" class="progress-fill"></div></div>
    </div>
    
    <!-- Preview Section -->
    <div id="ai-video-preview-section" class="hidden" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <h3 style="color: var(--text-primary); margin-bottom: 12px; font-size: 15px; display: flex; align-items: center;"><span data-icon="playCircle" style="margin-right: 6px;"></span> Preview Video Thành Phẩm</h3>
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; text-align: center;">
        <video id="ai-video-player" controls style="max-width: 100%; max-height: 400px; border-radius: 6px; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></video>
        <div style="margin-top: 12px; display: flex; justify-content: center; gap: 8px;">
           <button class="btn-primary" onclick="openOutputFolder()"><span data-icon="folder" style="margin-right:4px;vertical-align:middle;"></span> Mở thư mục chứa File</button>
        </div>
      </div>
    </div>
    
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
    <div><span data-icon="twitter" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;">X (Twitter) Accounts</h3><p style="color:var(--text-muted);">Quản lý tài khoản X & đăng Tweet tự động</p></div>
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

  <div id="secure-api-settings-section" class="settings-card-section" style="margin-top:16px; display: none;">
    <h3 style="margin-bottom:8px;">Bể chứa API Keys (Tự động xoay vòng)</h3>
    <p class="settings-hint">Các key sẽ được mã hóa an toàn bằng chip bảo mật của máy tính (Keychain/DPAPI) trước khi lưu xuống ổ đĩa, đảm bảo 100% không bị rò rỉ.</p>
    
    <!-- Form thêm Key -->
    <div style="display:flex; gap:8px; margin-bottom: 12px; margin-top: 12px;">
      <select id="new-key-type" style="width: 120px; padding: 8px; border-radius: 6px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
        <option value="GEMINI_API_KEY">Gemini API</option>
        <option value="FAL_KEY">Fal.ai API</option>
        <option value="OPENAI_API_KEY">OpenAI API</option>
      </select>
      <input type="password" id="new-key-value" placeholder="Dán API Key vào đây..." style="flex:1; padding: 8px; border-radius: 6px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);" />
      <input type="text" id="new-key-note" placeholder="Ghi chú (Ví dụ: Acc 1)" style="width: 120px; padding: 8px; border-radius: 6px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);" />
      <button class="btn-primary" onclick="addNewApiKey()" style="padding: 8px 16px; border-radius: 6px;">Thêm</button>
    </div>

    <!-- Danh sách Key hiện tại -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px;">Loại</th>
            <th style="padding: 10px;">Key (Ẩn)</th>
            <th style="padding: 10px;">Ghi chú</th>
            <th style="padding: 10px; width: 60px; text-align:center;">Hành động</th>
          </tr>
        </thead>
        <tbody id="api-keys-list-body">
          <!-- Render danh sách key ở đây -->
        </tbody>
      </table>
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

<!-- Chat Support View (Staff & Admin) -->
<div id="view-chat-support" class="view">
  <div style="display: flex; gap: 16px; height: 520px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden;">
    <!-- Lista phiên chat bên trái -->
    <div style="width: 260px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; background: var(--bg-primary);">
      <div style="padding: 14px; border-bottom: 1px solid var(--border-color); font-weight: 600; font-size: 14px;">Hộp thoại Khách hàng</div>
      <div id="staff-chat-list" style="flex:1; overflow-y:auto; padding: 8px; display: flex; flex-direction: column; gap: 6px;">
        <div class="chat-session-item active" style="padding: 10px; background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer;">
          <div style="font-weight: 600; font-size: 13px;">User: Client #1042</div>
          <div style="font-size: 12px; color: var(--accent); margin-top: 2px;">Yêu cầu Staff hỗ trợ...</div>
        </div>
      </div>
    </div>
    <!-- Cửa sổ Chat tương tác bên phải -->
    <div style="flex: 1; display: flex; flex-direction: column;">
      <div style="padding: 14px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; background: var(--bg-primary);">
        <div>
          <div style="font-weight: 600; font-size: 14px;">Đang chat với: Client #1042</div>
          <div style="font-size: 11px; color: var(--text-muted);">Tài khoản: client1042@gmail.com</div>
        </div>
        <button class="btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="showToast('Thông báo', 'Đã đánh dấu hoàn tất hỗ trợ.', 'success')">Hoàn tất Hỗ trợ</button>
      </div>
      <div id="staff-chat-messages" style="flex:1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-primary);">
        <div class="chat-msg ai" style="max-width: 80%; background: var(--bg-card); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 13px;">
          <strong>AI Bot:</strong> Xin chào! Tôi có thể giúp gì cho bạn?
        </div>
        <div class="chat-msg user" style="max-width: 80%; align-self: flex-end; background: var(--accent); color: white; padding: 10px; border-radius: 8px; font-size: 13px;">
          Tôi không nạp được API key Gemini, nhờ nhân viên kiểm tra giúp.
        </div>
      </div>
      <div style="padding: 12px 16px; background: var(--bg-card); border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px;">
        <input type="text" id="staff-chat-input" placeholder="Nhập câu trả lời của Staff..." style="flex: 1; padding: 10px 16px; border-radius: 20px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; outline: none;" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();sendStaffChatMessage(event);}" />
        <button type="button" class="btn-primary" style="width: auto !important; min-width: 90px; flex-shrink: 0; padding: 10px 24px; border-radius: 20px; margin: 0;" onclick="sendStaffChatMessage(event)">Gửi</button>
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

    <!-- Bảng hiển thị Dữ liệu Thực -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px;">User</th>
            <th style="padding: 10px;">Địa chỉ IP</th>
            <th style="padding: 10px;">HĐH / Thiết bị</th>
            <th style="padding: 10px;">Ngày tạo</th>
            <th style="padding: 10px;">Trạng thái</th>
            <th style="padding: 10px;">Vai trò (Role)</th>
            <th style="padding: 10px; text-align:center;">Hành động (Ban / Phân Tab)</th>
          </tr>
        </thead>
        <tbody id="user-mgmt-table-body">
          <tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Đang kết nối tới Supabase Database để tải dữ liệu thật...</td></tr>
        </tbody>
      </table>
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
      <button class="btn-primary" onclick="loadAdminNotificationHistory()" style="padding: 8px 16px; border-radius:6px; font-size:13px; width:auto;">
        🔄 Tải lại Lịch sử
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

    <!-- Bảng Lịch sử Thông báo -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px;">Tiêu đề</th>
            <th style="padding: 10px;">Nội dung</th>
            <th style="padding: 10px;">Đối tượng</th>
            <th style="padding: 10px;">Hạn dùng</th>
            <th style="padding: 10px;">Ngày tạo</th>
            <th style="padding: 10px; text-align:center;">Hành động (Sửa / Xóa)</th>
          </tr>
        </thead>
        <tbody id="admin-notif-table-body">
          <tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp Lịch sử Thông báo tu Supabase Database...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Tab Configuration Modal -->
<div id="tab-config-modal" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; width: 420px; max-width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
    <h3 style="margin-bottom: 8px; font-size:16px;">Phân Quyền Tab Màn Hình</h3>
    <p class="settings-hint" style="margin-bottom: 16px;">Tích chọn các Tab được phép hiển thị cho tài khoản này:</p>

    <div style="display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; padding: 12px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 16px;">
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="ho-so" checked /> <span>Hồ sơ (Thông tin cá nhân)</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="cong-cu" checked /> <span>Công cụ (Cắt, AI Video, Reup...)</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="tu-dong-hoa" checked /> <span>Tự động hóa (Workflow, Record)</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="tai-khoan" checked /> <span>Tài khoản (TikTok, Facebook, YT...)</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="tiep-thi" checked /> <span>Tiếp thị liên kết</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="doi-nhom" checked /> <span>Đội nhóm</span></label>
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;"><input type="checkbox" class="tab-config-cb" value="tien-ich" checked /> <span>Tiện ích</span></label>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-outline" style="padding: 8px 16px; font-size:13px; border-radius:6px;" onclick="closeTabConfigModal()">Hủy</button>
      <button class="btn-primary" style="padding: 8px 20px; width: auto; font-size:13px; border-radius:6px;" onclick="saveTabConfigModal()">Lưu Cấu Hình</button>
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
      <button class="btn-primary" onclick="loadRealFeedbackData()" style="padding: 8px 16px; border-radius:6px; font-size:13px; width:auto;">
        🔄 Tải lại Dữ liệu
      </button>
    </div>

    <!-- Thanh Tìm kiếm Feedback -->
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; background:var(--bg-primary); padding:12px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" id="feedback-search-input" placeholder="Tìm theo Email, Username hoặc Nội dung..." style="flex:1; min-width:240px; padding:8px 12px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); font-size:13px;" onkeyup="if(event.key==='Enter') loadRealFeedbackData()" />
      <button class="btn-outline" onclick="loadRealFeedbackData()" style="padding:8px 16px; border-radius:6px; font-size:13px;">Lọc</button>
    </div>

    <!-- Bảng hiển thị Dữ liệu Feedback Thực -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 10px;">Người gửi (User)</th>
            <th style="padding: 10px;">Nội dung phản hồi</th>
            <th style="padding: 10px;">Thời gian gửi</th>
            <th style="padding: 10px; text-align:center;">Hành động (Xóa)</th>
          </tr>
        </thead>
        <tbody id="feedback-mgmt-table-body">
          <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Đang kết nối tới Supabase Database để tải dữ liệu Feedback thực...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`;

function renderViews() {
  const root = document.getElementById('views-root');
  if (root) {
    root.outerHTML = '<div class="main-content">' + ViewsComponent + '</div>';
  }
}
