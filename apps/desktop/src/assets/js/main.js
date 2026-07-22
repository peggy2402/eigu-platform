function updateProfile() {
  if (userProfile) {
    document.getElementById('profile-email').textContent = userProfile.email || '—';
    document.getElementById('profile-role').textContent = userProfile.role || '—';
    document.getElementById('profile-verified').textContent = userProfile.isVerified ? 'Da xac thuc' : 'Chua xac thuc';
    document.getElementById('profile-created').textContent = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN') : '—';
    const name = userProfile.username || userProfile.email.split('@')[0];
    document.getElementById('greeting-text').textContent = 'Xin chào, ' + name;

    // Role badge
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge && userProfile.role) {
      const roleMap = {
        admin: { label: 'ADMIN', bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
        staff: { label: 'STAFF', bg: 'rgba(234,179,8,0.2)', color: '#eab308' },
        user:  { label: 'USER',  bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
      };
      const cfg = roleMap[userProfile.role] || roleMap.user;
      roleBadge.textContent = cfg.label;
      roleBadge.style.background = cfg.bg;
      roleBadge.style.color = cfg.color;
    }

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

    // Phân quyền Tab: dùng userProfile.hiddenTabs[] hoặc userProfile.tabPermissions[]
    let hiddenTabs = []; // danh sách tabKey bị ẩn
    if (userProfile.role !== 'admin' && userProfile.role !== 'staff') {
      if (Array.isArray(userProfile.hiddenTabs)) {
        hiddenTabs = userProfile.hiddenTabs;
      } else {
        const perms = userProfile.tabPermissions;
        if (perms && Array.isArray(perms) && perms.length > 0) {
          hiddenTabs = perms.filter(p => !p.visible).map(p => p.tabKey);
        }
      }
    }

    // Hàm phụ: ẩn/hiện một element
    function setTabVisibility(view, el) {
      if (!el) return;
      if (hiddenTabs.length > 0 && hiddenTabs.includes(view)) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }
    }

    // 1. Sidebar nav-item phẳng (ho-so, tiep-thi, doi-nhom, tien-ich, guide)
    document.querySelectorAll('.sidebar-nav > .nav-item[data-view]').forEach(el => {
      const view = el.getAttribute('data-view');
      if (!el.classList.contains('staff-only') && !el.classList.contains('admin-only')) {
        setTabVisibility(view, el);
      }
    });

    // 2. Sidebar nav-item-wrapper (cong-cu, tu-dong-hoa, tai-khoan)
    document.querySelectorAll('.sidebar-nav > .nav-item-wrapper').forEach(wrapper => {
      const navItem = wrapper.querySelector('.nav-item[data-view]');
      if (navItem) {
        const view = navItem.getAttribute('data-view');
        if (!navItem.classList.contains('staff-only') && !navItem.classList.contains('admin-only')) {
          setTabVisibility(view, wrapper);
        }
      }
    });

    // 2b. Sidebar nav-sub-item (cut, ai-video, workflow, record, tk-tiktok, tk-facebook, ...)
    document.querySelectorAll('.nav-sub-item[data-sub]').forEach(el => {
      const sub = el.getAttribute('data-sub');
      setTabVisibility(sub, el);
    });

    // 3. Profile dropdown (settings, feedback)
    document.querySelectorAll('#profile-dropdown .profile-menu-item').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      // Tìm tabKey trong onclick: switchView('settings', ...) hoặc switchView('feedback', ...)
      const m = onclick.match(/switchView\('([^']+)'/);
      if (m) {
        const view = m[1];
        setTabVisibility(view, el);
      }
    });

    // 4. Search popup results
    document.querySelectorAll('#search-popup-body .search-result').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      const m = onclick.match(/switchView\('([^']+)'/);
      if (m) {
        const view = m[1];
        setTabVisibility(view, el);
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

function closeBannedScreen() {
  if (typeof bannedCountdownInterval !== 'undefined' && bannedCountdownInterval) {
    clearInterval(bannedCountdownInterval);
    bannedCountdownInterval = null;
  }
  const overlay = document.getElementById('banned-screen-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
}

async function enterApp(showToastNotice = false) {
  closeBannedScreen();
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

let bannedCountdownInterval = null;

function showBannedScreen(banInfo) {
  closeBannedScreen();
  const overlay = document.getElementById('banned-screen-overlay');
  if (!overlay) return;

  const subtitleEl = document.getElementById('banned-screen-subtitle');
  const titleEl = document.getElementById('banned-countdown-title');
  const timerEl = document.getElementById('banned-countdown-timer');
  const reasonEl = document.getElementById('banned-screen-reason');

  const reason = banInfo?.banReason || banInfo?.data?.banReason || 'Vi phạm điều khoản dịch vụ hệ thống.';
  if (reasonEl) {
    reasonEl.textContent = reason;
  }

  if (bannedCountdownInterval) {
    clearInterval(bannedCountdownInterval);
    bannedCountdownInterval = null;
  }

  const bannedUntilStr = banInfo?.bannedUntil || banInfo?.data?.bannedUntil;

  if (bannedUntilStr) {
    const untilDate = new Date(bannedUntilStr);
    
    function updateCountdown() {
      const now = new Date();
      const diffMs = untilDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        if (timerEl) timerEl.textContent = '00 giờ 00 phút 00 giây';
        if (subtitleEl) subtitleEl.textContent = 'Hạn khóa tài khoản đã hết! Bạn có thể đăng nhập lại.';
        if (bannedCountdownInterval) clearInterval(bannedCountdownInterval);
        setTimeout(() => {
          overlay.classList.add('hidden');
          overlay.style.display = 'none';
          if (typeof handleLogout === 'function') handleLogout();
          showToast('Thông báo', 'Tài khoản của bạn đã được tự động gỡ khóa! Vui lòng đăng nhập lại.', 'success');
        }, 2000);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      if (timerEl) {
        timerEl.textContent = `${hStr} giờ ${mStr} phút ${sStr} giây`;
      }
      if (subtitleEl) {
        subtitleEl.textContent = `Tài khoản bị cấm tạm thời trong khoảng ${hours > 0 ? hours + ' giờ ' : ''}${minutes} phút`;
      }
    }

    if (titleEl) titleEl.textContent = 'Thời gian cấm còn lại';
    updateCountdown();
    bannedCountdownInterval = setInterval(updateCountdown, 1000);
  } else {
    // Vĩnh viễn
    if (titleEl) titleEl.textContent = 'TRẠNG THÁI KHÓA';
    if (timerEl) timerEl.textContent = 'KHÓA VĨNH VIỄN';
    if (subtitleEl) subtitleEl.textContent = 'Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm quy định.';
  }

  overlay.classList.remove('hidden');
  overlay.style.display = 'flex';
}

async function checkAuth() {
  if (accessToken) {
    try {
      userProfile = await apiFetch('/auth/me');
      enterApp(false); // Không bắn Toast khi F5 / Cmd+R / reload trang
      return;
    } catch (e) {
      if (e.data && e.data.isBanned) {
        showBannedScreen(e.data);
        return;
      }
    }
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
    if (typeof closeBanModal === 'function') closeBanModal();

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
