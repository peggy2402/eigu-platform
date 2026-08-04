// Auto Update Management Logic (VS Code & Modern Enterprise Modal style)

let CURRENT_VERSION = '1.0.6';
let latestVersionInfo = null;
let isUpdateReadyToInstall = false;

async function updateVersionBadge() {
  try {
    if (window.ipcRenderer && typeof window.ipcRenderer.invoke === 'function') {
      const ver = await window.ipcRenderer.invoke('get-app-version');
      if (ver) CURRENT_VERSION = ver;
    }
  } catch (e) {
    // Silent fallback
  }

  const badge = document.getElementById('app-version-badge');
  if (badge) {
    badge.textContent = `v${CURRENT_VERSION}`;
  }
}

function ensureUpdateModalDOM() {
  if (document.getElementById('update-modal-overlay')) return;

  const modalHtml = `
    <div id="update-modal-overlay" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: var(--bg-card, #1e1e2d); border: 1px solid var(--border-color, rgba(255,255,255,0.12)); border-radius: 16px; width: 460px; max-width: 92vw; padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 20px; animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08)); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary, #ffffff);" data-i18n="update_modal_title">Phát Hành Bản Cập Nhật Mới</h3>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-secondary, #94a3b8);" id="update-modal-sub-text">Đã có bản cập nhật mới sẵn sàng nâng cấp</p>
            </div>
          </div>
          <button type="button" onclick="closeUpdateModal()" style="background: transparent; border: none; color: var(--text-secondary, #94a3b8); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Version Pills -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.06)); padding: 12px 16px; border-radius: 10px;">
          <div style="font-size: 13px; color: var(--text-secondary, #94a3b8);">
            Phiên bản hiện tại: <span id="update-modal-current-ver" style="font-weight: 700; color: var(--text-primary, #fff);">v1.0.3</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 4px 12px; border-radius: 20px;" id="update-modal-target-ver">
            v1.0.4
          </div>
        </div>

        <!-- Release Notes Content -->
        <div>
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary, #94a3b8); margin-bottom: 8px;" data-i18n="update_release_notes_label">Nội dung cập nhật & cải tiến:</div>
          <div id="update-modal-notes" style="font-size: 13px; color: var(--text-primary, #e2e8f0); background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-color, rgba(255,255,255,0.05)); padding: 14px; border-radius: 10px; max-height: 160px; overflow-y: auto; line-height: 1.6; white-space: pre-wrap;">
            Đã có phiên bản cập nhật mới trên EIGU Platform với nhiều tính năng nâng cấp và sửa lỗi hệ thống.
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 4px;">
          <button type="button" class="btn-outline" onclick="closeUpdateModal()" style="padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 10px; margin: 0; cursor: pointer;" data-i18n="update_btn_later">
            Để sau
          </button>
          <button type="button" id="update-modal-confirm-btn" class="btn-primary" onclick="executeAppUpdate()" style="padding: 10px 22px; font-size: 13px; font-weight: 700; border-radius: 10px; margin: 0; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);" data-i18n="update_btn_now">
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

  if (isUpdateReadyToInstall) {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('quit-and-install-update');
    }
    return;
  }

  if (latestVersionInfo) {
    showToast('Cập nhật hệ thống', 'Đang tự động kiểm tra và tải bản nâng cấp ngầm...', 'info');
    if (window.ipcRenderer && typeof window.ipcRenderer.invoke === 'function') {
      window.ipcRenderer.invoke('check-for-updates');
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

  // Nếu đang ở trong Electron app, ưu tiên kiểm tra qua main process autoUpdater
  if (window.ipcRenderer && typeof window.ipcRenderer.invoke === 'function') {
    try {
      window.ipcRenderer.invoke('check-for-updates');
    } catch (e) {
      console.warn('[AutoUpdate] IPC check-for-updates failed:', e);
    }
  }

  // Fallback kiểm tra trực tiếp GitHub API
  try {
    const res = await fetch('https://api.github.com/repos/peggy2402/eigu-platform/releases/latest', {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    if (!res.ok) {
      if (btn && !isUpdateReadyToInstall) btn.classList.add('hidden');
      return;
    }

    const data = await res.json();
    if (!data || !data.tag_name) {
      if (btn && !isUpdateReadyToInstall) btn.classList.add('hidden');
      return;
    }

    const remoteVersion = data.tag_name.replace(/^v/, '');

    latestVersionInfo = {
      version: remoteVersion,
      url: data.html_url || 'https://github.com/peggy2402/eigu-platform/releases/latest',
      releaseNotes: data.body || `Phiên bản mới v${remoteVersion} đã phát hành trên EIGU Platform.`,
    };

    if (isNewerVersion(latestVersionInfo.version, CURRENT_VERSION)) {
      if (btn) {
        btn.classList.remove('hidden');
        if (!isUpdateReadyToInstall) {
          btn.textContent = 'Update';
        }
      }

      // Tự động mở Modal Popup cập nhật giữa màn hình 1 lần trong phiên nếu chưa từng hiển thị
      if (!sessionStorage.getItem('eigu_update_modal_auto_shown')) {
        sessionStorage.setItem('eigu_update_modal_auto_shown', 'true');
        openUpdateModal();
      }
    } else if (btn && !isUpdateReadyToInstall) {
      btn.classList.add('hidden');
    }
  } catch (err) {
    console.warn('[AutoUpdate] Check GitHub release failed:', err);
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

if (window.ipcRenderer) {
  window.ipcRenderer.on('update-status', (event, data) => {
    const btn = document.getElementById('update-badge-btn');
    if (!data) return;

    if (data.type === 'available') {
      showToast('Cập nhật hệ thống', `Đã tìm thấy bản mới v${data.version}. Đang tải ngầm...`, 'info');
      if (btn) {
        btn.classList.remove('hidden');
        btn.textContent = 'Downloading...';
      }
    } else if (data.type === 'downloaded') {
      isUpdateReadyToInstall = true;
      showToast('Cập nhật hoàn tất', `Bản nâng cấp v${data.version} đã sẵn sàng. Click nút Update để khởi động lại!`, 'success');
      if (btn) {
        btn.classList.remove('hidden');
        btn.textContent = 'Restart to Update';
        btn.style.background = '#10b981';
      }
      openUpdateModal();
    } else if (data.type === 'error') {
      console.warn('[AutoUpdate] autoUpdater check skipped or artifact not found (will fallback to GitHub API):', data.error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateVersionBadge();
  checkForUpdates();
});
