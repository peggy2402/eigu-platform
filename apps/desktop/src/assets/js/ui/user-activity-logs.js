// -----------------------------------------------------------
// MODULE 28: USER ACTIVITY LOGS (Lịch sử truy cập & Hoạt động)
// Professional Premium UI/UX - Zero Emoji Rule & Clean Date Formatting
// -----------------------------------------------------------

let currentActivityLogsRoleFilter = 'all';

function setActivityLogsRoleFilter(role, btn) {
  currentActivityLogsRoleFilter = role;
  const container = document.getElementById('activity-logs-role-pills');
  if (container) {
    const pills = container.querySelectorAll('.chat-filter-pill');
    pills.forEach(p => p.classList.remove('active'));
  }
  if (btn) btn.classList.add('active');
  loadRealUserActivityLogs();
}

function formatFriendlyActionName(action) {
  if (!action) return 'Hành động';
  const actUpper = String(action).toUpperCase();
  const actionMap = {
    'LOGIN': 'Đăng nhập hệ thống',
    'LOGOUT': 'Đăng xuất',
    'CUT_VIDEO': 'Tự động cắt video',
    'CREATE_AI_VIDEO': 'Tạo video AI',
    'UPDATE_SETTINGS': 'Cập nhật Cài đặt',
    'SEND_FEEDBACK': 'Gửi báo lỗi / Phản hồi',
    'SEND_CHAT': 'Nhắn tin hỗ trợ',
    'CHANGE_ROLE': 'Thay đổi phân quyền',
    'TOGGLE_MAINTENANCE': 'Bật / Tắt bảo trì',
    'ROTATE_CODE': 'Xoay mã bảo mật Obfuscation',
    'EMERGENCY_DISABLE': 'Tắt khẩn cấp',
  };
  return actionMap[actUpper] || action;
}

function formatFriendlyPayloadKey(key) {
  const keyMap = {
    'os': 'Hệ điều hành',
    'device': 'Thiết bị',
    'loginTime': 'Thời gian đăng nhập',
    'logintime': 'Thời gian đăng nhập',
    'updatedRole': 'Vai trò mới',
    'targetEmail': 'Email áp dụng',
    'reason': 'Lý do',
    'method': 'Phương thức',
    'status': 'Trạng thái',
    'url': 'Đường dẫn',
    'ip': 'Địa chỉ IP',
    'ipAddress': 'Địa chỉ IP',
    'action': 'Hành động',
  };
  if (keyMap[key]) return keyMap[key];
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatFriendlyValue(val) {
  if (val === null || val === undefined || val === '') return '-';

  const strVal = String(val).trim();
  // Format ISO timestamp string (e.g. 2026-07-24T08:44:49.206Z) to localized Vietnamese Date Time
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(strVal) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(strVal)) {
    const d = new Date(strVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('vi-VN');
    }
  }

  if (typeof val === 'boolean') {
    return val ? 'Có' : 'Không';
  }

  return escapeHtml(strVal);
}

function formatFriendlyPayload(rawPayload) {
  if (!rawPayload || rawPayload === '-' || rawPayload === '{}') {
    return '<span style="color:var(--text-muted); font-size:12px;">-</span>';
  }

  try {
    let parsed = rawPayload;
    if (typeof rawPayload === 'string' && (rawPayload.startsWith('{') || rawPayload.startsWith('['))) {
      parsed = JSON.parse(rawPayload);
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const entries = Object.entries(parsed);
      if (entries.length === 0) return '<span style="color:var(--text-muted); font-size:12px;">-</span>';

      return entries.map(([k, v]) => {
        const friendlyKey = formatFriendlyPayloadKey(k);
        const friendlyVal = formatFriendlyValue(v);
        return `<span style="display:inline-flex; align-items:center; gap:4px; margin-right:8px; margin-bottom:4px; background:var(--bg-primary); border:1px solid var(--border-color); padding:3px 8px; border-radius:6px; font-size:12px;"><span style="color:var(--text-muted); font-size:11px;">${escapeHtml(friendlyKey)}:</span> <strong style="color:var(--text-primary); font-weight:600;">${friendlyVal}</strong></span>`;
      }).join(' ');
    }
  } catch (e) {}

  let safeRaw = escapeHtml(String(rawPayload));
  safeRaw = safeRaw.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, (match) => {
    const d = new Date(match);
    return !isNaN(d.getTime()) ? d.toLocaleString('vi-VN') : match;
  });

  return `<span style="font-size:12px; color:var(--text-primary);">${safeRaw}</span>`;
}

async function loadRealUserActivityLogs() {
  const tbody = document.getElementById('activity-logs-table-body');
  const cardsContainer = document.getElementById('activity-logs-cards-container');
  if (!tbody) return;

  const userRole = (typeof userProfile !== 'undefined' && userProfile && userProfile.role) ? userProfile.role : 'user';

  // Điều chỉnh ẩn / hiện bộ lọc Role theo quyền
  const rolePillsContainer = document.getElementById('activity-logs-role-pills');
  if (rolePillsContainer) {
    if (userRole === 'user') {
      rolePillsContainer.style.display = 'none';
    } else if (userRole === 'staff') {
      rolePillsContainer.style.display = 'flex';
      const adminPill = rolePillsContainer.querySelector('[onclick*="admin"]');
      if (adminPill) adminPill.style.display = 'none';
    } else {
      rolePillsContainer.style.display = 'flex';
    }
  }

  const searchInput = document.getElementById('activity-logs-search-input');
  const searchQuery = searchInput ? searchInput.value.trim() : '';

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Đang tải dữ liệu Lịch sử truy cập từ hệ thống...</td></tr>';
  if (cardsContainer) {
    cardsContainer.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Đang tải dữ liệu Lịch sử truy cập từ hệ thống...</div>';
  }

  try {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('search', searchQuery);
    if (currentActivityLogsRoleFilter && currentActivityLogsRoleFilter !== 'all' && userRole === 'admin') {
      queryParams.set('role', currentActivityLogsRoleFilter);
    }
    queryParams.set('limit', '50');

    const fetchFunc = typeof apiFetch === 'function' ? apiFetch : (typeof request === 'function' ? request : null);
    if (!fetchFunc) throw new Error('Hàm kết nối API (apiFetch) chưa sẵn sàng');

    if (typeof window.syncObfuscationConfig === 'function') {
      await window.syncObfuscationConfig();
    }

    const res = await fetchFunc(`/audit-logs?${queryParams.toString()}`, { method: 'GET' });

    if (!res || !Array.isArray(res.data) || res.data.length === 0) {
      const emptyMsg = 'Chưa có lịch sử truy cập & hoạt động nào phù hợp.';
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">${emptyMsg}</td></tr>`;
      if (cardsContainer) cardsContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">${emptyMsg}</div>`;
      return;
    }

    tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    res.data.forEach(log => {
      const timeFormatted = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'N/A';

      let roleBadge = '<span style="background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); padding: 2px 8px; border-radius: 6px; font-weight:600; font-size:11px; letter-spacing:0.5px;">USER</span>';
      if (log.userRole === 'admin') {
        roleBadge = '<span style="background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); padding: 2px 8px; border-radius: 6px; font-weight:700; font-size:11px; letter-spacing:0.5px;">ADMIN</span>';
      } else if (log.userRole === 'staff') {
        roleBadge = '<span style="background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); padding: 2px 8px; border-radius: 6px; font-weight:600; font-size:11px; letter-spacing:0.5px;">STAFF</span>';
      }

      const payloadFormatted = formatFriendlyPayload(log.payload);
      const friendlyAction = formatFriendlyActionName(log.action);
      const safeEmail = escapeHtml(log.userEmail || 'Hệ thống');
      const safeModule = escapeHtml((log.module || 'SYSTEM').toUpperCase());
      const safeIp = escapeHtml(log.ipAddress || '127.0.0.1');
      const safeDevice = escapeHtml(log.device || 'Desktop');

      // 1. Render Table Row (Dành cho màn hình rộng)
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;';
      tr.onmouseenter = () => tr.style.background = 'rgba(255,255,255,0.02)';
      tr.onmouseleave = () => tr.style.background = 'transparent';

      tr.innerHTML = `
        <td style="padding: 12px 10px; white-space: nowrap; color: var(--text-muted); font-size: 12px;">${timeFormatted}</td>
        <td style="padding: 12px 10px;">
          <div style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${safeEmail}</div>
          <div style="margin-top: 4px;">${roleBadge}</div>
        </td>
        <td style="padding: 12px 10px; white-space: nowrap;">
          <span style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; color: var(--accent);">
            ${escapeHtml(friendlyAction)}
          </span>
        </td>
        <td style="padding: 12px 10px; white-space: nowrap;">
          <span style="font-weight: 700; color: var(--text-secondary); font-size: 11px; letter-spacing: 0.5px;">
            ${safeModule}
          </span>
        </td>
        <td style="padding: 12px 10px; font-size: 12px; max-width: 380px; word-break: break-word; line-height: 1.5;">
          ${payloadFormatted}
        </td>
        <td style="padding: 12px 10px; white-space: nowrap; font-size: 11px; color: var(--text-muted);">
          <div style="margin-bottom: 2px;">IP: ${safeIp}</div>
          <div>Thiết bị: ${safeDevice}</div>
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Render Responsive Card (Dành cho màn hình hẹp < 900px hoặc khi thu nhỏ)
      if (cardsContainer) {
        const card = document.createElement('div');
        card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:700; color:var(--text-primary); font-size:13px;">${safeEmail}</div>
            <div>${roleBadge}</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <span style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); padding: 3px 8px; border-radius: 6px; font-weight:600; font-size:12px; color:var(--accent);">
              ${escapeHtml(friendlyAction)}
            </span>
            <span style="font-size:11px; color:var(--text-muted);">${timeFormatted}</span>
          </div>
          <div style="font-size:12px; color:var(--text-secondary); line-height:1.4; background:var(--bg-primary); padding:8px 10px; border-radius:6px; border:1px solid var(--border-color);">
            ${payloadFormatted}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:6px; margin-top:2px;">
            <span>IP: ${safeIp}</span>
            <span>Thiết bị: ${safeDevice}</span>
          </div>
        `;
        cardsContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error('Lỗi khi tải Audit Logs:', err);
    const errHtml = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#ef4444;">Không thể tải dữ liệu lịch sử truy cập: ${escapeHtml(err.message || 'Lỗi kết nối')}</td></tr>`;
    tbody.innerHTML = errHtml;
    if (cardsContainer) cardsContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#ef4444;">Không thể tải dữ liệu lịch sử truy cập: ${escapeHtml(err.message || 'Lỗi kết nối')}</div>`;
  }
}

// Utility to dispatch Activity Log entry from Client side
async function logUserActivity(action, moduleName, payloadObj = {}) {
  try {
    const fetchFunc = typeof apiFetch === 'function' ? apiFetch : (typeof request === 'function' ? request : null);
    if (!fetchFunc) return;

    const userEmail = typeof getUserEmail === 'function' ? getUserEmail() : 'unknown@eigu.app';
    const role = (typeof userProfile !== 'undefined' && userProfile && userProfile.role) ? userProfile.role : 'user';
    const username = (typeof userProfile !== 'undefined' && userProfile && userProfile.username) ? userProfile.username : 'User';

    await fetchFunc('/audit-logs', {
      method: 'POST',
      body: JSON.stringify({
        userEmail: userEmail,
        username: username,
        userRole: role,
        action: action,
        module: moduleName,
        device: `Desktop (${navigator.platform || 'macOS'})`,
        payload: JSON.stringify(payloadObj),
      }),
    });
  } catch (e) {
    console.warn('Failed to dispatch user activity log:', e);
  }
}
