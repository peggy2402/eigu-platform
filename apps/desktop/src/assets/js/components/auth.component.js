const AuthComponent = `
<div id="auth-container" class="auth-container" style="display:none;">
  <div class="auth-card">
    <div class="auth-logo">
      <img src="img/logo.png" alt="EIGU Logo" style="width: 56px; height: 56px; object-fit: contain; margin-bottom: 16px; border-radius: 12px;" />
      <h1>EIGU Platform</h1>
      <p>Anti-Detect Automation Engine</p>
    </div>

    <!-- Login -->
    <div id="login-form" class="auth-form">
      <div id="login-error" class="auth-error"></div>
      <div class="form-group">
        <label>Email hoặc tên đăng nhập</label>
        <input type="text" id="login-email" placeholder="you@example.com" autocomplete="email" />
      </div>
      <div class="form-group">
        <label>Mật khẩu</label>
        <div class="pw-wrapper">
          <input type="password" id="login-pass" placeholder="••••••••" autocomplete="current-password" />
          <button class="pw-toggle" onclick="togglePw(this)" type="button" tabindex="-1"><span data-icon="eye"></span></button>
        </div>
      </div>
      <label class="checkbox-row" style="margin:-4px 0 4px;">
        <input type="checkbox" id="remember-me" />
        <span>Nhớ tài khoản</span>
      </label>
      <button id="login-btn" class="auth-btn" onclick="handleLogin()">Đăng nhập</button>
      <div class="auth-link">
        Chưa có tài khoản? <a onclick="showAuth('register')">Đăng ký</a>
        &nbsp;·&nbsp; <a onclick="showAuth('forgot')">Quên mật khẩu</a>
      </div>
    </div>

    <!-- Register -->
    <div id="register-form" class="auth-form hidden">
      <div id="register-error" class="auth-error"></div>
      <div id="register-step1">
        <div class="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" id="reg-username" placeholder="VD: haruki2402" autocomplete="username" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="pw-wrapper">
            <input type="password" id="reg-pass" placeholder="••••••••" autocomplete="new-password" oninput="updatePasswordStrength(this.value)" />
            <button class="pw-toggle" onclick="togglePw(this)" type="button" tabindex="-1"><span data-icon="eye"></span></button>
          </div>
        </div>
        <div class="password-strength hidden">
          <div class="password-strength-bar"><div class="password-strength-fill" id="pw-strength-fill"></div></div>
          <div class="password-strength-label" id="pw-strength-label"></div>
        </div>
        <div class="form-group">
          <label>Nhập lại mật khẩu</label>
          <div class="pw-wrapper">
            <input type="password" id="reg-pass-confirm" placeholder="••••••••" autocomplete="new-password" />
            <button class="pw-toggle" onclick="togglePw(this)" type="button" tabindex="-1"><span data-icon="eye"></span></button>
          </div>
        </div>
        <div style="height:16px;"></div>
        <button class="auth-btn" onclick="handleRegister()">Đăng ký</button>
      </div>
      <div id="register-step2" class="hidden">
        <p style="text-align:center;color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
          Nhập mã OTP gửi đến<br /><strong id="reg-otp-email" style="color:var(--text-primary);"></strong>
        </p>
        <div class="otp-inputs">
          <input type="text" maxlength="1" class="otp-digit" data-idx="0" />
          <input type="text" maxlength="1" class="otp-digit" data-idx="1" />
          <input type="text" maxlength="1" class="otp-digit" data-idx="2" />
          <input type="text" maxlength="1" class="otp-digit" data-idx="3" />
          <input type="text" maxlength="1" class="otp-digit" data-idx="4" />
          <input type="text" maxlength="1" class="otp-digit" data-idx="5" />
        </div>
        <button class="auth-btn" style="margin-top:16px;" onclick="handleVerifyOtp()">Xác thực</button>
      </div>
      <div class="auth-link"><a onclick="showAuth('login')">Quay lại đăng nhập</a></div>
    </div>

    <!-- Forgot Password -->
    <div id="forgot-form" class="auth-form hidden">
      <div id="forgot-error" class="auth-error"></div>
      <div id="forgot-step1">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="forgot-email" placeholder="you@example.com" />
        </div>
        <div style="height:16px;"></div>
        <button class="auth-btn" onclick="handleForgot()">Gửi OTP</button>
      </div>
      <div id="forgot-step2" class="hidden">
        <p style="text-align:center;color:var(--text-secondary);font-size:14px;margin-bottom:16px;">Nhập OTP và mật khẩu mới</p>
        <div class="otp-inputs" style="margin-bottom:16px;">
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="0" />
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="1" />
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="2" />
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="3" />
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="4" />
          <input type="text" maxlength="1" class="otp-digit forgot" data-idx="5" />
        </div>
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="pw-wrapper">
            <input type="password" id="forgot-newpass" placeholder="••••••••" />
            <button class="pw-toggle" onclick="togglePw(this)" type="button" tabindex="-1"><span data-icon="eye"></span></button>
          </div>
        </div>
        <button class="auth-btn" onclick="handleResetPass()">Đặt lại mật khẩu</button>
      </div>
      <div class="auth-link"><a onclick="showAuth('login')">Quay lại đăng nhập</a></div>
    </div>
  </div>
</div>
`;

function renderAuth() {
  const root = document.getElementById('auth-root');
  if (root) {
    root.outerHTML = AuthComponent;
  }
}
