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
    if (typeof showToast === 'function') showToast('Đã sao chép!', 'success');
  }).catch(() => {
    if (typeof showToast === 'function') showToast('Lỗi sao chép', 'error');
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