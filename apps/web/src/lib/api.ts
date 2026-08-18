import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';

let syncPromise: Promise<string> | null = null;

export async function syncApiPrefixFromBootstrap(): Promise<string> {
  if (typeof window === 'undefined') return getApiBaseUrl();

  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      let backendHost = '';
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL || getApiBaseUrl();
      if (envApiUrl && (envApiUrl.startsWith('http://') || envApiUrl.startsWith('https://'))) {
        try {
          const parsed = new URL(envApiUrl);
          backendHost = parsed.origin;
        } catch {
          // ignore
        }
      }

      if (!backendHost && typeof window !== 'undefined') {
        const port = process.env.NEXT_PUBLIC_API_PORT || '3001';
        const origin = window.location.origin;
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          backendHost = `http://localhost:${port}`;
        } else {
          backendHost = origin;
        }
      }

      if (!backendHost) backendHost = 'http://localhost:3001';

      const bootstrapController = new AbortController();
      const bootstrapTimeout = setTimeout(() => bootstrapController.abort(), 2500);

      try {
        const res = await fetch(`${backendHost}/api/bootstrap`, { signal: bootstrapController.signal });
        clearTimeout(bootstrapTimeout);
        if (res.ok) {
          const data = await res.json();
          if (data && data.apiPrefix) {
            const cleanPrefix = data.apiPrefix.replace(/^\//, '').replace(/\/$/, '');
            const fullUrl = `${backendHost}/${cleanPrefix}`;
            (window as any).__EIGU_ACTIVE_API_URL__ = fullUrl;
            return fullUrl;
          }
        }
      } catch (e) {
        clearTimeout(bootstrapTimeout);
        console.warn('[Web API] Bootstrap fetch failed, using fallback URL:', e);
      }
    } catch (e) {
      console.warn('[Web API] Bootstrap setup failed, using fallback URL:', e);
    } finally {
      syncPromise = null;
    }
    return getApiBaseUrl();
  })();

  return syncPromise;
}

let isRefreshingWebToken = false;
let webRefreshSubscribers: ((newToken: string) => void)[] = [];

function onWebTokenRefreshed(newToken: string) {
  webRefreshSubscribers.forEach((cb) => cb(newToken));
  webRefreshSubscribers = [];
}

async function request(path: string, options: RequestInit = {}, isRetry = false): Promise<any> {
  if (typeof window !== 'undefined' && !(window as any).__EIGU_ACTIVE_API_URL__) {
    await syncApiPrefixFromBootstrap();
  }

  const baseUrl = getApiBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s max timeout for fast user experience

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      // 🔒 Auto Silent Refresh on 401 Unauthorized (AccessToken expired)
      if (res.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/refresh') && typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          if (!isRefreshingWebToken) {
            isRefreshingWebToken = true;
            try {
              const refreshRes = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              const refreshData = await refreshRes.json();
              if (refreshRes.ok && refreshData && (refreshData.accessToken || refreshData.data?.accessToken)) {
                const newAccToken = refreshData.accessToken || refreshData.data.accessToken;
                localStorage.setItem('accessToken', newAccToken);
                if (refreshData.refreshToken || refreshData.data?.refreshToken) {
                  localStorage.setItem('refreshToken', refreshData.refreshToken || refreshData.data.refreshToken);
                }
                isRefreshingWebToken = false;
                onWebTokenRefreshed(newAccToken);
                return request(path, options, true);
              }
            } catch (e) {
              console.warn('[Web API] Refresh token error:', e);
            } finally {
              isRefreshingWebToken = false;
            }
          } else {
            return new Promise((resolve) => {
              webRefreshSubscribers.push(() => {
                resolve(request(path, options, true));
              });
            });
          }
          // Clear stale tokens if refresh failed or no refresh token exists
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      // If request failed with 404 (possibly outdated obfuscation prefix), resync & retry once
      if (res.status === 404 && !isRetry && typeof window !== 'undefined') {
        console.warn('[Web API] 404 encountered, resyncing API prefix from Gateway...');
        await syncApiPrefixFromBootstrap();
        return request(path, options, true);
      }

      const serverMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error);
      let msg = '';
      if ([502, 503, 504].includes(res.status)) {
        msg = `[HTTP ${res.status}] Máy chủ đang khởi tạo dịch vụ (Render Cold Start). Vui lòng thử lại sau 5 giây!`;
      } else if (serverMsg) {
        msg = `[HTTP ${res.status}] ${serverMsg}`;
      } else {
        msg = `[HTTP ${res.status}] Lỗi xử lý từ máy chủ API (${path})`;
      }

      const error = new Error(msg) as any;
      error.status = res.status;
      error.statusCode = res.status;
      // Attach any extra fields from the response body (e.g. email, isBanned, bannedUntil, banReason)
      if (data.email) error.email = data.email;
      if (data.isBanned !== undefined) error.isBanned = data.isBanned;
      if (data.bannedUntil) error.bannedUntil = data.bannedUntil;
      if (data.banReason) error.banReason = data.banReason;
      throw error;
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`[Timeout 45s] Kết nối tới API (${path}) quá 45s. Máy chủ Render đang khởi động lại hoặc gặp sự cố mạng.`);
    }
    throw err;
  }
}

export const authApi = {
  register: (username: string, email: string, password: string, refCode?: string) =>
    request(API_ENDPOINTS.AUTH.REGISTER, { method: 'POST', body: JSON.stringify({ username, email, password, refCode }) }),


  verifyEmail: (email: string, otp: string) =>
    request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { method: 'POST', body: JSON.stringify({ email, otp }) }),

  resendOtp: (email: string) =>
    request(API_ENDPOINTS.AUTH.RESEND_OTP, { method: 'POST', body: JSON.stringify({ email }) }),

  login: (identifier: string, password: string) =>
    request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
        os: typeof window !== 'undefined' ? (navigator.platform || 'Web Browser') : 'Web Browser',
        device: 'Next.js Web Client'
      })
    }),

  forgotPassword: (email: string) =>
    request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    request(API_ENDPOINTS.AUTH.RESET_PASSWORD, { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),

  refresh: (refreshToken: string) =>
    request(API_ENDPOINTS.AUTH.REFRESH, { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  getMe: () => request(API_ENDPOINTS.AUTH.ME),

  logout: () => request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }),
};

export const pricingApi = {
  getPricing: (moduleSlug?: string) => {
    const query = moduleSlug ? `?m=${encodeURIComponent(moduleSlug)}` : '';
    return request(`${API_ENDPOINTS.PRICING.BASE}${query}`);
  },
  getMySubscriptions: () => request('/pricing/my-subscriptions'),
  subscribe: (moduleId: string, tierId: string, refCode?: string) =>
    request('/pricing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ moduleId, tierId, refCode }),
    }),
};


export const themeEventApi = {
  getConfig: () => request('/theme-event'),
  updateConfig: (data: any) => request('/theme-event', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const contactApi = {
  submitContact: (data: { name: string; email: string; message: string }) =>
    request('/feedback/public', { method: 'POST', body: JSON.stringify(data) }),
};

export const paymentApi = {
  createDeposit: (amount: number) =>
    request(API_ENDPOINTS.PAYMENT.CREATE_DEPOSIT, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  getMyTransactions: () => request(API_ENDPOINTS.PAYMENT.MY_TRANSACTIONS),

  checkStatus: (code: string) => request(API_ENDPOINTS.PAYMENT.CHECK_STATUS(code)),

  cancelDeposit: (code: string) => request(`/payment/cancel/${code}`, { method: 'PATCH' }),
};

export const affiliateApi = {
  getStats: () => request(API_ENDPOINTS.AFFILIATE.STATS),
  getReferrals: (page = 1, limit = 10) => request(`${API_ENDPOINTS.AFFILIATE.REFERRALS}?page=${page}&limit=${limit}`),
  getCommissions: (page = 1, limit = 10) => request(`${API_ENDPOINTS.AFFILIATE.COMMISSIONS}?page=${page}&limit=${limit}`),
  getPayouts: (page = 1, limit = 10) => request(`${API_ENDPOINTS.AFFILIATE.PAYOUTS}?page=${page}&limit=${limit}`),
  saveBankSettings: (data: { bankName: string; bankAccountNumber: string; bankAccountHolder: string }) =>
    request(API_ENDPOINTS.AFFILIATE.BANK_SETTINGS, { method: 'PATCH', body: JSON.stringify(data) }),
  requestPayout: (data: { amount: number; bankName: string; accountNumber: string; accountHolder: string; saveAsDefault?: boolean }) =>
    request(API_ENDPOINTS.AFFILIATE.PAYOUT_REQUEST, { method: 'POST', body: JSON.stringify(data) }),

  // Admin endpoints
  getAdminStats: () => request(API_ENDPOINTS.AFFILIATE.ADMIN_STATS),
  getAdminPayouts: (page = 1, limit = 10, status?: string, search?: string) => {
    let query = `${API_ENDPOINTS.AFFILIATE.ADMIN_PAYOUTS}?page=${page}&limit=${limit}`;
    if (status && status !== 'ALL' && status !== 'all') query += `&status=${status}`;
    if (search && search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
    return request(query);
  },
  getAdminPayoutAudit: (id: string) => request(`${API_ENDPOINTS.AFFILIATE.ADMIN_PAYOUTS}/${id}/audit`),
  getAdminConfig: () => request(API_ENDPOINTS.AFFILIATE.ADMIN_CONFIG),
  saveAdminConfig: (data: { commissionRate?: number; minPayoutThreshold?: number; payoutFeePercent?: number; payoutFeeFixed?: number }) =>
    request(API_ENDPOINTS.AFFILIATE.ADMIN_CONFIG, { method: 'PATCH', body: JSON.stringify(data) }),
  updateAdminPayoutStatus: (id: string, status: string, adminNote?: string) =>
    request(API_ENDPOINTS.AFFILIATE.ADMIN_PAYOUT_STATUS(id), { method: 'PATCH', body: JSON.stringify({ status, adminNote }) }),
};




