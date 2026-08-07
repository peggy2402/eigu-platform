let registerOtpTimer = null;
let registerOtpSeconds = 0;
let forgotOtpTimer = null;
let forgotOtpSeconds = 0;

function startOtpCountdown(type) {
  if (type === 'register') {
    if (registerOtpTimer) clearInterval(registerOtpTimer);
    registerOtpSeconds = 60;
    const btn = document.getElementById('reg-resend-btn');
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
      btn.textContent = `Gửi lại OTP (${registerOtpSeconds}s)`;
    }
    registerOtpTimer = setInterval(() => {
      registerOtpSeconds--;
      const el = document.getElementById('reg-resend-btn');
      if (registerOtpSeconds <= 0) {
        clearInterval(registerOtpTimer);
        registerOtpTimer = null;
        if (el) {
          el.style.pointerEvents = 'auto';
          el.style.opacity = '1';
          el.textContent = 'Gửi lại OTP';
        }
      } else if (el) {
        el.textContent = `Gửi lại OTP (${registerOtpSeconds}s)`;
      }
    }, 1000);
  } else if (type === 'forgot') {
    if (forgotOtpTimer) clearInterval(forgotOtpTimer);
    forgotOtpSeconds = 60;
    const btn = document.getElementById('forgot-resend-btn');
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
      btn.textContent = `Gửi lại OTP (${forgotOtpSeconds}s)`;
    }
    forgotOtpTimer = setInterval(() => {
      forgotOtpSeconds--;
      const el = document.getElementById('forgot-resend-btn');
      if (forgotOtpSeconds <= 0) {
        clearInterval(forgotOtpTimer);
        forgotOtpTimer = null;
        if (el) {
          el.style.pointerEvents = 'auto';
          el.style.opacity = '1';
          el.textContent = 'Gửi lại OTP';
        }
      } else if (el) {
        el.textContent = `Gửi lại OTP (${forgotOtpSeconds}s)`;
      }
    }, 1000);
  }
}

function clearOtpCountdowns() {
  if (registerOtpTimer) { clearInterval(registerOtpTimer); registerOtpTimer = null; }
  registerOtpSeconds = 0;
  const regBtn = document.getElementById('reg-resend-btn');
  if (regBtn) {
    regBtn.style.pointerEvents = 'auto';
    regBtn.style.opacity = '1';
    regBtn.textContent = 'Gửi lại OTP';
  }

  if (forgotOtpTimer) { clearInterval(forgotOtpTimer); forgotOtpTimer = null; }
  forgotOtpSeconds = 0;
  const forgotBtn = document.getElementById('forgot-resend-btn');
  if (forgotBtn) {
    forgotBtn.style.pointerEvents = 'auto';
    forgotBtn.style.opacity = '1';
    forgotBtn.textContent = 'Gửi lại OTP';
  }
}

function resetRegisterStep() {
  const step1 = document.getElementById('register-step1');
  const step2 = document.getElementById('register-step2');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');
  document.querySelectorAll('#register-step2 .otp-digit').forEach(inp => inp.value = '');
  if (typeof registerEmail !== 'undefined') registerEmail = '';
  clearOtpCountdowns();
}

function resetForgotStep() {
  const step1 = document.getElementById('forgot-step1');
  const step2 = document.getElementById('forgot-step2');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');
  document.querySelectorAll('#forgot-step2 .otp-digit').forEach(inp => inp.value = '');
  const passInp = document.getElementById('forgot-newpass');
  if (passInp) passInp.value = '';
  if (typeof forgotEmail !== 'undefined') forgotEmail = '';
  clearOtpCountdowns();
}

function showAuth(form) {
  if (typeof closeBannedScreen === 'function') closeBannedScreen();
  const liveChatContainer = document.getElementById('live-chat-container');
  if (liveChatContainer) liveChatContainer.style.display = 'none';

  resetRegisterStep();
  resetForgotStep();

  ['login','register','forgot'].forEach(f => {
    const el = document.getElementById(f+'-form');
    if (el) el.classList.add('hidden');
    const err = document.getElementById(f+'-error');
    if (err) err.classList.remove('show');
  });

  const targetForm = document.getElementById(form+'-form');
  if (targetForm) targetForm.classList.remove('hidden');

  if (form === 'login' && typeof loadRememberedEmail === 'function') loadRememberedEmail();
}

if (typeof window !== 'undefined') {
  window.resetRegisterStep = resetRegisterStep;
  window.resetForgotStep = resetForgotStep;
  window.showAuth = showAuth;
  window.startOtpCountdown = startOtpCountdown;
  window.clearOtpCountdowns = clearOtpCountdowns;
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

document.addEventListener('paste', (e) => {
  if (e.target && e.target.classList.contains('otp-digit')) {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const container = e.target.closest('.otp-inputs');
    if (!container) return;

    const inputs = container.querySelectorAll('.otp-digit');
    digits.split('').forEach((digit, idx) => {
      if (inputs[idx]) {
        inputs[idx].value = digit;
      }
    });

    const targetIdx = Math.min(digits.length - 1, inputs.length - 1);
    if (inputs[targetIdx]) {
      inputs[targetIdx].focus();
    }
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
