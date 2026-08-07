const API_BASE = localStorage.getItem('eigu_api_url') || 'https://api.eigu.site/api';

function formatFriendlyErrorMessage(raw) {
  if (!raw) return 'Có lỗi xảy ra, vui lòng thử lại sau.';
  let msg = typeof raw === 'string' ? raw : (raw.message || 'Có lỗi xảy ra');
  if (Array.isArray(msg)) msg = msg.join(', ');

  const lower = String(msg).toLowerCase();

  if (lower.includes('invalid credentials')) {
    return 'Tên đăng nhập / Email hoặc mật khẩu không chính xác.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau!';
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

let isSyncingConfig = false;
async function syncObfuscationConfig() {
  if (isSyncingConfig) return;
  isSyncingConfig = true;
  try {
    const rawBase = (window.EIGU_CONFIG && window.EIGU_CONFIG.API_BASE_URL) || 'https://api.eigu.site/api';
    const origin = rawBase.split('/api')[0] || 'https://api.eigu.site';

    const bootstrapUrl = `${origin}/api/system-config/bootstrap`;

    const res = await fetch(bootstrapUrl).then(r => r.json());
    if (res && res.apiPrefix) {
      const cleanPrefix = res.apiPrefix.replace(/\/$/, '');
      const newApiUrl = `${origin}/${cleanPrefix}`;
      if (window.EIGU_CONFIG && typeof window.EIGU_CONFIG.setApiUrl === 'function') {
        window.EIGU_CONFIG.setApiUrl(newApiUrl);
      }
    }
  } catch (e) {
    // Silent catch
  } finally {
    isSyncingConfig = false;
  }
}

// Initial sync on startup
syncObfuscationConfig();

// ----------------------------------------------------------------------
// 🔄 FACEBOOK-STYLE ROLLING SESSION & SILENT TOKEN REFRESH ARCHITECTURE
// ----------------------------------------------------------------------
let isRefreshingToken = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function silentRefreshSession() {
  const storedRefreshToken = (typeof refreshToken !== 'undefined' && refreshToken)
    ? refreshToken
    : localStorage.getItem('refreshToken');

  if (!storedRefreshToken) return false;

  try {
    const rawBase = (window.EIGU_CONFIG && window.EIGU_CONFIG.API_BASE_URL) || 'https://api.eigu.site/api';
    let refreshUrl = `${rawBase.replace(/\/$/, '')}/auth/refresh`;
    if (window.EIGU_CONFIG && typeof window.EIGU_CONFIG.getApiUrl === 'function') {
      refreshUrl = window.EIGU_CONFIG.getApiUrl('/auth/refresh');
    }

    const res = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data && data.accessToken) {
      if (typeof accessToken !== 'undefined') accessToken = data.accessToken;
      if (typeof refreshToken !== 'undefined' && data.refreshToken) refreshToken = data.refreshToken;

      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// Tự động xoay vòng Refresh Token ngầm cứ 8 phút một lần (duy trì phiên Facebook-style)
setInterval(async () => {
  const currentToken = (typeof accessToken !== 'undefined' && accessToken) ? accessToken : localStorage.getItem('accessToken');
  if (currentToken) {
    await silentRefreshSession();
  }
}, 8 * 60 * 1000);

async function apiFetch(path, options = {}, isRetry = false) {
  const token = (typeof accessToken !== 'undefined' && accessToken) ? accessToken : localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let fullUrl = '';
  if (window.EIGU_CONFIG && typeof window.EIGU_CONFIG.getApiUrl === 'function') {
    fullUrl = window.EIGU_CONFIG.getApiUrl(path);
  } else {
    const baseUrl = typeof window.getApiBaseUrl === 'function' ? window.getApiBaseUrl() : 'https://api.eigu.site/api';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = (path || '').replace(/^\//, '');
    fullUrl = `${cleanBase}/${cleanPath}`;
  }

  try {
    const res = await fetch(fullUrl, { ...options, headers });
    const data = await res.json();

    // 🔒 Xử lý Lỗi 401 Unauthorized (AccessToken Hết Hạn) -> Silent Refresh + Retry tự động
    if (res.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        const refreshed = await silentRefreshSession();
        isRefreshingToken = false;

        if (refreshed) {
          const newToken = (typeof accessToken !== 'undefined' && accessToken) ? accessToken : localStorage.getItem('accessToken');
          onTokenRefreshed(newToken);
          return apiFetch(path, options, true);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Stop all background timers if checkout component is polling
          if (window.__CHECKOUT_STATE__) {
            if (window.__CHECKOUT_STATE__.pollTimer) {
              clearInterval(window.__CHECKOUT_STATE__.pollTimer);
              window.__CHECKOUT_STATE__.pollTimer = null;
            }
            if (window.__CHECKOUT_STATE__.countdownTimer) {
              clearInterval(window.__CHECKOUT_STATE__.countdownTimer);
              window.__CHECKOUT_STATE__.countdownTimer = null;
            }
          }

          const authContainer = document.getElementById('auth-container');
          if (authContainer) authContainer.style.display = 'flex';
          const appContainer = document.getElementById('app-container');
          if (appContainer) appContainer.style.display = 'none';
          if (typeof showAuth === 'function') showAuth('login');
        }
      } else {
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            resolve(apiFetch(path, options, true));
          });
        });
      }
    }

    if (!res.ok) {
      if (res.status === 404 && !isRetry && data && data.errorId && data.errorId.includes('INVALID_OBF')) {
        await syncObfuscationConfig();
        return apiFetch(path, options, true);
      }

      const rawMsg = typeof data.message === 'string' ? data.message : (Array.isArray(data.message) ? data.message.join(', ') : 'Có lỗi xảy ra');
      const friendlyMsg = formatFriendlyErrorMessage(rawMsg);
      const err = new Error(friendlyMsg);
      err.data = data;
      if (window.EIGU_TELEMETRY) {
        window.EIGU_TELEMETRY.captureError(err, `HTTP_${res.status}`, { url: fullUrl, method: options.method || 'GET', status: res.status, rawResponse: data });
      }
      throw err;
    }
    return data;
  } catch (err) {
    if (!isRetry && err.message && (err.message.includes('404') || err.message.includes('INVALID_OBF'))) {
      await syncObfuscationConfig();
      return apiFetch(path, options, true);
    }
    if (window.EIGU_TELEMETRY && !err.data) {
      window.EIGU_TELEMETRY.captureError(err, 'NETWORK_ERROR', { url: fullUrl, method: options.method || 'GET' });
    }
    throw err;
  }
}

const request = apiFetch;
if (typeof window !== 'undefined') {
  window.request = apiFetch;
  window.apiFetch = apiFetch;
  window.syncObfuscationConfig = syncObfuscationConfig;
  window.silentRefreshSession = silentRefreshSession;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
