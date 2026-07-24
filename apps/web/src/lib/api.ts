import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';

let syncPromise: Promise<string> | null = null;

export async function syncApiPrefixFromBootstrap(): Promise<string> {
  if (typeof window === 'undefined') return getApiBaseUrl();

  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const port = process.env.NEXT_PUBLIC_API_PORT || '3001';
      const host = typeof window !== 'undefined'
        ? window.location.origin.replace(/:3000$/, `:${port}`).replace(/:3001$/, `:${port}`)
        : `http://localhost:${port}`;
      const baseUrl = host.includes('localhost') || host.includes('127.0.0.1') ? `http://localhost:${port}` : host;

      const res = await fetch(`${baseUrl}/api/bootstrap`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.apiPrefix) {
          const cleanPrefix = data.apiPrefix.replace(/^\//, '').replace(/\/$/, '');
          const fullUrl = `${baseUrl}/${cleanPrefix}`;
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
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request(API_ENDPOINTS.AUTH.REGISTER, { method: 'POST', body: JSON.stringify({ username, email, password }) }),

  verifyEmail: (email: string, otp: string) =>
    request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { method: 'POST', body: JSON.stringify({ email, otp }) }),

  login: (identifier: string, password: string) =>
    request(API_ENDPOINTS.AUTH.LOGIN, { method: 'POST', body: JSON.stringify({ identifier, password }) }),

  forgotPassword: (email: string) =>
    request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    request(API_ENDPOINTS.AUTH.RESET_PASSWORD, { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),

  refresh: (refreshToken: string) =>
    request(API_ENDPOINTS.AUTH.REFRESH, { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  getMe: () => request(API_ENDPOINTS.AUTH.ME),

  logout: () => request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }),
};
