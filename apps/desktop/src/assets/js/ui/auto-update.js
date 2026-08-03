// Auto Update Management Logic (VS Code style)

const CURRENT_VERSION = '1.0.2';
let latestVersionInfo = null;

async function checkForUpdates() {
  const btn = document.getElementById('update-badge-btn');

  try {
    const res = await fetch('https://api.github.com/repos/peggy2402/eigu-platform/releases/latest', {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    if (!res.ok) {
      if (btn) btn.classList.add('hidden');
      return;
    }

    const data = await res.json();
    if (!data || !data.tag_name) {
      if (btn) btn.classList.add('hidden');
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
    } else if (btn) {
      btn.classList.add('hidden');
    }
  } catch (err) {
    console.warn('[AutoUpdate] Check release failed:', err);
    if (btn) btn.classList.add('hidden');
  }
}

function isNewerVersion(newVer, oldVer) {
  const n = newVer.split('.').map(Number);
  const o = oldVer.split('.').map(Number);
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

  if (!latestVersionInfo) return;

  if (confirm(`Đã có bản cập nhật mới (v${latestVersionInfo.version})!\n\n${latestVersionInfo.releaseNotes}\n\nBạn có muốn tự động tải & khởi chạy trình cài đặt mới (.exe / .dmg) ngay không?`)) {
    if (window.ipcRenderer) {
      showToast('Cập nhật', 'Hệ thống đang tự động tải bản nâng cấp...', 'info');
      window.ipcRenderer.send('download-and-install-update', latestVersionInfo.url);
    } else {
      window.open(latestVersionInfo.url, '_blank');
    }
  }
}

if (window.ipcRenderer) {
  window.ipcRenderer.on('update-status', (msg) => {
    showToast('Cập nhật hệ thống', msg, 'success');
  });
  window.ipcRenderer.on('update-error', (err) => {
    showToast('Lỗi cập nhật', err, 'error');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkForUpdates();
});
