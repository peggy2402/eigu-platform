// Feedback Management UI Logic (Fetching Real Data from Supabase / NestJS API)

async function loadRealFeedbackData() {
  const tbody = document.getElementById('feedback-mgmt-table-body');
  if (!tbody) return;

  const q = (document.getElementById('feedback-search-input')?.value || '').trim();

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu Feedback thực từ Supabase Database...</td></tr>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);

    const list = await apiFetch(`/feedback?${queryParams.toString()}`);
    tbody.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy phản hồi nào.</td></tr>';
      return;
    }

    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';

      const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
      const email = item.user ? item.user.email : 'N/A';
      const username = item.user && item.user.username ? '@' + item.user.username : 'Chưa đặt';

      tr.innerHTML = `
        <td style="padding: 10px;">
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(email)}</div>
          <div style="font-size:11px; color:var(--accent);">${escapeHtml(username)}</div>
        </td>
        <td style="padding: 10px; color:var(--text-secondary); line-height:1.5;">${escapeHtml(item.content)}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted);">${createdDate}</td>
        <td style="padding: 10px; text-align:center;">
          <button class="btn-outline" onclick="deleteFeedbackReal('${item.id}')" style="padding: 4px 10px; font-size:11px; border-radius: 4px; color:#ef4444; border-color:#ef4444;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu Feedback:', err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</td></tr>`;
  }
}

async function deleteFeedbackReal(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này khỏi Supabase Database không?')) return;

  try {
    await apiFetch(`/feedback/${id}`, { method: 'DELETE' });
    showToast('Thành công', 'Đã xóa phản hồi khỏi Database!', 'success');
    loadRealFeedbackData();
  } catch (err) {
    showToast('Lỗi', err.message || 'Không thể xóa phản hồi', 'error');
  }
}
