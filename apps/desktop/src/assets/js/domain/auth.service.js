async function handleLogin() {
  const identifier = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  if (!identifier || !password) return setAuthError('login', 'Vui lòng nhập email hoặc tên đăng nhập và mật khẩu');
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Đang đăng nhập...';
  try {
    const data = await apiFetch('/auth/login', { method:'POST', body:JSON.stringify({identifier,password}) });
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (document.getElementById('remember-me').checked) {
      localStorage.setItem('eigu_saved_email', identifier);
      localStorage.setItem('eigu_saved_password', password);
    } else {
      localStorage.removeItem('eigu_saved_email');
      localStorage.removeItem('eigu_saved_password');
    }
    userProfile = data.user;
    enterApp(true);
  } catch(e) { setAuthError('login', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Đăng nhập'; }
}

function loadRememberedEmail() {
  const savedEmail = localStorage.getItem('eigu_saved_email');
  const savedPass = localStorage.getItem('eigu_saved_password');
  if (savedEmail) {
    document.getElementById('login-email').value = savedEmail;
    document.getElementById('remember-me').checked = true;
    if (savedPass) {
      document.getElementById('login-pass').value = savedPass;
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Yếu', pct: 25, color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Trung bình', pct: 50, color: '#f59e0b' };
  if (score <= 3) return { level: 3, label: 'Khá', pct: 75, color: '#10b981' };
  return { level: 4, label: 'Mạnh', pct: 100, color: '#6366f1' };
}

function updatePasswordStrength(pw) {
  const el = document.querySelector('.password-strength');
  const fill = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!pw) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const s = getPasswordStrength(pw);
  fill.style.width = s.pct + '%';
  fill.style.background = s.color;
  label.textContent = s.label;
}

let registerEmail = '';
async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-pass').value;
  const confirmPw = document.getElementById('reg-pass-confirm').value;
  if (!username || !email || !password) return setAuthError('register', 'Vui lòng nhập tên đăng nhập, email và mật khẩu');
  if (username.length < 3) return setAuthError('register', 'Tên đăng nhập ít nhất 3 ký tự');
  if (!EMAIL_RE.test(email)) return setAuthError('register', 'Email không hợp lệ');
  if (password.length < 6) return setAuthError('register', 'Mật khẩu ít nhất 6 ký tự');
  if (password !== confirmPw) return setAuthError('register', 'Mật khẩu xác nhận không khớp');
  const btn = document.querySelector('#register-step1 .auth-btn');
  btn.disabled = true; btn.textContent = 'Đang đăng ký...';
  try {
    await apiFetch('/auth/register', { method:'POST', body:JSON.stringify({username,email,password}) });
    registerEmail = email;
    document.getElementById('reg-otp-email').textContent = email;
    showToast('Đăng ký thành công', 'Vui lòng kiểm tra email để lấy mã OTP', 'success');
    document.getElementById('register-step1').classList.add('hidden');
    document.getElementById('register-step2').classList.remove('hidden');
    document.querySelectorAll('#register-step2 .otp-digit').forEach(inp => inp.value = '');
    if (document.querySelector('#register-step2 .otp-digit')) document.querySelector('#register-step2 .otp-digit').focus();
  } catch(e) { setAuthError('register', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Đăng ký'; }
}

async function handleVerifyOtp() {
  let otp = '';
  document.querySelectorAll('#register-step2 .otp-digit').forEach(inp => otp += inp.value);
  if (otp.length !== 6) return setAuthError('register', 'Nhập đủ 6 số OTP');
  const btn = document.querySelector('#register-step2 .auth-btn');
  btn.disabled = true; btn.textContent = 'Đang xác thực...';
  try {
    const data = await apiFetch('/auth/verify-email', { method:'POST', body:JSON.stringify({email:registerEmail,otp}) });
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    userProfile = data.user;
    enterApp();
  } catch(e) { setAuthError('register', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Xác thực'; }
}

let forgotEmail = '';
async function handleForgot() {
  forgotEmail = document.getElementById('forgot-email').value.trim();
  if (!forgotEmail) return setAuthError('forgot', 'Vui lòng nhập email');
  const btn = document.querySelector('#forgot-step1 .auth-btn');
  btn.disabled = true; btn.textContent = 'Đang gửi...';
  try {
    await apiFetch('/auth/forgot-password', { method:'POST', body:JSON.stringify({email:forgotEmail}) });
    document.getElementById('forgot-step1').classList.add('hidden');
    document.getElementById('forgot-step2').classList.remove('hidden');
    document.querySelectorAll('#forgot-step2 .otp-digit').forEach(inp => inp.value = '');
    if (document.querySelector('#forgot-step2 .otp-digit')) document.querySelector('#forgot-step2 .otp-digit').focus();
  } catch(e) { setAuthError('forgot', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Gửi OTP'; }
}

async function handleResetPass() {
  let otp = '';
  document.querySelectorAll('#forgot-step2 .otp-digit').forEach(inp => otp += inp.value);
  const newPassword = document.getElementById('forgot-newpass').value;
  if (otp.length !== 6 || !newPassword) return setAuthError('forgot', 'Nhập đủ OTP và mật khẩu mới');
  const btn = document.querySelector('#forgot-step2 .auth-btn');
  btn.disabled = true; btn.textContent = 'Đang xử lý...';
  try {
    await apiFetch('/auth/reset-password', { method:'POST', body:JSON.stringify({email:forgotEmail,otp,newPassword}) });
    showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');
    showAuth('login');
  } catch(e) { setAuthError('forgot', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Đặt lại mật khẩu'; }
}

async function handleLogout() {
  try { await apiFetch('/auth/logout', { method:'POST' }); } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  accessToken = null;
  refreshToken = null;
  userProfile = null;

  // Reset phân quyền UI Sidebar khi Đăng xuất
  document.querySelectorAll('.staff-only').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.sidebar-nav > .nav-item[data-view]').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('.sidebar-nav > .nav-item-wrapper').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('.nav-sub-item[data-sub]').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('#profile-dropdown .profile-menu-item').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('#search-popup-body .search-result').forEach(el => el.classList.remove('hidden'));

  // Trả view về Hồ sơ
  if (typeof switchView === 'function') switchView('ho-so');

  // Khôi phục Live Chat Widget
  const liveChatWidget = document.getElementById('live-chat-container');
  if (liveChatWidget) liveChatWidget.style.display = 'block';

  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  showAuth('login');
}
