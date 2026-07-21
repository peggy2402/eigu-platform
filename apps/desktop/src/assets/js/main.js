function updateProfile() {
  if (userProfile) {
    document.getElementById('profile-email').textContent = userProfile.email || '—';
    document.getElementById('profile-role').textContent = userProfile.role || '—';
    document.getElementById('profile-verified').textContent = userProfile.isVerified ? 'Da xac thuc' : 'Chua xac thuc';
    document.getElementById('profile-created').textContent = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN') : '—';
    const name = userProfile.username || userProfile.email.split('@')[0];
    document.getElementById('greeting-text').textContent = 'Xin chào, ' + name;

    // Phân quyền cho phần Cài đặt API
    const apiSettingsSection = document.getElementById('secure-api-settings-section');
    if (apiSettingsSection) {
      if (userProfile.role === 'admin' || userProfile.role === 'staff') {
        apiSettingsSection.style.display = 'block';
      } else {
        apiSettingsSection.style.display = 'none';
      }
    }

    // Phân quyền hiển thị Sidebar Tabs cho Admin & Staff
    document.querySelectorAll('.staff-only').forEach(el => {
      if (userProfile.role === 'admin' || userProfile.role === 'staff') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    document.querySelectorAll('.admin-only').forEach(el => {
      if (userProfile.role === 'admin') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    // Ẩn Floating Live Chat Widget đối với Role Staff và Admin (vì đã có Tab Chat Support)
    const liveChatWidget = document.getElementById('live-chat-container');
    if (liveChatWidget) {
      if (userProfile.role === 'admin' || userProfile.role === 'staff') {
        liveChatWidget.style.display = 'none';
      } else {
        liveChatWidget.style.display = 'block';
      }
    }
  }
}

function broadcastAdminNotification() {
  const title = document.getElementById('admin-notif-title').value.trim();
  const content = document.getElementById('admin-notif-content').value.trim();
  const target = document.getElementById('admin-notif-target').value;
  const ttl = document.getElementById('admin-notif-ttl') ? document.getElementById('admin-notif-ttl').value : '24h';

  if (!title || !content) {
    showToast('Lỗi', 'Vui lòng nhập tiêu đề và nội dung thông báo!', 'error');
    return;
  }

  if (typeof addSystemNotification === 'function') {
    addSystemNotification(title, content, target, ttl);
  }
  showToast('Thành công', `Đã phát thông báo "${title}" (Hạn dùng: ${ttl})!`, 'success');
  document.getElementById('admin-notif-title').value = '';
  document.getElementById('admin-notif-content').value = '';
}

async function enterApp(showToastNotice = false) {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';
  addLog('[SYSTEM] Dang nhap thanh cong.');
  if (showToastNotice) {
    showToast('Đăng nhập thành công', 'Chào mừng bạn đến với EIGU Platform', 'success');
  }
  if (!userProfile || !userProfile.createdAt) {
    try { userProfile = await apiFetch('/auth/me'); } catch (e) { }
  }
  updateProfile();
}

async function checkAuth() {
  if (accessToken) {
    try {
      userProfile = await apiFetch('/auth/me');
      enterApp(false); // Không bắn Toast khi F5 / Cmd+R / reload trang
      return;
    } catch (e) { /* token expired */ }
  }
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  showAuth('login');
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
    if (typeof closeTabConfigModal === 'function') closeTabConfigModal();

    const chatBox = document.getElementById('live-chat-box');
    if (chatBox && !chatBox.classList.contains('hidden')) {
      chatBox.classList.add('hidden');
      chatBox.style.display = 'none';
      if (typeof isChatOpen !== 'undefined') isChatOpen = false;
    }

    const overlay = document.getElementById('search-popup-overlay');
    if (overlay && !overlay.classList.contains('hidden')) closeSearchPopup();

    const notifDrawer = document.getElementById('notif-drawer');
    if (notifDrawer) notifDrawer.classList.add('hidden');

    const profileMenu = document.querySelector('.profile-menu-wrapper');
    if (profileMenu) profileMenu.classList.remove('open');
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
