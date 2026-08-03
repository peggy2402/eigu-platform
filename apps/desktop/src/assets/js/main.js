function updateProfile() {
  if (userProfile) {
    const emailEl = document.getElementById('profile-email');
    if (emailEl) {
      if ('value' in emailEl) emailEl.value = userProfile.email || '';
      else emailEl.textContent = userProfile.email || '—';
    }

    const usernameInput = document.getElementById('profile-input-username');
    if (usernameInput) {
      usernameInput.value = userProfile.username || '';
    }

    const displayNameEl = document.getElementById('profile-display-name');
    if (displayNameEl) {
      displayNameEl.textContent = userProfile.username || userProfile.email.split('@')[0];
    }

    const avatarCharEl = document.getElementById('profile-avatar-char');
    if (avatarCharEl) {
      const nameStr = userProfile.username || userProfile.email || 'U';
      avatarCharEl.textContent = nameStr.charAt(0).toUpperCase();
    }

    const emailSubEl = document.getElementById('profile-email-sub');
    if (emailSubEl) {
      emailSubEl.textContent = userProfile.email || '—';
    }

    const balanceValEl = document.getElementById('profile-balance-val');
    if (balanceValEl) {
      const balance = Number(userProfile.balance || 0);
      balanceValEl.textContent = balance.toLocaleString('vi-VN') + 'đ';
    }

    const verifiedEl = document.getElementById('profile-verified');
    if (verifiedEl) {
      verifiedEl.textContent = userProfile.isVerified ? '✓ Đã xác thực' : '⚠️ Chưa xác thực';
    }

    const name = userProfile.username || userProfile.email.split('@')[0];
    const currentLang = localStorage.getItem('eigu_language') || 'vi';
    const greetingPrefix = currentLang === 'en' ? 'Hi, ' : 'Xin chào, ';
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) greetingEl.textContent = greetingPrefix + name;

    // Role badges (Header & Profile View)
    if (userProfile.role) {
      const roleMap = {
        admin: { label: 'Quản trị', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' },
        staff: { label: 'Nhân viên', bg: 'rgba(234, 179, 8, 0.18)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)' },
        user:  { label: 'Thành viên', bg: 'rgba(34, 197, 94, 0.18)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)' },
      };
      const cfg = roleMap[userProfile.role] || roleMap.user;

      ['role-badge', 'profile-role-badge'].forEach(badgeId => {
        const badgeEl = document.getElementById(badgeId);
        if (badgeEl) {
          badgeEl.textContent = cfg.label;
          badgeEl.style.background = cfg.bg;
          badgeEl.style.color = cfg.color;
          badgeEl.style.border = cfg.border;
        }
      });
    }

    // Header User Balance
    const headerBalanceEl = document.getElementById('header-user-balance');
    if (headerBalanceEl) {
      const balance = Number(userProfile.balance || 0);
      headerBalanceEl.textContent = balance.toLocaleString('vi-VN') + 'đ';
    }

    // Phân quyền cho phần Cài đặt API & Telemetry (Chỉ Admin)
    if (typeof loadAdminApiConfig === 'function') {
      loadAdminApiConfig();
    }

    // Phân quyền hiển thị Sidebar Tabs cho Admin & Staff
    document.querySelectorAll('.staff-only').forEach(el => {
      if (userProfile.role === 'admin' || userProfile.role === 'staff') {
        el.style.display = '';
      } else {
        el.style.display = 'none';
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

  // Kiểm tra bảo trì hệ thống trước khi cho vào app
  if (typeof checkMaintenanceOnLogin === 'function') {
    const isMaintenance = await checkMaintenanceOnLogin();
    if (isMaintenance) {
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'none';
      return;
    }
  }

  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';
  addLog('[SYSTEM] Dang nhap thanh cong.');
  if (showToastNotice) {
    showToast(t('toast_login_success_title'), t('toast_login_success_desc'), 'success');
  }
  if (!userProfile || !userProfile.createdAt) {
    try { userProfile = await apiFetch('/auth/me'); } catch (e) { }
  }
  updateProfile();
  if (typeof loadUserSubscriptionsDesktop === 'function') {
    loadUserSubscriptionsDesktop();
  }
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
          showToast(t('toast_notification'), t('toast_auto_unban_desc'), 'success');
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
  if (typeof syncObfuscationConfig === 'function') {
    await syncObfuscationConfig();
  }

  const token = typeof accessToken !== 'undefined' && accessToken ? accessToken : localStorage.getItem('accessToken');
  if (token) {
    try {
      userProfile = await apiFetch('/auth/me');
      enterApp(false); // Không bắn Toast khi F5 / Cmd+R / reload trang
      return;
    } catch (e) {
      if (e.data && e.data.isBanned) {
        showBannedScreen(e.data);
        return;
      }
      // Thử Silent Refresh nếu AccessToken hết hạn lúc khởi động
      if (typeof silentRefreshSession === 'function') {
        const refreshed = await silentRefreshSession();
        if (refreshed) {
          try {
            userProfile = await apiFetch('/auth/me');
            enterApp(false);
            return;
          } catch (e2) {}
        }
      }
    }
  }
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  showAuth('login');
}



async function refreshUserProfileDesktop() {
  try {
    if (typeof apiFetch === 'function') {
      const updated = await apiFetch('/auth/me');
      if (updated && updated.id) {
        userProfile = updated;
        if (typeof updateProfile === 'function') {
          updateProfile();
        }
      }
    }
  } catch (err) {
    console.warn('[ProfileRefresh] Failed to refresh profile:', err);
  }
}

// Auto background periodic profile balance sync every 12 seconds
setInterval(() => {
  if (typeof userProfile !== 'undefined' && userProfile && userProfile.id) {
    refreshUserProfileDesktop();
  }
}, 12000);

function toggleProfileMenu(e) {
  if (e) e.stopPropagation();
  const wrapper = document.querySelector('.profile-menu-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('open');
    if (wrapper.classList.contains('open')) {
      refreshUserProfileDesktop();
    }
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
    if (typeof closePricingModuleModal === 'function') closePricingModuleModal();
    if (typeof closePricingTierModal === 'function') closePricingTierModal();
    if (typeof closePricingBadgeModal === 'function') closePricingBadgeModal();
    if (typeof closeModulePricingModalDesktop === 'function') closeModulePricingModalDesktop();

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
  showToast(t('toast_network_online_title'), t('toast_network_online_desc'), 'success');
});
window.addEventListener('offline', () => {
  showToast(t('toast_network_offline_title'), t('toast_network_offline_desc'), 'error');
});
