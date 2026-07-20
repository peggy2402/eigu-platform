async function handleLogin() {
  const identifier = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  if (!identifier || !password) return setAuthError('login', 'Vui long nhap email hoac ten dang nhap va mat khau');
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Dang dang nhap...';
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
    enterApp();
  } catch(e) { setAuthError('login', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Dang nhap'; }
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
  if (!username || !email || !password) return setAuthError('register', 'Vui long nhap ten dang nhap, email va mat khau');
  if (username.length < 3) return setAuthError('register', 'Ten dang nhap it nhat 3 ky tu');
  if (!EMAIL_RE.test(email)) return setAuthError('register', 'Email khong hop le');
  if (password.length < 6) return setAuthError('register', 'Mat khau it nhat 6 ky tu');
  if (password !== confirmPw) return setAuthError('register', 'Mat khau xac nhan khong khop');
  const btn = document.querySelector('#register-step1 .auth-btn');
  btn.disabled = true; btn.textContent = 'Dang dang ky...';
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
  finally { btn.disabled = false; btn.textContent = 'Dang ky'; }
}

async function handleVerifyOtp() {
  let otp = '';
  document.querySelectorAll('#register-step2 .otp-digit').forEach(inp => otp += inp.value);
  if (otp.length !== 6) return setAuthError('register', 'Nhap du 6 so OTP');
  const btn = document.querySelector('#register-step2 .auth-btn');
  btn.disabled = true; btn.textContent = 'Dang xac thuc...';
  try {
    const data = await apiFetch('/auth/verify-email', { method:'POST', body:JSON.stringify({email:registerEmail,otp}) });
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    userProfile = data.user;
    enterApp();
  } catch(e) { setAuthError('register', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Xac thuc'; }
}

let forgotEmail = '';
async function handleForgot() {
  forgotEmail = document.getElementById('forgot-email').value.trim();
  if (!forgotEmail) return setAuthError('forgot', 'Vui long nhap email');
  const btn = document.querySelector('#forgot-step1 .auth-btn');
  btn.disabled = true; btn.textContent = 'Dang gui...';
  try {
    await apiFetch('/auth/forgot-password', { method:'POST', body:JSON.stringify({email:forgotEmail}) });
    document.getElementById('forgot-step1').classList.add('hidden');
    document.getElementById('forgot-step2').classList.remove('hidden');
    document.querySelectorAll('#forgot-step2 .otp-digit').forEach(inp => inp.value = '');
    if (document.querySelector('#forgot-step2 .otp-digit')) document.querySelector('#forgot-step2 .otp-digit').focus();
  } catch(e) { setAuthError('forgot', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Gui OTP'; }
}

async function handleResetPass() {
  let otp = '';
  document.querySelectorAll('#forgot-step2 .otp-digit').forEach(inp => otp += inp.value);
  const newPassword = document.getElementById('forgot-newpass').value;
  if (otp.length !== 6 || !newPassword) return setAuthError('forgot', 'Nhap du OTP va mat khau moi');
  const btn = document.querySelector('#forgot-step2 .auth-btn');
  btn.disabled = true; btn.textContent = 'Dang xu ly...';
  try {
    await apiFetch('/auth/reset-password', { method:'POST', body:JSON.stringify({email:forgotEmail,otp,newPassword}) });
    showToast('Dat lai mat khau thanh cong! Vui long dang nhap.', 'success');
    showAuth('login');
  } catch(e) { setAuthError('forgot', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Dat lai mat khau'; }
}

async function handleLogout() {
  try { await apiFetch('/auth/logout', { method:'POST' }); } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  accessToken = null;
  refreshToken = null;
  userProfile = null;
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  showAuth('login');
}
