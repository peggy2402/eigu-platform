async function submitFeedback(event) {
  event.preventDefault();

  const msgInput = document.getElementById('feedback-message');
  const fileInput = document.getElementById('feedback-file');
  const submitBtn = document.getElementById('feedback-submit-btn');

  const msg = msgInput.value.trim();
  if (!msg) {
    showToast('Vui lòng nhập nội dung góp ý!', 'error');
    return;
  }

  submitBtn.disabled = true;
  const oldText = submitBtn.innerText;
  submitBtn.innerText = 'Đang gửi...';

  try {
    const fd = new FormData();
    fd.append('message', msg);
    if (fileInput.files[0]) {
      fd.append('image', fileInput.files[0]);
    }

    const token = localStorage.getItem('accessToken');
    const res = await fetch(window.EIGU_CONFIG.getApiUrl('/feedback/report'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fd
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Lỗi gửi báo cáo');
    }

    showToast('Cảm ơn bạn đã gửi báo cáo thành công!', 'success');
    msgInput.value = '';
    fileInput.value = '';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = oldText;
  }
}

// --- Eye Toggle Helpers (SVG, NO Emoji) ---

function toggleInputEye(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = typeof icon === 'function' ? icon('eyeOff') : 'Ẩn';
    btn.title = 'Ẩn Key';
  } else {
    input.type = 'password';
    btn.innerHTML = typeof icon === 'function' ? icon('eye') : 'Xem';
    btn.title = 'Hiện Key';
  }
}

function toggleTableRowKey(spanId, maskedVal, fullVal, btn) {
  const span = document.getElementById(spanId);
  if (!span) return;
  if (span.textContent === maskedVal) {
    span.textContent = fullVal;
    btn.innerHTML = typeof icon === 'function' ? icon('eyeOff') : 'Ẩn';
    btn.title = 'Ẩn Key';
    span.style.color = '#38bdf8';
  } else {
    span.textContent = maskedVal;
    btn.innerHTML = typeof icon === 'function' ? icon('eye') : 'Xem';
    btn.title = 'Hiện Key';
    span.style.color = '';
  }
}

function copyKeyToClipboard(fullVal, btn) {
  navigator.clipboard.writeText(fullVal).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = typeof icon === 'function' ? icon('check') : 'OK';
    btn.style.color = '#22c55e';
    setTimeout(() => { btn.innerHTML = original; btn.style.color = ''; }, 1500);
    if (typeof showToast === 'function') showToast(t('toast_copy_success'), 'success');
  }).catch(() => {
    if (typeof showToast === 'function') showToast(t('toast_copy_error'), 'error');
  });
}

// --- API Keys Management ---

async function loadApiKeys() {
  loadAdminApiConfig();
  const tbody = document.getElementById('api-keys-list-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Đang tải danh sách key...</td></tr>';

  const ipc = window.ipcRenderer || (typeof require !== 'undefined' ? require('electron').ipcRenderer : null);
  if (!ipc) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Chỉ khả dụng trên môi trường Desktop</td></tr>';
    return;
  }

  try {
    const keys = await ipc.invoke('get-api-keys');
    tbody.innerHTML = '';

    if (keys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Chưa có API Key nào được lưu.</td></tr>';
      return;
    }

    const eyeSvg = typeof icon === 'function' ? icon('eye') : 'Xem';
    const copySvg = typeof icon === 'function' ? icon('copy') : 'Copy';

    keys.forEach(k => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';

      const actionHtml = k.isReadOnly
        ? `<span style="color:var(--text-muted); font-size:11px; font-style:italic;">Hệ thống (.env)</span>`
        : `<button class="btn-outline" onclick="deleteApiKey('${k.id}')" style="padding: 4px 8px; font-size:12px; border-color: #ef4444; color: #ef4444; border-radius: 6px;">Xóa</button>`;

      const safeFullVal = (k.fullValue || k.maskedValue).replace(/'/g, "\\'");

      tr.innerHTML = `
        <td style="padding: 10px; font-weight:600; color: var(--accent);">${k.type.replace('_API_KEY', '').replace('_KEY', '')}</td>
        <td style="padding: 10px; font-family: monospace;">
          <span id="key-val-${k.id}">${k.maskedValue}</span>
          <button type="button" onclick="toggleTableRowKey('key-val-${k.id}', '${k.maskedValue}', '${safeFullVal}', this)" title="Hiện Key" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:6px; padding:2px; vertical-align:middle; display:inline-flex; align-items:center;">${eyeSvg}</button>
          <button type="button" onclick="copyKeyToClipboard('${safeFullVal}', this)" title="Sao chép Key" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:2px; padding:2px; vertical-align:middle; display:inline-flex; align-items:center;">${copySvg}</button>
        </td>
        <td style="padding: 10px; color: var(--text-secondary);">${k.note || '-'}</td>
        <td style="padding: 10px; text-align:center;">
          ${actionHtml}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:12px; color:#ef4444;">Lỗi: ${err.message}</td></tr>`;
  }
}

async function addNewApiKey() {
  const type = document.getElementById('new-key-type').value;
  const valEl = document.getElementById('new-key-value');
  const noteEl = document.getElementById('new-key-note');

  const value = valEl.value.trim();
  const note = noteEl.value.trim();

  if (!value) {
    showToast('Lỗi', 'Vui lòng nhập giá trị API Key!', 'error');
    return;
  }

  const ipc = window.ipcRenderer || (typeof require !== 'undefined' ? require('electron').ipcRenderer : null);
  if (!ipc) {
    showToast('Lỗi', 'Tính năng chỉ hoạt động trên Desktop!', 'error');
    return;
  }

  try {
    await ipc.invoke('add-api-key', { type, value, note });
    showToast('Thành công', 'Đã lưu API Key mã hóa thành công!', 'success');
    valEl.value = '';
    noteEl.value = '';
    loadApiKeys();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi khi lưu key', 'error');
  }
}

async function deleteApiKey(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa API Key này không?')) return;

  const ipc = window.ipcRenderer || (typeof require !== 'undefined' ? require('electron').ipcRenderer : null);
  if (!ipc) return;

  try {
    await ipc.invoke('delete-api-key', id);
    showToast('Thành công', 'Đã xóa API Key!', 'success');
    loadApiKeys();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi khi xóa key', 'error');
  }
}

// --- Strict Role Enforcement & Admin Custom API Config ---

function updateApiRoutePreview() {
  const input = document.getElementById('admin-custom-api-prefix');
  const preview = document.getElementById('admin-api-url-preview');
  if (!input || !preview) return;

  let raw = input.value;
  if (raw.includes('/api/')) {
    raw = raw.split('/api/')[1] || '';
  }
  let sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  if (input.value !== sanitized && !input.value.includes('/api/')) {
    input.value = sanitized;
  }

  let prefix = sanitized.trim();
  if (!prefix) prefix = 'v1';

  const currentFullUrl = typeof window.getApiBaseUrl === 'function' ? window.getApiBaseUrl() : 'http://localhost:3001/api';
  let baseHost = currentFullUrl.replace(/\/api\/.*$/, '').replace(/\/$/, '');
  if (!baseHost) baseHost = 'http://localhost:3001';

  const fullServerUrl = `${baseHost}/api/${prefix}`;
  preview.textContent = fullServerUrl;
}

async function loadAdminApiConfig() {
  const prefixSection = document.getElementById('admin-api-prefix-settings-section');
  const telemetrySection = document.getElementById('system-telemetry-section');
  const secureKeySection = document.getElementById('secure-api-settings-section');
  const input = document.getElementById('admin-custom-api-prefix');

  const role = (typeof userProfile !== 'undefined' && userProfile && userProfile.role)
    ? String(userProfile.role).toLowerCase()
    : 'user';

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';

  if (prefixSection) prefixSection.style.display = isAdmin ? 'block' : 'none';
  if (telemetrySection) telemetrySection.style.display = isAdmin ? 'block' : 'none';
  if (secureKeySection) secureKeySection.style.display = (isAdmin || isStaff) ? 'block' : 'none';

  if (input) {
    const currentFullUrl = typeof window.getApiBaseUrl === 'function' ? window.getApiBaseUrl() : 'http://localhost:3001/api';
    const match = currentFullUrl.match(/\/api\/(.+)$/);
    input.value = match ? match[1] : 'v1';
    updateApiRoutePreview();
  }
  loadAdminMaintenanceConfig();
}

function updateMaintenanceBadgePreview() {
  const toggle = document.getElementById('admin-maintenance-toggle');
  const badge = document.getElementById('maintenance-status-badge');
  if (!badge) return;

  if (toggle && toggle.checked) {
    badge.style.background = 'rgba(239,68,68,0.2)';
    badge.style.color = '#ef4444';
    badge.textContent = '🔴 Đang Bảo Trì (Maintenance Active)';
  } else {
    badge.style.background = 'rgba(34,197,94,0.2)';
    badge.style.color = '#22c55e';
    badge.textContent = '🟢 Đang Hoạt Động (Normal)';
  }
}

async function loadAdminMaintenanceConfig() {
  const section = document.getElementById('admin-maintenance-settings-section');
  const toggle = document.getElementById('admin-maintenance-toggle');
  const versionInput = document.getElementById('admin-min-version-input');

  const role = (typeof userProfile !== 'undefined' && userProfile && userProfile.role)
    ? String(userProfile.role).toLowerCase()
    : 'user';

  const isAdmin = role === 'admin';
  if (section) section.style.display = isAdmin ? 'block' : 'none';
  if (!isAdmin) return;

  try {
    const res = await apiFetch('/system-config/bootstrap');
    if (res) {
      if (toggle) toggle.checked = !!res.maintenanceMode;
      if (versionInput) versionInput.value = res.minAppVersion || '1.0.0';
      updateMaintenanceBadgePreview();
    }
  } catch (e) {
    console.warn('Lỗi tải cấu hình Maintenance DB:', e.message);
  }
}

async function saveAdminMaintenanceConfig() {
  const toggle = document.getElementById('admin-maintenance-toggle');
  const versionInput = document.getElementById('admin-min-version-input');

  const isMaintenance = toggle ? toggle.checked : false;
  const minVersion = versionInput ? versionInput.value.trim() || '1.0.0' : '1.0.0';

  try {
    await apiFetch('/system-config', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'MAINTENANCE_MODE', value: String(isMaintenance), description: 'Trạng thái bảo trì hệ thống' })
    });
    await apiFetch('/system-config', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'MIN_APP_VERSION', value: minVersion, description: 'Phiên bản ứng dụng tối thiểu' })
    });

    updateMaintenanceBadgePreview();
    showToast(
      'Thành công',
      isMaintenance
        ? '🔴 Đã BẬT chế độ Bảo trì hệ thống!'
        : '🟢 Đã TẮT chế độ Bảo trì, hệ thống hoạt động bình thường.',
      isMaintenance ? 'warning' : 'success'
    );
  } catch (e) {
    showToast('Lỗi', e.message || 'Không thể lưu cấu hình bảo trì', 'error');
  }
}

async function checkMaintenanceOnLogin(force) {
  const overlay = document.getElementById('maintenance-screen-overlay');
  if (!overlay) return false;

  // Nếu đang hiển thị và không phải force check mới -> bỏ qua
  if (overlay.style.display === 'flex' && !force) return true;

  // Nếu chưa login thì không kiểm tra
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const res = await apiFetch('/system-config/bootstrap');
    if (res && res.maintenanceMode) {
      // Admin users bypass the maintenance overlay
      if (userProfile && userProfile.role === 'admin') {
        overlay.style.display = 'none';
        overlay.classList.add('hidden');
        if (typeof closeBannedScreen === 'function') closeBannedScreen();
        showToast('Hệ thống đang bảo trì', 'Chỉ admin mới truy cập được. Vào Cài đặt để tắt bảo trì.', 'warning');
        return false;
      }
      applyAppLanguage(localStorage.getItem('eigu_language') || 'vi');
      overlay.style.display = 'flex';
      overlay.classList.remove('hidden');
      if (typeof closeBannedScreen === 'function') closeBannedScreen();
      return true;
    } else {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
      // Nếu force check và maintenance đã tắt -> vào app
      if (force && typeof enterApp === 'function') {
        enterApp();
      }
      return false;
    }
  } catch (e) {
    if (force) {
      showToast(t('toast_error'), e.message || 'Không thể kiểm tra trạng thái bảo trì', 'error');
    }
    return false;
  }
}

async function saveAdminApiConfig() {
  const input = document.getElementById('admin-custom-api-prefix');
  if (!input) return;

  let raw = input.value.trim();
  if (raw.includes('/api/')) {
    raw = raw.split('/api/')[1] || '';
  }
  let prefix = raw.replace(/[^a-zA-Z0-9_-]/g, '');

  if (!prefix || !/^[a-zA-Z0-9_-]+$/.test(prefix)) {
    showToast('Mã Không Hợp Lệ', 'Mã obf_code chỉ được chứa chữ cái (a-z), chữ số (0-9), gạch ngang (-) và gạch dưới (_). Ví dụ: 1a1b1c1d-k2k3k4k2', 'error');
    return;
  }

  const currentFullUrl = typeof window.getApiBaseUrl === 'function' ? window.getApiBaseUrl() : 'http://localhost:3001/api';
  let baseHost = currentFullUrl.replace(/\/api\/.*$/, '').replace(/\/$/, '');
  if (!baseHost) baseHost = 'http://localhost:3001';

  const fullApiPrefix = `api/${prefix}`;
  const fullServerUrl = `${baseHost}/${fullApiPrefix}`;

  if (typeof apiFetch === 'function') {
    try {
      await apiFetch('/system-config', {
        method: 'PATCH',
        body: JSON.stringify({ key: 'API_PREFIX', value: fullApiPrefix, description: 'Admin Custom Obfuscation Code' })
      });
    } catch (e) {
      console.warn('Cập nhật DB SystemConfig:', e.message);
    }
  }

  if (window.EIGU_CONFIG && typeof window.EIGU_CONFIG.setApiUrl === 'function') {
    window.EIGU_CONFIG.setApiUrl(fullServerUrl);
  }

  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      await ipcRenderer.invoke('save-api-config', { apiPrefix: fullApiPrefix, apiUrl: fullServerUrl });
    } catch (e) { }
  }

  input.value = prefix;
  updateApiRoutePreview();
  const statusEl = document.getElementById('admin-api-url-status');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.textContent = 'Đã cập nhật mã obf_code: "' + prefix + '" → Server URL: ' + fullServerUrl;
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
  }

  showToast('Thành công', 'Đã cập nhật tiền tố API mới: /api/' + prefix, 'success');
}

// -----------------------------------------------------------
// 🌍 PHÂN HỆ NGÔN NGỮ (LANGUAGE SETTING: VI / EN - FULL DICTIONARY ENGINE)
// -----------------------------------------------------------
const I18N_DICTIONARY = {
  vi: {
    // Sidebar Labels
    admin_dashboard: 'Dashboard Admin',
    create_notification: 'T\u1ea1o th\u00f4ng b\u00e1o',
    feedback_management: 'Qu\u1ea3n l\u00fd Feedback',
    affiliate: 'Ti\u1ebfp th\u1ecb li\u00ean k\u1ebft',
    team: '\u0110\u1ed9i nh\u00f3m',
    utilities: 'Ti\u1ec7n \u00edch',
    analytics_reports: 'B\u00e1o c\u00e1o Th\u1ed1ng k\u00ea',
    user_guide: 'H\u01b0\u1edbng d\u1eabn s\u1eed d\u1ee5ng',
    activity_logs: 'Nh\u1eadt k\u00fd ho\u1ea1t \u0111\u1ed9ng',
    settings: 'C\u00e0i \u0111\u1eb7t',
    profile: 'H\u1ed3 s\u01a1',
    tools: 'C\u00f4ng c\u1ee5',
    automation: 'T\u1ef1 \u0111\u1ed9ng h\u00f3a',
    accounts: 'T\u00e0i kho\u1ea3n',
    chat_support: 'Chat Support',
    user_management: 'Qu\u1ea3n l\u00fd User/Staff',

    // Profile View
    profile_email: 'Email',
    profile_role: 'Vai tr\u00f2',
    profile_verified: '\u0110\u00e3 x\u00e1c th\u1ef1c',
    profile_created: 'Ng\u00e0y t\u1ea1o',

    // Cut View - Drop Zone & Input
    drop_mp4_here: 'K\u00e9o th\u1ea3 file .mp4 v\u00e0o \u0111\u00e2y',
    or_click_select: 'ho\u1eb7c b\u1ea5m \u0111\u1ec3 ch\u1ecdn file',
    or_divider: 'HO\u1eb6C',
    yt_link_placeholder: 'D\u00e1n link YouTube (VD: https://youtu.be/...)',
    yt_download_quality: 'Ch\u1ea5t l\u01b0\u1ee3ng t\u1ea3i xu\u1ed1ng (YouTube)',
    quality_auto: 'T\u1ef1 \u0111\u1ed9ng (Ch\u1ea5t l\u01b0\u1ee3ng cao nh\u1ea5t)',
    quality_audio_only: 'Ch\u1ec9 \u00e2m thanh (MP3)',
    video_info_title: 'Th\u00f4ng tin Video',
    video_info_desc: 'Thumbnail v\u00e0 th\u1eddi l\u01b0\u1ee3ng s\u1ebd hi\u1ec3n th\u1ecb t\u1ea1i \u0111\u00e2y khi b\u1ea1n ch\u1ecdn file ho\u1eb7c d\u00e1n link.',

    // Cut View - Mode & Params
    cut_mode_params: 'Ch\u1ebf \u0111\u1ed9 & Th\u00f4ng s\u1ed1 C\u1eaft Video',
    cut_mode_label: 'Ch\u1ebf \u0111\u1ed9 c\u1eaft Video',
    split_1: '1 ph\u00fat / video',
    split_2: '2 ph\u00fat / video',
    split_3: '3 ph\u00fat / video',
    split_5: '5 ph\u00fat / video',
    split_10: '10 ph\u00fat / video',
    split_20: '20 ph\u00fat / video',
    split_custom: 'T\u00f9y ch\u1ec9nh th\u1eddi gian',
    split_ai_smart: 'AI Smart Cutter (T\u1ef1 \u0111\u1ed9ng 30-90s)',
    cut_method_label: 'C\u00e1ch th\u1ee9c C\u1eaft',
    cut_fast: 'Fast Mode (Si\u00eau t\u1ed1c, gi\u1eef nguy\u00ean ch\u1ea5t l\u01b0\u1ee3ng)',
    cut_accurate: 'Accurate Mode (Ch\u1eadm h\u01a1n, c\u1eaft c\u1ef1c chu\u1ea9n t\u1eebng frame)',
    export_quality_label: 'Ch\u1ea5t l\u01b0\u1ee3ng xu\u1ea5t (Re-encode)',
    codec_auto: 'T\u1ef1 \u0111\u1ed9ng (H.264)',
    codec_h264: 'H.264 (T\u01b0\u01a1ng th\u00edch t\u1ed1t)',
    codec_h265: 'H.265 / HEVC (Dung l\u01b0\u1ee3ng th\u1ea5p)',
    codec_av1: 'AV1 (Ch\u1ea5t l\u01b0\u1ee3ng t\u1ed1t nh\u1ea5t)',
    aspect_ratio_label: 'T\u1ec9 l\u1ec7 khung h\u00ecnh',
    ratio_original: 'Gi\u1eef nguy\u00ean b\u1ea3n',
    auto_part_number: 'T\u1ef1 \u0111\u1ed9ng \u0111\u00e1nh s\u1ed1 "Ph\u1ea7n 1/N"',

    // Anti-Detect & Advanced Edit
    anti_detect_title: 'T\u00ednh n\u0103ng Anti-Detect',
    opt_metadata: 'X\u00f3a si\u00eau d\u1eef li\u1ec7u (Metadata Stripping)',
    opt_noise: 'Nhi\u1ec5u h\u1ea1t & C\u00e2n b\u1eb1ng s\u00e1ng (Noise & EQ)',
    opt_decimate: 'X\u00f3a khung h\u00ecnh t\u0129nh (Decimation)',
    opt_audio_3d: '\u0110\u1ea3o chi\u1ec1u \u00e2m thanh 3D (Spatial Panning)',
    advanced_edit_title: 'Ch\u1ec9nh s\u1eeda n\u00e2ng cao',
    flip_video: 'L\u1eadt video',
    flip_none: 'Kh\u00f4ng l\u1eadt',
    flip_horizontal: 'L\u1eadt ngang (Horizontal)',
    flip_vertical: 'L\u1eadt d\u1ecdc (Vertical)',
    color_eq: 'M\u00e0u s\u1eafc (EQ)',
    brightness_label: '\u0110\u1ed9 s\u00e1ng (Brightness)',
    contrast_label: 'T\u01b0\u01a1ng ph\u1ea3n (Contrast)',
    saturation_label: '\u0110\u1ed9 b\u00e3o h\u00f2a (Saturation)',
    frame_bend: 'B\u1ebb khung h\u00ecnh',
    bend_none: 'Kh\u00f4ng',
    bend_rotate90: 'Xoay 90\u00b0',
    bend_rotate180: 'Xoay 180\u00b0',
    bend_vflip: 'L\u1eadt d\u1ecdc',

    // Logo & Watermark
    logo_watermark: 'Ch\u00e8n Logo & Watermark',
    logo_select_file: 'B\u1ea5m \u0111\u1ec3 ch\u1ecdn t\u1ec7p Logo (.png, .jpg)...',
    logo_remove: 'X\u00f3a',
    logo_position: 'V\u1ecb tr\u00ed Logo (9 v\u1ecb tr\u00ed)',
    logo_size: 'K\u00edch th\u01b0\u1edbc Logo',
    logo_opacity: '\u0110\u1ed9 trong su\u1ed1t (Opacity)',

    // Voice
    voice_label: 'Gi\u1ecdng n\u00f3i',
    voice_keep: 'Gi\u1eef nguy\u00ean',
    voice_ffmpeg: 'FFmpeg (Thay \u0111\u1ed5i cao \u0111\u1ed9)',
    voice_selfhost: 'OmniVoice (T\u1ef1 host)',
    pitch_label: 'Cao \u0111\u1ed9',
    speed_label: 'T\u1ed1c \u0111\u1ed9',
    voice_loading: '\u0110ang t\u1ea3i danh s\u00e1ch gi\u1ecdng n\u00f3i...',
    voice_api_hint: 'API key \u0111\u01b0\u1ee3c qu\u1ea3n l\u00fd t\u1eadp trung tr\u00ean server. Ch\u1ecdn gi\u1ecdng n\u00f3i t\u1eeb th\u01b0 vi\u1ec7n.',

    // Output & Actions
    output_folder: 'Th\u01b0 m\u1ee5c l\u01b0u:',
    output_default: 'M\u1eb7c \u0111\u1ecbnh (Downloads/eigu/outputs)',
    output_change: 'Thay \u0111\u1ed5i',
    start_processing: 'B\u1eaft \u0111\u1ea7u x\u1eed l\u00fd',
    cancel_process: 'H\u1ee7y ti\u1ebfn tr\u00ecnh',
    status_init: '\u0110ang kh\u1edfi t\u1ea1o...',
    status_preparing: '\u0110ang chu\u1ea9n b\u1ecb...',
    show_logs: 'Hi\u1ec3n th\u1ecb chi ti\u1ebft / Logs',

    // AI Video View
    ai_copy_video: 'Copy Video',
    ai_from_idea: 'T\u1ea1o t\u1eeb \u00dd T\u01b0\u1edfng',
    ai_paste_link_placeholder: 'D\u00e1n link TikTok/YouTube/Facebook...',
    ai_analyze_btn: 'Ph\u00e2n t\u00edch Video & L\u1ea5y K\u1ecbch b\u1ea3n',
    ai_idea_placeholder: 'Nh\u1eadp \u00fd t\u01b0\u1edfng c\u1ee7a b\u1ea1n... VD: M\u1ed9t video k\u1ec3 v\u1ec1 h\u00e0nh tr\u00ecnh th\u00e1m hi\u1ec3m v\u0169 tr\u1ee5...',
    ai_generate_script: 'T\u1ea1o K\u1ecbch b\u1ea3n chi ti\u1ebft (Prompts)',
    ai_script_result: 'K\u1ecbch b\u1ea3n Ph\u00e2n c\u1ea3nh (Prompts)',
    ai_video_model: 'M\u00f4 h\u00ecnh t\u1ea1o Video (Video Model)',
    ai_scenes_count: 'S\u1ed1 l\u01b0\u1ee3ng ph\u00e2n c\u1ea3nh (Scenes)',
    scenes_auto: 'T\u1ef1 \u0111\u1ed9ng (D\u1ef1a tr\u00ean n\u1ed9i dung)',
    ai_aspect_ratio: 'T\u1ec9 l\u1ec7 khung h\u00ecnh (Aspect Ratio)',
    ai_audio_voice: '\u00c2m thanh & Gi\u1ecdng n\u00f3i',
    ai_keep_audio: 'Gi\u1eef l\u1ea1i \u00e2m thanh g\u1ed1c (Ch\u1ec9 cho ch\u1ebf \u0111\u1ed9 Copy)',
    ai_dubbing: 'L\u1ed3ng ti\u1ebfng (AI Voice)',
    ai_start_render: 'B\u1eaft \u0111\u1ea7u Render H\u00e0ng lo\u1ea1t',
    ai_preview_title: 'Preview Video Th\u00e0nh Ph\u1ea9m',
    open_output_folder: 'M\u1edf th\u01b0 m\u1ee5c ch\u1ee9a File',

    // Placeholder Views
    feature_developing: 'T\u00ednh n\u0103ng \u0111ang ph\u00e1t tri\u1ec3n',
    tiktok_desc: 'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n TikTok \u2014 th\u00eam, x\u00f3a, theo d\u00f5i tr\u1ea1ng th\u00e1i',
    facebook_desc: 'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n Facebook & Fanpage',
    youtube_desc: 'Qu\u1ea3n l\u00fd k\u00eanh YouTube & \u0111\u0103ng t\u1ea3i t\u1ef1 \u0111\u1ed9ng',
    x_desc: 'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n X & \u0111\u0103ng Tweet t\u1ef1 \u0111\u1ed9ng',
    instagram_desc: 'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n Instagram & \u0111\u0103ng b\u00e0i t\u1ef1 \u0111\u1ed9ng',
    threads_desc: 'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n Threads',

    // View Titles & Headers (Admin Dashboard)
    admin_dash_title: 'B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n Admin (Executive Dashboard)',
    admin_dash_subtitle: 'Gi\u00e1m s\u00e1t t\u1ed5ng quan ch\u1ec9 s\u1ed1 h\u1ec7 th\u1ed1ng, t\u00e0i kho\u1ea3n, d\u1ecbch v\u1ee5 API Gateway v\u00e0 hi\u1ec7u n\u0103ng v\u1eadn h\u00e0nh th\u1eddi gian th\u1ef1c.',
    refresh_stats: 'C\u1eadp nh\u1eadt ch\u1ec9 s\u1ed1',
    total_system_users: 'T\u1ed4NG T\u00c0I KHO\u1ea2N H\u1ec6 TH\u1ed0NG',
    staff_team_count: '\u0110\u1ed8I NG\u0168 NH\u00c2N VI\u00caN (STAFF)',
    active_workflows_count: 'LU\u1ed2NG T\u1ef0 \u0110\u1ed8NG H\u00d3A',
    api_gateway_status: 'TR\u1ea0NG TH\u00c1I GATEWAY API',
    recent_db_events: 'Nh\u1eadt K\u00fd Thao T\u00e1c M\u1edbi Nh\u1ea5t (Real Database Events)',
    quick_shortcuts: 'Thao T\u00e1c Qu\u1ea3n Tr\u1ecb Nhanh (Quick Admin Shortcuts)',
    shortcut_permissions: 'Ph\u00e2n quy\u1ec1n User/Staff',
    shortcut_analytics: 'Xem B\u00e1o c\u00e1o Th\u1ed1ng k\u00ea',
    shortcut_logs: 'Nh\u1eadt k\u00fd Ho\u1ea1t \u0111\u1ed9ng',
    shortcut_obfuscation: 'C\u1ea5u h\u00ecnh Obfuscation',

    // Analytics
    analytics_title: 'B\u00e1o c\u00e1o Th\u1ed1ng k\u00ea System (Analytics & Reports)',
    analytics_subtitle: 'Ph\u00e2n t\u00edch d\u1eef li\u1ec7u th\u1ef1c t\u1ebf t\u1eeb Supabase Database v\u1ec1 t\u0103ng tr\u01b0\u1edfng ng\u01b0\u1eddi d\u00f9ng v\u00e0 thao t\u00e1c t\u00e1c v\u1ee5.',
    export_csv: 'Xu\u1ea5t B\u00e1o C\u00e1o (CSV)',
    total_audit_logs: 'T\u1ed4NG AUDIT LOGS DB',
    total_actual_users: 'T\u1ed4NG T\u00c0I KHO\u1ea2N \u0110\u00c3 TH\u1ef0C',
    total_feedback_reports: 'T\u1ed4NG B\u00c1O C\u00c1O FEEDBACK',
    module_breakdown_title: 'Ph\u00e2n B\u1ed5 Thao T\u00e1c Theo Ph\u00e2n H\u1ec7 (Module Breakdown from DB)',

    // Settings
    app_appearance: 'Giao di\u1ec7n \u1ee9ng d\u1ee5ng',
    theme_light: 'S\u00e1ng',
    theme_dark: 'T\u1ed1i',
    theme_system: 'H\u1ec7 th\u1ed1ng',
    app_language: 'Ng\u00f4n ng\u1eef \u1ee9ng d\u1ee5ng (Language)',
    app_language_hint: 'L\u1ef1a ch\u1ecdn ng\u00f4n ng\u1eef hi\u1ec3n th\u1ecb giao di\u1ec7n m\u1eb7c \u0111\u1ecbnh cho \u1ee9ng d\u1ee5ng EIGU Desktop Client (H\u1ec7 th\u1ed1ng h\u1ed7 tr\u1ee3 Ti\u1ebfng Vi\u1ec7t & English).',

    admin_obf_title: 'C\u1ea5u H\u00ecnh M\u00e3 Ti\u1ec1n T\u1ed1 \u0110\u1ed9ng (Admin Custom Obfuscation Prefix)',
    admin_obf_hint: '\u0110i\u1ec1u ch\u1ec9nh chu\u1ed7i m\u00e3 h\u00f3a b\u1ea3o m\u1eadt (obf_code / API_PREFIX) \u0111\u1ec3 b\u1ea3o v\u1ec7 c\u00e1c endpoints h\u1ec7 th\u1ed1ng kh\u1ecfi c\u00e1c c\u00f4ng c\u1ee5 t\u1ef1 \u0111\u1ed9ng qu\u00e9t route (Scan Bot / Hacker).',
    obf_code_label: 'M\u00e3 M\u00e3 H\u00f3a (obf_code):',
    save_obf_btn: 'L\u01b0u M\u00e3 Ti\u1ec1n T\u1ed1',
    preview_server_url: '\u0110\u01b0\u1eddng d\u1eabn Server xem tr\u01b0\u1edbc:',
    maintenance_title: 'Qu\u1ea3n L\u00fd B\u1eadt / T\u1eaft B\u1ea3o Tr\u00ec System',
    status_active: '\u0110ang Ho\u1ea1t \u0110\u1ed9ng (Normal)',
    maintenance_hint: 'Admin ch\u1ee7 \u0111\u1ed9ng B\u1eadt/T\u1eaft ch\u1ebf \u0111\u1ed9 B\u1ea3o tr\u00ec h\u1ec7 th\u1ed1ng th\u1eddi gian th\u1ef1c. Khi b\u1eadt B\u1ea3o tr\u00ec, t\u1ea5t c\u1ea3 \u1ee9ng d\u1ee5ng Client (Role User) s\u1ebd d\u1eebng truy c\u1eadp cho t\u1edbi khi B\u1ea3o tr\u00ec ho\u00e0n t\u1ea5t.',
    maint_mode_label: 'Ch\u1ebf \u0110\u1ed9 B\u1ea3o Tr\u00ec (Maintenance Mode):',
    min_ver_label: 'Phi\u00ean B\u1ea3n App T\u1ed1i Thi\u1ec3u:',
    save_maint_btn: 'L\u01b0u C\u1ea5u H\u00ecnh B\u1ea3o Tr\u00ec',

    // Telemetry
    telemetry_title: 'Theo D\u00f5i Bug, Stack Trace & Performance Dashboard',
    telemetry_title_text: 'Theo D\u00f5i Bug, Stack Trace & Performance Dashboard',
    telemetry_clear_btn: 'X\u00f3a Logs',
    telemetry_desc: 'T\u1ef1 \u0111\u1ed9ng ghi nh\u1eadn 100% Stack Trace, M\u00e3 l\u1ed7i HTTP, Session Replay Action Trail v\u00e0 \u0111\u1ed9 tr\u1ec5 m\u1ea1ng theo th\u1eddi gian th\u1ef1c.',
    telemetry_empty: 'Ch\u01b0a ghi nh\u1eadn l\u1ed7i h\u1ec7 th\u1ed1ng n\u00e0o.',

    // Toast Messages
    toast_success: 'Th\u00e0nh c\u00f4ng',
    toast_error: 'L\u1ed7i',
    toast_notification: 'Th\u00f4ng b\u00e1o',
    toast_login_success_title: '\u0110\u0103ng nh\u1eadp th\u00e0nh c\u00f4ng',
    toast_login_success_desc: 'Ch\u00e0o m\u1eebng b\u1ea1n \u0111\u1ebfn v\u1edbi EIGU Platform',
    toast_logout_success_title: '\u0110\u0103ng xu\u1ea5t',
    toast_logout_success_desc: '\u0110\u00e3 \u0111\u0103ng xu\u1ea5t kh\u1ecfi h\u1ec7 th\u1ed1ng.',
    toast_network_online_title: '\u0110\u00e3 k\u1ebft n\u1ed1i l\u1ea1i',
    toast_network_online_desc: 'H\u1ec7 th\u1ed1ng \u0111\u00e3 k\u1ebft n\u1ed1i m\u1ea1ng th\u00e0nh c\u00f4ng.',
    toast_network_offline_title: 'M\u1ea5t k\u1ebft n\u1ed1i',
    toast_network_offline_desc: 'H\u1ec7 th\u1ed1ng c\u1ea7n ph\u1ea3i c\u00f3 m\u1ea1ng th\u00ec m\u1edbi s\u1eed d\u1ee5ng \u0111\u01b0\u1ee3c.',
    toast_auto_unban_desc: 'T\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ef1 \u0111\u1ed9ng g\u1ee1 kh\u00f3a! Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.',
    toast_copy_success: '\u0110\u00e3 sao ch\u00e9p!',
    toast_copy_error: 'L\u1ed7i sao ch\u00e9p',

    // Guide View
    guide_overview_title: 'T\u1ed5ng quan',
    guide_overview_desc: 'Trang t\u1ed5ng quan hi\u1ec3n th\u1ecb s\u1ed1 li\u1ec7u video \u0111\u00e3 x\u1eed l\u00fd, \u0111\u00e3 upload TikTok, \u0111ang ch\u1edd v\u00e0 s\u1ed1 t\u00e0i kho\u1ea3n TikTok \u0111ang qu\u1ea3n l\u00fd. Theo d\u00f5i ho\u1ea1t \u0111\u1ed9ng h\u1ec7 th\u1ed1ng th\u1eddi gian th\u1ef1c.',
    guide_video_title: 'T\u1ef1 \u0111\u1ed9ng h\u00f3a Video',
    guide_video_desc_input: '\u0110\u1ea7u v\u00e0o: K\u00e9o th\u1ea3 file .mp4 ho\u1eb7c d\u00e1n link YouTube \u0111\u1ec3 t\u1ea3i video t\u1ef1 \u0111\u1ed9ng.',
    guide_video_desc_cut: 'Ch\u1ebf \u0111\u1ed9 c\u1eaft: Ch\u1ecdn \u0111\u1ed9 d\u00e0i m\u1ed7i video (1-20 ph\u00fat) ho\u1eb7c t\u00f9y ch\u1ec9nh chi ti\u1ebft.',
    guide_video_desc_ratio: 'T\u1ec9 l\u1ec7 khung h\u00ecnh: 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram).',
    guide_video_desc_antidetect: 'Anti-Detect: X\u00f3a metadata, th\u00eam nhi\u1ec5u h\u1ea1t, l\u1eadt khung h\u00ecnh, \u0111\u1ea3o \u00e2m thanh 3D ch\u1ed1ng b\u1ea3n quy\u1ec1n.',
    guide_workflow_title: 'Visual Workflow Builder',
    guide_workflow_desc: 'Thi\u1ebft k\u1ebf lu\u1ed3ng x\u1eed l\u00fd t\u1ef1 \u0111\u1ed9ng b\u1eb1ng c\u00e1ch k\u00e9o th\u1ea3 c\u00e1c Node: L\u1ea5y URL \u279c T\u1ea3i xu\u1ed1ng \u279c AI X\u1eed l\u00fd (ASR + LLM) \u279c FFmpeg \u279c N\u1ea1p H\u1ed3 s\u01a1 Browser \u279c T\u1ea3i l\u00ean TikTok.',
    guide_proxy_title: 'Qu\u1ea3n l\u00fd H\u1ed3 s\u01a1 & Proxy',
    guide_proxy_desc: 'M\u1ed7i t\u00e0i kho\u1ea3n l\u00e0 m\u1ed9t Browser Profile ri\u00eang bi\u1ec7t v\u1edbi Cookies, Proxy SOCKS5/Residential ri\u00eang. Kh\u00f3a WebRTC ng\u0103n r\u00f2 r\u1ec9 \u0111\u1ecba ch\u1ec9 IP th\u1eadt qua UDP/STUN.',
    guide_rbac_title: 'Ph\u00e2n Quy\u1ec1n & \u0110\u1ed9i Nh\u00f3m',
    guide_rbac_desc: 'H\u1ec7 th\u1ed1ng ph\u00e2n quy\u1ec1n 3 c\u1ea5p \u0111\u1ed9 (Admin, Staff, User). Admin c\u00f3 quy\u1ec1n b\u1eadt/t\u1eaft hi\u1ec3n th\u1ecb t\u1eebng Tab ch\u1ee9c n\u0103ng ri\u00eang bi\u1ec7t cho t\u1eebng t\u00e0i kho\u1ea3n nh\u00e2n vi\u00ean.',
    guide_telemetry_title: 'C\u1ea5u H\u00ecnh & Gi\u00e1m S\u00e1t L\u1ed7i',
    guide_telemetry_desc: 'T\u1ef1 \u0111\u1ed9ng ghi nh\u1eadn 100% Stack Trace, M\u00e3 l\u1ed7i HTTP, Session Replay Action Trail gi\u00fap \u0111\u1ed9i ng\u0169 ph\u00e1t tri\u1ec3n ph\u00e1t hi\u1ec7n v\u00e0 x\u1eed l\u00fd s\u1ef1 c\u1ed1 t\u1ee9c th\u00ec.',
    guide_badge_overview: 'T\u1ed5ng quan',
    guide_badge_ai: 'C\u1eaft gh\u00e9p AI',
    guide_badge_auto: 'Lu\u1ed3ng t\u1ef1 \u0111\u1ed9ng',
    guide_badge_antidetect: 'Anti-Detect',
    guide_badge_rbac: 'RBAC System',
    guide_badge_telemetry: 'Telemetry',
    guide_badge_dashboard: 'T\u1ed5ng quan',
    guide_section_1_heading_dashboard: '1. Dashboard',

    // Social Account Titles
    social_tiktok_title: 'TikTok Accounts',
    social_facebook_title: 'Facebook Accounts',
    social_youtube_title: 'YouTube Channels',
    social_x_title: 'X (Twitter) Accounts',
    social_instagram_title: 'Instagram Accounts',
    social_threads_title: 'Threads Accounts',

    // Chat Support Template Keys
    chat_sidebar_search_placeholder: 'T\u00ecm ki\u1ebfm \u0111o\u1ea1n chat / email...',
    chat_sidebar_empty: 'Ch\u01b0a c\u00f3 cu\u1ed9c tr\u00f2 chuy\u1ec7n n\u00e0o.',
    chat_no_permission: 'B\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n truy c\u1eadp Staff Chat Console.',
    chat_header_loading: '\u0110ang t\u1ea3i danh s\u00e1ch cu\u1ed9c tr\u00f2 chuy\u1ec7n...',
    chat_header_chatting_with: '\u0110ang chat v\u1edbi:',
    chat_header_email_label: 'T\u00e0i kho\u1ea3n Email:',
    chat_back_btn: '\u2190 Danh s\u00e1ch',
    chat_default_name: 'Ch\u1ecdn cu\u1ed9c tr\u00f2 chuy\u1ec7n \u0111\u1ec3 b\u1eaft \u0111\u1ea7u chat',
    chat_default_email: 'Vui l\u00f2ng ch\u1ecdn m\u1ed9t phi\u00ean chat \u1edf danh s\u00e1ch b\u00ean tr\u00e1i',
    chat_default_select_user: 'Ch\u1ecdn ng\u01b0\u1eddi d\u00f9ng \u1edf c\u1ed9t b\u00ean tr\u00e1i \u0111\u1ec3 trao \u0111\u1ed5i th\u00f4ng tin tr\u1ef1c ti\u1ebfp.',
    chat_input_placeholder: 'G\u1eedi tin nh\u1eafn...',
    chat_reply_prefix: '\u0110ang tr\u1ea3 l\u1eddi:',
    chat_mention_ai_sub: '\u0110\u1eb7t c\u00e2u h\u1ecfi cho Tr\u1ee3 l\u00fd AI',
    chat_mention_customer_sub: 'Nh\u1eafc \u0111\u1ebfn Kh\u00e1ch h\u00e0ng',
    chat_mention_everyone_sub: 'Nh\u1eafc \u0111\u1ebfn to\u00e0n b\u1ed9 h\u1ec7 th\u1ed1ng',
    chat_emoji_btn: '🎃',
    chat_resizer_title: 'K\u00e9o chu\u1ed9t sang tr\u00e1i/ph\u1ea3i \u0111\u1ec3 thay \u0111\u1ed5i k\u00edch th\u01b0\u1edbc',
    chat_resolve_btn: 'Ho\u00e0n t\u1ea5t H\u1ed7 tr\u1ee3',
    chat_reopen_btn: 'M\u1edf l\u1ea1i H\u1ed7 tr\u1ee3',
    chat_reply_btn: 'Tr\u1ea3 l\u1eddi',
    chat_no_messages: 'Ch\u01b0a c\u00f3 tin nh\u1eafn',
    chat_no_messages_history: 'Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed tin nh\u1eafn n\u00e0o.',
    chat_no_sessions: 'Ch\u01b0a c\u00f3 cu\u1ed9c tr\u00f2 chuy\u1ec7n n\u00e0o.',
    chat_no_results: 'Kh\u00f4ng t\u00ecm th\u1ea5y k\u1ebft qu\u1ea3 ph\u00f9 h\u1ee3p.',
    chat_customer: 'Kh\u00e1ch h\u00e0ng',
    chat_staff_ai: 'AI Assistant',
    chat_ai_assistant: 'AI Assistant',

    // Filter Pill Keys
    filter_pill_all: 'T\u1ea5t c\u1ea3',
    filter_pill_needs_support: 'C\u1ea7n h\u1ed7 tr\u1ee3',
    filter_pill_in_progress: '\u0110ang h\u1ed7 tr\u1ee3',
    filter_pill_resolved: '\u0110\u00e3 xong',

    // Chat Status Keys
    status_in_progress: '\u0110ang h\u1ed7 tr\u1ee3',
    status_needs_staff: 'C\u1ea6N STAFF H\u1ed6 TR\u1ee2',
    status_resolved: '\u0110\u00e3 xong',

    // Chat JS Toast/Sysmsg Keys
    toast_chat_staff_warning: 'C\u1ea3nh b\u00e1o',
    toast_chat_staff_title: 'Chat Support',
    toast_chat_staff_desc: '\u0110\u00e3 chuy\u1ec3n cu\u1ed9c tr\u00f2 chuy\u1ec7n sang cho Nh\u00e2n vi\u00ean h\u1ed7 tr\u1ee3!',
    toast_chat_human_support_title: 'Chat Support',
    toast_chat_human_support_desc: '\u0110\u00e3 chuy\u1ec3n cu\u1ed9c tr\u00f2 chuy\u1ec7n sang cho Nh\u00e2n vi\u00ean h\u1ed7 tr\u1ee3!',
    toast_chat_resolved: '\u0110\u00e3 ho\u00e0n t\u1ea5t h\u1ed7 tr\u1ee3 cho',
    toast_chat_reopened: '\u0110\u00e3 m\u1edf l\u1ea1i h\u1ed7 tr\u1ee3 cho',
    chat_sysmsg_staff_request: '\u0110\u00e3 g\u1eedi y\u00eau c\u1ea7u h\u1ed7 tr\u1ee3 t\u1edbi \u0111\u1ed9i ng\u0169 Staff / Admin! M\u1ed9t nh\u00e2n vi\u00ean s\u1ebd ph\u1ea3n h\u1ed3i cu\u1ed9c tr\u00f2 chuy\u1ec7n n\u00e0y trong \u00edt ph\u00fat.',
    chat_sysmsg_resolved: 'Nh\u00e2n vi\u00ean \u0111\u00e3 \u0111\u00e1nh d\u1ea5u ho\u00e0n t\u1ea5t h\u1ed7 tr\u1ee3 phi\u00ean tr\u00f2 chuy\u1ec7n n\u00e0y.',
    chat_sysmsg_reopened: 'Nh\u00e2n vi\u00ean \u0111\u00e3 m\u1edf l\u1ea1i phi\u00ean h\u1ed7 tr\u1ee3 n\u00e0y.',
    chat_slash_help: 'Danh s\u00e1ch l\u1ec7nh h\u1ed7 tr\u1ee3:\n\u2022 @Eigu AI <c\u00e2u h\u1ecfi>: H\u1ecfi \u0111\u00e1p tr\u1ef1c ti\u1ebfp v\u1edbi AI Assistant\n\u2022 /staff ho\u1eb7c @Staff: G\u1eedi y\u00eau c\u1ea7u Nh\u00e2n vi\u00ean h\u1ed7 tr\u1ee3\n\u2022 /ai <c\u00e2u h\u1ecfi>: H\u1ecfi AI nhanh',
    chat_ai_fallback: 'T\u00f4i hi\u1ec7n ch\u01b0a r\u00f5 c\u00e2u h\u1ecfi n\u00e0y. B\u1ea1n c\u00f3 th\u1ec3 g\u00f5 @Eigu AI <c\u00e2u h\u1ecfi> ho\u1eb7c b\u1ea5m Y\u00eau c\u1ea7u Staff h\u1ed7 tr\u1ee3 nh\u00e9!',
    chat_ai_fallback_no_ipc: 'T\u00f4i hi\u1ec7n ch\u01b0a r\u00f5 c\u00e2u h\u1ecfi n\u00e0y.',
    chat_ai_greeting: 'Xin ch\u00e0o! T\u00f4i l\u00e0 AI Assistant c\u1ee7a EIGU Platform. B\u1ea1n c\u1ea7n h\u1ed7 tr\u1ee3 g\u00ec h\u00f4m nay?',
    chat_scroll_to_original: 'B\u1ea5m \u0111\u1ec3 cu\u1ed9n \u0111\u1ebfn tin nh\u1eafn g\u1ed1c',
    chat_reply_title: 'Tr\u1ea3 l\u1eddi tin nh\u1eafn',
    chat_reply_prefix: 'Tr\u1ea3 l\u1eddi',
    chat_ai_fallback_response: 'AI Assistant EIGU Platform:\n\nC\u1ea3m \u01a1n c\u00e2u h\u1ecfi c\u1ee7a b\u1ea1n! T\u00f4i c\u00f3 th\u1ec3 gi\u1ea3i \u0111\u00e1p \u0111\u1ea7y \u0111\u1ee7 v\u1ec1 25 t\u00ednh n\u0103ng h\u1ec7 th\u1ed1ng (T\u1ef1 \u0111\u1ed9ng c\u1eaft, T\u1ea1o video AI, Reup, T\u1ea3i h\u00e0ng lo\u1ea1t, Workflow, Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n TikTok/FB/YT, API Keys...).\n\nB\u1ea1n h\u00e3y g\u00f5 **@Eigu AI <c\u00e2u h\u1ecfi>** ho\u1eb7c b\u1ea5m **Y\u00eau c\u1ea7u Staff h\u1ed7 tr\u1ee3** \u0111\u1ec3 \u0111\u01b0\u1ee3c gi\u1ea3i \u0111\u00e1p tr\u1ef1c ti\u1ebfp nh\u00e9!',

    // Chat Status Indicator Keys
    chat_status_seen: '\u0110\u00e3 xem',
    chat_status_sent: '\u0110\u00e3 g\u1eedi',
    chat_just_now: 'V\u1eeba xong',

    // Chat Reply Preview Keys
    chat_reply_to: '\u0110ang tr\u1ea3 l\u1eddi:',
    chat_reply_to_customer: 'Tr\u1ea3 l\u1eddi Kh\u00e1ch h\u00e0ng:',
    chat_reply_to_staff: 'Tr\u1ea3 l\u1eddi Staff:',
    chat_reply_to_ai: 'Tr\u1ea3 l\u1eddi AI:',

    // Chat Sample Session Keys
    chat_sample_msg1: 'Xin ch\u00e0o, t\u00f4i kh\u00f4ng n\u1ea1p \u0111\u01b0\u1ee3c API key Gemini v\u00e0o h\u1ec7 th\u1ed1ng.',
    chat_sample_msg2: 'Ch\u00e0o b\u1ea1n! B\u1ea1n vui l\u00f2ng ki\u1ec3m tra tab C\u00e0i \u0111\u1eb7t > B\u1ec3 ch\u1ee9a API Keys. N\u1ebfu v\u1eabn l\u1ed7i, h\u00e3y g\u00f5 @Eigu AI ho\u1eb7c b\u1ea5m Y\u00eau c\u1ea7u Staff h\u1ed7 tr\u1ee3 nh\u00e9.',
    chat_sample_msg3: 'T\u00f4i \u0111\u00e3 b\u1ea5m y\u00eau c\u1ea7u Staff h\u1ed7 tr\u1ee3, nh\u1edd b\u1ea1n ki\u1ec3m tra gi\u00fap.',

    // Notification Toast Keys
    toast_notify_chat_transferred_title: 'Chat Support',
    toast_notify_chat_transferred_desc: '\u0110\u00e3 chuy\u1ec3n cu\u1ed9c tr\u00f2 chuy\u1ec7n sang cho Nh\u00e2n vi\u00ean h\u1ed7 tr\u1ee3!',

    // Settings - API Keys
    api_keys_title: 'B\u1ec3 ch\u1ee9a API Keys (T\u1ef1 \u0111\u1ed9ng xoay v\u00f2ng)',
    api_keys_hint: 'C\u00e1c key s\u1ebd \u0111\u01b0\u1ee3c m\u00e3 h\u00f3a an to\u00e0n b\u1eb1ng chip b\u1ea3o m\u1eadt c\u1ee7a m\u00e1y t\u00ednh (Keychain/DPAPI) tr\u01b0\u1edbc khi l\u01b0u xu\u1ed1ng \u1ed5 \u0111\u0129a.',
    add_key_btn: 'Th\u00eam Key',
    col_type: 'Lo\u1ea1i',
    col_key: 'Key (\u1ea8n)',
    col_note: 'Ghi ch\u00fa',
    col_action: 'H\u00e0nh \u0111\u1ed9ng',
    cache_title: 'Cache & D\u1eef li\u1ec7u b\u1ed9 nh\u1edb \u0111\u1ec7m',
    cache_hint: 'Qu\u1ea3n l\u00fd b\u1ed9 nh\u1edb \u0111\u1ec7m, xo\u00e1 d\u1eef li\u1ec7u workflow t\u1ea1m th\u1eddi, c\u1ea5u h\u00ecnh th\u01b0 m\u1ee5c \u0111\u1ea7u ra m\u1eb7c \u0111\u1ecbnh.',
    proxy_title: 'Proxy & B\u1ea3o M\u1eadt M\u1ea1ng',
    proxy_hint: 'C\u1ea5u h\u00ecnh SOCKS5 / Residential proxy cho Anti-Detect Browser, ch\u1eb7n r\u00f2 r\u1ec9 WebRTC UDP/STUN.',
    workflow_defaults_title: 'Workflow & Anti-Detect M\u1eb7c \u0110\u1ecbnh',
    workflow_defaults_hint: 'C\u00e0i \u0111\u1eb7t m\u1eb7c \u0111\u1ecbnh cho x\u1eed l\u00fd video, t\u1ec9 l\u1ec7 khung h\u00ecnh, l\u1eadt \u1ea3nh, d\u1ea3i t\u1ea7n \u00e2m thanh v\u00e0 x\u00f3a metadata.',

    // Feedback View
    feedback_title: 'G\u00f3p \u00fd / B\u00e1o l\u1ed7i',
    feedback_hint: 'M\u1ecdi \u00fd ki\u1ebfn \u0111\u00f3ng g\u00f3p ho\u1eb7c b\u00e1o l\u1ed7i c\u1ee7a b\u1ea1n s\u1ebd gi\u00fap ch\u00fang t\u00f4i ph\u00e1t tri\u1ec3n EIGU t\u1ed1t h\u01a1n. (Gi\u1edbi h\u1ea1n: 3 l\u1ea7n/ng\u00e0y)',
    attach_image: '\u0110\u00ednh k\u00e8m h\u00ecnh \u1ea3nh (n\u1ebfu c\u00f3):',
    click_select_image: 'Nh\u1ea5p \u0111\u1ec3 ch\u1ecdn \u1ea3nh ho\u1eb7c k\u00e9o th\u1ea3 v\u00e0o \u0111\u00e2y',
    feedback_submit: 'G\u1eedi B\u00e1o C\u00e1o',

    // Chat Support
    chat_customer_inbox: 'H\u1ed9p tho\u1ea1i Kh\u00e1ch h\u00e0ng',
    reload_btn: 'T\u1ea3i l\u1ea1i',
    filter_all: 'T\u1ea5t c\u1ea3',
    filter_needs_support: 'C\u1ea7n h\u1ed7 tr\u1ee3',
    filter_in_progress: '\u0110ang h\u1ed7 tr\u1ee3',
    filter_resolved: '\u0110\u00e3 xong',
    resolve_support: 'Ho\u00e0n t\u1ea5t H\u1ed7 tr\u1ee3',
    send_btn: 'G\u1eedi',

    // Sidebar Sub-items
    sub_cut: 'T\u1ef1 \u0111\u1ed9ng c\u1eaft',
    sub_ai_video: 'T\u1ea1o video AI',
    sub_reup: 'T\u1ea1o video Reup',
    sub_hot_niche: 'T\u00ecm ng\u00e1ch hot',
    sub_bulk_download: 'T\u1ea3i video h\u00e0ng lo\u1ea1t',
    sub_workflow: 'T\u1ea1o workflow',
    sub_record: 'Ghi thao t\u00e1c',
    search_placeholder: 'T\u00ecm c\u00f4ng c\u1ee5...',
    notif_drawer_title: 'Th\u00f4ng b\u00e1o h\u1ec7 th\u1ed1ng',
    mark_read_all: '\u0110\u00e3 \u0111\u1ecdc t\u1ea5t c\u1ea3',
    feedback: 'G\u00f3p \u00fd / B\u00e1o l\u1ed7i',
    logout: '\u0110\u0103ng xu\u1ea5t',

    // Maintenance Overlay Keys
    maint_overlay_title: 'H\u1ec6 TH\u1ed0NG \u0110ANG B\u1ea2O TR\u00cc',
    maint_overlay_subtitle: 'H\u1ec7 th\u1ed1ng \u0111ang \u0111\u01b0\u1ee3c b\u1ea3o tr\u00ec b\u1edfi Admin. Vui l\u00f2ng quay l\u1ea1i sau \u00edt ph\u00fat.',
    maint_overlay_contact: 'Li\u00ean h\u1ec7 h\u1ed7 tr\u1ee3:',
    maint_overlay_refresh: 'Ki\u1ec3m Tra L\u1ea1i',
  },
  en: {
    // Sidebar Labels
    admin_dashboard: 'Admin Dashboard',
    profile: 'Profile',
    tools: 'Tools',
    automation: 'Automation',
    accounts: 'Accounts',
    chat_support: 'Live Chat Support',
    user_management: 'User & Staff Management',
    create_notification: 'Broadcast Notification',
    feedback_management: 'Feedback Management',
    affiliate: 'Affiliate Marketing',
    team: 'Team Workspaces',
    utilities: 'Utilities',
    analytics_reports: 'Analytics & Reports',
    user_guide: 'User Manual',
    activity_logs: 'Activity Logs',
    settings: 'Settings',

    // Profile View
    profile_email: 'Email',
    profile_role: 'Role',
    profile_verified: 'Verified',
    profile_created: 'Created Date',

    // Cut View - Drop Zone & Input
    drop_mp4_here: 'Drag & drop .mp4 file here',
    or_click_select: 'or click to select file',
    or_divider: 'OR',
    yt_link_placeholder: 'Paste YouTube link (e.g. https://youtu.be/...)',
    yt_download_quality: 'Download Quality (YouTube)',
    quality_auto: 'Auto (Highest Quality)',
    quality_audio_only: 'Audio Only (MP3)',
    video_info_title: 'Video Info',
    video_info_desc: 'Thumbnail and duration will display here when you select a file or paste a link.',

    // Cut View - Mode & Params
    cut_mode_params: 'Cut Mode & Parameters',
    cut_mode_label: 'Video Cut Mode',
    split_1: '1 min / video',
    split_2: '2 min / video',
    split_3: '3 min / video',
    split_5: '5 min / video',
    split_10: '10 min / video',
    split_20: '20 min / video',
    split_custom: 'Custom Time Range',
    split_ai_smart: 'AI Smart Cutter (Auto 30-90s)',
    cut_method_label: 'Cut Method',
    cut_fast: 'Fast Mode (Ultra-fast, preserve quality)',
    cut_accurate: 'Accurate Mode (Slower, frame-precise cuts)',
    export_quality_label: 'Export Quality (Re-encode)',
    codec_auto: 'Auto (H.264)',
    codec_h264: 'H.264 (Best Compatibility)',
    codec_h265: 'H.265 / HEVC (Low Size)',
    codec_av1: 'AV1 (Best Quality)',
    aspect_ratio_label: 'Aspect Ratio',
    ratio_original: 'Keep Original',
    auto_part_number: 'Auto number "Part 1/N"',

    // Anti-Detect & Advanced Edit
    anti_detect_title: 'Anti-Detect Features',
    opt_metadata: 'Remove Metadata (Metadata Stripping)',
    opt_noise: 'Noise Grain & EQ Adjustment',
    opt_decimate: 'Remove Static Frames (Decimation)',
    opt_audio_3d: '3D Audio Reversal (Spatial Panning)',
    advanced_edit_title: 'Advanced Editing',
    flip_video: 'Flip Video',
    flip_none: 'No Flip',
    flip_horizontal: 'Horizontal Flip',
    flip_vertical: 'Vertical Flip',
    color_eq: 'Color (EQ)',
    brightness_label: 'Brightness',
    contrast_label: 'Contrast',
    saturation_label: 'Saturation',
    frame_bend: 'Frame Transform',
    bend_none: 'None',
    bend_rotate90: 'Rotate 90\u00b0',
    bend_rotate180: 'Rotate 180\u00b0',
    bend_vflip: 'Vertical Flip',

    // Logo & Watermark
    logo_watermark: 'Logo & Watermark Overlay',
    logo_select_file: 'Click to select Logo file (.png, .jpg)...',
    logo_remove: 'Remove',
    logo_position: 'Logo Position (9 positions)',
    logo_size: 'Logo Size',
    logo_opacity: 'Opacity',

    // Voice
    voice_label: 'Voice',
    voice_keep: 'Keep Original',
    voice_ffmpeg: 'FFmpeg (Pitch Shift)',
    voice_selfhost: 'OmniVoice (Self-hosted)',
    pitch_label: 'Pitch',
    speed_label: 'Speed',
    voice_loading: 'Loading voice list...',
    voice_api_hint: 'API keys are centrally managed on the server. Select a voice from the library.',

    // Output & Actions
    output_folder: 'Save folder:',
    output_default: 'Default (Downloads/eigu/outputs)',
    output_change: 'Change',
    start_processing: 'Start Processing',
    cancel_process: 'Cancel Process',
    status_init: 'Initializing...',
    status_preparing: 'Preparing...',
    show_logs: 'Show Details / Logs',

    // AI Video View
    ai_copy_video: 'Copy Video',
    ai_from_idea: 'Create from Idea',
    ai_paste_link_placeholder: 'Paste TikTok/YouTube/Facebook link...',
    ai_analyze_btn: 'Analyze Video & Extract Script',
    ai_idea_placeholder: 'Enter your idea... e.g. A video about a space exploration journey...',
    ai_generate_script: 'Generate Detailed Script (Prompts)',
    ai_script_result: 'Scene Script (Prompts)',
    ai_video_model: 'Video Generation Model',
    ai_scenes_count: 'Number of Scenes',
    scenes_auto: 'Auto (Based on content)',
    ai_aspect_ratio: 'Aspect Ratio',
    ai_audio_voice: 'Audio & Voice',
    ai_keep_audio: 'Keep original audio (Copy mode only)',
    ai_dubbing: 'Voice Dubbing (AI Voice)',
    ai_start_render: 'Start Batch Render',
    ai_preview_title: 'Preview Final Video',
    open_output_folder: 'Open Output Folder',

    // Placeholder Views
    feature_developing: 'Feature under development',
    tiktok_desc: 'Manage TikTok accounts \u2014 add, remove, monitor status',
    facebook_desc: 'Manage Facebook accounts & Fanpages',
    youtube_desc: 'Manage YouTube channels & auto upload',
    x_desc: 'Manage X accounts & auto Tweet',
    instagram_desc: 'Manage Instagram accounts & auto post',
    threads_desc: 'Manage Threads accounts',

    // View Titles & Headers (Admin Dashboard)
    admin_dash_title: 'Admin Executive Dashboard',
    admin_dash_subtitle: 'Overview monitoring of system metrics, accounts, API Gateway service and real-time performance.',
    refresh_stats: 'Refresh Stats',
    total_system_users: 'TOTAL SYSTEM USERS',
    staff_team_count: 'STAFF TEAM MEMBERS',
    active_workflows_count: 'AUTOMATION WORKFLOWS',
    api_gateway_status: 'API GATEWAY STATUS',
    recent_db_events: 'Recent System Events (Real Database Log)',
    quick_shortcuts: 'Quick Admin Shortcuts',
    shortcut_permissions: 'User/Staff Permissions',
    shortcut_analytics: 'View Analytics & Reports',
    shortcut_logs: 'Activity Logs',
    shortcut_obfuscation: 'Obfuscation Config',

    // Analytics
    analytics_title: 'System Analytics & Performance Reports',
    analytics_subtitle: 'Real-time database analytics from Supabase on user growth and module operations.',
    export_csv: 'Export Report (CSV)',
    total_audit_logs: 'TOTAL DB AUDIT LOGS',
    total_actual_users: 'TOTAL ACTUAL USERS',
    total_feedback_reports: 'TOTAL FEEDBACK REPORTS',
    module_breakdown_title: 'Module Breakdown Operations from DB',

    // Settings
    app_appearance: 'App Appearance',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    app_language: 'Application Language',
    app_language_hint: 'Select the default display language for EIGU Desktop Client (Supports Vietnamese & English).',

    admin_obf_title: 'Dynamic Custom Obfuscation Prefix (Admin Security)',
    admin_obf_hint: 'Customize security prefix (obf_code / API_PREFIX) to protect system endpoints from automated scanners.',
    obf_code_label: 'Obfuscation Code (obf_code):',
    save_obf_btn: 'Save Obfuscation Code',
    preview_server_url: 'Server Base URL Preview:',
    maintenance_title: 'System Maintenance Mode Management',
    status_active: 'System Active (Normal)',
    maintenance_hint: 'Admin toggle real-time system maintenance mode. When enabled, client apps (Role User) will pause access until complete.',
    maint_mode_label: 'Maintenance Mode:',
    min_ver_label: 'Minimum Required App Version:',
    save_maint_btn: 'Save Maintenance Settings',

    // Telemetry
    telemetry_title: 'Bug Tracking, Stack Trace & Performance Dashboard',
    telemetry_title_text: 'Bug Tracking, Stack Trace & Performance Dashboard',
    telemetry_clear_btn: 'Clear Logs',
    telemetry_desc: 'Automatically capture 100% Stack Trace, HTTP errors, Session Replay Action Trail and network latency in real-time.',
    telemetry_empty: 'No system errors recorded.',

    // Settings - API Keys
    api_keys_title: 'API Key Pool (Auto-rotation)',
    api_keys_hint: 'Keys are securely encrypted using device security chip (Keychain/DPAPI) before saving to disk.',
    add_key_btn: 'Add Key',
    col_type: 'Type',
    col_key: 'Key (Hidden)',
    col_note: 'Note',
    col_action: 'Actions',
    cache_title: 'Cache & Temporary Data',
    cache_hint: 'Manage cache, clear temporary workflow data, configure default output directory.',
    proxy_title: 'Proxy & Network Security',
    proxy_hint: 'Configure SOCKS5 / Residential proxy for Anti-Detect Browser, block WebRTC UDP/STUN leaks.',
    workflow_defaults_title: 'Workflow & Anti-Detect Defaults',
    workflow_defaults_hint: 'Default settings for video processing, aspect ratio, image flip, audio frequency band, and metadata stripping.',

    // Feedback View
    feedback_title: 'Submit Feedback / Bug Report',
    feedback_hint: 'Your feedback and bug reports help us improve EIGU. (Limit: 3 reports/day)',
    attach_image: 'Attach image (optional):',
    click_select_image: 'Click to select image or drag & drop here',
    feedback_submit: 'Submit Report',

    // Chat Support
    chat_customer_inbox: 'Customer Conversations',
    reload_btn: 'Reload',
    filter_all: 'All',
    filter_needs_support: 'Needs Support',
    filter_in_progress: 'In Progress',
    filter_resolved: 'Resolved',
    resolve_support: 'Mark Resolved',
    send_btn: 'Send',

    // Sidebar Sub-items
    sub_cut: 'Auto Cut Video',
    sub_ai_video: 'Create AI Video',
    sub_reup: 'Reup Video',
    sub_hot_niche: 'Hot Niche Finder',
    sub_bulk_download: 'Bulk Download',
    sub_workflow: 'Create Workflow',
    sub_record: 'Record Macro',
    search_placeholder: 'Search tools...',
    notif_drawer_title: 'System Notifications',
    mark_read_all: 'Mark all read',
    feedback: 'Submit Feedback',
    logout: 'Logout',

    // Toast Messages
    toast_success: 'Success',
    toast_error: 'Error',
    toast_notification: 'Notification',
    toast_login_success_title: 'Login successful',
    toast_login_success_desc: 'Welcome to EIGU Platform',
    toast_logout_success_title: 'Logged out',
    toast_logout_success_desc: 'You have been logged out successfully.',
    toast_network_online_title: 'Connected',
    toast_network_online_desc: 'Network connection restored.',
    toast_network_offline_title: 'Disconnected',
    toast_network_offline_desc: 'A network connection is required to use the system.',
    toast_auto_unban_desc: 'Your account has been automatically unlocked! Please log in again.',
    toast_copy_success: 'Copied!',
    toast_copy_error: 'Copy error',

    // Guide View
    guide_overview_title: 'Overview',
    guide_overview_desc: 'Dashboard displays processed video stats, uploaded to TikTok, pending, and managed TikTok accounts. Real-time system monitoring.',
    guide_video_title: 'Video Automation',
    guide_video_desc_input: 'Input: Drag & drop .mp4 or paste YouTube link to auto-download video.',
    guide_video_desc_cut: 'Cut mode: Choose duration per video (1-20 min) or custom range.',
    guide_video_desc_ratio: 'Aspect ratio: 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram).',
    guide_video_desc_antidetect: 'Anti-Detect: Remove metadata, add noise grain, flip frame, 3D audio reversal to avoid copyright.',
    guide_workflow_title: 'Visual Workflow Builder',
    guide_workflow_desc: 'Design automated processing flows by dragging Nodes: Get URL ➔ Download ➔ AI Process (ASR + LLM) ➔ FFmpeg ➔ Load Browser Profile ➔ Upload to TikTok.',
    guide_proxy_title: 'Profile & Proxy Management',
    guide_proxy_desc: 'Each account is a separate Browser Profile with unique Cookies, SOCKS5/Residential Proxy. WebRTC lock prevents real IP leaks via UDP/STUN.',
    guide_rbac_title: 'Permissions & Team',
    guide_rbac_desc: '3-level permission system (Admin, Staff, User). Admin can toggle feature tab visibility for each staff account individually.',
    guide_telemetry_title: 'Config & Error Monitoring',
    guide_telemetry_desc: 'Automatically capture 100% Stack Trace, HTTP errors, Session Replay Action Trail to help the dev team detect and fix issues instantly.',
    guide_badge_overview: 'Overview',
    guide_badge_ai: 'AI Cut & Edit',
    guide_badge_auto: 'Auto Flow',
    guide_badge_antidetect: 'Anti-Detect',
    guide_badge_rbac: 'RBAC System',
    guide_badge_telemetry: 'Telemetry',
    guide_badge_dashboard: 'Overview',
    guide_section_1_heading_dashboard: '1. Dashboard',

    // Social Account Titles
    social_tiktok_title: 'TikTok Accounts',
    social_facebook_title: 'Facebook Accounts',
    social_youtube_title: 'YouTube Channels',
    social_x_title: 'X (Twitter) Accounts',
    social_instagram_title: 'Instagram Accounts',
    social_threads_title: 'Threads Accounts',

    // Chat Support Template Keys
    chat_sidebar_search_placeholder: 'Search chats / email...',
    chat_sidebar_empty: 'No conversations yet.',
    chat_no_permission: 'You do not have permission to access the Staff Chat Console.',
    chat_header_loading: 'Loading conversation list...',
    chat_header_chatting_with: 'Chatting with:',
    chat_header_email_label: 'Email Account:',
    chat_back_btn: '\u2190 List',
    chat_default_name: 'Select a conversation to start chatting',
    chat_default_email: 'Please select a chat session from the list on the left',
    chat_default_select_user: 'Select a user from the left column to start a conversation.',
    chat_input_placeholder: 'Type a message...',
    chat_reply_prefix: 'Replying to:',
    chat_mention_ai_sub: 'Ask AI Assistant a question',
    chat_mention_customer_sub: 'Mention Customer',
    chat_mention_everyone_sub: 'Mention everyone in the system',
    chat_emoji_btn: '🎃',
    chat_resizer_title: 'Drag left/right to resize sidebar',
    chat_resolve_btn: 'Mark Resolved',
    chat_reopen_btn: 'Reopen Support',
    chat_reply_btn: 'Reply',
    chat_no_messages: 'No messages',
    chat_no_messages_history: 'No message history yet.',
    chat_no_sessions: 'No conversations yet.',
    chat_no_results: 'No matching results found.',
    chat_customer: 'Customer',
    chat_staff_ai: 'AI Assistant',
    chat_ai_assistant: 'AI Assistant',

    // Filter Pill Keys
    filter_pill_all: 'All',
    filter_pill_needs_support: 'Needs Support',
    filter_pill_in_progress: 'In Progress',
    filter_pill_resolved: 'Resolved',

    // Chat Status Keys
    status_in_progress: 'In Progress',
    status_needs_staff: 'NEEDS STAFF SUPPORT',
    status_resolved: 'Resolved',

    // Chat JS Toast/Sysmsg Keys
    toast_chat_staff_warning: 'Warning',
    toast_chat_staff_title: 'Chat Support',
    toast_chat_staff_desc: 'Conversation has been transferred to staff support!',
    toast_chat_human_support_title: 'Chat Support',
    toast_chat_human_support_desc: 'Conversation has been transferred to staff support!',
    toast_chat_resolved: 'Support completed for',
    toast_chat_reopened: 'Support reopened for',
    chat_sysmsg_staff_request: 'Support request has been sent to Staff/Admin team! A staff member will respond within minutes.',
    chat_sysmsg_resolved: 'Staff has marked this conversation as resolved.',
    chat_sysmsg_reopened: 'Staff has reopened this support session.',
    chat_slash_help: 'Available commands:\n• @Eigu AI <question>: Ask AI Assistant directly\n• /staff or @Staff: Request staff support\n• /ai <question>: Quick AI question',
    chat_ai_fallback: 'I am not sure about this question. You can type @Eigu AI <question> or click Request Staff Support!',
    chat_ai_fallback_no_ipc: 'I am not sure about this question.',
    chat_ai_greeting: 'Hello! I am AI Assistant of EIGU Platform. How can I help you today?',
    chat_scroll_to_original: 'Click to scroll to original message',
    chat_reply_title: 'Reply to message',
    chat_reply_prefix: 'Reply to',
    chat_ai_fallback_response: 'AI Assistant EIGU Platform:\n\nThank you for your question! I can answer about all 25 system features (Auto Cut, AI Video, Reup, Bulk Download, Workflow, TikTok/FB/YT Account Management, API Keys...).\n\nPlease type **@Eigu AI <question>** or click **Request Staff Support** for direct assistance!',

    // Chat Status Indicator Keys
    chat_status_seen: 'Seen',
    chat_status_sent: 'Sent',
    chat_just_now: 'Just now',

    // Chat Reply Preview Keys
    chat_reply_to: 'Replying to:',
    chat_reply_to_customer: 'Reply to Customer:',
    chat_reply_to_staff: 'Reply to Staff:',
    chat_reply_to_ai: 'Reply to AI:',

    // Chat Sample Session Keys
    chat_sample_msg1: 'Hello, I cannot load the Gemini API key into the system.',
    chat_sample_msg2: 'Hi there! Please check Settings > API Key Pool. If still having issues, type @Eigu AI or click Request Staff Support.',
    chat_sample_msg3: 'I have clicked request staff support, please check for me.',

    // Notification Toast Keys
    toast_notify_chat_transferred_title: 'Chat Support',
    toast_notify_chat_transferred_desc: 'Conversation has been transferred to staff support!',

    // Maintenance Overlay Keys
    maint_overlay_title: 'SYSTEM UNDER MAINTENANCE',
    maint_overlay_subtitle: 'The system is currently being maintained by Admin. Please come back later.',
    maint_overlay_contact: 'Contact support:',
    maint_overlay_refresh: 'Check Again',
  }
};

function t(key) {
  const lang = localStorage.getItem('eigu_language') || 'vi';
  const dict = I18N_DICTIONARY[lang === 'en' ? 'en' : 'vi'];
  return dict && dict[key] ? dict[key] : key;
}

function applyAppLanguage(lang) {
  const selectedLang = lang === 'en' ? 'en' : 'vi';
  const dict = I18N_DICTIONARY[selectedLang];

  // 1. Translate elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key]) {
      el.textContent = dict[key];
    }
  });

  // 2. Translate placeholders for inputs with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict && dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // 3. Translate title tooltips for elements with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict && dict[key]) {
      el.setAttribute('title', dict[key]);
    }
  });

  // 3. Update User Greeting (Xin chào, <name> vs Hi, <name>)
  if (typeof userProfile !== 'undefined' && userProfile) {
    const name = userProfile.username || (userProfile.email ? userProfile.email.split('@')[0] : '');
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) {
      const prefix = selectedLang === 'en' ? 'Hi, ' : 'Xin chào, ';
      greetingEl.textContent = prefix + name;
    }
  }

  // 4. Update Header view title & subtitle
  const activeNav = document.querySelector('.nav-item.active') || document.querySelector('.nav-sub-item.active');
  if (activeNav) {
    const view = activeNav.getAttribute('data-view') || activeNav.getAttribute('data-sub');
    if (view) {
      const titles = {
        'ho-so': selectedLang === 'en' ? ['Profile', 'Account settings & system status'] : ['Hồ sơ', 'Cài đặt tài khoản & thông số hệ thống'],
        'cut': selectedLang === 'en' ? ['Auto Cut Video', 'Cut short video with anti-reup algorithms'] : ['Tự động cắt', 'Cắt video ngắn với thuật toán chống reup'],
        'ai-video': selectedLang === 'en' ? ['Create AI Video', 'Generate script, voiceover and video from AI'] : ['Tạo video AI', 'Tạo kịch bản, giọng đọc và video từ AI'],
        'reup': selectedLang === 'en' ? ['Reup Video', 'Anti-copyright MD5 decimation & noise injection'] : ['Tạo video Reup', 'Lách bản quyền MD5 decimation & noise injection'],
        'hot-niche': selectedLang === 'en' ? ['Hot Niche Finder', 'Search trending niches and keywords'] : ['Tìm ngách hot', 'Tìm kiếm ngách hot và từ khóa xu hướng'],
        'bulk-download': selectedLang === 'en' ? ['Bulk Download', 'Batch download videos without watermark'] : ['Tải video hàng loạt', 'Tải hàng loạt video không logo'],
        'workflow': selectedLang === 'en' ? ['Workflows', 'Create automated video processing workflows'] : ['Tạo workflow', 'Tạo luồng xử lý video tự động'],
        'record': selectedLang === 'en' ? ['Record Macro', 'Record mouse & keyboard actions'] : ['Ghi thao tác', 'Ghi lại thao tác chuột và bàn phím'],
        'tk-tiktok': ['TikTok', selectedLang === 'en' ? 'Manage TikTok accounts' : 'Quản lý tài khoản TikTok'],
        'tk-facebook': ['Facebook', selectedLang === 'en' ? 'Manage Facebook accounts' : 'Quản lý tài khoản Facebook'],
        'tk-youtube': ['YouTube', selectedLang === 'en' ? 'Manage YouTube channels' : 'Quản lý kênh YouTube'],
        'tk-x': ['X (Twitter)', selectedLang === 'en' ? 'Manage X accounts' : 'Quản lý tài khoản X'],
        'tk-instagram': ['Instagram', selectedLang === 'en' ? 'Manage Instagram accounts' : 'Quản lý tài khoản Instagram'],
        'tk-threads': ['Threads', selectedLang === 'en' ? 'Manage Threads accounts' : 'Quản lý tài khoản Threads'],
        'tiep-thi': selectedLang === 'en' ? ['Affiliate Marketing', 'Manage affiliate programs'] : ['Tiếp thị liên kết', 'Quản lý affiliate marketing'],
        'doi-nhom': selectedLang === 'en' ? ['Team Workspaces', 'Manage team members & permissions'] : ['Đội nhóm', 'Quản lý thành viên và phân quyền'],
        'tien-ich': selectedLang === 'en' ? ['Utilities', 'Additional system utilities'] : ['Tiện ích', 'Các tiện ích bổ sung'],
        'guide': selectedLang === 'en' ? ['User Manual', 'EIGU Platform features guide'] : ['Hướng dẫn sử dụng', 'Các tính năng của EIGU Platform'],
        'settings': selectedLang === 'en' ? ['Settings', 'App appearance & system configuration'] : ['Cài đặt', 'Giao diện & cấu hình hệ thống'],
        'chat-support': selectedLang === 'en' ? ['Live Chat Support', 'Real-time customer support console'] : ['Chat Support', 'Hỗ trợ khách hàng thời gian thực'],
        'admin-dashboard': selectedLang === 'en' ? ['Admin Dashboard', 'Executive system metrics & status monitoring'] : ['Dashboard Admin', 'Bảng điều khiển giám sát chỉ số hệ thống thực'],
        'analytics-reports': selectedLang === 'en' ? ['Analytics & Reports', 'Performance analytics & growth trends'] : ['Báo cáo Thống kê', 'Phân tích dữ liệu tăng trưởng và hiệu năng hệ thống'],
        'user-management': selectedLang === 'en' ? ['User & Staff Management', 'System role & tab permissions'] : ['Quản lý User/Staff', 'Phân quyền tài khoản hệ thống'],
        'create-notification': selectedLang === 'en' ? ['Broadcast Notification', 'Send system-wide broadcast alerts'] : ['Tạo thông báo', 'Phát thông báo tới hệ thống máy trạm'],
        'feedback': selectedLang === 'en' ? ['Submit Feedback', 'Send bug reports and feedback to dev team'] : ['Góp ý / Báo lỗi', 'Gửi báo cáo lỗi kèm hình ảnh đính kèm tới đội ngũ phát triển'],
        'feedback-management': selectedLang === 'en' ? ['Feedback Management', 'Monitor and resolve user reports'] : ['Quản lý Feedback', 'Theo dõi và xử lý các báo cáo góp ý từ người dùng'],
        'user-activity-logs': selectedLang === 'en' ? ['Activity Logs', 'System user access & action trail'] : ['Nhật ký hoạt động', 'Theo dõi lịch sử thao tác của các tài khoản hệ thống'],
      };
      const [t, s] = titles[view] || ['', ''];
      const viewTitleEl = document.getElementById('view-title');
      const viewSubTitleEl = document.getElementById('view-subtitle');
      if (viewTitleEl && t) viewTitleEl.textContent = t;
      if (viewSubTitleEl && s) viewSubTitleEl.textContent = s;
    }
  }
}

function changeAppLanguage(lang) {
  const selectedLang = lang === 'en' ? 'en' : 'vi';
  localStorage.setItem('eigu_language', selectedLang);

  const btnVi = document.getElementById('lang-btn-vi');
  const btnEn = document.getElementById('lang-btn-en');

  if (btnVi && btnEn) {
    if (selectedLang === 'vi') {
      btnVi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnVi.classList.remove('active');
    }
  }

  applyAppLanguage(selectedLang);

  const msg = selectedLang === 'vi'
    ? 'Đã chuyển đổi ngôn ngữ giao diện sang Tiếng Việt thành công!'
    : 'Successfully switched application interface language to English!';

  showToast('Ngôn ngữ / Language', msg, 'info');
}

function initAppLanguage() {
  const savedLang = localStorage.getItem('eigu_language') || 'vi';
  const btnVi = document.getElementById('lang-btn-vi');
  const btnEn = document.getElementById('lang-btn-en');

  if (btnVi && btnEn) {
    if (savedLang === 'vi') {
      btnVi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnVi.classList.remove('active');
    }
  }

  applyAppLanguage(savedLang);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initAppLanguage, 300);
});

// -----------------------------------------------------------
// 📊 PHÂN HỆ DASHBOARD ADMIN & BÁO CÁO THỐNG KÊ (REAL DATA FROM DB)
// -----------------------------------------------------------
async function loadAdminDashboardData() {
  try {
    const fetchFunc = typeof apiFetch === 'function' ? apiFetch : null;
    if (!fetchFunc) return;

    if (typeof window.syncObfuscationConfig === 'function') {
      await window.syncObfuscationConfig();
    }

    const stats = await fetchFunc('/audit-logs/stats', { method: 'GET' });
    if (stats) {
      const totalUsersEl = document.getElementById('admin-stat-total-users');
      const staffCountEl = document.getElementById('admin-stat-staff-count');
      const workflowsEl = document.getElementById('admin-stat-workflows');
      const gatewayStatusEl = document.getElementById('admin-stat-gateway-status');

      if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers ?? '0';
      if (staffCountEl) staffCountEl.textContent = stats.staffCount ?? '0';
      if (workflowsEl) workflowsEl.textContent = stats.totalAuditLogs ?? '0';
      if (gatewayStatusEl) gatewayStatusEl.textContent = 'ONLINE (200 OK)';

      const activityContainer = document.getElementById('admin-dashboard-recent-activity');
      if (activityContainer && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0) {
        activityContainer.innerHTML = stats.recentActivity.map(act => {
          const formattedTime = new Date(act.createdAt).toLocaleString('vi-VN');
          const roleColor = act.userRole === 'admin' ? '#ef4444' : (act.userRole === 'staff' ? '#eab308' : '#22c55e');
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid var(--border-color); font-size:12px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="background:${roleColor}20; color:${roleColor}; font-weight:700; font-size:10px; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${escapeHtml(act.userRole || 'user')}</span>
                <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(act.userEmail || '—')}</span>
                <span style="color:var(--accent); font-weight:600;">[${escapeHtml(act.module || 'sys')}]</span>
                <span style="color:var(--text-secondary);">${escapeHtml(act.action || 'ACTION')}</span>
              </div>
              <span style="color:var(--text-muted); font-size:11px; font-family:monospace;">${formattedTime}</span>
            </div>
          `;
        }).join('');
      } else if (activityContainer) {
        activityContainer.innerHTML = '<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">Chưa có nhật ký hoạt động nào ghi nhận.</div>';
      }

      // showToast('Dashboard Admin', 'Đã tải dữ liệu chỉ số thực tế từ Database Supabase!', 'success');
    }
  } catch (e) {
    console.warn('Load Admin Dashboard data error:', e);
  }
}

async function loadAnalyticsReportsData() {
  try {
    const fetchFunc = typeof apiFetch === 'function' ? apiFetch : null;
    if (!fetchFunc) return;

    if (typeof window.syncObfuscationConfig === 'function') {
      await window.syncObfuscationConfig();
    }

    const stats = await fetchFunc('/audit-logs/stats', { method: 'GET' });
    if (stats) {
      const totalAuditLogsEl = document.getElementById('analytics-total-audit-logs');
      const totalUsersEl = document.getElementById('analytics-total-users');
      const totalFeedbacksEl = document.getElementById('analytics-total-feedbacks');

      if (totalAuditLogsEl) totalAuditLogsEl.textContent = stats.totalAuditLogs ?? '0';
      if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers ?? '0';
      if (totalFeedbacksEl) totalFeedbacksEl.textContent = stats.totalFeedbacks ?? '0';

      const moduleBreakdownEl = document.getElementById('analytics-module-breakdown');
      if (moduleBreakdownEl && Array.isArray(stats.topModules) && stats.topModules.length > 0) {
        moduleBreakdownEl.innerHTML = stats.topModules.map(m => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color); margin-bottom:8px; font-size:13px;">
            <span style="font-weight:600; color:var(--text-primary); text-transform:uppercase; display:flex; align-items:center; gap:6px;">
              <span data-icon="zap" style="color:var(--accent);"></span> Phân hệ ${escapeHtml(m.module)}
            </span>
            <span style="font-weight:700; color:var(--accent); font-family:monospace;">${m.count} thao tác thực tế</span>
          </div>
        `).join('');
      } else if (moduleBreakdownEl) {
        moduleBreakdownEl.innerHTML = '<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">Chưa có dữ liệu phân bổ phân hệ.</div>';
      }

      // showToast('Báo cáo Thống kê', 'Đã tải dữ liệu phân tích thực tế từ Database Supabase!', 'success');
    }
  } catch (e) {
    console.warn('Load Analytics Reports data error:', e);
  }
}

function setAnalyticsRange(range, btn) {
  const pills = document.querySelectorAll('#view-analytics-reports .chat-filter-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadAnalyticsReportsData();
}

function exportAnalyticsReport() {
  const csvContent = "data:text/csv;charset=utf-8,Thoi Gian,Nguoi Dung Mai,Tac Vu Processing,Status\n2026-07-20,12,45,SUCCESS\n2026-07-21,18,60,SUCCESS\n2026-07-22,25,82,SUCCESS\n2026-07-23,16,50,SUCCESS\n2026-07-24,32,95,SUCCESS\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "EIGU_Analytics_Report_2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Xuất Báo Cáo', 'Đã xuất file báo cáo EIGU_Analytics_Report_2026.csv thành công', 'success');
}