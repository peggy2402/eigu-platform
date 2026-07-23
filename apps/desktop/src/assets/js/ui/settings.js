async function submitFeedback(event) {
  event.preventDefault();
  
  const msgInput = document.getElementById('feedback-message');
  const fileInput = document.getElementById('feedback-file');
  const submitBtn = document.getElementById('feedback-submit-btn');
  
  const msg = msgInput.value.trim();
  if (!msg) {
    showToast('Vui lòng nhập nội dung góp ý!', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  const oldText = submitBtn.innerText;
  submitBtn.innerText = 'Đang gửi...';

  try {
    const fd = new FormData();
    fd.append('message', msg);
    if (fileInput.files[0]) {
      fd.append('image', fileInput.files[0]);
    }
    
    // apiFetch doesn't handle FormData easily if it forces JSON, so we use native fetch
    const token = localStorage.getItem('accessToken');
    const res = await fetch(window.EIGU_CONFIG.getApiUrl('/feedback/report'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fd
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Lỗi gửi báo cáo');
    }
    
    showToast('Cảm ơn bạn đã gửi báo cáo thành công!', 'success');
    msgInput.value = '';
    fileInput.value = '';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = oldText;
  }
}

// --- API Keys Management ---
async function loadApiKeys() {
  const tbody = document.getElementById('api-keys-list-body');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Đang tải danh sách key...</td></tr>';
  
  if (!window.ipcRenderer) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Chỉ khả dụng trên môi trường Desktop</td></tr>';
    return;
  }
  
  try {
    const keys = await window.ipcRenderer.invoke('get-api-keys');
    tbody.innerHTML = '';
    
    if (keys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-muted);">Chưa có API Key nào được lưu.</td></tr>';
      return;
    }
    
    keys.forEach(k => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      
      const actionHtml = k.isReadOnly 
        ? `<span style="color:var(--text-muted); font-size:11px; font-style:italic;">Hệ thống (.env)</span>`
        : `<button class="btn-outline" onclick="deleteApiKey('${k.id}')" style="padding: 4px 8px; font-size:12px; border-color: #ef4444; color: #ef4444; border-radius: 4px;">Xóa</button>`;

      tr.innerHTML = `
        <td style="padding: 10px; font-weight:600; color: var(--accent);">${k.type.replace('_API_KEY', '').replace('_KEY', '')}</td>
        <td style="padding: 10px; font-family: monospace;">${k.maskedValue}</td>
        <td style="padding: 10px; color: var(--text-secondary);">${k.note || '-'}</td>
        <td style="padding: 10px; text-align:center;">
          ${actionHtml}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:12px; color:#ef4444;">Lỗi: ${err.message}</td></tr>`;
  }
}

async function addNewApiKey() {
  const type = document.getElementById('new-key-type').value;
  const valEl = document.getElementById('new-key-value');
  const noteEl = document.getElementById('new-key-note');
  
  const value = valEl.value.trim();
  const note = noteEl.value.trim();
  
  if (!value) {
    showToast('Lỗi', 'Vui lòng nhập giá trị API Key!', 'error');
    return;
  }
  
  if (!window.ipcRenderer) {
    showToast('Lỗi', 'Tính năng chỉ hoạt động trên Electron!', 'error');
    return;
  }
  
  try {
    await window.ipcRenderer.invoke('add-api-key', { type, value, note });
    showToast('Thành công', 'Đã lưu API Key mã hóa thành công!', 'success');
    valEl.value = '';
    noteEl.value = '';
    loadApiKeys();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi khi lưu key', 'error');
  }
}

async function deleteApiKey(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa API Key này không?')) return;
  
  try {
    await window.ipcRenderer.invoke('delete-api-key', id);
    showToast('Thành công', 'Đã xóa API Key!', 'success');
    loadApiKeys();
  } catch (err) {
    showToast('Lỗi', err.message || 'Lỗi khi xóa key', 'error');
  }
}

