// Notifications System UI Logic (Persisted to Supabase Database)

let notificationsData = [];

async function loadRealNotifications() {
  try {
    const list = await apiFetch('/notifications');
    if (Array.isArray(list)) {
      notificationsData = list.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        target: n.target,
        read: n.isRead,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
      }));
    }
  } catch (err) {
    console.warn('Sử dụng cache thông báo tạm thời:', err);
  }
  renderNotifications();
}

function toggleNotificationDrawer(e) {
  if (e) e.stopPropagation();
  const drawer = document.getElementById('notif-drawer');
  if (!drawer) return;
  
  const wasHidden = drawer.classList.contains('hidden');
  document.querySelectorAll('.notif-drawer').forEach(d => d.classList.add('hidden'));
  
  if (wasHidden) {
    drawer.classList.remove('hidden');
    loadRealNotifications();
  }
}

// Global click to close drawer
document.addEventListener('click', (e) => {
  const drawer = document.getElementById('notif-drawer');
  const btn = document.querySelector('.notif-btn');
  if (drawer && !drawer.classList.contains('hidden')) {
    if (!drawer.contains(e.target) && (!btn || !btn.contains(e.target))) {
      drawer.classList.add('hidden');
    }
  }
});

function renderNotifications() {
  const listEl = document.getElementById('notif-drawer-list');
  const badgeEl = document.getElementById('notif-badge');
  if (!listEl) return;

  const unreadCount = notificationsData.filter(n => !n.read).length;

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.classList.remove('hidden');
      badgeEl.style.display = 'flex';
      badgeEl.innerText = unreadCount > 5 ? '5+' : unreadCount;
    } else {
      badgeEl.classList.add('hidden');
      badgeEl.style.display = 'none';
    }
  }

  listEl.innerHTML = '';

  if (notificationsData.length === 0) {
    listEl.innerHTML = '<div class="notif-empty">Không có thông báo nào</div>';
    return;
  }

  notificationsData.forEach(n => {
    const item = document.createElement('div');
    item.className = `notif-item ${n.read ? '' : 'unread'}`;
    item.onclick = () => markNotificationAsRead(n.id);
    item.innerHTML = `
      <div class="notif-item-title">${escapeHtml(n.title)}</div>
      <div class="notif-item-desc">${escapeHtml(n.content)}</div>
      <div class="notif-item-time">${escapeHtml(n.time)}</div>
    `;
    listEl.appendChild(item);
  });
}

async function markNotificationAsRead(id) {
  const n = notificationsData.find(item => item.id === id);
  if (n) {
    n.read = true;
    renderNotifications();
  }
}

async function markAllNotificationsRead() {
  try {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
  } catch (err) {}
  notificationsData.forEach(n => n.read = true);
  renderNotifications();
  showToast('Thông báo', 'Đã đánh dấu đọc tất cả thông báo.', 'info');
}

async function addSystemNotification(title, content, target = 'all', ttl = '24h') {
  try {
    const editId = document.getElementById('admin-notif-edit-id')?.value;
    let created;
    if (editId) {
      created = await apiFetch(`/notifications/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, target, ttl })
      });
      showToast('Thành công', 'Đã cập nhật thông báo!', 'success');
      cancelEditNotification();
    } else {
      created = await apiFetch('/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, content, target, ttl })
      });
      showToast('Thành công', `Đã phát thông báo "${title}" tới ${target}!`, 'success');
    }
  } catch (err) {
    showToast('Lỗi', err.message || 'Không thể lưu thông báo', 'error');
  }
  loadRealNotifications();
  loadAdminNotificationHistory();
}

async function loadAdminNotificationHistory() {
  const tbody = document.getElementById('admin-notif-table-body');
  if (!tbody) return;

  const q = (document.getElementById('notif-search-input')?.value || '').trim();
  const target = document.getElementById('notif-target-filter')?.value || 'all';
  const sortBy = document.getElementById('notif-sort-filter')?.value || 'newest';

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Đang tải Lịch sử Thông báo từ Supabase Database...</td></tr>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (target && target !== 'all') queryParams.append('target', target);
    if (sortBy) queryParams.append('sortBy', sortBy);

    const list = await apiFetch(`/notifications?${queryParams.toString()}`);
    tbody.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy thông báo nào phù hợp.</td></tr>';
      return;
    }

    list.forEach(n => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';

      const createdDate = n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—';
      const expiresDate = n.expiresAt ? new Date(n.expiresAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Không hết hạn';
      
      const targetBadge = n.target === 'staff'
        ? `<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px;">Chỉ Staff</span>`
        : n.target === 'user'
        ? `<span style="background: rgba(148,163,184,0.2); color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-size:11px;">Chỉ User</span>`
        : `<span style="background: rgba(99,102,241,0.2); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px;">Tất cả (All)</span>`;

      tr.innerHTML = `
        <td style="padding: 10px; font-weight:600; color:var(--text-primary); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(n.title)}</td>
        <td style="padding: 10px; color:var(--text-secondary); max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(n.content)}</td>
        <td style="padding: 10px;">${targetBadge}</td>
        <td style="padding: 10px; font-size:12px; color:var(--accent);">${expiresDate}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted);">${createdDate}</td>
        <td style="padding: 10px; text-align:center; display:flex; gap:6px; justify-content:center;">
          <button class="btn-outline" onclick="editNotification('${n.id}', '${escapeHtml(n.title).replace(/'/g, "\\'")}', '${escapeHtml(n.content).replace(/'/g, "\\'")}', '${n.target}')" style="padding: 3px 10px; font-size:11px; border-radius: 4px; color:var(--accent); border-color:var(--accent);">Sửa</button>
          <button class="btn-outline" onclick="deleteNotification('${n.id}')" style="padding: 3px 10px; font-size:11px; border-radius: 4px; color:#ef4444; border-color:#ef4444;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Lỗi tải Lịch sử Thông báo:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối Server: ${err.message}</td></tr>`;
  }
}

function editNotification(id, title, content, target) {
  document.getElementById('admin-notif-edit-id').value = id;
  document.getElementById('admin-notif-title').value = title;
  document.getElementById('admin-notif-content').value = content;
  document.getElementById('admin-notif-target').value = target;

  const submitBtn = document.getElementById('admin-notif-submit-btn');
  const cancelBtn = document.getElementById('admin-notif-cancel-btn');
  const formTitle = document.getElementById('admin-notif-form-title');

  if (submitBtn) submitBtn.innerText = 'Cập Nhật Thông Báo';
  if (cancelBtn) cancelBtn.classList.remove('hidden');
  if (formTitle) formTitle.innerText = 'Chỉnh Sửa Thông Báo (Dữ liệu Thực)';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEditNotification() {
  document.getElementById('admin-notif-edit-id').value = '';
  document.getElementById('admin-notif-title').value = '';
  document.getElementById('admin-notif-content').value = '';
  document.getElementById('admin-notif-target').value = 'all';

  const submitBtn = document.getElementById('admin-notif-submit-btn');
  const cancelBtn = document.getElementById('admin-notif-cancel-btn');
  const formTitle = document.getElementById('admin-notif-form-title');

  if (submitBtn) submitBtn.innerText = 'Phát Thông Báo Ngay';
  if (cancelBtn) cancelBtn.classList.add('hidden');
  if (formTitle) formTitle.innerText = 'Tạo & Quản lý Thông báo (Dữ liệu Thực)';
}

async function deleteNotification(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi Supabase Database không?')) return;
  try {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    showToast('Thành công', 'Đã xóa thông báo khỏi Database!', 'success');
    loadAdminNotificationHistory();
    loadRealNotifications();
  } catch (err) {
    showToast('Lỗi', err.message || 'Không thể xóa thông báo', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRealNotifications();
});
