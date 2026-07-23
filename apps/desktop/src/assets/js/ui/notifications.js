// Notifications System UI Logic (Persisted locally + synced with Supabase Database)

let notificationsData = [];

function getNotifStorageKey() {
  const email = (typeof userProfile !== 'undefined' && userProfile && userProfile.email) ? userProfile.email : 'guest';
  return `eigu_header_bell_notifications_${email}`;
}

function getStoredHeaderNotifications() {
  try {
    const key = getNotifStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveStoredHeaderNotifications(data) {
  try {
    const key = getNotifStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

async function loadRealNotifications() {
  const localNotifs = getStoredHeaderNotifications();
  notificationsData = localNotifs;
  try {
    const list = await apiFetch('/notifications');
    if (Array.isArray(list)) {
      const remoteNotifs = list.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        targetRole: n.target || 'all',
        read: n.isRead,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
      }));
      // Merge remote + local chat notifications without duplicates
      const merged = [...localNotifs];
      remoteNotifs.forEach(rn => {
        if (!merged.some(mn => mn.id === rn.id)) merged.push(rn);
      });
      notificationsData = merged;
      saveStoredHeaderNotifications(notificationsData);
    }
  } catch (err) {
    notificationsData = localNotifs;
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
    renderNotifications();
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

  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');

  // Filter notifications based on role
  const filteredData = notificationsData.filter(n => {
    if (!n.targetRole || n.targetRole === 'all') return true;
    if (isStaffOrAdmin) return n.targetRole === 'staff';
    return n.targetRole === 'user';
  });

  const unreadCount = filteredData.filter(n => !n.read).length;

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

  if (filteredData.length === 0) {
    listEl.innerHTML = '<div class="notif-empty">Không có thông báo nào</div>';
    return;
  }

  filteredData.forEach(n => {
    const item = document.createElement('div');
    item.className = `notif-item ${n.read ? '' : 'unread'}`;
    item.onclick = () => handleNotificationClick(n);
    item.innerHTML = `
      <div class="notif-item-title">${escapeHtml(n.title)}</div>
      <div class="notif-item-desc">${escapeHtml(n.content)}</div>
      <div class="notif-item-time">${escapeHtml(n.time)}</div>
    `;
    listEl.appendChild(item);
  });
}

function handleNotificationClick(n) {
  markNotificationAsRead(n.id);
  const drawer = document.getElementById('notif-drawer');
  if (drawer) drawer.classList.add('hidden');

  if (n.isChatNotif) {
    const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
    if (isStaffOrAdmin) {
      if (typeof switchView === 'function') {
        switchView('chat-support');
      }
      setTimeout(() => {
        if (typeof selectStaffChatSession === 'function' && n.userEmail) {
          selectStaffChatSession(n.userEmail);
        }
      }, 100);
    } else {
      if (typeof toggleLiveChatWidget === 'function') {
        if (typeof isChatOpen !== 'undefined' && !isChatOpen) {
          toggleLiveChatWidget();
        }
      }
    }
  }
}

function addChatNotificationForStaff(userEmail, textPreview) {
  const notif = {
    id: 'chat_notif_stf_' + Date.now(),
    title: '💬 Yêu cầu Chat Support từ: ' + userEmail,
    content: textPreview.length > 50 ? textPreview.slice(0, 50) + '...' : textPreview,
    userEmail: userEmail,
    targetRole: 'staff',
    isChatNotif: true,
    read: false,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
  
  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
  if (isStaffOrAdmin) {
    notificationsData.unshift(notif);
    saveStoredHeaderNotifications(notificationsData);
    renderNotifications();
  }
}

function addChatNotificationForUser(targetEmail, textPreview) {
  const notif = {
    id: 'chat_notif_usr_' + Date.now(),
    title: '💬 Staff EIGU vừa trả lời tin nhắn của bạn',
    content: textPreview.length > 50 ? textPreview.slice(0, 50) + '...' : textPreview,
    userEmail: targetEmail,
    targetRole: 'user',
    isChatNotif: true,
    read: false,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
  
  // Persist directly to target user's notifications storage key
  try {
    const userNotifKey = `eigu_header_bell_notifications_${targetEmail}`;
    let userNotifs = [];
    const raw = localStorage.getItem(userNotifKey);
    if (raw) userNotifs = JSON.parse(raw);
    userNotifs.unshift(notif);
    localStorage.setItem(userNotifKey, JSON.stringify(userNotifs));
  } catch (e) {}

  // Update live UI if target email matches current logged-in user
  if (typeof userProfile !== 'undefined' && userProfile && userProfile.email === targetEmail) {
    notificationsData.unshift(notif);
    saveStoredHeaderNotifications(notificationsData);
    renderNotifications();
  }
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
  const cardsContainer = document.getElementById('admin-notif-cards-container');
  if (!tbody) return;

  const q = (document.getElementById('notif-search-input')?.value || '').trim();
  const target = document.getElementById('notif-target-filter')?.value || 'all';
  const sortBy = document.getElementById('notif-sort-filter')?.value || 'newest';

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Đang tải Lịch sử Thông báo từ Supabase Database...</td></tr>';
  if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Đang tải Lịch sử Thông báo từ Supabase Database...</div>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (target && target !== 'all') queryParams.append('target', target);
    if (sortBy) queryParams.append('sortBy', sortBy);

    const list = await apiFetch(`/notifications?${queryParams.toString()}`);
    tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy thông báo nào phù hợp.</td></tr>';
      if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy thông báo nào phù hợp.</div>';
      return;
    }

    list.forEach(n => {
      const createdDate = n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—';
      const expiresDate = n.expiresAt ? new Date(n.expiresAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Không hết hạn';
      
      const targetBadge = n.target === 'staff'
        ? `<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px; white-space:nowrap;">Chỉ Staff</span>`
        : n.target === 'user'
        ? `<span style="background: rgba(148,163,184,0.2); color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-size:11px; white-space:nowrap;">Chỉ User</span>`
        : `<span style="background: rgba(99,102,241,0.2); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px; white-space:nowrap;">Tất cả (All)</span>`;

      // Giới hạn hiển thị tối đa 100 ký tự
      const rawContent = n.content || '';
      const displayContent = rawContent.length > 100 ? rawContent.slice(0, 100) + '...' : rawContent;

      // 1. Render Table Row (Desktop View)
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 10px; font-weight:600; color:var(--text-primary); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(n.title)}">${escapeHtml(n.title)}</td>
        <td style="padding: 10px; color:var(--text-secondary); max-width:340px; word-break:break-word; line-height:1.4;" title="${escapeHtml(rawContent)}">${escapeHtml(displayContent)}</td>
        <td style="padding: 10px; white-space:nowrap;">${targetBadge}</td>
        <td style="padding: 10px; font-size:12px; color:var(--accent); white-space:nowrap;">${expiresDate}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted); white-space:nowrap;">${createdDate}</td>
        <td style="padding: 10px; text-align:center; display:flex; gap:6px; justify-content:center; white-space:nowrap;">
          <button class="btn-outline" onclick="editNotification('${n.id}', '${escapeHtml(n.title).replace(/'/g, "\\'")}', '${escapeHtml(n.content).replace(/'/g, "\\'")}', '${n.target}')" style="padding: 3px 10px; font-size:11px; border-radius: 4px; color:var(--accent); border-color:var(--accent);">Sửa</button>
          <button class="btn-outline" onclick="deleteNotification('${n.id}')" style="padding: 3px 10px; font-size:11px; border-radius: 4px; color:#ef4444; border-color:#ef4444;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Render Responsive Card (Screen < 900px)
      if (cardsContainer) {
        const card = document.createElement('div');
        card.className = 'notif-card';
        card.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; width:100%;">
            <div style="font-weight:700; font-size:14px; color:var(--text-primary); min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(n.title)}">${escapeHtml(n.title)}</div>
            <div style="flex-shrink:0;">${targetBadge}</div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); line-height:1.4; background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color); word-break:break-word;" title="${escapeHtml(rawContent)}">
            ${escapeHtml(displayContent)}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
            <div><b>Hạn dùng:</b> <span style="color:var(--accent);">${expiresDate}</span></div>
            <div>${createdDate}</div>
          </div>

          <div style="display:flex; gap:8px; width:100%;">
            <button class="btn-outline" onclick="editNotification('${n.id}', '${escapeHtml(n.title).replace(/'/g, "\\'")}', '${escapeHtml(n.content).replace(/'/g, "\\'")}', '${n.target}')" style="flex:1; padding: 6px 10px; font-size:11px; font-weight:600; border-radius: 6px; color:var(--accent); border-color:var(--accent);">Sửa</button>
            <button class="btn-outline" onclick="deleteNotification('${n.id}')" style="flex:1; padding: 6px 10px; font-size:11px; font-weight:600; border-radius: 6px; color:#ef4444; border-color:#ef4444;">Xóa</button>
          </div>
        `;
        cardsContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error('Lỗi tải Lịch sử Thông báo:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối Server: ${err.message}</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối Server: ${err.message}</div>`;
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
