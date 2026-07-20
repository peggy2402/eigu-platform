function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleDropdown(el) {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('collapsed')) {
    sidebar.classList.remove('collapsed');
  }

  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}

function switchView(view, navEl, sub) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
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
    'workflow': ['Tạo workflow', 'Thiết kế luồng xử lý tự động'],
    'record': ['Ghi thao tác', 'Ghi lại các thao tác trình duyệt'],
    'tai-khoan': ['Tài khoản', 'Quản lý tài khoản TikTok'],
    'tiep-thi': ['Tiếp thị liên kết', 'Quản lý affiliate marketing'],
    'doi-nhom': ['Đội nhóm', 'Quản lý thành viên và phân quyền'],
    'tien-ich': ['Tiện ích', 'Các tiện ích bổ sung'],
    'guide': ['Hướng dẫn sử dụng', 'Các tính năng của EIGU Platform'],
    'settings': ['Cài đặt', 'Giao diện & cấu hình hệ thống'],
  };
  const [t, s] = titles[view] || ['', ''];
  document.getElementById('view-title').textContent = t;
  document.getElementById('view-subtitle').textContent = s;

  document.querySelectorAll('.nav-sub-item').forEach(i => i.classList.remove('active'));
  if (sub) {
    const subEl = document.querySelector('.nav-sub-item[data-sub="' + sub + '"]');
    if (subEl) subEl.classList.add('active');
  }
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === '/') {
    e.preventDefault();
    toggleSidebar();
  }
});

document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar || sidebar.classList.contains('collapsed')) return;
  if (!sidebar.contains(e.target) && !e.target.closest('.title-bar-overlay')) {
    sidebar.classList.add('collapsed');
  }
});
