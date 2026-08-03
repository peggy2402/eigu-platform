'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  isVerified: boolean;
  balance?: number;
  createdAt: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  setToken: () => {},
  setUser: () => {},
  refreshUser: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      try {
        const u = await authApi.getMe();
        if (u) {
          setUser(u);
        }
      } catch (err) {
        console.warn('[AuthContext] refreshUser failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      setToken(t);
      authApi.getMe()
        .then(d => setUser(d))
        .catch((err) => {
          console.warn('[AuthContext] getMe fetch error:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__EIGU_REFRESH_USER__ = refreshUser;
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, refreshUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
