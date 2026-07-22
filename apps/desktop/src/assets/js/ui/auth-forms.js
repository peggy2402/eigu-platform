function showAuth(form) {
  if (typeof closeBannedScreen === 'function') closeBannedScreen();
  const liveChatContainer = document.getElementById('live-chat-container');
  if (liveChatContainer) liveChatContainer.style.display = 'none';

  ['login','register','forgot'].forEach(f => document.getElementById(f+'-form').classList.add('hidden'));
  document.getElementById(form+'-form').classList.remove('hidden');
  ['login','register','forgot'].forEach(f => document.getElementById(f+'-error').classList.remove('show'));
  if (form === 'login' && typeof loadRememberedEmail === 'function') loadRememberedEmail();
}

function setAuthError(form, msg) {
  const el = document.getElementById(form+'-error');
  if (el) {
    const friendly = typeof formatFriendlyErrorMessage === 'function' ? formatFriendlyErrorMessage(msg) : msg;
    el.textContent = friendly;
    el.classList.add('show');
  }
}

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('otp-digit') && e.target.value) {
    const next = e.target.parentElement.querySelector(`.otp-digit[data-idx="${parseInt(e.target.dataset.idx) + 1}"]`);
    if (next) next.focus();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && e.target.classList.contains('otp-digit') && !e.target.value) {
    const prev = e.target.parentElement.querySelector(`.otp-digit[data-idx="${parseInt(e.target.dataset.idx) - 1}"]`);
    if (prev) { prev.focus(); prev.value = ''; }
  }

  if (e.key === 'Enter') {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer || authContainer.style.display === 'none') {
      return; // Stop execution if user is already inside the application!
    }

    if (!document.getElementById('login-form').classList.contains('hidden')) {
      handleLogin();
    } else if (!document.getElementById('register-form').classList.contains('hidden')) {
      if (!document.getElementById('register-step1').classList.contains('hidden')) {
        handleRegister();
      } else if (!document.getElementById('register-step2').classList.contains('hidden')) {
        handleVerifyOtp();
      }
    } else if (!document.getElementById('forgot-form').classList.contains('hidden')) {
      if (!document.getElementById('forgot-step1').classList.contains('hidden')) {
        handleForgot();
      } else if (!document.getElementById('forgot-step2').classList.contains('hidden')) {
        handleResetPass();
      }
    }
  }
});
