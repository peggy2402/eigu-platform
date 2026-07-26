const VideoToolsViews = `
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

        <!-- Chế độ cắt Video -->
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
          <button id="mode-image-btn" class="btn-outline" style="flex:1; padding: 8px; border-radius: 6px; font-weight: 500;" onclick="switchAiVideoMode('image')" data-i18n="ai_from_image">Tạo từ Hình Ảnh</button>
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

        <!-- Chế độ Hình ảnh (Image-to-Video) -->
        <div id="ai-video-image-section" class="hidden">
          <div id="ai-image-dropzone" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: var(--bg-card); cursor: pointer; transition: border-color 0.2s;" onclick="document.getElementById('ai-image-file-input').click()">
            <span data-icon="image" style="font-size: 24px; opacity: 0.7; display: block; margin-bottom: 4px;"></span>
            <span style="font-size: 13px; color: var(--text-secondary);" data-i18n="ai_image_upload_prompt">Kéo thả hoặc nhấp để chọn hình ảnh nguồn (PNG, JPG)</span>
            <input type="file" id="ai-image-file-input" accept="image/*" multiple style="display:none;" onchange="handleAiImageSelect(event)" />
          </div>
          <div id="ai-image-preview-list" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;"></div>
          <button id="ai-image-analyze-btn" class="btn-outline" style="width: 100%; margin-top: 10px; padding: 10px; font-weight: 500;" onclick="startAiImageScriptGeneration()" data-i18n="ai_generate_image_script">Phân tích Ảnh & Sinh Kịch bản</button>
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

<!-- AI Video Studio (.eigu Workspace) -->
<div id="view-ai-studio" class="view">
  <div id="studio-root"></div>
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
`;
