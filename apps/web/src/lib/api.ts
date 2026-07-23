import { getApiBaseUrl, API_ENDPOINTS } from '@eigu-platform/shared';

const API_BASE = getApiBaseUrl();

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
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
