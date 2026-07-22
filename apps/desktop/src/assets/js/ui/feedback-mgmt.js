// Feedback Management UI Logic (Fetching Real Data from Supabase / NestJS API)

async function loadRealFeedbackData() {
  const tbody = document.getElementById('feedback-mgmt-table-body');
  const cardsContainer = document.getElementById('feedback-mgmt-cards-container');
  if (!tbody) return;

  const q = (document.getElementById('feedback-search-input')?.value || '').trim();

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu Feedback thực từ Supabase Database...</td></tr>';
  if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Đang nạp dữ liệu Feedback thực từ Supabase Database...</div>';

  try {
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);

    const list = await apiFetch(`/feedback?${queryParams.toString()}`);
    tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy phản hồi nào.</td></tr>';
      if (cardsContainer) cardsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Không tìm thấy phản hồi nào.</div>';
      return;
    }

    list.forEach(item => {
      const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
      const email = item.user ? item.user.email : 'N/A';
      const username = item.user && item.user.username ? '@' + item.user.username : 'Chưa đặt';

      // Giới hạn hiển thị tối đa 100 ký tự nội dung
      const rawContent = item.content || '';
      const displayContent = rawContent.length > 100 ? rawContent.slice(0, 100) + '...' : rawContent;

      // 1. Render Table Row (Desktop View)
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 10px; white-space:nowrap;">
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(email)}</div>
          <div style="font-size:11px; color:var(--accent);">${escapeHtml(username)}</div>
        </td>
        <td style="padding: 10px; color:var(--text-secondary); max-width:380px; word-break:break-word; line-height:1.4;" title="${escapeHtml(rawContent)}">${escapeHtml(displayContent)}</td>
        <td style="padding: 10px; font-size:12px; color:var(--text-muted); white-space:nowrap;">${createdDate}</td>
        <td style="padding: 10px; text-align:center; white-space:nowrap;">
          <button class="btn-outline" onclick="deleteFeedbackReal('${item.id}')" style="padding: 4px 10px; font-size:11px; border-radius: 4px; color:#ef4444; border-color:#ef4444;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Render Responsive Card (Screen < 900px)
      if (cardsContainer) {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        card.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; width:100%;">
            <div style="min-width:0; flex:1;">
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(email)}">${escapeHtml(email)}</div>
              <div style="font-size:11px; color:var(--accent); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(username)}</div>
            </div>
            <div style="font-size:11px; color:var(--text-muted); flex-shrink:0; white-space:nowrap;">${createdDate}</div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); line-height:1.4; background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color); word-break:break-word;" title="${escapeHtml(rawContent)}">
            ${escapeHtml(displayContent)}
          </div>

          <button class="btn-outline" onclick="deleteFeedbackReal('${item.id}')" style="width:100%; padding: 6px 10px; font-size:11px; font-weight:600; border-radius: 6px; color:#ef4444; border-color:#ef4444;">Xóa Phản Hồi</button>
        `;
        cardsContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu Feedback:', err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444;">Lỗi kết nối tới Server API: ${err.message}</div>`;
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
