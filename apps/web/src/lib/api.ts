const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),

  verifyEmail: (email: string, otp: string) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  login: (identifier: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),

  refresh: (refreshToken: string) =>
    request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  getMe: () => request('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),
};
