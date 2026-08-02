// Admin Transaction Management JS module
let adminTxCurrentPage = 1;
let adminTxTotalPages = 1;

function onAdminTxDatePresetChange() {
  const presetEl = document.getElementById('admin-tx-date-preset');
  const customContainer = document.getElementById('admin-tx-custom-date-container');

  if (!presetEl || !customContainer) return;

  if (presetEl.value === 'CUSTOM') {
    customContainer.style.display = 'flex';
  } else {
    customContainer.style.display = 'none';
    loadAdminTransactionData(1);
  }
}

async function loadAdminTransactionData(page = 1) {
  adminTxCurrentPage = page;
  const searchInput = document.getElementById('admin-tx-search-input');
  const statusFilter = document.getElementById('admin-tx-status-filter');
  const pageSizeSelect = document.getElementById('admin-tx-page-size');
  const datePresetSelect = document.getElementById('admin-tx-date-preset');
  const startDateInput = document.getElementById('admin-tx-start-date');
  const endDateInput = document.getElementById('admin-tx-end-date');
  const tbody = document.getElementById('admin-tx-table-body');

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
