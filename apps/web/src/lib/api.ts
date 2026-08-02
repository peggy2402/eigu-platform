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

      const res = await fetch(`${backendHost}/api/bootstrap`);
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
      console.warn('[Web API] Bootstrap fetch failed, using fallback URL:', e);
    } finally {
      syncPromise = null;
    }
    return getApiBaseUrl();
  })();

  return syncPromise;
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

  const res = await fetch(fullUrl, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // If request failed with 404 (possibly outdated obfuscation prefix), resync & retry once
    if (res.status === 404 && !isRetry && typeof window !== 'undefined') {
      console.warn('[Web API] 404 encountered, resyncing API prefix from Gateway...');
      await syncApiPrefixFromBootstrap();
      return request(path, options, true);
    }
    const msg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || JSON.stringify(data));
    throw new Error(msg);
  }

  return data;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request(API_ENDPOINTS.AUTH.REGISTER, { method: 'POST', body: JSON.stringify({ username, email, password }) }),

  verifyEmail: (email: string, otp: string) =>
    request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { method: 'POST', body: JSON.stringify({ email, otp }) }),

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
  subscribe: (moduleId: string, tierId: string) =>
    request('/pricing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ moduleId, tierId }),
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
};


