let currentEditingUserId = null;

async function loadRealUserData() {
  const tbody = document.getElementById('user-mgmt-table-body');
  if (!tbody) return;

  const q = (document.getElementById('user-search-input')?.value || '').trim();
  const role = document.getElementById('user-role-filter')?.value || 'all';
  const sortBy = document.getElementById('user-sort-filter')?.value || 'newest';

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu thực từ Supabase Database...</td></tr>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (role && role !== 'all') queryParams.append('role', role);
    if (sortBy) queryParams.append('sortBy', sortBy);

    const users = await apiFetch(`/users?${queryParams.toString()}`);
    tbody.innerHTML = '';

    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy người dùng nào phù hợp.</td></tr>';
      return;
    }

    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';

      const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
      
      const roleBadge = u.role === 'admin' 
        ? `<span style="background: rgba(99,102,241,0.2); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-weight:700; font-size:11px;">ADMIN</span>`
        : u.role === 'staff'
        ? `<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight:700; font-size:11px;">STAFF</span>`
        : `<span style="background: rgba(148,163,184,0.2); color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-size:11px;">USER</span>`;

      const statusBadge = u.isBanned
        ? `<span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px;">🛑 ĐÃ BLOCK (BAN)</span>`
        : `<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight:600; font-size:11px;">🟢 HOẠT ĐỘNG</span>`;

      const banBtnText = u.isBanned ? 'Mở Khóa' : 'Block (Ban)';
      const banBtnStyle = u.isBanned ? 'border-color: #22c55e; color: #22c55e;' : 'border-color: #ef4444; color: #ef4444;';

      tr.innerHTML = `
        <td style="padding: 10px;">
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(u.email)}</div>
          <div style="font-size:11px; color:var(--text-muted);">${u.username ? '@' + escapeHtml(u.username) : 'ID: ' + u.id.slice(0,8)}</div>
        </td>
        <td style="padding: 10px; font-family: monospace; font-size:12px; color:var(--accent);">${escapeHtml(u.lastIp || '127.0.0.1')}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-secondary);">
          <div>${escapeHtml(u.lastOs || 'Desktop')}</div>
          <div style="font-size:10px; color:var(--text-muted);">${escapeHtml(u.lastDevice || 'Electron Client')}</div>
        </td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted);">${createdDate}</td>
        <td style="padding: 10px;">${statusBadge}</td>
        <td style="padding: 10px;">
          <select style="padding: 4px 6px; border-radius: 4px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size:12px;" onchange="updateUserRoleReal('${u.id}', this.value)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Staff</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td style="padding: 10px; text-align:center; display:flex; gap:6px; justify-content:center;">
          <button class="btn-outline" onclick="toggleUserBanReal('${u.id}', ${!u.isBanned})" style="padding: 3px 8px; font-size:11px; border-radius: 4px; ${banBtnStyle}">${banBtnText}</button>
          <button class="btn-outline" onclick="configureUserTabsReal('${u.id}')" style="padding: 3px 8px; font-size:11px; border-radius: 4px;">Phân Tab</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu người dùng:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</td></tr>`;
  }
}

async function updateUserRoleReal(userId, newRole) {
  try {
    await apiFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
    showToast('Thành công', `Đã cập nhật role thành ${newRole.toUpperCase()}!`, 'success');
    loadRealUserData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Không thể cập nhật role', 'error');
  }
}

async function toggleUserBanReal(userId, shouldBan) {
  const actionText = shouldBan ? 'Khóa (Block/Ban)' : 'Mở khóa';
  if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;

  try {
    await apiFetch(`/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned: shouldBan })
    });
    showToast('Thành công', `Đã ${actionText} tài khoản thành công!`, 'success');
    loadRealUserData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi xử lý khóa tài khoản', 'error');
  }
}

async function configureUserTabsReal(userId) {
  currentEditingUserId = userId;
  const modal = document.getElementById('tab-config-modal');
  if (!modal) return;

  try {
    // Fetch tab permissions từ API (trả về ALL_TABS kèm visible)
    const tabs = await apiFetch(`/users/${userId}/tab-permissions`);
    renderTabConfigCheckboxes(tabs);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  } catch (err) {
    showToast('Lỗi', 'Không thể tải cấu hình tab: ' + err.message, 'error');
  }
}

function renderTabConfigCheckboxes(tabs) {
  const container = document.getElementById('tab-config-list');
  if (!container) return;

  const sidebarTabs = tabs.filter(t => t.group === 'sidebar');
  const profileTabs = tabs.filter(t => t.group === 'profile');

  const parents = sidebarTabs.filter(t => !t.parentKey);
  const children = sidebarTabs.filter(t => t.parentKey);

  let html = `
    <div style="margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px;">Sidebar</div>
  `;

  parents.forEach(p => {
    html += `
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; padding: 2px 0; font-weight: 600;">
        <input type="checkbox" class="tab-config-cb" value="${p.tabKey}" ${p.visible ? 'checked' : ''} />
        <span>${escapeHtml(p.label)}</span>
      </label>
    `;
    const subs = children.filter(c => c.parentKey === p.tabKey);
    subs.forEach(c => {
      html += `
        <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; padding: 2px 0 2px 28px;">
          <input type="checkbox" class="tab-config-cb" value="${c.tabKey}" ${c.visible ? 'checked' : ''} />
          <span>${escapeHtml(c.label)}</span>
        </label>
      `;
    });
  });

  html += `
    <div style="margin: 10px 0 8px; font-size: 12px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px;">Menu hồ sơ</div>
  `;

  profileTabs.forEach(t => {
    html += `
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; padding: 2px 0;">
        <input type="checkbox" class="tab-config-cb" value="${t.tabKey}" ${t.visible ? 'checked' : ''} />
        <span>${escapeHtml(t.label)}</span>
      </label>
    `;
  });

  container.innerHTML = html;
}

function closeTabConfigModal() {
  const modal = document.getElementById('tab-config-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

async function saveTabConfigModal() {
  if (!currentEditingUserId) return;
  const tabPermissions = Array.from(document.querySelectorAll('.tab-config-cb')).map(cb => ({
    tabKey: cb.value,
    visible: cb.checked,
  }));

  try {
    await apiFetch(`/users/${currentEditingUserId}/tab-permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ tabPermissions }),
    });
    showToast('Thành công', 'Đã lưu cấu hình Phân quyền Tab cho User!', 'success');
    closeTabConfigModal();
    loadRealUserData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi lưu phân quyền Tab', 'error');
  }
}
