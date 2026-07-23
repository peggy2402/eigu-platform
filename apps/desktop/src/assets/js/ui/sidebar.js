function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleDropdown(el, e) {
  if (e) { e.stopPropagation(); }
  const sidebar = document.getElementById('sidebar');

  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}

function switchView(view, navEl, sub, e) {
  if (e) { e.stopPropagation(); }
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  if (navEl) {
    navEl.classList.add('active');
    if (sub) navEl.classList.add('open');
  }

  const titles = {
    'ho-so': ['Hồ sơ', 'Thông tin cá nhân'],
    'cut': ['Tự động cắt', 'Cắt và xử lý video tự động'],
    'ai-video': ['Tạo video AI', 'Sinh video bằng trí tuệ nhân tạo'],
    'hot-niche': ['Tìm ngách hot', 'Phân tích xu hướng thị trường'],
    'bulk-download': ['Tải video hàng loạt', 'Tải nhiều video cùng lúc'],
    'reup': ['Tạo video Reup', 'Tự động tải và đăng lại video'],
    'workflow': ['Tạo workflow', 'Thiết kế luồng xử lý tự động'],
    'record': ['Ghi thao tác', 'Ghi lại các thao tác trình duyệt'],
    'tai-khoan': ['Tài khoản', 'Quản lý tài khoản mạng xã hội'],
    'tk-tiktok': ['TikTok', 'Quản lý tài khoản TikTok'],
    'tk-facebook': ['Facebook', 'Quản lý tài khoản Facebook & Fanpage'],
    'tk-youtube': ['YouTube', 'Quản lý kênh YouTube'],
    'tk-x': ['X (Twitter)', 'Quản lý tài khoản X'],
    'tk-instagram': ['Instagram', 'Quản lý tài khoản Instagram'],
    'tk-threads': ['Threads', 'Quản lý tài khoản Threads'],
    'tiep-thi': ['Tiếp thị liên kết', 'Quản lý affiliate marketing'],
    'doi-nhom': ['Đội nhóm', 'Quản lý thành viên và phân quyền'],
    'tien-ich': ['Tiện ích', 'Các tiện ích bổ sung'],
    'guide': ['Hướng dẫn sử dụng', 'Các tính năng của EIGU Platform'],
    'settings': ['Cài đặt', 'Giao diện & cấu hình hệ thống'],
    'chat-support': ['Chat Support', 'Hỗ trợ khách hàng thời gian thực'],
    'user-management': ['Quản lý User/Staff', 'Phân quyền tài khoản hệ thống'],
    'create-notification': ['Tạo thông báo', 'Phát thông báo tới hệ thống máy trạm'],
    'feedback': ['Góp ý / Báo lỗi', 'Gửi báo cáo lỗi kèm hình ảnh đính kèm tới đội ngũ phát triển'],
    'feedback-management': ['Quản lý Feedback', 'Theo dõi và xử lý các báo cáo góp ý từ người dùng'],
  };
  const [t, s] = titles[view] || ['', ''];
  document.getElementById('view-title').textContent = t;
  document.getElementById('view-subtitle').textContent = s;

  document.querySelectorAll('.nav-sub-item').forEach(i => i.classList.remove('active'));
  if (sub) {
    const subEl = document.querySelector('.nav-sub-item[data-sub="' + sub + '"]');
    if (subEl) subEl.classList.add('active');
  }

  // Load API Keys if entering Settings view
  if (view === 'settings' && typeof loadApiKeys === 'function') {
    loadApiKeys();
  }

  // Load Real Database User Data if entering User Management view
  if (view === 'user-management' && typeof loadRealUserData === 'function') {
    loadRealUserData();
  }

  // Load Real Notification History if entering Notification Management view
  if (view === 'create-notification' && typeof loadAdminNotificationHistory === 'function') {
    loadAdminNotificationHistory();
  }

  // Load Real Feedback Data if entering Feedback Management view
  if (view === 'feedback-management' && typeof loadRealFeedbackData === 'function') {
    loadRealFeedbackData();
  }

  // Load Real Chat Console if entering Chat Support view
  if (view === 'chat-support') {
    if (typeof userProfile !== 'undefined' && userProfile && userProfile.role === 'user') {
      if (typeof toggleLiveChatWidget === 'function') toggleLiveChatWidget();
    } else if (typeof loadStaffChatConsole === 'function') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          loadStaffChatConsole();
        }, 30);
      });
    }
  }
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === '/') {
    e.preventDefault();
    toggleSidebar();
  }
});

// Dynamic positioning for collapsed sidebar submenus when hovering
document.addEventListener('mouseover', e => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar || !sidebar.classList.contains('collapsed')) return;
  const wrapper = e.target.closest('.nav-item-wrapper');
  if (wrapper) {
    const sub = wrapper.querySelector('.nav-sub');
    if (sub) {
      const rect = wrapper.getBoundingClientRect();
      const subHeight = sub.offsetHeight || 200;
      let topPos = rect.top;
      if (topPos + subHeight > window.innerHeight - 10) {
        topPos = Math.max(10, window.innerHeight - subHeight - 10);
      }
      sub.style.top = topPos + 'px';
    }
  }
});


