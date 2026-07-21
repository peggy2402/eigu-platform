// Auto Update Management Logic (VS Code style)

const CURRENT_VERSION = '1.0.0';
let latestVersionInfo = null;

function checkForUpdates() {
  const btn = document.getElementById('update-badge-btn');
  
  // Giả lập kiểm tra bản cập nhật mới từ server
  setTimeout(() => {
    // Giả định có bản v1.1.0 mới hơn v1.0.0
    latestVersionInfo = {
      version: '1.1.0',
      url: 'https://github.com/eigu/eigu-platform/releases/latest',
      releaseNotes: 'Phiên bản 1.1.0: Thêm tính năng Chat AI Support, Bể chứa API Key mã hóa và hệ thống thông báo realtime.'
    };

    if (btn && isNewerVersion(latestVersionInfo.version, CURRENT_VERSION)) {
      btn.classList.remove('hidden');
    }
  }, 3000);
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
