const ViewsComponent = `
<div id="view-ho-so" class="view active">
  <div class="profile-card">
    <div class="profile-field"><span class="field-label" data-i18n="profile_email">Email</span><span class="field-value" id="profile-email">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_role">Vai trò</span><span class="field-value" id="profile-role">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_verified">Đã xác thực</span><span class="field-value" id="profile-verified">—</span></div>
    <div class="profile-field"><span class="field-label" data-i18n="profile_created">Ngày tạo</span><span class="field-value" id="profile-created">—</span></div>
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
            <p data-i18n="drop_mp4_here">Kéo thả file .mp4 vào đây</p>
            <span data-i18n="or_click_select">hoặc bấm để chọn file</span>
          </div>
          <div id="file-info" class="file-info">
            <span id="file-name" class="file-name"></span>
            <button class="file-clear" onclick="handleClearFile()">✕</button>
          </div>
        </div>
        <input type="file" id="file-input" accept=".mp4" style="display:none" />
        <div class="divider-text" data-i18n="or_divider">HOẶC</div>
        <input type="text" id="youtube-input" class="yt-input" placeholder="Dán link YouTube (VD: https://youtu.be/...)" autocomplete="off" data-i18n-placeholder="yt_link_placeholder" />
        
        <div class="download-options" style="margin-top: 4px; background: var(--bg-primary); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <label style="font-size: 13px; font-weight: 500; color: var(--text-secondary); display: block; margin-bottom: 8px;" data-i18n="yt_download_quality">Chất lượng tải xuống (YouTube)</label>
          <select id="yt-quality" style="width: 100%; padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 13px; outline: none; border: 1px solid var(--border-color);">
            <option value="auto" data-i18n="quality_auto">Tự động (Chất lượng cao nhất)</option>
            <option value="1080p">1080p (MP4)</option>
            <option value="720p">720p (MP4)</option>
            <option value="audio" data-i18n="quality_audio_only">Chỉ âm thanh (MP3)</option>
          </select>
        </div>
        
        <div id="video-preview-card" class="video-preview-card" style="margin-top: 4px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); padding: 24px; background: var(--bg-primary); text-align: center; min-height: 180px; position: relative; overflow: hidden;">
          <span data-icon="youtube" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px; opacity: 0.5;"></span>
          <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500;" data-i18n="video_info_title">Thông tin Video</p>
          <span style="color: var(--text-muted); font-size: 12px; margin-top: 4px; max-width: 80%;" data-i18n="video_info_desc">Thumbnail và thời lượng sẽ hiển thị tại đây khi bạn chọn file hoặc dán link.</span>
        </div>

        <!-- Chế độ cắt Video (Nằm dưới khối Thông tin Video) -->
        <div class="cut-mode-card" style="margin-top: 4px; padding: 16px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
          <label style="font-weight:600; color:var(--accent); font-size: 14px; display:flex; align-items:center; gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> <span data-i18n="cut_mode_params">Chế độ & Thông số Cắt Video</span></label>
          
          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;" data-i18n="cut_mode_label">Chế độ cắt Video</label>
            <select id="split-mode" class="custom-select">
              <option value="split_1" data-i18n="split_1">1 phút / video</option>
              <option value="split_2" data-i18n="split_2">2 phút / video</option>
              <option value="split_3" data-i18n="split_3">3 phút / video</option>
              <option value="split_5" selected data-i18n="split_5">5 phút / video</option>
              <option value="split_10" data-i18n="split_10">10 phút / video</option>
              <option value="split_20" data-i18n="split_20">20 phút / video</option>
              <option value="custom" data-i18n="split_custom">Tùy chỉnh thời gian</option>
              <option value="ai_smart" data-i18n="split_ai_smart">AI Smart Cutter (Tự động 30-90s)</option>
            </select>
            <div id="custom-times" class="hidden" style="display:flex;gap:8px;align-items:center;margin-top:6px;">
              <input type="text" id="time-start" placeholder="00:00:00" style="flex:1;" />
              <span style="color:var(--text-muted);">→</span>
              <input type="text" id="time-end" placeholder="00:01:20" style="flex:1;" />
            </div>
          </div>
          
          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;" data-i18n="cut_method_label">Cách thức Cắt</label>
            <select id="cut-engine" class="custom-select">
              <option value="fast" selected data-i18n="cut_fast">Fast Mode (Siêu tốc, giữ nguyên chất lượng)</option>
              <option value="accurate" data-i18n="cut_accurate">Accurate Mode (Chậm hơn, cắt cực chuẩn từng frame)</option>
            </select>
            
            <div id="quality-config" class="hidden" style="margin-top:6px;">
              <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;" data-i18n="export_quality_label">Chất lượng xuất (Re-encode)</label>
              <select id="cut-quality" class="custom-select">
                <option value="auto" data-i18n="codec_auto">Tự động (H.264)</option>
                <option value="h264" data-i18n="codec_h264">H.264 (Tương thích tốt)</option>
                <option value="h265" data-i18n="codec_h265">H.265 / HEVC (Dung lượng thấp)</option>
                <option value="av1" data-i18n="codec_av1">AV1 (Chất lượng tốt nhất)</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;" data-i18n="aspect_ratio_label">Tỉ lệ khung hình</label>
            <select id="aspect-ratio" class="custom-select">
              <option value="original" data-i18n="ratio_original">Giữ nguyên bản</option>
              <option value="9:16">9:16 (TikTok, Shorts)</option>
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (Instagram)</option>
            </select>
          </div>

          <label class="checkbox-row" style="margin-top: 4px;"><input type="checkbox" id="auto-part" checked /><span data-i18n="auto_part_number">Tự động đánh số "Phần 1/N"</span></label>
        </div>
      </div>

      <div class="settings-card">
        <label style="font-weight:600;color:#38bdf8;font-size:14px;" data-i18n="anti_detect_title">Tính năng Anti-Detect</label>
        <label class="checkbox-row"><input type="checkbox" id="opt-metadata" checked /><span data-i18n="opt_metadata">Xóa siêu dữ liệu (Metadata Stripping)</span></label>
        <label class="checkbox-row"><input type="checkbox" id="opt-noise" /><span data-i18n="opt_noise">Nhiễu hạt & Cân bằng sáng (Noise & EQ)</span></label>
        <label class="checkbox-row"><input type="checkbox" id="opt-decimate" /><span data-i18n="opt_decimate">Xóa khung hình tĩnh (Decimation)</span></label>
        <label class="checkbox-row"><input type="checkbox" id="opt-audio" /><span data-i18n="opt_audio_3d">Đảo chiều âm thanh 3D (Spatial Panning)</span></label>
        <hr />
        <label style="font-weight:600;color:#a78bfa;font-size:14px;" data-i18n="advanced_edit_title">Chỉnh sửa nâng cao</label>

        <label data-i18n="flip_video">Lật video</label>
        <select id="opt-flip" class="custom-select">
          <option value="none" data-i18n="flip_none">Không lật</option>
          <option value="horizontal" data-i18n="flip_horizontal">Lật ngang (Horizontal)</option>
          <option value="vertical" data-i18n="flip_vertical">Lật dọc (Vertical)</option>
        </select>

        <label style="margin-top:4px;" data-i18n="color_eq">Màu sắc (EQ)</label>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);" data-i18n="brightness_label">Độ sáng (Brightness)</label>
              <span class="slider-val-badge" id="val-brightness">1.00x</span>
            </div>
            <input type="range" id="opt-brightness" class="custom-range-slider" value="1.00" min="0.50" max="1.50" step="0.02" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);" data-i18n="contrast_label">Tương phản (Contrast)</label>
              <span class="slider-val-badge" id="val-contrast">1.00x</span>
            </div>
            <input type="range" id="opt-contrast" class="custom-range-slider" value="1.00" min="0.50" max="1.50" step="0.02" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);" data-i18n="saturation_label">Độ bão hòa (Saturation)</label>
              <span class="slider-val-badge" id="val-saturation">1.00x</span>
            </div>
            <input type="range" id="opt-saturation" class="custom-range-slider" value="1.00" min="0.00" max="2.00" step="0.05" />
          </div>
        </div>

        <label style="margin-top:4px;" data-i18n="frame_bend">Bẻ khung hình</label>
        <select id="opt-frame-bend" class="custom-select">
          <option value="none" data-i18n="bend_none">Không</option>
          <option value="rotate90" data-i18n="bend_rotate90">Xoay 90°</option>
          <option value="rotate180" data-i18n="bend_rotate180">Xoay 180°</option>
          <option value="vflip" data-i18n="bend_vflip">Lật dọc</option>
        </select>

        <hr style="margin:6px 0;" />
        <label style="font-weight:600; color:#f472b6;" data-i18n="logo_watermark">Chèn Logo & Watermark</label>

        <div class="logo-upload-container">
          <input type="file" id="logo-file-input" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" />
          <div id="logo-drop-area" class="logo-drop-area" onclick="document.getElementById('logo-file-input').click()">
            <span data-icon="image" style="width:18px; height:18px; color:var(--text-muted);"></span>
            <span id="logo-file-name" style="font-size:12px; color:var(--text-secondary);" data-i18n="logo_select_file">Bấm để chọn tệp Logo (.png, .jpg)...</span>
            <button id="logo-remove-btn" type="button" class="btn-outline hidden" onclick="event.stopPropagation(); removeLogoFile();" style="padding:2px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);" data-i18n="logo_remove">Xóa</button>
          </div>
        </div>

        <div id="logo-options-group" class="hidden" style="display:flex; flex-direction:column; gap:10px; margin-top:4px;">
          <label style="font-size:12px; color:var(--text-secondary);" data-i18n="logo_position">Vị trí Logo (9 vị trí)</label>
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
              <label style="font-size:12px; color:var(--text-secondary);" data-i18n="logo_size">Kích thước Logo</label>
              <span class="slider-val-badge" id="val-logo-size">15%</span>
            </div>
            <input type="range" id="opt-logo-size" class="custom-range-slider" value="15" min="5" max="40" step="1" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label style="font-size:12px; color:var(--text-secondary);" data-i18n="logo_opacity">Độ trong suốt (Opacity)</label>
              <span class="slider-val-badge" id="val-logo-opacity">100%</span>
            </div>
            <input type="range" id="opt-logo-opacity" class="custom-range-slider" value="100" min="10" max="100" step="5" />
          </div>
        </div>

        <hr style="margin:6px 0;" />
        <label data-i18n="voice_label">Giọng nói</label>
        <select id="opt-voice" class="custom-select">
          <option value="none" data-i18n="voice_keep">Giữ nguyên</option>
          <option value="ffmpeg" data-i18n="voice_ffmpeg">FFmpeg (Thay đổi cao độ)</option>
          <option value="elevenlabs">ElevenLabs AI Voice</option>
          <option value="omnivoice">Omni Voice API</option>
          <option value="self-hosted" data-i18n="voice_selfhost">OmniVoice (Tự host)</option>
        </select>
        <div id="voice-ffmpeg-config" class="hidden" style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex; gap:10px;">
            <div style="flex:1;" class="slider-group">
              <div class="slider-header">
                <label style="font-size:11px;color:var(--text-muted);" data-i18n="pitch_label">Cao độ</label>
                <span class="slider-val-badge" id="val-voice-pitch">1.0x</span>
              </div>
              <input type="range" id="voice-pitch" class="custom-range-slider" value="1.0" min="0.5" max="2.0" step="0.05" />
            </div>
            <div style="flex:1;" class="slider-group">
              <div class="slider-header">
                <label style="font-size:11px;color:var(--text-muted);" data-i18n="speed_label">Tốc độ</label>
                <span class="slider-val-badge" id="val-voice-speed">1.0x</span>
              </div>
              <input type="range" id="voice-speed" class="custom-range-slider" value="1.0" min="0.5" max="2.0" step="0.05" />
            </div>
          </div>
        </div>
        <div id="voice-api-config" class="hidden" style="display:flex;flex-direction:column;gap:6px;">
          <select id="voice-speaker" class="custom-select">
            <option value="" data-i18n="voice_loading">Đang tải danh sách giọng nói...</option>
          </select>
          <p style="font-size:11px;color:var(--text-muted);" data-i18n="voice_api_hint">API key được quản lý tập trung trên server. Chọn giọng nói từ thư viện.</p>
        </div>
      </div>
    </div>

    <div class="output-row" style="margin-top:16px;">
      <span class="label" data-i18n="output_folder">Thư mục lưu:</span>
      <span class="path clickable-path" id="output-path" onclick="openOutputFolder()" title="Bấm để mở thư mục trong Finder (macOS) / File Explorer (Windows)" data-i18n="output_default">Mặc định (Downloads/eigu/outputs)</span>
      <button class="change-btn" onclick="selectOutputFolder()" data-i18n="output_change">Thay đổi</button>
    </div>

    <button id="start-btn" class="btn-primary" style="margin-top:16px;" disabled onclick="startWorkflow()"><span data-icon="play" style="margin-right:6px;vertical-align:middle;"></span> <span data-i18n="start_processing">Bắt đầu xử lý</span></button>
    <button id="cancel-btn" class="btn-danger hidden" onclick="cancelWorkflow()"><span data-icon="x" style="margin-right:6px;vertical-align:middle;"></span> <span data-i18n="cancel_process">Hủy tiến trình</span></button>

    <div id="progress-section" class="progress-section hidden" style="margin-top:16px;">
      <div class="progress-header">
        <span id="status-text" data-i18n="status_init">Đang khởi tạo...</span>
        <div style="display:flex;gap:12px;align-items:center;">
          <span id="eta-display" style="color:var(--text-muted);font-size:12px;"></span>
          <span id="progress-percent">0%</span>
        </div>
      </div>
      <div class="progress-track"><div id="progress-fill" class="progress-fill"></div></div>
    </div>

    <details style="margin-top:16px;cursor:pointer;">
      <summary style="color:var(--text-primary);font-weight:600;font-size:14px;" data-i18n="show_logs">Hiển thị chi tiết / Logs</summary>
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
          <button id="mode-copy-btn" class="btn-primary" style="flex:1; padding: 8px; border-radius: 6px; font-weight: 500;" onclick="switchAiVideoMode('copy')" data-i18n="ai_copy_video">Copy Video</button>
          <button id="mode-idea-btn" class="btn-outline" style="flex:1; padding: 8px; border-radius: 6px; font-weight: 500;" onclick="switchAiVideoMode('idea')" data-i18n="ai_from_idea">Tạo từ Ý Tưởng</button>
        </div>

        <!-- Chế độ Copy (Dán link) -->
        <div id="ai-video-copy-section">
          <input type="text" id="ai-copy-url" class="yt-input" placeholder="Dán link TikTok/YouTube/Facebook..." autocomplete="off" data-i18n-placeholder="ai_paste_link_placeholder" />
          <button id="ai-analyze-btn" class="btn-outline" style="width: 100%; margin-top: 8px; padding: 10px; font-weight: 500;" onclick="startAiVideoAnalysis()" data-i18n="ai_analyze_btn">Phân tích Video & Lấy Kịch bản</button>
        </div>

        <!-- Chế độ Ý tưởng (Nhập Text) -->
        <div id="ai-video-idea-section" class="hidden">
          <textarea id="ai-idea-text" placeholder="Nhập ý tưởng của bạn... VD: Một video kể về hành trình thám hiểm vũ trụ, có người ngoài hành tinh..." rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); resize: vertical; margin-bottom: 8px;" data-i18n-placeholder="ai_idea_placeholder"></textarea>
          <button id="ai-generate-script-btn" class="btn-outline" style="width: 100%; padding: 10px; font-weight: 500;" onclick="startAiScriptGeneration()" data-i18n="ai_generate_script">Tạo Kịch bản chi tiết (Prompts)</button>
        </div>

        <!-- Kết quả kịch bản phân cảnh -->
        <div id="ai-script-result" class="hidden" style="margin-top: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); padding: 12px;">
          <h4 style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;" data-i18n="ai_script_result">Kịch bản Phân cảnh (Prompts)</h4>
          <div id="ai-scenes-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
             <!-- Render scene prompts here -->
          </div>
        </div>
        
      </div>

      <div class="settings-card">
        <label data-i18n="ai_video_model">Mô hình tạo Video (Video Model)</label>
        <select id="ai-video-model">
          <option value="veo3">Veo 3 (8s/clip)</option>
          <option value="runway">Runway Gen-3 Alpha</option>
          <option value="luma">Luma Dream Machine</option>
          <option value="kling">Kling AI</option>
        </select>
        
        <label style="margin-top:8px;" data-i18n="ai_scenes_count">Số lượng phân cảnh (Scenes)</label>
        <select id="ai-video-scenes-count">
          <option value="auto" data-i18n="scenes_auto">Tự động (Dựa trên nội dung)</option>
          <option value="3">3 Cảnh (~24s)</option>
          <option value="5">5 Cảnh (~40s)</option>
          <option value="8">8 Cảnh (~1 phút)</option>
        </select>

        <label style="margin-top:8px;" data-i18n="ai_aspect_ratio">Tỉ lệ khung hình (Aspect Ratio)</label>
        <select id="ai-video-ratio">
          <option value="9:16">9:16 (TikTok, Shorts)</option>
          <option value="16:9">16:9 (YouTube)</option>
        </select>
        
        <hr />
        
        <label style="font-weight:600;color:#38bdf8;" data-i18n="ai_audio_voice">Âm thanh & Giọng nói</label>
        <label class="checkbox-row"><input type="checkbox" id="ai-video-keep-audio" checked /><span data-i18n="ai_keep_audio">Giữ lại âm thanh gốc (Chỉ cho chế độ Copy)</span></label>
        
        <div id="ai-video-voice-options" class="hidden">
          <label data-i18n="ai_dubbing">Lồng tiếng (AI Voice)</label>
          <select id="ai-video-voice-engine">
            <option value="elevenlabs">ElevenLabs</option>
            <option value="omnivoice">Omni Voice API</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Action Buttons -->
    <button id="ai-video-start-btn" class="btn-primary" style="margin-top:16px;" onclick="startAiVideoRender()"><span data-icon="zap" style="margin-right:6px;vertical-align:middle;"></span> <span data-i18n="ai_start_render">Bắt đầu Render Hàng loạt</span></button>
    
    <!-- Progress Bar -->
    <div id="ai-video-progress-section" class="progress-section hidden" style="margin-top:16px;">
      <div class="progress-header">
        <span id="ai-video-status-text" data-i18n="status_preparing">Đang chuẩn bị...</span>
        <div style="display:flex;gap:12px;align-items:center;">
          <span id="ai-video-eta" style="color:var(--text-muted);font-size:12px;"></span>
          <span id="ai-video-progress-percent">0%</span>
        </div>
      </div>
      <div class="progress-track"><div id="ai-video-progress-fill" class="progress-fill"></div></div>
    </div>
    
    <!-- Preview Section -->
    <div id="ai-video-preview-section" class="hidden" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <h3 style="color: var(--text-primary); margin-bottom: 12px; font-size: 15px; display: flex; align-items: center;"><span data-icon="playCircle" style="margin-right: 6px;"></span> <span data-i18n="ai_preview_title">Preview Video Thành Phẩm</span></h3>
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; text-align: center;">
        <video id="ai-video-player" controls style="max-width: 100%; max-height: 400px; border-radius: 6px; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></video>
        <div style="margin-top: 12px; display: flex; justify-content: center; gap: 8px;">
           <button class="btn-primary" onclick="openOutputFolder()"><span data-icon="folder" style="margin-right:4px;vertical-align:middle;"></span> <span data-i18n="open_output_folder">Mở thư mục chứa File</span></button>
        </div>
      </div>
    </div>
    
  </div>
</div>
<div id="view-hot-niche" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="trendingUp" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="sub_hot_niche">Tìm ngách hot</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-bulk-download" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="downloadCloud" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="sub_bulk_download">Tải video hàng loạt</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-reup" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="refreshCw" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="sub_reup">Tạo video Reup</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-workflow" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="refreshCw" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="sub_workflow">Tạo workflow</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>
<div id="view-record" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="mic" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="sub_record">Ghi thao tác</h3><p style="color:var(--text-muted);" data-i18n="feature_developing">Tính năng đang phát triển</p></div>
  </div>
</div>
<!-- Social Account Views -->
<div id="view-tk-tiktok" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="tiktok" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#ff0050;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_tiktok_title">TikTok Accounts</h3><p style="color:var(--text-muted);" data-i18n="tiktok_desc">Quản lý tài khoản TikTok — thêm, xóa, theo dõi trạng thái</p></div>
  </div>
</div>
<div id="view-tk-facebook" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="facebook" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#1877F2;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_facebook_title">Facebook Accounts</h3><p style="color:var(--text-muted);" data-i18n="facebook_desc">Quản lý tài khoản Facebook & Fanpage</p></div>
  </div>
</div>
<div id="view-tk-youtube" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="youtube" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#FF0000;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_youtube_title">YouTube Channels</h3><p style="color:var(--text-muted);" data-i18n="youtube_desc">Quản lý kênh YouTube & đăng tải tự động</p></div>
  </div>
</div>
<div id="view-tk-x" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="twitter" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_x_title">X (Twitter) Accounts</h3><p style="color:var(--text-muted);" data-i18n="x_desc">Quản lý tài khoản X & đăng Tweet tự động</p></div>
  </div>
</div>
<div id="view-tk-instagram" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="instagram" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;color:#E4405F;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_instagram_title">Instagram Accounts</h3><p style="color:var(--text-muted);" data-i18n="instagram_desc">Quản lý tài khoản Instagram & đăng bài tự động</p></div>
  </div>
</div>
<div id="view-tk-threads" class="view">
  <div style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;">
    <div><span data-icon="threads" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></span><h3 style="color:var(--text-primary);margin-bottom:8px;" data-i18n="social_threads_title">Threads Accounts</h3><p style="color:var(--text-muted);" data-i18n="threads_desc">Quản lý tài khoản Threads</p></div>
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
      <h3 style="color: #ef4444; margin:0; display:inline-flex; align-items:center; gap:6px;" data-i18n="telemetry_title"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3 3 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg> <span data-i18n="telemetry_title_text">Theo D\u00f5i Bug, Stack Trace & Performance Dashboard</span></h3>
      <button class="btn-outline" onclick="if(window.EIGU_TELEMETRY) window.EIGU_TELEMETRY.clearLogs();" style="padding:4px 12px; font-size:12px; border-color:#ef4444; color:#ef4444; border-radius: 6px;" data-i18n="telemetry_clear_btn">X\u00f3a Logs</button>
    </div>
    <p class="settings-hint" data-i18n="telemetry_desc">T\u1ef1 \u0111\u1ed9ng ghi nh\u1eadn 100% Stack Trace, M\u00e3 l\u1ed7i HTTP, Session Replay Action Trail v\u00e0 \u0111\u1ed9 tr\u1ec5 m\u1ea1ng theo th\u1eddi gian th\u1ef1c.</p>
    
    <div id="telemetry-logs-list" style="margin-top: 14px; max-height: 320px; overflow-y: auto;">
      <div style="text-align:center; padding: 20px; color: var(--text-muted);" data-i18n="telemetry_empty">Ch\u01b0a ghi nh\u1eadn l\u1ed7i h\u1ec7 th\u1ed1ng n\u00e0o.</div>
    </div>
  </div>

  <div id="secure-api-settings-section" class="settings-card-section" style="margin-top:20px; display: none;">
    <h3 style="margin-bottom:8px;" data-i18n="api_keys_title">Bể chứa API Keys (Tự động xoay vòng)</h3>
    <p class="settings-hint" data-i18n="api_keys_hint">Các key sẽ được mã hóa an toàn bằng chip bảo mật của máy tính (Keychain/DPAPI) trước khi lưu xuống ổ đĩa, đảm bảo 100% không bị rò rỉ.</p>
    
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

      <!-- Thanh Tìm Kiếm & Bộ Lọc Messenger (Ảnh 2) -->
      <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); background: var(--bg-primary); flex-shrink: 0; display: flex; flex-direction: column; gap: 8px;">
        <div style="position: relative; display: flex; align-items: center;">
          <span style="position: absolute; left: 10px; color: var(--text-muted); display: inline-flex; pointer-events: none;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="staff-chat-search-input" placeholder="Tìm kiếm đoạn chat / email..." style="width: 100%; padding: 6px 10px 6px 30px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 12px; outline: none;" oninput="onStaffChatSearchInput(this.value)" data-i18n-placeholder="chat_sidebar_search_placeholder" />
        </div>

        <!-- Bộ Lọc Nút Pill (Tất cả, Cần hỗ trợ, Đang hỗ trợ, Đã xong) -->
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

      <!-- Bộ lọc Pill theo Role (Không dùng Emoji) -->
      <div id="activity-logs-role-pills" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;">
        <button type="button" class="chat-filter-pill active" onclick="setActivityLogsRoleFilter('all', this)">Tất cả Vai trò</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('admin', this)">Admin</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('staff', this)">Staff</button>
        <button type="button" class="chat-filter-pill" onclick="setActivityLogsRoleFilter('user', this)">User</button>
      </div>
    </div>

    <!-- Bảng hiển thị Dữ liệu Audit Log Thực (Khung Cuộn Co Giãn Mượt Ma Khi Phóng To Thu Nhỏ) -->
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
<!-- Pricing Management View (Quản lý Bảng giá dành riêng cho Admin) -->
<div id="view-pricing-management" class="view" style="width: 100%; box-sizing: border-box;">
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; width: 100%; box-sizing: border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h3 style="margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <span data-icon="tag" style="color:var(--accent);"></span> Quản lý Bảng giá (Dynamic Pricing Console)
        </h3>
        <p class="settings-hint">Cấu hình mô-đun, các gói dịch vụ, điều chỉnh giá bán và discount real-time đồng bộ trực tiếp lên Website.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn-primary" onclick="loadAdminPricingData()" style="padding: 8px 16px; border-radius:8px; font-size:13px;"><span data-icon="refreshCw"></span> Tải lại</button>
      </div>
    </div>

    {/* Dynamic Admin Pricing Container */}
    <div id="admin-pricing-container">
      <div style="text-align:center; padding:30px; color:var(--text-muted);">Đang tải dữ liệu Bảng giá từ Supabase Database...</div>
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
