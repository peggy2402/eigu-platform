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
        
        <div id="video-preview-card" class="video-preview-card" style="margin-top: 4px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); padding: 24px; background: var(--bg-primary); text-align: center; min-height: 180px; position: relative; overflow: hidden;">
          <span data-icon="youtube" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px; opacity: 0.5;"></span>
          <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500;">Thông tin Video</p>
          <span style="color: var(--text-muted); font-size: 12px; margin-top: 4px; max-width: 80%;">Thumbnail và thời lượng sẽ hiển thị tại đây khi bạn chọn file hoặc dán link.</span>
        </div>

        <!-- Chế độ cắt Video (Nằm dưới khối Thông tin Video) -->
        <div class="cut-mode-card" style="margin-top: 4px; padding: 16px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
          <label style="font-weight:600; color:var(--accent); font-size: 14px; display:flex; align-items:center; gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> Chế độ & Thông số Cắt Video</label>
          
          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;">Chế độ cắt Video</label>
            <select id="split-mode" class="custom-select">
              <option value="split_1">1 phút / video</option>
              <option value="split_2">2 phút / video</option>
              <option value="split_3">3 phút / video</option>
              <option value="split_5" selected>5 phút / video</option>
              <option value="split_10">10 phút / video</option>
              <option value="split_20">20 phút / video</option>
              <option value="custom">Tùy chỉnh thời gian</option>
              <option value="ai_smart">AI Smart Cutter (Tự động 30-90s)</option>
            </select>
            <div id="custom-times" class="hidden" style="display:flex;gap:8px;align-items:center;margin-top:6px;">
              <input type="text" id="time-start" placeholder="00:00:00" style="flex:1;" />
              <span style="color:var(--text-muted);">→</span>
              <input type="text" id="time-end" placeholder="00:01:20" style="flex:1;" />
            </div>
          </div>
          
          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;">Cách thức Cắt</label>
            <select id="cut-engine" class="custom-select">
              <option value="fast" selected>🟢 Fast Mode (Siêu tốc, giữ nguyên chất lượng)</option>
              <option value="accurate">🟡 Accurate Mode (Chậm hơn, cắt cực chuẩn từng frame)</option>
            </select>
            
            <div id="quality-config" class="hidden" style="margin-top:6px;">
              <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;">Chất lượng xuất (Re-encode)</label>
              <select id="cut-quality" class="custom-select">
                <option value="auto">Tự động (H.264)</option>
                <option value="h264">H.264 (Tương thích tốt)</option>
                <option value="h265">H.265 / HEVC (Dung lượng thấp)</option>
                <option value="av1">AV1 (Chất lượng tốt nhất)</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;">Tỉ lệ khung hình</label>
            <select id="aspect-ratio" class="custom-select">
              <option value="original">Giữ nguyên bản</option>
              <option value="9:16">9:16 (TikTok, Shorts)</option>
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (Instagram)</option>
            </select>
          </div>

          <label class="checkbox-row" style="margin-top: 4px;"><input type="checkbox" id="auto-part" checked />Tự động đánh số "Phần 1/N"</label>
        </div>
      </div>

      <div class="settings-card">
        <label style="font-weight:600;color:#38bdf8;font-size:14px;">Tính năng Anti-Detect</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-metadata" checked />Xóa siêu dữ liệu (Metadata Stripping)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-noise" />Nhiễu hạt & Cân bằng sáng (Noise & EQ)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-decimate" />Xóa khung hình tĩnh (Decimation)</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-audio" />Đảo chiều âm thanh 3D (Spatial Panning)</label>
        <hr />
        <label style="font-weight:600;color:#a78bfa;font-size:14px;">Chỉnh sửa nâng cao</label>

        <label>Lật video</label>
        <select id="opt-flip" class="custom-select">
          <option value="none">Không lật</option>
          <option value="horizontal">Lật ngang (Horizontal)</option>
          <option value="vertical">Lật dọc (Vertical)</option>
        </select>

        <label style="margin-top:4px;">Màu sắc (EQ)</label>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);">Độ sáng (Brightness)</label>
              <span class="slider-val-badge" id="val-brightness">1.00x</span>
            </div>
            <input type="range" id="opt-brightness" class="custom-range-slider" value="1.00" min="0.50" max="1.50" step="0.02" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);">Tương phản (Contrast)</label>
              <span class="slider-val-badge" id="val-contrast">1.00x</span>
            </div>
            <input type="range" id="opt-contrast" class="custom-range-slider" value="1.00" min="0.50" max="1.50" step="0.02" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);">Độ bão hòa (Saturation)</label>
              <span class="slider-val-badge" id="val-saturation">1.00x</span>
            </div>
            <input type="range" id="opt-saturation" class="custom-range-slider" value="1.00" min="0.00" max="2.00" step="0.05" />
          </div>
        </div>

        <label style="margin-top:4px;">Bẻ khung hình</label>
        <select id="opt-frame-bend" class="custom-select">
          <option value="none">Không</option>
          <option value="rotate90">Xoay 90°</option>
          <option value="rotate180">Xoay 180°</option>
          <option value="vflip">Lật dọc</option>
        </select>

        <hr style="margin:6px 0;" />
        <label style="font-weight:600; color:#f472b6;">Chèn Logo & Watermark</label>

        <div class="logo-upload-container">
          <input type="file" id="logo-file-input" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" />
          <div id="logo-drop-area" class="logo-drop-area" onclick="document.getElementById('logo-file-input').click()">
            <span data-icon="image" style="width:18px; height:18px; color:var(--text-muted);"></span>
            <span id="logo-file-name" style="font-size:12px; color:var(--text-secondary);">Bấm để chọn tệp Logo (.png, .jpg)...</span>
            <button id="logo-remove-btn" type="button" class="btn-outline hidden" onclick="event.stopPropagation(); removeLogoFile();" style="padding:2px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);">Xóa</button>
          </div>
        </div>

        <div id="logo-options-group" class="hidden" style="display:flex; flex-direction:column; gap:10px; margin-top:4px;">
          <label style="font-size:12px; color:var(--text-secondary);">Vị trí Logo (9 vị trí)</label>
          <div class="logo-grid-selector">
            <button type="button" class="grid-btn" data-pos="top-left" title="Trên Trái">↖</button>
            <button type="button" class="grid-btn" data-pos="top-center" title="Giữa Trên">⬆</button>
            <button type="button" class="grid-btn" data-pos="top-right" title="Trên Phải">↗</button>
            
            <button type="button" class="grid-btn" data-pos="center-left" title="Giữa Trái">⬅</button>
            <button type="button" class="grid-btn" data-pos="center" title="Chính Giữa">⏺</button>
            <button type="button" class="grid-btn" data-pos="center-right" title="Giữa Phải">➔</button>
            
            <button type="button" class="grid-btn" data-pos="bottom-left" title="Dưới Trái">↙</button>
            <button type="button" class="grid-btn" data-pos="bottom-center" title="Giữa Dưới">⬇</button>
            <button type="button" class="grid-btn active" data-pos="bottom-right" title="Dưới Phải">↘</button>
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);">Kích thước Logo</label>
              <span class="slider-val-badge" id="val-logo-size">15%</span>
            </div>
            <input type="range" id="opt-logo-size" class="custom-range-slider" value="15" min="5" max="40" step="1" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);">Độ trong suốt (Opacity)</label>
              <span class="slider-val-badge" id="val-logo-opacity">100%</span>
            </div>
            <input type="range" id="opt-logo-opacity" class="custom-range-slider" value="100" min="10" max="100" step="5" />
          </div>
        </div>

        <hr style="margin:6px 0;" />
        <label>Giọng nói</label>
        <select id="opt-voice" class="custom-select">
          <option value="none">Giữ nguyên</option>
          <option value="ffmpeg">FFmpeg (Thay đổi cao độ)</option>
          <option value="elevenlabs">ElevenLabs AI Voice</option>
          <option value="omnivoice">Omni Voice API</option>
          <option value="self-hosted">OmniVoice (Tự host)</option>
        </select>
        <div id="voice-ffmpeg-config" class="hidden" style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex; gap:10px;">
            <div style="flex:1;" class="slider-group">
              <div class="slider-header">
                <label style="font-size:11px;color:var(--text-muted);">Cao độ</label>
                <span class="slider-val-badge" id="val-voice-pitch">1.0x</span>
              </div>
              <input type="range" id="voice-pitch" class="custom-range-slider" value="1.0" min="0.5" max="2.0" step="0.05" />
            </div>
            <div style="flex:1;" class="slider-group">
              <div class="slider-header">
                <label style="font-size:11px;color:var(--text-muted);">Tốc độ</label>
                <span class="slider-val-badge" id="val-voice-speed">1.0x</span>
              </div>
              <input type="range" id="voice-speed" class="custom-range-slider" value="1.0" min="0.5" max="2.0" step="0.05" />
            </div>
          </div>
        </div>
        <div id="voice-api-config" class="hidden" style="display:flex;flex-direction:column;gap:6px;">
          <select id="voice-speaker" class="custom-select">
            <option value="">Đang tải danh sách giọng nói...</option>
          </select>
          <p style="font-size:11px;color:var(--text-muted);">API key được quản lý tập trung trên server. Chọn giọng nói từ thư viện.</p>
        </div>
      </div>
    </div>

    <div class="output-row" style="margin-top:16px;">
      <span class="label">Thư mục lưu:</span>
      <span class="path clickable-path" id="output-path" onclick="openOutputFolder()" title="Bấm để mở thư mục trong Finder (macOS) / File Explorer (Windows)">Mặc định (Downloads/eigu/outputs)</span>
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
<div id="view-guide" class="view" style="width: 100%; box-sizing: border-box;">
  <div class="guide-container">
    <div class="guide-section">
      <div class="guide-heading">
        <span>📊 1. Dashboard</span>
        <span class="guide-badge">Tổng quan</span>
      </div>
      <p>Trang tổng quan hiển thị số liệu video đã xử lý, đã upload TikTok, đang chờ và số tài khoản TikTok đang quản lý. Theo dõi hoạt động hệ thống thời gian thực.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span>🎬 2. Tự động hóa Video</span>
        <span class="guide-badge">Cắt ghép AI</span>
      </div>
      <p><strong>Đầu vào:</strong> Kéo thả file .mp4 hoặc dán link YouTube để tải video tự động.</p>
      <p><strong>Chế độ cắt:</strong> Chọn độ dài mỗi video (1-20 phút) hoặc tùy chỉnh chi tiết.</p>
      <p><strong>Tỉ lệ khung hình:</strong> 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram).</p>
      <p><strong>Anti-Detect:</strong> Xóa metadata, thêm nhiễu hạt, lật khung hình, đảo âm thanh 3D chống bản quyền.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span>🔄 3. Visual Workflow Builder</span>
        <span class="guide-badge">Luồng tự động</span>
      </div>
      <p>Thiết kế luồng xử lý tự động bằng cách kéo thả các Node: Lấy URL ➔ Tải xuống ➔ AI Xử lý (ASR + LLM) ➔ FFmpeg ➔ Nạp Hồ sơ Browser ➔ Tải lên TikTok.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span>🌐 4. Quản lý Hồ sơ & Proxy</span>
        <span class="guide-badge">Anti-Detect</span>
      </div>
      <p>Mỗi tài khoản là một Browser Profile riêng biệt với Cookies, Proxy SOCKS5/Residential riêng. Khóa WebRTC ngăn rò rỉ địa chỉ IP thật qua UDP/STUN.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span>👥 5. Phân Quyền & Đội Nhóm</span>
        <span class="guide-badge">RBAC System</span>
      </div>
      <p>Hệ thống phân quyền 3 cấp độ (Admin, Staff, User). Admin có quyền bật/tắt hiển thị từng Tab chức năng riêng biệt cho từng tài khoản nhân viên.</p>
    </div>
    
    <div class="guide-section">
      <div class="guide-heading">
        <span>🛠️ 6. Cấu Hình & Giám Sát Lỗi</span>
        <span class="guide-badge">Telemetry</span>
      </div>
      <p>Tự động ghi nhận 100% Stack Trace, Mã lỗi HTTP, Session Replay Action Trail giúp đội ngũ phát triển phát hiện và xử lý sự cố tức thì.</p>
    </div>
  </div>
</div>

<!-- Settings View -->
<div id="view-settings" class="view" style="width: 100%; box-sizing: border-box;">
  <div class="settings-card-section">
    <h3 style="margin-bottom:16px;">Giao diện ứng dụng</h3>
    <div class="theme-options">
      <div class="theme-option" data-theme="light"><span data-icon="sun"></span> Sáng</div>
      <div class="theme-option" data-theme="dark"><span data-icon="moon"></span> Tối</div>
      <div class="theme-option" data-theme="system"><span data-icon="monitor"></span> Hệ thống</div>
    </div>
  </div>

  <!-- Cấu hình Tiền tố API Server & Obfuscation Code (Admin Obfuscation Key Management) -->
  <div id="admin-api-prefix-settings-section" class="settings-card-section" style="margin-top:20px; display: none;">
    <h3 style="margin-bottom:8px;">🔒 Cấu Hình Mã Tiền Tố Động (Admin Custom Obfuscation Prefix)</h3>
    <p class="settings-hint">Điều chỉnh chuỗi mã hóa bảo mật (<code>obf_code</code> / <code>API_PREFIX</code>) để bảo vệ các endpoints hệ thống khỏi các công cụ tự động quét route (Scan Bot / Hacker).</p>
    
    <div style="display:flex; gap:12px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
      <label style="font-weight: 600; font-size: 13px; min-width: 140px; color: var(--text-secondary);">Mã Mã Hóa (<code>obf_code</code>):</label>
      <input type="text" id="admin-custom-api-prefix" placeholder="v2-sec-2026" style="flex:1; min-width: 240px; padding: 10px 14px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: monospace; font-size: 13px;" oninput="updateApiRoutePreview()" />
      <button class="btn-primary" onclick="saveAdminApiConfig()" style="padding: 10px 24px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; min-width: 130px; margin: 0;">Lưu Mã Tiền Tố</button>
    </div>

    <!-- Hiển thị xem trước Đường dẫn Server URL Hoàn Chỉnh -->
    <div style="margin-top: 12px; padding: 10px 14px; background: var(--bg-primary); border-radius: 8px; border: 1px dashed var(--border-color); font-size: 12px;">
      <span style="color: var(--text-muted);">Đường dẫn Server xem trước:</span>
      <code id="admin-api-url-preview" style="color: var(--accent); font-weight: 700; font-family: monospace; margin-left: 6px;">http://localhost:3001/api/v2-sec-2026</code>
    </div>

    <p id="admin-api-url-status" class="settings-hint" style="margin-top: 8px; color: var(--accent); display: none;"></p>
  </div>

  <!-- Dashboard Theo Dõi Bug, Stack Trace & Performance Telemetry (CHỈ ADMIN MỚI ĐƯỢC XEM) -->
  <div id="system-telemetry-section" class="settings-card-section" style="margin-top:20px; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); display: none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap: wrap; gap: 8px;">
      <h3 style="color: #ef4444; margin:0; display:inline-flex; align-items:center; gap:6px;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3 3 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg> Theo Dõi Bug, Stack Trace & Performance Dashboard</h3>
      <button class="btn-outline" onclick="if(window.EIGU_TELEMETRY) window.EIGU_TELEMETRY.clearLogs();" style="padding:4px 12px; font-size:12px; border-color:#ef4444; color:#ef4444; border-radius: 6px;">Xóa Logs</button>
    </div>
    <p class="settings-hint">Tự động ghi nhận 100% Stack Trace, Mã lỗi HTTP, Session Replay Action Trail và độ trễ mạng theo thời gian thực.</p>
    
    <div id="telemetry-logs-list" style="margin-top: 14px; max-height: 320px; overflow-y: auto;">
      <div style="text-align:center; padding: 20px; color: var(--text-muted);">✅ Chưa ghi nhận lỗi hệ thống nào.</div>
    </div>
  </div>

  <div id="secure-api-settings-section" class="settings-card-section" style="margin-top:20px; display: none;">
    <h3 style="margin-bottom:8px;">Bể chứa API Keys (Tự động xoay vòng)</h3>
    <p class="settings-hint">Các key sẽ được mã hóa an toàn bằng chip bảo mật của máy tính (Keychain/DPAPI) trước khi lưu xuống ổ đĩa, đảm bảo 100% không bị rò rỉ.</p>
    
    <!-- Form thêm Key -->
    <div style="display:flex; gap:10px; margin-bottom: 14px; margin-top: 14px; flex-wrap: wrap;">
      <select id="new-key-type" style="width: 140px; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;">
        <option value="GEMINI_API_KEY">Gemini API</option>
        <option value="FAL_KEY">Fal.ai API</option>
        <option value="OPENAI_API_KEY">OpenAI API</option>
      </select>
      <div style="flex:1; min-width: 220px; position: relative; display: flex; align-items: center;">
        <input type="password" id="new-key-value" placeholder="Dán API Key vào đây..." style="width: 100%; padding: 10px 36px 10px 12px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;" />
        <button type="button" onclick="toggleInputEye('new-key-value', this)" title="Hiện Key" style="position: absolute; right: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </div>
      <input type="text" id="new-key-note" placeholder="Ghi chú" style="width: 140px; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px;" />
      <button class="btn-primary" onclick="addNewApiKey()" style="padding: 10px 20px; border-radius: 8px; margin: 0; white-space: nowrap;">Thêm Key</button>
    </div>

    <!-- Danh sách Key hiện tại -->
    <div style="overflow-x:auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <th style="padding: 12px;">Loại</th>
            <th style="padding: 12px;">Key (Ẩn)</th>
            <th style="padding: 12px;">Ghi chú</th>
            <th style="padding: 12px; width: 80px; text-align:center;">Hành động</th>
          </tr>
        </thead>
        <tbody id="api-keys-list-body">
          <!-- Render danh sách key ở đây -->
        </tbody>
      </table>
    </div>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;">Cache & Dữ liệu bộ nhớ đệm</h3>
    <p class="settings-hint">Quản lý bộ nhớ đệm, xoá dữ liệu workflow tạm thời, cấu hình thư mục đầu ra mặc định.</p>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;">Proxy & Bảo Mật Mạng</h3>
    <p class="settings-hint">Cấu hình SOCKS5 / Residential proxy cho Anti-Detect Browser, chặn rò rỉ WebRTC UDP/STUN.</p>
  </div>

  <div class="settings-card-section" style="margin-top:20px;">
    <h3 style="margin-bottom:8px;">Workflow & Anti-Detect Mặc Định</h3>
    <p class="settings-hint">Cài đặt mặc định cho xử lý video, tỉ lệ khung hình, lật ảnh, dải tần âm thanh và xóa metadata.</p>
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

<!-- Chat Support View (Staff & Admin Console) -->
<div id="view-chat-support" class="view" style="height: 100%; width: 100%; box-sizing: border-box; overflow: hidden;">
  <div id="chat-support-container" class="chat-support-container show-list">
    <!-- List phiên chat bên trái -->
    <div class="chat-support-sidebar">
      <div style="padding: 12px 14px; border-bottom: 1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <span style="font-weight: 700; font-size: 13px; color: var(--text-primary);">Hộp thoại Khách hàng</span>
        <button class="btn-outline" style="padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;" onclick="loadStaffChatConsole()" title="Tải lại danh sách"><span data-icon="refreshCw"></span> Tải lại</button>
      </div>
      <div id="staff-chat-list" style="flex:1; min-height:0; overflow-y:auto; padding: 6px; display: flex; flex-direction: column; gap: 6px;">
        <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">Đang tải danh sách cuộc trò chuyện...</div>
      </div>
    </div>
    <!-- Cửa sổ Chat tương tác bên phải -->
    <div class="chat-support-main">
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); gap: 8px; flex-shrink: 0; min-height: 52px; box-sizing: border-box;">
        <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
          <button id="staff-chat-back-btn" class="btn-outline" style="padding: 4px 8px; font-size: 11px; display: none; flex-shrink: 0;" onclick="toggleStaffChatMobilePanel('list')">← Danh sách</button>
          <div style="min-width:0; flex:1;">
            <div id="staff-chat-target-name" style="font-weight: 700; font-size: 13px; color: var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Chọn cuộc trò chuyện để bắt đầu chat</div>
            <div id="staff-chat-target-email" style="font-size: 11px; color: var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Vui lòng chọn một phiên chat ở danh sách bên trái</div>
          </div>
        </div>
        <button id="staff-resolve-btn" class="btn-outline" style="padding: 4px 12px; font-size: 11px; flex-shrink: 0; white-space: nowrap;" onclick="resolveCurrentStaffChat()">Hoàn tất Hỗ trợ</button>
      </div>
      <div id="staff-chat-messages" style="flex:1; min-height:0; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-primary);">
        <div style="text-align:center; padding:40px; color:var(--text-muted); font-size:13px;">Chọn người dùng ở cột bên trái để trao đổi thông tin trực tiếp.</div>
      </div>
      <!-- Quote Reply Preview Bar -->
      <div id="staff-chat-reply-preview" style="display:none; padding: 6px 16px; background: var(--bg-card); border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary); align-items: center; justify-content: space-between;">
        <div style="min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <span style="font-weight:700; color:var(--accent);" id="staff-reply-target-name">Đang trả lời:</span>
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
              <div class="mention-sub">Đặt câu hỏi cho Trợ lý AI</div>
            </div>
          </div>
          <div class="mention-item" onclick="insertStaffMention('@Khách hàng ')">
            <img src="https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_14_60037b48e5.jpg" class="mention-avatar" alt="Client" />
            <div class="mention-info">
              <div class="mention-title">@Khách hàng</div>
              <div class="mention-sub">Nhắc đến Khách hàng</div>
            </div>
          </div>
          <div class="mention-item" onclick="insertStaffMention('@mọi người ')">
            <div class="mention-avatar" style="background:var(--bg-card-hover); display:flex; align-items:center; justify-content:center; font-size:14px;">👥</div>
            <div class="mention-info">
              <div class="mention-title">@mọi người</div>
              <div class="mention-sub">Nhắc đến toàn bộ hệ thống</div>
            </div>
          </div>
        </div>

        <button type="button" class="btn-outline" style="padding: 8px 12px; font-size: 16px; border-radius: 20px; border-color: var(--border-color);" onclick="toggleStaffEmojiPicker(event)" title="Thêm biểu cảm Emoji">😊</button>
        
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

        <div id="staff-chat-input" class="chat-input-editable" contenteditable="true" data-placeholder="Gửi tin nhắn..." oninput="handleStaffMentionInput(event)" onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); event.stopPropagation(); sendStaffChatMessage(event); }"></div>
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
`;

function renderViews() {
  const root = document.getElementById('views-root');
  if (root) {
    root.outerHTML = '<div class="main-content">' + ViewsComponent + '</div>';
  }
}
