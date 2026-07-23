/**
 * EIGU Platform - Centralized API Constants & Endpoints Configuration
 */
export const DEFAULT_API_PORT = 3001;
export const DEFAULT_WEB_PORT = 3000;

export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
export const DEFAULT_WEBSOCKET_URL = 'http://localhost:3001';

/**
 * Lấy URL Gốc của API Server dựa theo Biến môi trường hoặc Cấu hình Cục bộ
 */
export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process && process.env) {
    const env = process.env;
    if (env['NEXT_PUBLIC_API_URL']) return env['NEXT_PUBLIC_API_URL'];
    if (env['EIGU_API_URL']) return env['EIGU_API_URL'];
    if (env['API_URL']) return env['API_URL'];
  }
  if (typeof window !== 'undefined' && window && (window as any).EIGU_CONFIG && (window as any).EIGU_CONFIG.API_BASE_URL) {
    return (window as any).EIGU_CONFIG.API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window && (window as any).EIGU_API_URL) {
    return (window as any).EIGU_API_URL;
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Lấy URL Gốc của WebSocket Server dựa theo Biến môi trường hoặc Cấu hình Cục bộ
 */
export function getWebSocketUrl(): string {
  if (typeof process !== 'undefined' && process && process.env) {
    const env = process.env;
    if (env['NEXT_PUBLIC_WS_URL']) return env['NEXT_PUBLIC_WS_URL'];
    if (env['EIGU_WS_URL']) return env['EIGU_WS_URL'];
    if (env['WS_URL']) return env['WS_URL'];
  }
  if (typeof window !== 'undefined' && window && (window as any).EIGU_CONFIG && (window as any).EIGU_CONFIG.WEBSOCKET_URL) {
    return (window as any).EIGU_CONFIG.WEBSOCKET_URL;
  }
  if (typeof window !== 'undefined' && window && (window as any).EIGU_WS_URL) {
    return (window as any).EIGU_WS_URL;
  }
  return DEFAULT_WEBSOCKET_URL;
}

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_OTP: '/auth/resend-otp',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    ROLE: (id: string) => `/users/${id}/role`,
    BAN: (id: string) => `/users/${id}/ban`,
    TAB_PERMISSIONS: (id: string) => `/users/${id}/tab-permissions`,
    TABS: (id: string) => `/users/${id}/tabs`,
  },
  CHAT: {
    HISTORY: '/chat/history',
    SESSIONS: '/chat/sessions',
    CLEANUP: '/chat/cleanup',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ_ALL: '/notifications/read-all',
  },
  FEEDBACK: {
    REPORT: '/feedback/report',
    BASE: '/feedback',
  },
  VOICE: {
    SPEAKERS: '/voice/speakers',
    CONVERT: '/voice/convert',
  },
} as const;
