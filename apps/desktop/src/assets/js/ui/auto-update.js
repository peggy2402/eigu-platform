// Auto Update Management Logic (VS Code & Modern Enterprise Modal style)

let CURRENT_VERSION = '1.0.8';
let latestVersionInfo = null;
let isUpdateReadyToInstall = false;

// Safe IPC Resolver to ensure window.ipcRenderer works across all renderer context models
function getIpcRenderer() {
  if (typeof window !== 'undefined' && window.ipcRenderer) {
    return window.ipcRenderer;
  }
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      if (ipcRenderer) {
        window.ipcRenderer = ipcRenderer;
        return ipcRenderer;
      }
    } catch (e) {
      console.warn('[AutoUpdate Debug] Could not require electron ipcRenderer:', e);
    }
  }
  return null;
}

async function updateVersionBadge() {
  const ipc = getIpcRenderer();
  if (ipc && typeof ipc.invoke === 'function') {
    try {
      const ver = await ipc.invoke('get-app-version');
      if (ver) {
        CURRENT_VERSION = ver;
        console.log(`[AutoUpdate Debug] App version fetched via IPC: v${CURRENT_VERSION}`);
      }
    } catch (e) {
      console.warn('[AutoUpdate Debug] Failed to invoke get-app-version via IPC:', e);
    }
  } else {
    console.log(`[AutoUpdate Debug] Running with static version fallback: v${CURRENT_VERSION}`);
  }

  const badge = document.getElementById('app-version-badge');
  if (badge) {
    badge.textContent = `v${CURRENT_VERSION}`;
  }
}

function ensureUpdateModalDOM() {
  if (document.getElementById('update-modal-overlay')) return;

  const modalHtml = `
    <div id="update-modal-overlay" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: var(--bg-card, #1e1e2d); border: 1px solid var(--border-color, rgba(255,255,255,0.12)); border-radius: 18px; width: 460px; max-width: 92vw; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 18px; animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); box-sizing: border-box;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div style="min-width: 0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary, #ffffff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-i18n="update_modal_title">Phát Hành Bản Cập Nhật Mới</h3>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-secondary, #94a3b8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="update-modal-sub-text">Đã có bản cập nhật mới sẵn sàng nâng cấp</p>
            </div>
          </div>
          <button type="button" onclick="closeUpdateModal()" style="background: transparent; border: none; color: var(--text-secondary, #94a3b8); cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Version Pills -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.06)); padding: 12px 16px; border-radius: 12px;">
          <div style="font-size: 13px; color: var(--text-secondary, #94a3b8);">
            Phiên bản hiện tại: <span id="update-modal-current-ver" style="font-weight: 700; color: var(--text-primary, #fff);">v${CURRENT_VERSION}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.25); padding: 4px 12px; border-radius: 20px;" id="update-modal-target-ver">
            v${latestVersionInfo ? latestVersionInfo.version : 'New'}
          </div>
        </div>

        <!-- Release Notes Content -->
        <div>
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary, #94a3b8); margin-bottom: 8px;" data-i18n="update_release_notes_label">Nội dung cập nhật & cải tiến:</div>
          <div id="update-modal-notes" style="font-size: 13px; color: var(--text-primary, #e2e8f0); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color, rgba(255,255,255,0.05)); padding: 14px; border-radius: 12px; max-height: 160px; overflow-y: auto; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
            Đã có phiên bản cập nhật mới trên EIGU Platform với nhiều tính năng nâng cấp và sửa lỗi hệ thống.
          </div>
        </div>

        <!-- Responsive Equal-Width Action Buttons -->
        <div style="display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 4px; box-sizing: border-box;">
          <button type="button" class="btn-outline" onclick="closeUpdateModal()" style="flex: 1; width: 50%; padding: 12px 16px; font-size: 13.5px; font-weight: 600; border-radius: 12px; margin: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; text-align: center; box-sizing: border-box;" data-i18n="update_btn_later">
            Để sau
          </button>
          <button type="button" id="update-modal-confirm-btn" class="btn-primary" onclick="executeAppUpdate()" style="flex: 1; width: 50%; padding: 12px 16px; font-size: 13.5px; font-weight: 700; border-radius: 12px; margin: 0; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; text-align: center; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); box-sizing: border-box;" data-i18n="update_btn_now">
            Cập nhật ngay
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openUpdateModal() {
  ensureUpdateModalDOM();

  const overlay = document.getElementById('update-modal-overlay');
  const currentVerEl = document.getElementById('update-modal-current-ver');
  const targetVerEl = document.getElementById('update-modal-target-ver');
  const notesEl = document.getElementById('update-modal-notes');
  const confirmBtn = document.getElementById('update-modal-confirm-btn');

  if (currentVerEl) currentVerEl.textContent = `v${CURRENT_VERSION}`;

  if (latestVersionInfo) {
    if (targetVerEl) targetVerEl.textContent = `v${latestVersionInfo.version}`;
    if (notesEl) notesEl.textContent = latestVersionInfo.releaseNotes || `Phiên bản mới v${latestVersionInfo.version} đã phát hành trên EIGU Platform.`;
  }

  if (confirmBtn) {
    if (isUpdateReadyToInstall) {
      confirmBtn.textContent = 'Khởi động lại để cập nhật';
      confirmBtn.style.background = '#10b981';
    } else {
      confirmBtn.textContent = 'Cập nhật ngay';
      confirmBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
    }
  }

  if (overlay) overlay.classList.remove('hidden');
}

function closeUpdateModal() {
  const overlay = document.getElementById('update-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function executeAppUpdate() {
  closeUpdateModal();
  const ipc = getIpcRenderer();

  if (isUpdateReadyToInstall) {
    if (ipc) {
      ipc.send('quit-and-install-update');
    }
    return;
  }

  if (latestVersionInfo) {
    showToast('Cập nhật hệ thống', 'Đang tự động kiểm tra và tải bản nâng cấp ngầm...', 'info');
    if (ipc && typeof ipc.invoke === 'function') {
      ipc.invoke('check-for-updates');
    } else {
      window.open(latestVersionInfo.url, '_blank');
    }
  }
}

function handleAppUpdateClick(e) {
  if (e) e.stopPropagation();
  openUpdateModal();
}

async function checkForUpdates() {
  const btn = document.getElementById('update-badge-btn');
  await updateVersionBadge();

  const ipc = getIpcRenderer();

  // 1. Kích hoạt autoUpdater trong Main process nếu đang ở môi trường Electron App
  if (ipc && typeof ipc.invoke === 'function') {
    try {
      ipc.invoke('check-for-updates');
    } catch (e) {
      console.warn('[AutoUpdate Debug] IPC check-for-updates failed:', e);
    }
  }

  // 2. Fallback kiểm tra trực tiếp GitHub API (để luôn cập nhật UI ngay lập tức)
  try {
    console.log('[AutoUpdate Debug] Fetching latest release info from GitHub API...');
    const res = await fetch('https://api.github.com/repos/peggy2402/eigu-platform/releases/latest', {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    if (res.status === 403 || res.status === 429) {
      console.warn(`[AutoUpdate Debug] GitHub API Rate limit hit (Status: ${res.status}). Will rely on main process autoUpdater.`);
      return;
    }

    if (!res.ok) {
      console.warn(`[AutoUpdate Debug] GitHub API returned HTTP ${res.status}: ${res.statusText}`);
      if (btn && !isUpdateReadyToInstall) btn.classList.add('hidden');
      return;
    }

    const data = await res.json();
    if (!data || !data.tag_name) {
      console.warn('[AutoUpdate Debug] GitHub API response missing tag_name');
      if (btn && !isUpdateReadyToInstall) btn.classList.add('hidden');
      return;
    }

    const remoteVersion = data.tag_name.replace(/^v/, '');
    console.log(`[AutoUpdate Debug] Latest remote version: v${remoteVersion} (Local: v${CURRENT_VERSION})`);

    latestVersionInfo = {
      version: remoteVersion,
      url: data.html_url || 'https://github.com/peggy2402/eigu-platform/releases/latest',
      releaseNotes: data.body || `Phiên bản mới v${remoteVersion} đã phát hành trên EIGU Platform.`,
    };

    if (isNewerVersion(latestVersionInfo.version, CURRENT_VERSION)) {
      console.log(`[AutoUpdate Debug] Newer version detected: v${remoteVersion} > v${CURRENT_VERSION}`);
      if (btn) {
        btn.classList.remove('hidden');
        if (!isUpdateReadyToInstall) {
          btn.textContent = 'Update';
        }
      }

      // Tự động mở Modal Popup cập nhật giữa màn hình cho phiên bản mới này nếu chưa hiển thị trong phiên
      const sessionKey = `eigu_update_modal_shown_v${remoteVersion}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        openUpdateModal();
      }
    } else {
      console.log(`[AutoUpdate Debug] Local version v${CURRENT_VERSION} is up to date.`);
      if (btn && !isUpdateReadyToInstall) {
        btn.classList.add('hidden');
      }
    }
  } catch (err) {
    console.warn('[AutoUpdate Debug] Check GitHub release failed:', err);
    if (btn && !isUpdateReadyToInstall) btn.classList.add('hidden');
  }
}

function isNewerVersion(newVer, oldVer) {
  const n = String(newVer).split('.').map(Number);
  const o = String(oldVer).split('.').map(Number);
  for (let i = 0; i < Math.max(n.length, o.length); i++) {
    const nv = n[i] || 0;
    const ov = o[i] || 0;
    if (nv > ov) return true;
    if (nv < ov) return false;
  }
  return false;
}

// Wire IPC event listeners from main process autoUpdater
const ipc = getIpcRenderer();
if (ipc) {
  ipc.on('update-status', (event, data) => {
    const btn = document.getElementById('update-badge-btn');
    if (!data) return;

    console.log(`[AutoUpdate Debug] IPC update-status event received:`, data);

    if (data.type === 'available') {
      showToast('Cập nhật hệ thống', `Đã phát hiện bản mới v${data.version}. Đang tự động tải ngầm...`, 'info');
      if (btn) {
        btn.classList.remove('hidden');
        btn.textContent = 'Downloading...';
      }
    } else if (data.type === 'downloading') {
      if (btn && data.percent) {
        btn.classList.remove('hidden');
        btn.textContent = `Downloading ${Math.round(data.percent)}%`;
      }
    } else if (data.type === 'downloaded') {
      isUpdateReadyToInstall = true;
      if (data.version) {
        latestVersionInfo = {
          version: data.version,
          releaseNotes: data.releaseNotes || `Bản nâng cấp v${data.version} đã tải về hoàn tất.`
        };
      }
      showToast('Cập nhật hoàn tất', `Bản nâng cấp v${data.version} đã sẵn sàng. Bấm nút Update để tự động restart & cài đặt!`, 'success');
      if (btn) {
        btn.classList.remove('hidden');
        btn.textContent = 'Update';
        btn.style.background = '#10b981';
      }
      openUpdateModal();
    } else if (data.type === 'error') {
      console.warn('[AutoUpdate Debug] autoUpdater error / skipped:', data.error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateVersionBadge();
  checkForUpdates();
});
