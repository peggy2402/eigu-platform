let currentEditingUserId = null;
let banTargetUserId = null;

async function loadRealUserData() {
  const tbody = document.getElementById('user-mgmt-table-body');
  const cardsContainer = document.getElementById('user-mgmt-cards-container');
  if (!tbody) return;

  const q = (document.getElementById('user-search-input')?.value || '').trim();
  const role = document.getElementById('user-role-filter')?.value || 'all';
  const sortBy = document.getElementById('user-sort-filter')?.value || 'newest';

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu thực từ Supabase Database...</td></tr>';
  if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu thực từ Supabase Database...</div>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (role && role !== 'all') queryParams.append('role', role);
    if (sortBy) queryParams.append('sortBy', sortBy);

    const users = await apiFetch(`/users?${queryParams.toString()}`);
    tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy người dùng nào phù hợp.</td></tr>';
      if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy người dùng nào phù hợp.</div>';
      return;
    }

    users.forEach(u => {
      const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
      
      const roleBadge = u.role === 'admin' 
        ? `<span style="background: rgba(99,102,241,0.2); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-weight:700; font-size:11px;">ADMIN</span>`
        : u.role === 'staff'
        ? `<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight:700; font-size:11px;">STAFF</span>`
        : `<span style="background: rgba(148,163,184,0.2); color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-size:11px;">USER</span>`;

      // Cột Trạng thái cho Bảng (Table View)
      let statusBadgeTable = '';
      let statusBadgeCard = '';
      if (u.isBanned) {
        if (u.bannedUntil) {
          const untilFormatted = new Date(u.bannedUntil).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
          statusBadgeTable = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.15); color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight:600; font-size:11px; white-space: nowrap;" title="Khóa đến: ${untilFormatted}">🛑 BAN TẠM THỜI <span style="opacity: 0.85; font-size: 10px;">(${untilFormatted})</span></span>`;
          statusBadgeCard = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.15); color: #ef4444; padding: 3px 8px; border-radius: 6px; font-weight:700; font-size:11px; white-space: nowrap;">🛑 BAN TẠM THỜI</span>
            <span style="font-size: 10px; color: #ef4444; font-weight:600; opacity: 0.85; white-space: nowrap;">Hạn: ${untilFormatted}</span>
          </div>`;
        } else {
          statusBadgeTable = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.15); color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight:600; font-size:11px; white-space: nowrap;">🛑 BAN VĨNH VIỄN</span>`;
          statusBadgeCard = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.15); color: #ef4444; padding: 3px 8px; border-radius: 6px; font-weight:700; font-size:11px; white-space: nowrap;">🛑 BAN VĨNH VIỄN</span>`;
        }
      } else if (u.isOnline) {
        statusBadgeTable = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 8px; border-radius: 6px; font-weight:600; font-size:11px; white-space: nowrap;">🟢 ONLINE</span>`;
        statusBadgeCard = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34,197,94,0.15); color: #22c55e; padding: 3px 8px; border-radius: 6px; font-weight:700; font-size:11px; white-space: nowrap;">🟢 ONLINE</span>`;
      } else {
        const rawDate = u.lastActiveAt || u.updatedAt || u.createdAt;
        let lastActiveText = 'Vừa tạo';
        if (rawDate) {
          const d = new Date(rawDate);
          const isToday = d.toDateString() === new Date().toDateString();
          lastActiveText = isToday
            ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
        }
        statusBadgeTable = `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(148,163,184,0.15); color: var(--text-secondary); padding: 4px 8px; border-radius: 6px; font-weight:500; font-size:11px; white-space: nowrap;">⚪ OFFLINE <span style="opacity: 0.75; font-size: 10px;">(${lastActiveText})</span></span>`;
        statusBadgeCard = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
          <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(148,163,184,0.15); color: var(--text-secondary); padding: 3px 8px; border-radius: 6px; font-weight:500; font-size:11px; white-space: nowrap;">⚪ OFFLINE</span>
          <span style="font-size: 10px; color: var(--text-muted); opacity: 0.85; white-space: nowrap;">(${lastActiveText})</span>
        </div>`;
      }

      const banBtnText = u.isBanned ? 'Mở Khóa' : 'Block (Ban)';
      const banBtnStyle = u.isBanned ? 'border-color: #22c55e; color: #22c55e;' : 'border-color: #ef4444; color: #ef4444;';
      const banOnClick = u.isBanned ? `unbanUser('${u.id}')` : `openBanModal('${u.id}', '${escapeHtml(u.email)}')`;

      // 1. Render Table Row (Desktop > 900px)
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 10px;">
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(u.email)}</div>
          <div style="font-size:11px; color:var(--text-muted);">${u.username ? '@' + escapeHtml(u.username) : 'ID: ' + u.id.slice(0,8)}</div>
        </td>
        <td style="padding: 10px; font-family: monospace; font-size:12px; color:var(--accent); white-space: nowrap;">${escapeHtml(u.lastIp || '127.0.0.1 (Localhost)')}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-secondary); white-space: nowrap;">
          <div>${escapeHtml(u.lastOs || 'Desktop')}</div>
          <div style="font-size:10px; color:var(--text-muted);">${escapeHtml(u.lastDevice || 'Electron Client')}</div>
        </td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted); white-space: nowrap;">${createdDate}</td>
        <td style="padding: 10px; white-space: nowrap;">${statusBadgeTable}</td>
        <td style="padding: 10px;">
          <select style="padding: 4px 6px; border-radius: 4px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size:12px;" onchange="updateUserRoleReal('${u.id}', this.value)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Staff</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td style="padding: 10px; text-align:center; display:flex; gap:6px; justify-content:center;">
          <button class="btn-outline" onclick="${banOnClick}" style="padding: 3px 8px; font-size:11px; border-radius: 4px; ${banBtnStyle}">${banBtnText}</button>
          <button class="btn-outline" onclick="configureUserTabsReal('${u.id}')" style="padding: 3px 8px; font-size:11px; border-radius: 4px;">Phân Tab</button>
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Render Responsive Card (Screen < 900px)
      if (cardsContainer) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; width: 100%;">
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(u.email)}">${escapeHtml(u.email)}</div>
              <div style="font-size:11px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.username ? '@' + escapeHtml(u.username) : 'ID: ' + u.id.slice(0,8)}</div>
            </div>
            <div style="flex-shrink: 0; text-align: right;">${statusBadgeCard}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11px; background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
            <div>
              <div style="font-size:10px; color:var(--text-muted); font-weight:600;">ĐỊA CHỈ IP</div>
              <div style="font-family:monospace; color:var(--accent); font-weight:600;">${escapeHtml(u.lastIp || '127.0.0.1 (Localhost)')}</div>
            </div>
            <div>
              <div style="font-size:10px; color:var(--text-muted); font-weight:600;">THIẾT BỊ / HĐH</div>
              <div style="color:var(--text-secondary);">${escapeHtml(u.lastOs || 'Desktop')} (${escapeHtml(u.lastDevice || 'Electron')})</div>
            </div>
            <div>
              <div style="font-size:10px; color:var(--text-muted); font-weight:600;">NGÀY TẠO</div>
              <div style="color:var(--text-secondary);">${createdDate}</div>
            </div>
            <div>
              <div style="font-size:10px; color:var(--text-muted); font-weight:600;">VAI TRÒ (ROLE)</div>
              <select style="margin-top:2px; width:100%; padding: 3px 6px; border-radius: 4px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size:11px;" onchange="updateUserRoleReal('${u.id}', this.value)">
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Staff</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </div>
          </div>

          <div style="display:flex; gap:8px; width:100%;">
            <button class="btn-outline" onclick="${banOnClick}" style="flex:1; padding: 6px 10px; font-size:11px; font-weight:600; border-radius: 6px; ${banBtnStyle}">${banBtnText}</button>
            <button class="btn-outline" onclick="configureUserTabsReal('${u.id}')" style="flex:1; padding: 6px 10px; font-size:11px; font-weight:600; border-radius: 6px;">Phân Tab</button>
          </div>
        `;
        cardsContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu người dùng:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</div>`;
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

function openBanModal(userId, email) {
  banTargetUserId = userId;
  const emailEl = document.getElementById('ban-target-user');
  if (emailEl) emailEl.textContent = email;

  const now = new Date();
  const startTimeEl = document.getElementById('ban-start-time-text');
  if (startTimeEl) {
    startTimeEl.textContent = now.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  setBanPreset(1, 'day'); // Mặc định preset 1 ngày
  const reasonInput = document.getElementById('ban-reason-input');
  if (reasonInput) reasonInput.value = '';

  const modal = document.getElementById('ban-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeBanModal() {
  const modal = document.getElementById('ban-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function setBanPreset(value, unit) {
  const input = document.getElementById('ban-until-input');
  if (!input) return;

  if (unit === 'permanent') {
    input.value = '';
    return;
  }

  const now = new Date();
  if (unit === 'hour') now.setHours(now.getHours() + value);
  else if (unit === 'day') now.setDate(now.getDate() + value);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  input.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function confirmBanUser() {
  if (!banTargetUserId) return;
  const inputVal = document.getElementById('ban-until-input')?.value;
  const banReason = document.getElementById('ban-reason-input')?.value?.trim() || null;

  let bannedUntil = null;
  if (inputVal) {
    bannedUntil = new Date(inputVal).toISOString();
  }

  try {
    await apiFetch(`/users/${banTargetUserId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned: true, bannedUntil, banReason })
    });
    showToast('Thành công', 'Đã Khóa (Block) tài khoản thành công!', 'success');
    closeBanModal();
    loadRealUserData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi khóa tài khoản', 'error');
  }
}

async function unbanUser(userId) {
  if (!confirm('Bạn có chắc chắn muốn Mở khóa tài khoản này không?')) return;
  try {
    await apiFetch(`/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned: false, bannedUntil: null })
    });
    showToast('Thành công', 'Đã mở khóa tài khoản thành công!', 'success');
    loadRealUserData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi mở khóa tài khoản', 'error');
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
