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
  console.log('[DEBUG switchView] Called with view:', view, 'sub:', sub, 'targetElement:', document.getElementById('view-' + view));
  if (e) { e.stopPropagation(); }
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) {
    target.classList.add('active');
    console.log('[DEBUG switchView] Activated #view-' + view, target);
  } else {
    console.error('[DEBUG switchView] Target element NOT FOUND: #view-' + view);
  }

  if (view === 'ai-studio' || view === 'ai-video') {
    console.log('[DEBUG switchView] Triggering AIVideoStudio.init("#studio-root") for view:', view);
    if (typeof AIVideoStudio !== 'undefined' && typeof AIVideoStudio.init === 'function') {
      AIVideoStudio.init('#studio-root');
    } else {
      console.error('[DEBUG switchView] AIVideoStudio is UNDEFINED or init is not a function!', typeof AIVideoStudio);
    }
  }

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  if (navEl) {
    navEl.classList.add('active');
    if (sub) navEl.classList.add('open');
  }

  const lang = localStorage.getItem('eigu_language') || 'vi';
  const titles = {
    'ho-so': lang === 'en' ? ['Profile', 'Account settings & system status'] : ['Hồ sơ', 'Cài đặt tài khoản & thông số hệ thống'],
    'cut': lang === 'en' ? ['Auto Cut Video', 'Cut short video with anti-reup algorithms'] : ['Tự động cắt', 'Cắt video ngắn với thuật toán chống reup'],
    'ai-video': lang === 'en' ? ['Create AI Video (Quick)', 'Generate script, voiceover and video from AI'] : ['Tạo video AI (Nhanh)', 'Tạo kịch bản, giọng đọc và video từ AI'],
    'ai-studio': lang === 'en' ? ['AI Video Studio', 'EIGU Project Editor & Storyboard Workspace (.eigu)'] : ['AI Video Studio (.eigu)', 'Trình biên tập kịch bản, phân cảnh & xuất dự án .eigu'],
    'reup': lang === 'en' ? ['Reup Video', 'Anti-copyright MD5 decimation & noise injection'] : ['Tạo video Reup', 'Lách bản quyền MD5 decimation & noise injection'],
    'hot-niche': lang === 'en' ? ['Hot Niche Finder', 'Search trending niches and keywords'] : ['Tìm ngách hot', 'Tìm kiếm ngách hot và từ khóa xu hướng'],
    'bulk-download': lang === 'en' ? ['Bulk Download', 'Batch download videos without watermark'] : ['Tải video hàng loạt', 'Tải hàng loạt video không logo'],
    'workflow': lang === 'en' ? ['Workflows', 'Create automated video processing workflows'] : ['Tạo workflow', 'Tạo luồng xử lý video tự động'],
    'record': lang === 'en' ? ['Record Macro', 'Record mouse & keyboard actions'] : ['Ghi thao tác', 'Ghi lại thao tác chuột và bàn phím'],
    'tk-tiktok': ['TikTok', lang === 'en' ? 'Manage TikTok accounts' : 'Quản lý tài khoản TikTok'],
    'tk-facebook': ['Facebook', lang === 'en' ? 'Manage Facebook accounts' : 'Quản lý tài khoản Facebook'],
    'tk-youtube': ['YouTube', lang === 'en' ? 'Manage YouTube channels' : 'Quản lý kênh YouTube'],
    'tk-x': ['X (Twitter)', lang === 'en' ? 'Manage X accounts' : 'Quản lý tài khoản X'],
    'tk-instagram': ['Instagram', lang === 'en' ? 'Manage Instagram accounts' : 'Quản lý tài khoản Instagram'],
    'tk-threads': ['Threads', lang === 'en' ? 'Manage Threads accounts' : 'Quản lý tài khoản Threads'],
    'tiep-thi': lang === 'en' ? ['Affiliate Marketing', 'Manage affiliate programs'] : ['Tiếp thị liên kết', 'Quản lý affiliate marketing'],
    'doi-nhom': lang === 'en' ? ['Team Workspaces', 'Manage team members & permissions'] : ['Đội nhóm', 'Quản lý thành viên và phân quyền'],
    'tien-ich': lang === 'en' ? ['Utilities', 'Additional system utilities'] : ['Tiện ích', 'Các tiện ích bổ sung'],
    'guide': lang === 'en' ? ['User Manual', 'EIGU Platform features guide'] : ['Hướng dẫn sử dụng', 'Các tính năng của EIGU Platform'],
    'settings': lang === 'en' ? ['Settings', 'App appearance & system configuration'] : ['Cài đặt', 'Giao diện & cấu hình hệ thống'],
    'chat-support': lang === 'en' ? ['Live Chat Support', 'Real-time customer support console'] : ['Chat Support', 'Hỗ trợ khách hàng thời gian thực'],
    'admin-dashboard': lang === 'en' ? ['Admin Dashboard', 'Executive system metrics & status monitoring'] : ['Dashboard Admin', 'Bảng điều khiển giám sát chỉ số hệ thống thực'],
    'analytics-reports': lang === 'en' ? ['Analytics & Reports', 'Performance analytics & growth trends'] : ['Báo cáo Thống kê', 'Phân tích dữ liệu tăng trưởng và hiệu năng hệ thống'],
    'user-management': lang === 'en' ? ['User & Staff Management', 'System role & tab permissions'] : ['Quản lý User/Staff', 'Phân quyền tài khoản hệ thống'],
    'create-notification': lang === 'en' ? ['Broadcast Notification', 'Send system-wide broadcast alerts'] : ['Tạo thông báo', 'Phát thông báo tới hệ thống máy trạm'],
    'feedback': lang === 'en' ? ['Submit Feedback', 'Send bug reports and feedback to dev team'] : ['Góp ý / Báo lỗi', 'Gửi báo cáo lỗi kèm hình ảnh đính kèm tới đội ngũ phát triển'],
    'feedback-management': lang === 'en' ? ['Feedback Management', 'Monitor and resolve user reports'] : ['Quản lý Feedback', 'Theo dõi và xử lý các báo cáo góp ý từ người dùng'],
    'user-activity-logs': lang === 'en' ? ['Activity Logs', 'System user access & action trail'] : ['Nhật ký hoạt động', 'Theo dõi lịch sử thao tác của các tài khoản hệ thống'],
  };
  const [t, s] = titles[view] || ['', ''];
  const viewTitleEl = document.getElementById('view-title');
  const viewSubTitleEl = document.getElementById('view-subtitle');
  if (viewTitleEl) viewTitleEl.textContent = t;
  if (viewSubTitleEl) viewSubTitleEl.textContent = s;

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

  // Tự động tải Lịch sử truy cập khi chuyển sang Tab Nhật ký hoạt động
  if (view === 'user-activity-logs' && typeof loadRealUserActivityLogs === 'function') {
    loadRealUserActivityLogs();
  }

  // Tự động tải Dữ liệu Thực khi chuyển sang Tab Admin Dashboard & Báo cáo Thống kê
  if (view === 'admin-dashboard' && typeof loadAdminDashboardData === 'function') {
    loadAdminDashboardData();
  }

  if (view === 'analytics-reports' && typeof loadAnalyticsReportsData === 'function') {
    loadAnalyticsReportsData();
  }

  // Load AI Video Studio when entering AI Video Studio view
  if ((view === 'ai-studio' || view === 'ai-video') && typeof AIVideoStudio !== 'undefined' && typeof AIVideoStudio.init === 'function') {
    AIVideoStudio.init('#studio-root');
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


