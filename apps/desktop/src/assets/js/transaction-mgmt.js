// Admin Transaction Management JS module
let adminTxCurrentPage = 1;
let adminTxTotalPages = 1;
let activeAdminTxTab = 'deposit'; // 'deposit' or 'subscriptions'
let cachedAdminSubscriptions = [];
let userDepositPollTimer = null;

function switchAdminTxTab(tab) {
  activeAdminTxTab = tab;
  const depBtn = document.getElementById('admin-tx-tab-btn-deposit');
  const subBtn = document.getElementById('admin-tx-tab-btn-subscriptions');
  const kpiRow = document.getElementById('admin-tx-kpi-row');

  if (tab === 'deposit') {
    if (depBtn) {
      depBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      depBtn.style.color = '#ffffff';
      depBtn.style.border = 'none';
      depBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
    }
    if (subBtn) {
      subBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      subBtn.style.color = 'var(--text-muted)';
      subBtn.style.border = '1px solid var(--border-color)';
      subBtn.style.boxShadow = 'none';
    }
    if (kpiRow) kpiRow.style.display = 'grid';
    loadAdminTransactionData(1);
  } else {
    if (subBtn) {
      subBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      subBtn.style.color = '#ffffff';
      subBtn.style.border = 'none';
      subBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
    }
    if (depBtn) {
      depBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      depBtn.style.color = 'var(--text-muted)';
      depBtn.style.border = '1px solid var(--border-color)';
      depBtn.style.boxShadow = 'none';
    }
    if (kpiRow) kpiRow.style.display = 'none';
    loadAdminSubscriptionData();
  }
}

async function loadAdminSubscriptionData() {
  if (activeAdminTxTab !== 'subscriptions') return;

  const tbody = document.getElementById('admin-tx-table-body');
  const thead = document.getElementById('admin-tx-table-head');
  const infoEl = document.getElementById('admin-tx-pagination-info');

  if (thead) {
    thead.innerHTML = `
      <tr style="background: var(--bg-primary); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 12px 14px;">KHÁCH HÀNG</th>
        <th style="padding: 12px 14px;">MÔ-ĐUN DỊCH VỤ</th>
        <th style="padding: 12px 14px;">GÓI ĐĂNG KÝ</th>
        <th style="padding: 12px 14px;">CẤU HÌNH GÓI</th>
        <th style="padding: 12px 14px;">CHI PHÍ GÓI</th>
        <th style="padding: 12px 14px;">THỜI HẠN SỬ DỤNG</th>
        <th style="padding: 12px 14px;">TRẠNG THÁI</th>
        <th style="padding: 12px 14px; text-align: center;">HÀNH ĐỘNG</th>
      </tr>
    `;
  }

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Đang kết nối Database lấy danh sách gói cước dịch vụ của mọi User...
        </td>
      </tr>
    `;
  }

  try {
    const res = await apiFetch('/pricing/admin/all-subscriptions');
    cachedAdminSubscriptions = (res && Array.isArray(res.data)) ? res.data : [];

    filterAndRenderAdminSubscriptions();
  } catch (err) {
    console.error('[AdminSubscriptions] Error:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải danh sách gói cước User: ${err.message || err}</td></tr>`;
  }
}

function filterAndRenderAdminSubscriptions() {
  if (activeAdminTxTab !== 'subscriptions') return;

  const tbody = document.getElementById('admin-tx-table-body');
  const infoEl = document.getElementById('admin-tx-pagination-info');
  const searchInput = document.getElementById('admin-tx-search-input');
  const search = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = cachedAdminSubscriptions;
  if (search) {
    list = list.filter(s =>
      (s.userEmail && s.userEmail.toLowerCase().includes(search)) ||
      (s.username && s.username.toLowerCase().includes(search)) ||
      (s.moduleName && s.moduleName.toLowerCase().includes(search)) ||
      (s.moduleSlug && s.moduleSlug.toLowerCase().includes(search)) ||
      (s.tierLabel && s.tierLabel.toLowerCase().includes(search))
    );
  }

  if (infoEl) infoEl.textContent = `Hiển thị ${list.length} gói cước dịch vụ đã mua của User`;

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">Chưa có dữ liệu đăng ký gói cước nào.</td></tr>`;
    return;
  }

  if (tbody) {
    tbody.innerHTML = list.map(sub => {
      const isExpired = sub.expiresAt && new Date(sub.expiresAt) < new Date();
      const statusBadge = !isExpired && sub.status === 'ACTIVE'
        ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); font-weight: 700; font-size: 11px;">Đang hoạt động</span>`
        : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); font-weight: 700; font-size: 11px;">Hết hạn</span>`;

      const priceStr = sub.price ? `${sub.price.toLocaleString('vi-VN')}đ/tháng` : 'Miễn phí';
      const createdDateStr = new Date(sub.createdAt).toLocaleDateString('vi-VN');
      const expireDateStr = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn';

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 12px 14px;">
            <div style="font-weight: 800; color: var(--text-primary); font-size: 13px;">${escapeHtml(sub.userEmail)}</div>
            <div style="font-size: 11px; color: var(--accent); margin-top: 2px;">
              ${sub.username ? '@' + escapeHtml(sub.username) : 'ID: ' + sub.userId.slice(0, 8)} &bull; SD: ${(sub.userBalance || 0).toLocaleString('vi-VN')}đ
            </div>
          </td>
          <td style="padding: 12px 14px;">
            <span style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 12px;">${escapeHtml(sub.moduleName || sub.moduleSlug)}</span>
          </td>
          <td style="padding: 12px 14px; font-weight: 900; color: #818cf8; font-size: 13px;">Gói ${escapeHtml(sub.tierLabel || sub.tierCode)}</td>
          <td style="padding: 12px 14px; font-size: 11px;">
            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
              <span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-primary);">Luồng: <strong>${sub.threads}</strong></span>
              <span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-primary);">Máy: <strong>${sub.machines}</strong></span>
              <span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-primary);">${sub.resolution}</span>
            </div>
          </td>
          <td style="padding: 12px 14px; font-weight: 800; color: #22c55e;">${priceStr}</td>
          <td style="padding: 12px 14px; color: var(--text-muted); font-size: 11px;">
            <div>Từ: ${createdDateStr}</div>
            <div style="color: ${isExpired ? '#ef4444' : 'var(--text-primary)'}; font-weight: 700;">Đến: ${expireDateStr}</div>
          </td>
          <td style="padding: 12px 14px;">${statusBadge}</td>
          <td style="padding: 12px 14px; text-align: center;">
            <button type="button" class="btn-outline" onclick="openModulePricingModalDesktop('${sub.moduleSlug}')" style="padding: 5px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; margin: 0;">
              Bảng giá
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function onAdminTxDatePresetChange() {
  const presetEl = document.getElementById('admin-tx-date-preset');
  const customContainer = document.getElementById('admin-tx-custom-date-container');

  if (!presetEl || !customContainer) return;

  if (presetEl.value === 'CUSTOM') {
    customContainer.style.display = 'flex';
  } else {
    customContainer.style.display = 'none';
    if (activeAdminTxTab === 'deposit') {
      loadAdminTransactionData(1);
    }
  }
}

async function loadAdminTransactionData(page = 1) {
  if (activeAdminTxTab === 'subscriptions') {
    filterAndRenderAdminSubscriptions();
    return;
  }

  adminTxCurrentPage = page;
  const searchInput = document.getElementById('admin-tx-search-input');
  const statusFilter = document.getElementById('admin-tx-status-filter');
  const pageSizeSelect = document.getElementById('admin-tx-page-size');
  const datePresetSelect = document.getElementById('admin-tx-date-preset');
  const startDateInput = document.getElementById('admin-tx-start-date');
  const endDateInput = document.getElementById('admin-tx-end-date');
  const tbody = document.getElementById('admin-tx-table-body');
  const thead = document.getElementById('admin-tx-table-head');

  if (thead) {
    thead.innerHTML = `
      <tr style="background: var(--bg-primary); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
        <th style="padding: 12px 14px;" data-i18n="col_code">MÃ ĐƠN</th>
        <th style="padding: 12px 14px;" data-i18n="col_customer">KHÁCH HÀNG</th>
        <th style="padding: 12px 14px;" data-i18n="col_amount">SỐ TIỀN</th>
        <th style="padding: 12px 14px;" data-i18n="col_syntax">CÚ PHÁP / SEPAY TRANS</th>
        <th style="padding: 12px 14px;" data-i18n="col_status">TRẠNG THÁI</th>
        <th style="padding: 12px 14px;" data-i18n="col_time">THỜI GIAN</th>
        <th style="padding: 12px 14px; text-align: center;" data-i18n="col_action">HÀNH ĐỘNG</th>
      </tr>
    `;
  }

  const search = searchInput ? searchInput.value.trim() : '';
  const status = statusFilter ? statusFilter.value : 'ALL';
  const limit = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;
  const datePreset = datePresetSelect ? datePresetSelect.value : 'ALL';
  const startDate = startDateInput ? startDateInput.value : '';
  const endDate = endDateInput ? endDateInput.value : '';

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Đang tải danh sách giao dịch...
        </td>
      </tr>
    `;
  }

  try {
    const params = new URLSearchParams({
      page: adminTxCurrentPage,
      limit,
      search,
      status,
      datePreset,
    });

    if (datePreset === 'CUSTOM') {
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
    }

    const res = await apiFetch(`/payment/admin/all?${params.toString()}`);

    if (!res || !res.data) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Không có dữ liệu.</td></tr>`;
      return;
    }

    // 1. Update KPI stats
    if (res.stats) {
      const revenueEl = document.getElementById('admin-tx-total-revenue');
      const totalCountEl = document.getElementById('admin-tx-total-count');
      const pendingCountEl = document.getElementById('admin-tx-pending-count');
      const completedCountEl = document.getElementById('admin-tx-completed-count');

      if (revenueEl) revenueEl.textContent = (res.stats.totalRevenue || 0).toLocaleString('vi-VN') + 'đ';
      if (totalCountEl) totalCountEl.textContent = (res.stats.totalTransactions || 0) + ' đơn';
      if (pendingCountEl) pendingCountEl.textContent = (res.stats.pendingCount || 0) + ' đơn';
      if (completedCountEl) completedCountEl.textContent = (res.stats.completedCount || 0) + ' đơn';
    }

    // 2. Render Table Rows (Strictly No Emojis)
    const items = res.data;
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Không tìm thấy giao dịch nào phù hợp.</td></tr>`;
    } else {
      tbody.innerHTML = items.map(tx => {
        let statusBadge = '';
        if (tx.status === 'COMPLETED') {
          statusBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(34, 197, 94, 0.12); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); font-weight: 700; font-size: 11px;">Thành công</span>`;
        } else if (tx.status === 'PENDING') {
          statusBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 700; font-size: 11px;">Đang chờ</span>`;
        } else {
          statusBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-weight: 700; font-size: 11px;">Đã hủy</span>`;
        }

        const dateStr = new Date(tx.createdAt).toLocaleString('vi-VN');

        let actionBtns = '';
        if (tx.status === 'PENDING') {
          actionBtns = `
            <div style="display: flex; gap: 6px; justify-content: center;">
              <button onclick="handleApproveTxAdmin('${tx.id}', '${tx.code}', '${tx.userEmail}', ${tx.amount})" style="padding: 5px 12px; border-radius: 6px; background: #22c55e; color: #ffffff; border: none; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;">
                Duyệt (+Cộng tiền)
              </button>
              <button onclick="handleCancelTxAdmin('${tx.id}', '${tx.code}')" style="padding: 5px 10px; border-radius: 6px; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                Hủy
              </button>
            </div>
          `;
        } else {
          actionBtns = `<span style="font-size: 11px; color: var(--text-muted);">Không khả dụng</span>`;
        }

        return `
          <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s;">
            <td style="padding: 12px 14px; font-weight: 800; color: var(--text-primary);">#${tx.code}</td>
            <td style="padding: 12px 14px;">
              <div style="font-weight: 700; color: var(--text-primary);">${tx.username}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${tx.userEmail}</div>
            </td>
            <td style="padding: 12px 14px; font-weight: 800; color: ${tx.status === 'COMPLETED' ? '#22c55e' : 'var(--text-primary)'};">
              +${tx.amount.toLocaleString('vi-VN')}đ
            </td>
            <td style="padding: 12px 14px; font-family: monospace; font-size: 12px; color: var(--text-secondary);">
              <div>${tx.fullContent}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${tx.sepayTransId ? 'Ref: ' + tx.sepayTransId : tx.bankName}</div>
            </td>
            <td style="padding: 12px 14px;">${statusBadge}</td>
            <td style="padding: 12px 14px; font-size: 12px; color: var(--text-muted);">${dateStr}</td>
            <td style="padding: 12px 14px; text-align: center;">${actionBtns}</td>
          </tr>
        `;
      }).join('');
    }

    // 3. Update Pagination
    adminTxTotalPages = res.totalPages || 1;
    const startIdx = res.total > 0 ? (res.page - 1) * res.limit + 1 : 0;
    const endIdx = Math.min(res.page * res.limit, res.total);

    const infoEl = document.getElementById('admin-tx-pagination-info');
    if (infoEl) infoEl.textContent = `Hiển thị ${startIdx} - ${endIdx} trên tổng ${res.total} giao dịch`;

    const badgeEl = document.getElementById('admin-tx-page-badge');
    if (badgeEl) badgeEl.textContent = `${res.page} / ${adminTxTotalPages}`;

    const prevBtn = document.getElementById('admin-tx-prev-btn');
    const nextBtn = document.getElementById('admin-tx-next-btn');

    if (prevBtn) prevBtn.disabled = res.page <= 1;
    if (nextBtn) nextBtn.disabled = res.page >= adminTxTotalPages;

  } catch (err) {
    console.error('[AdminTx] Error loading transactions:', err);
    if (typeof showToast === 'function') {
      showToast('Lỗi tải danh sách giao dịch: ' + (err.message || err), 'error');
    }
  }
}

function adminTxChangePage(dir) {
  const targetPage = adminTxCurrentPage + dir;
  if (targetPage >= 1 && targetPage <= adminTxTotalPages) {
    loadAdminTransactionData(targetPage);
  }
}

async function handleApproveTxAdmin(txId, code, email, amount) {
  const formattedAmt = amount.toLocaleString('vi-VN') + 'đ';
  const confirmMsg = `XÁC NHẬN PHÊ DUYỆT THỦ CÔNG:\n\nĐơn nạp: #${code}\nKhách hàng: ${email}\nSố tiền cộng: +${formattedAmt}\n\nSau khi duyệt, số dư người dùng sẽ lập tức tăng +${formattedAmt}. Bạn có chắc chắn muốn duyệt?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await apiFetch(`/payment/admin/approve/${txId}`, {
      method: 'PATCH',
    });

    if (typeof showToast === 'function') {
      showToast(res.message || 'Đã duyệt giao dịch thành công!', 'success');
    }
    loadAdminTransactionData(adminTxCurrentPage);
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Lỗi duyệt giao dịch: ' + (err.message || err), 'error');
    }
  }
}

async function handleCancelTxAdmin(txId, code) {
  if (!confirm(`Bạn có chắc chắn muốn hủy đơn nạp tiền #${code}?`)) return;

  try {
    const res = await apiFetch(`/payment/admin/cancel/${txId}`, {
      method: 'PATCH',
    });

    if (typeof showToast === 'function') {
      showToast(res.message || 'Đã hủy đơn nạp thành công!', 'success');
    }
    loadAdminTransactionData(adminTxCurrentPage);
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Lỗi hủy giao dịch: ' + (err.message || err), 'error');
    }
  }
}

// ==================== USER TRANSACTION HISTORY & DEPOSIT MODAL ====================
let userTxCurrentPage = 1;
let activeUserTxTab = 'deposit';

function switchUserTxTab(tabName) {
  activeUserTxTab = tabName;
  const depositBtn = document.getElementById('tx-tab-btn-deposit');
  const subBtn = document.getElementById('tx-tab-btn-subscriptions');
  const thead = document.getElementById('user-tx-table-head');
  const filterToolbar = document.getElementById('user-tx-filter-toolbar');

  if (tabName === 'deposit') {
    if (depositBtn) {
      depositBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      depositBtn.style.color = '#ffffff';
      depositBtn.style.border = 'none';
      depositBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
    }
    if (subBtn) {
      subBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      subBtn.style.color = 'var(--text-muted)';
      subBtn.style.border = '1px solid var(--border-color)';
      subBtn.style.boxShadow = 'none';
    }

    if (filterToolbar) filterToolbar.style.display = 'flex';

    if (thead) {
      thead.innerHTML = `
        <tr style="background: var(--bg-primary); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
          <th style="padding: 12px 14px;">MÃ ĐƠN</th>
          <th style="padding: 12px 14px;">NỘI DUNG CHUYỂN KHOẢN</th>
          <th style="padding: 12px 14px;">SỐ TIỀN</th>
          <th style="padding: 12px 14px;">NGÂN HÀNG</th>
          <th style="padding: 12px 14px;">TRẠNG THÁI</th>
          <th style="padding: 12px 14px;">THỜI GIAN</th>
          <th style="padding: 12px 14px; text-align: center;">HÀNH ĐỘNG</th>
        </tr>
      `;
    }
    loadUserTransactionHistory(1);
  } else {
    if (subBtn) {
      subBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      subBtn.style.color = '#ffffff';
      subBtn.style.border = 'none';
      subBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
    }
    if (depositBtn) {
      depositBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      depositBtn.style.color = 'var(--text-muted)';
      depositBtn.style.border = '1px solid var(--border-color)';
      depositBtn.style.boxShadow = 'none';
    }

    if (filterToolbar) filterToolbar.style.display = 'none';

    if (thead) {
      thead.innerHTML = `
        <tr style="background: var(--bg-primary); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
          <th style="padding: 12px 14px;">MÔ-ĐUN DỊCH VỤ</th>
          <th style="padding: 12px 14px;">GÓI ĐĂNG KÝ</th>
          <th style="padding: 12px 14px;">CẤU HÌNH GÓI</th>
          <th style="padding: 12px 14px;">CHI PHÍ THÁNG</th>
          <th style="padding: 12px 14px;">THỜI HẠN SỬ DỤNG</th>
          <th style="padding: 12px 14px;">TRẠNG THÁI</th>
          <th style="padding: 12px 14px; text-align: center;">HÀNH ĐỘNG</th>
        </tr>
      `;
    }
    loadUserSubscriptionHistory();
  }
}

function refreshCurrentTxTab() {
  if (activeUserTxTab === 'subscriptions') {
    loadUserSubscriptionHistory();
  } else {
    loadUserTransactionHistory(1);
  }
}

async function loadUserSubscriptionHistory() {
  if (activeUserTxTab !== 'subscriptions') return;

  const tbody = document.getElementById('user-tx-table-body');
  const infoEl = document.getElementById('user-tx-pagination-info');
  const badgeEl = document.getElementById('user-tx-page-badge');

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Đang tải danh sách gói cước đã đăng ký...
        </td>
      </tr>
    `;
  }

  try {
    const res = await apiFetch('/pricing/my-subscriptions');
    const subs = (res && Array.isArray(res.data)) ? res.data : [];

    if (infoEl) infoEl.textContent = `Tổng cộng ${subs.length} gói cước dịch vụ đã mua`;
    if (badgeEl) badgeEl.textContent = `1 / 1`;

    if (subs.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">Bạn chưa đăng ký gói cước dịch vụ nào. Bấm nút [Nâng cấp gói / Bảng giá] ở các mô-đun để trải nghiệm!</td></tr>`;
      return;
    }

    if (tbody) {
      tbody.innerHTML = subs.map(sub => {
        const isExpired = sub.expiresAt && new Date(sub.expiresAt) < new Date();
        const statusBadge = !isExpired && sub.status === 'ACTIVE'
          ? `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); font-weight: 700; font-size: 11px; white-space: nowrap;">Đang hoạt động</span>`
          : `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); font-weight: 700; font-size: 11px; white-space: nowrap;">Hết hạn</span>`;

        const priceStr = sub.price ? `-${sub.price.toLocaleString('vi-VN')}đ` : 'Miễn phí';
        const dateStr = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn';

        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 14px; font-weight: 800; color: var(--text-primary);">
              <span style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; display: inline-block; white-space: nowrap;">${sub.moduleName || sub.moduleSlug}</span>
            </td>
            <td style="padding: 14px; font-weight: 900; color: #818cf8; font-size: 14px; white-space: nowrap;">Gói ${sub.tierLabel || sub.tierCode}</td>
            <td style="padding: 14px; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px; color: var(--text-primary); border: 1px solid var(--border-color);">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <strong>${sub.threads}</strong> luồng
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px; color: var(--text-primary); border: 1px solid var(--border-color);">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <strong>${sub.machines}</strong> máy
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px; color: var(--text-primary); border: 1px solid var(--border-color);">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#a855f7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                  ${sub.resolution}
                </span>
              </div>
            </td>
            <td style="padding: 14px; font-weight: 900; color: #ef4444; font-size: 14px; white-space: nowrap;">${priceStr}</td>
            <td style="padding: 14px; color: var(--text-muted); font-size: 12px; white-space: nowrap;">Đến ${dateStr}</td>
            <td style="padding: 14px;">${statusBadge}</td>
            <td style="padding: 14px; text-align: center;">
              <button type="button" class="btn-primary" onclick="openModulePricingModalDesktop('${sub.moduleSlug}')" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 8px; width: auto !important; margin: 0; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
                <span>Gia hạn / Nâng cấp</span>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('[UserSubsHistory] Error:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải danh sách gói cước.</td></tr>`;
  }
}

async function loadUserTransactionHistory(page = 1) {
  if (activeUserTxTab !== 'deposit') return;

  userTxCurrentPage = page;
  const searchInput = document.getElementById('user-tx-search-input');
  const statusFilter = document.getElementById('user-tx-status-filter');
  const pageSizeSelect = document.getElementById('user-tx-page-size');
  const tbody = document.getElementById('user-tx-table-body');

  const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const status = statusFilter ? statusFilter.value : 'ALL';
  const limit = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Đang tải lịch sử giao dịch...
        </td>
      </tr>
    `;
  }

  try {
    const rawData = await apiFetch('/payment/my-transactions');
    if (!Array.isArray(rawData)) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Không có dữ liệu.</td></tr>`;
      return;
    }

    // Client-side filtering
    let filtered = rawData.filter(item => {
      if (status !== 'ALL' && item.status !== status) return false;
      if (search) {
        const matchCode = (item.code || '').toLowerCase().includes(search);
        const matchContent = (item.fullContent || '').toLowerCase().includes(search);
        const matchBank = (item.bankName || '').toLowerCase().includes(search);
        if (!matchCode && !matchContent && !matchBank) return false;
      }
      return true;
    });

    const total = filtered.length;
    userTxTotalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.min(Math.max(1, userTxCurrentPage), userTxTotalPages);
    const startIdx = (safePage - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    if (paginated.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Chưa có giao dịch nào phù hợp.</td></tr>`;
    } else {
      tbody.innerHTML = paginated.map(item => {
        let statusBadge = '';
        if (item.status === 'COMPLETED') {
          statusBadge = `<span style="padding: 3px 10px; border-radius: 20px; background: rgba(34, 197, 94, 0.12); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); font-weight: 700; font-size: 11px;">Thành công</span>`;
        } else if (item.status === 'PENDING') {
          statusBadge = `<span style="padding: 3px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 700; font-size: 11px;">Đang chờ</span>`;
        } else {
          statusBadge = `<span style="padding: 3px 10px; border-radius: 20px; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-weight: 700; font-size: 11px;">Đã hủy</span>`;
        }

        let actionBtn = '';
        if (item.status === 'PENDING') {
          actionBtn = `<button type="button" onclick="resumePendingDepositDesktop('${item.code}')" style="padding: 5px 12px; border-radius: 6px; background: var(--accent); color: #ffffff; border: none; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; white-space: nowrap;">Thanh toán ngay →</button>`;
        } else {
          actionBtn = `<span style="font-size: 11px; color: var(--text-muted);">—</span>`;
        }

        const dateStr = new Date(item.createdAt).toLocaleString('vi-VN');

        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 12px 14px; font-weight: 800; color: var(--text-primary);">#${item.code}</td>
            <td style="padding: 12px 14px; font-family: monospace; font-size: 12px; color: var(--text-secondary);">${item.fullContent}</td>
            <td style="padding: 12px 14px; font-weight: 800; color: ${item.status === 'COMPLETED' ? '#22c55e' : 'var(--text-primary)'};">+${item.amount.toLocaleString('vi-VN')}đ</td>
            <td style="padding: 12px 14px; color: var(--text-secondary);">${item.bankName || 'ACB'}</td>
            <td style="padding: 12px 14px;">${statusBadge}</td>
            <td style="padding: 12px 14px; color: var(--text-muted); font-size: 12px;">${dateStr}</td>
            <td style="padding: 12px 14px; text-align: center;">${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }

    const infoEl = document.getElementById('user-tx-pagination-info');
    if (infoEl) infoEl.textContent = `Hiển thị ${total > 0 ? startIdx + 1 : 0} - ${Math.min(startIdx + limit, total)} trên tổng ${total} giao dịch`;

    const badgeEl = document.getElementById('user-tx-page-badge');
    if (badgeEl) badgeEl.textContent = `${safePage} / ${userTxTotalPages}`;

    const prevBtn = document.getElementById('user-tx-prev-btn');
    const nextBtn = document.getElementById('user-tx-next-btn');

    if (prevBtn) prevBtn.disabled = safePage <= 1;
    if (nextBtn) nextBtn.disabled = safePage >= userTxTotalPages;

  } catch (err) {
    console.error('[UserTx] Error fetching history:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải lịch sử giao dịch. Vui lòng đăng nhập lại.</td></tr>`;
  }
}

function userTxChangePage(dir) {
  const targetPage = userTxCurrentPage + dir;
  if (targetPage >= 1 && targetPage <= userTxTotalPages) {
    loadUserTransactionHistory(targetPage);
  }
}

async function resumePendingDepositDesktop(code) {
  try {
    if (typeof showToast === 'function') {
      // showToast('Đang mở lại mã...', 'info');
    }
    const res = await apiFetch(`/payment/status/${code}`);
    if (res && res.status === 'PENDING') {
      currentDepositData = res;
      openDepositModalDesktop();
      renderDepositStep2(res);
      startDepositPollingDesktop(code);
    } else if (res && res.status === 'COMPLETED') {
      if (typeof showToast === 'function') {
        showToast('Đơn nạp đã được hoàn tất thành công!', 'success');
      }
      loadUserTransactionHistory(userTxCurrentPage);
    } else {
      if (typeof showToast === 'function') {
        showToast('Đơn nạp không còn khả dụng.', 'error');
      }
    }
  } catch (err) {
    console.error('[ResumeDeposit] Error:', err);
    if (typeof showToast === 'function') {
      showToast('Không thể mở lại đơn nạp tiền: ' + (err.message || err), 'error');
    }
  }
}

// ==================== DEPOSIT MODAL LOGIC ====================

function openDepositModalDesktop() {
  const overlay = document.getElementById('desktop-deposit-modal-overlay');
  if (overlay) overlay.classList.remove('hidden');
  renderDepositStep1();
}

function closeDepositModalDesktop() {
  const overlay = document.getElementById('desktop-deposit-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (userDepositPollTimer) {
    clearInterval(userDepositPollTimer);
    userDepositPollTimer = null;
  }
}

function renderDepositStep1() {
  const container = document.getElementById('desktop-deposit-modal-content');
  if (!container) return;

  const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      <div>
        <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; display: block;">
          Chọn nhanh hạn mức nạp (VNĐ):
        </label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px;">
          ${presetAmounts.map((amt, idx) => `
            <button type="button" onclick="selectDepositPreset(${amt})" style="padding: 10px 12px; border-radius: 10px; background: ${amt === 200000 ? 'var(--accent)' : 'var(--bg-primary)'}; color: ${amt === 200000 ? '#ffffff' : 'var(--text-primary)'}; border: 1px solid ${amt === 200000 ? 'var(--accent)' : 'var(--border-color)'}; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;" id="preset-btn-${amt}">
              ${amt.toLocaleString('vi-VN')}đ
            </button>
          `).join('')}
        </div>
      </div>

      <div>
        <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: block;">
          Hoặc nhập số tiền tùy chỉnh:
        </label>
        <div style="position: relative;">
          <input type="text" id="desktop-custom-amount" value="200.000" placeholder="Ví dụ: 100.000" style="width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 16px; font-weight: 800; outline: none;" oninput="onCustomAmountInput(this.value)" />
          <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: 700; font-size: 14px;">VNĐ</span>
        </div>
      </div>

      <div id="desktop-deposit-error" style="display: none; padding: 12px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; font-size: 13px;"></div>

      <button type="button" class="btn-primary" id="desktop-create-qr-btn" onclick="handleCreateDepositDesktop()" style="width: 100% !important; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 800; margin: 0;">
        Tạo mã QR nạp tiền →
      </button>
    </div>
  `;
}

function selectDepositPreset(amt) {
  const input = document.getElementById('desktop-custom-amount');
  if (input) input.value = amt.toLocaleString('vi-VN');

  const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];
  presetAmounts.forEach(a => {
    const btn = document.getElementById(`preset-btn-${a}`);
    if (btn) {
      if (a === amt) {
        btn.style.background = 'var(--accent)';
        btn.style.color = '#ffffff';
        btn.style.borderColor = 'var(--accent)';
      } else {
        btn.style.background = 'var(--bg-primary)';
        btn.style.color = 'var(--text-primary)';
        btn.style.borderColor = 'var(--border-color)';
      }
    }
  });
}

function onCustomAmountInput(val) {
  const clean = val.replace(/\D/g, '');
  const input = document.getElementById('desktop-custom-amount');
  if (input && clean) {
    input.value = parseInt(clean, 10).toLocaleString('vi-VN');
  }
}

async function handleCreateDepositDesktop() {
  const input = document.getElementById('desktop-custom-amount');
  const errDiv = document.getElementById('desktop-deposit-error');
  const btn = document.getElementById('desktop-create-qr-btn');

  const rawVal = input ? input.value.replace(/\D/g, '') : '';
  const amount = parseInt(rawVal, 10);

  if (!amount || amount < 10000) {
    if (errDiv) {
      errDiv.style.display = 'block';
      errDiv.textContent = 'Số tiền nạp tối thiểu là 10.000đ';
    }
    return;
  }

  if (errDiv) errDiv.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Đang tạo mã QR...';
  }

  try {
    const res = await apiFetch('/payment/create-deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });

    if (res && res.code) {
      currentDepositData = res;
      renderDepositStep2(res);
      startDepositPollingDesktop(res.code);
    }
  } catch (err) {
    if (errDiv) {
      errDiv.style.display = 'block';
      errDiv.textContent = err.message || 'Lỗi kết nối tạo mã QR';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Tạo mã QR nạp tiền →';
    }
  }
}

function renderDepositStep2(data) {
  const container = document.getElementById('desktop-deposit-modal-content');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Real-time Polling Status Banner -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 10px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--accent);">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
          <span>Đang chờ chuyển khoản... (Tự động kiểm tra 24/7)</span>
        </div>
        <span style="font-size: 11px; opacity: 0.8;">Cập nhật 3s/lần</span>
      </div>

      <!-- QR & Details Grid -->
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
        <div style="flex: 1 1 200px; display: flex; flex-direction: column; align-items: center; background: #ffffff; padding: 12px; border-radius: 16px; border: 1px solid var(--border-color);">
          <img src="${data.qrCodeUrl}" alt="VietQR SePay" style="width: 100%; max-width: 200px; aspect-ratio: 1/1; object-fit: contain; border-radius: 8px;" />
          <span style="font-size: 11px; font-weight: 700; color: #000000; margin-top: 6px;">Quét bằng App Ngân Hàng</span>
        </div>

        <div style="flex: 1 1 240px; display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 11px; color: var(--text-muted);">Ngân hàng nhận</div>
            <div style="font-size: 14px; font-weight: 800; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center;">
              <span>${data.bankName}</span>
              <button type="button" onclick="copyTextDesktop('${data.bankName}')" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; font-weight: 700;">Copy</button>
            </div>
          </div>

          <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 11px; color: var(--text-muted);">Số tài khoản</div>
            <div style="font-size: 15px; font-weight: 800; color: var(--accent); display: flex; justify-content: space-between; align-items: center;">
              <span>${data.accountNumber}</span>
              <button type="button" onclick="copyTextDesktop('${data.accountNumber}')" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; font-weight: 700;">Copy</button>
            </div>
          </div>

          <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 11px; color: var(--text-muted);">Chủ tài khoản</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${data.accountHolder}</div>
          </div>

          <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 11px; color: var(--text-muted);">Số tiền nạp</div>
            <div style="font-size: 16px; font-weight: 900; color: #22c55e; display: flex; justify-content: space-between; align-items: center;">
              <span>${data.amount.toLocaleString('vi-VN')}đ</span>
              <button type="button" onclick="copyTextDesktop('${data.amount}')" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; font-weight: 700;">Copy</button>
            </div>
          </div>

          <div style="background: rgba(245, 158, 11, 0.15); padding: 10px 12px; border-radius: 10px; border: 2px dashed var(--accent);">
            <div style="font-size: 11px; color: var(--accent); font-weight: 800;">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):</div>
            <div style="font-size: 14px; font-weight: 900; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span>${data.fullContent}</span>
              <button type="button" onclick="copyTextDesktop('${data.fullContent}')" style="background: var(--accent); color: #ffffff; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Copy</button>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="btn-outline" onclick="renderDepositStep1()" style="width: 100% !important; padding: 10px; border-radius: 10px; font-size: 13px; margin: 0;">
        ← Thay đổi số tiền nạp khác
      </button>
    </div>
  `;
}

function startDepositPollingDesktop(code) {
  if (userDepositPollTimer) clearInterval(userDepositPollTimer);

  userDepositPollTimer = setInterval(async () => {
    try {
      const res = await apiFetch(`/payment/status/${code}`);
      if (res && res.status === 'COMPLETED') {
        clearInterval(userDepositPollTimer);
        userDepositPollTimer = null;

        renderDepositSuccessDesktop(res);

        // Refresh user profile balance
        if (typeof loadProfileData === 'function') loadProfileData();
        if (typeof updateProfile === 'function') updateProfile();
      }
    } catch (e) {
      console.warn('[DepositPoll] Error checking status:', e);
    }
  }, 3000);
}

function renderDepositSuccessDesktop(res) {
  const container = document.getElementById('desktop-deposit-modal-content');
  if (!container) return;

  const amtStr = (res.amount || currentDepositData?.amount || 0).toLocaleString('vi-VN') + 'đ';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 20px 10px; gap: 16px;">
      <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; color: #22c55e; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: var(--text-primary);">Nạp tiền thành công!</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-top: 6px;">
          Giao dịch tự động đã hoàn tất. Số dư tài khoản đã được cộng thành công.
        </p>
      </div>

      <div style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 16px; border-radius: 12px; width: 100%; box-sizing: border-box;">
        <div style="font-size: 12px; color: var(--text-muted);">Mã đơn nạp: #${res.code || currentDepositData?.code}</div>
        <div style="font-size: 22px; font-weight: 900; color: #22c55e; margin: 6px 0;">+${amtStr}</div>
      </div>

      <button type="button" class="btn-primary" onclick="closeDepositModalDesktop(); loadUserTransactionHistory(1);" style="width: 100% !important; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; margin: 0;">
        Hoàn tất & Đóng
      </button>
    </div>
  `;
}

function copyTextDesktop(text) {
  navigator.clipboard.writeText(text);
  if (typeof showToast === 'function') {
    showToast('Đã sao chép: ' + text, 'success');
  }
}
