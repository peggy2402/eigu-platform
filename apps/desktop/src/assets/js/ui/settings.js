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
    const res = await fetch('http://localhost:3001/api/feedback/report', {
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
