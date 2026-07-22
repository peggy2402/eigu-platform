const API_BASE = localStorage.getItem('eigu_api_url') || 'http://localhost:3001/api';

function formatFriendlyErrorMessage(raw) {
  if (!raw) return 'Có lỗi xảy ra, vui lòng thử lại sau.';
  let msg = typeof raw === 'string' ? raw : (raw.message || 'Có lỗi xảy ra');
  if (Array.isArray(msg)) msg = msg.join(', ');

  const lower = String(msg).toLowerCase();

  if (lower.includes('invalid credentials')) {
    return 'Tên đăng nhập / Email hoặc mật khẩu không chính xác.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Không thể kết nối tới máy chủ API. Vui lòng kiểm tra lại đường truyền kết nối.';
  }
  if (lower.includes('email not verified')) {
    return 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư OTP.';
  }
  if (lower.includes('user already exists') || lower.includes('email already exists') || lower.includes('username already exists')) {
    return 'Email hoặc Tên đăng nhập này đã được sử dụng trên hệ thống.';
  }
  if (lower.includes('unauthorized') || lower.includes('jwt expired') || lower.includes('token expired')) {
    return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (lower.includes('forbidden')) {
    return 'Tài khoản của bạn không có quyền thực hiện thao tác này.';
  }
  if (lower.includes('invalid otp') || lower.includes('otp expired')) {
    return 'Mã xác thực OTP không đúng hoặc đã hết hạn.';
  }

  return msg;
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      const rawMsg = typeof data.message === 'string' ? data.message : (Array.isArray(data.message) ? data.message.join(', ') : 'Có lỗi xảy ra');
      const friendlyMsg = formatFriendlyErrorMessage(rawMsg);
      const err = new Error(friendlyMsg);
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.data) throw err;
    const friendlyMsg = formatFriendlyErrorMessage(err.message);
    const friendlyErr = new Error(friendlyMsg);
    throw friendlyErr;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = String(text);
  return div.innerHTML;
}
