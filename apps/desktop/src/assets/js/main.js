function updateProfile() {
  if (userProfile) {
    document.getElementById('profile-email').textContent = userProfile.email || '—';
    document.getElementById('profile-role').textContent = userProfile.role || '—';
    document.getElementById('profile-verified').textContent = userProfile.isVerified ? 'Da xac thuc' : 'Chua xac thuc';
    document.getElementById('profile-created').textContent = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN') : '—';
    const name = userProfile.username || userProfile.email.split('@')[0];
    document.getElementById('greeting-text').textContent = 'Xin chào, ' + name;
  }
}

async function enterApp() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';
  addLog('[SYSTEM] Dang nhap thanh cong.');
  showToast('Đăng nhập thành công', 'Chào mừng bạn đến với EIGU Platform', 'success');
  if (!userProfile) {
    try { userProfile = await apiFetch('/auth/me'); } catch (e) { }
  }
  updateProfile();
}

async function checkAuth() {
  if (accessToken) {
    try {
      userProfile = await apiFetch('/auth/me');
      enterApp();
      return;
    } catch (e) { /* token expired */ }
  }
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  showAuth('login');
}

function handleLogout() {
  localStorage.removeItem('eigu_token');
  localStorage.removeItem('eigu_user');
  showToast('Đã đăng xuất', 'Bạn đã đăng xuất khỏi hệ thống.', 'info');
  setTimeout(() => location.reload(), 1000);
}

function toggleProfileMenu(e) {
  if (e) e.stopPropagation();
  const wrapper = document.querySelector('.profile-menu-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('open');
  }
}

// Close profile menu when clicking outside
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.profile-menu-wrapper');
  if (wrapper && wrapper.classList.contains('open') && !wrapper.contains(e.target)) {
    wrapper.classList.remove('open');
  }
});

function openSearchPopup() {
  document.getElementById('search-popup-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('search-popup-input').focus(), 50);
}

function closeSearchPopup(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('search-popup-overlay').classList.add('hidden');
}

addLog('[SYSTEM] EIGU Platform Desktop Client initialized.');
renderAutomation();
checkAuth();

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('search-popup-overlay');
    if (overlay.classList.contains('hidden')) {
      openSearchPopup();
    } else {
      closeSearchPopup();
    }
  }
  if (e.key === 'Escape') {
    const overlay = document.getElementById('search-popup-overlay');
    if (!overlay.classList.contains('hidden')) closeSearchPopup();
  }
});

document.getElementById('search-popup-input').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  document.querySelectorAll('.search-result').forEach(el => {
    el.style.display = q === '' || el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth < 768) {
    if (!sidebar.classList.contains('collapsed')) {
      sidebar.classList.add('collapsed');
    }
  } else {
    if (sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
    }
  }
});

// Network Connectivity Validation
window.addEventListener('online', () => {
  showToast('Đã kết nối lại', 'Hệ thống đã kết nối mạng thành công.', 'success');
});
window.addEventListener('offline', () => {
  showToast('Mất kết nối', 'Hệ thống cần phải có mạng thì mới sử dụng được.', 'error');
});
