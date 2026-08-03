// Auto Update Management Logic (VS Code style)

let CURRENT_VERSION = '1.0.2';
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

    if (btn && isNewerVersion(latestVersionInfo.version, CURRENT_VERSION)) {
      btn.classList.remove('hidden');
      if (!isUpdateReadyToInstall) {
        btn.textContent = 'Update';
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

function handleAppUpdateClick(e) {
  if (e) e.stopPropagation();

  if (isUpdateReadyToInstall) {
    if (confirm('Bản nâng cấp mới đã sẵn sàng! Bạn có muốn khởi động lại ứng dụng để hoàn tất cập nhật ngay không?')) {
      if (window.ipcRenderer) {
        window.ipcRenderer.send('quit-and-install-update');
      }
    }
    return;
  }

  if (!latestVersionInfo) {
    checkForUpdates();
    return;
  }

  if (confirm(`Đã có bản cập nhật mới (v${latestVersionInfo.version})!\n\n${latestVersionInfo.releaseNotes}\n\nBạn có muốn tự động tải & nâng cấp ứng dụng ngay không?`)) {
    if (window.ipcRenderer) {
      showToast('Cập nhật', 'Đang tự động kiểm tra và tải bản nâng cấp ngầm...', 'info');
      window.ipcRenderer.invoke('check-for-updates');
    } else {
      window.open(latestVersionInfo.url, '_blank');
    }
  }
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
    } else if (data.type === 'error') {
      console.warn('[AutoUpdate] Error:', data.error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateVersionBadge();
  checkForUpdates();
});
