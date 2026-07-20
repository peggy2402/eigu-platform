'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  token: null, user: null, setToken: () => {}, setUser: () => {}, logout: async () => {}, loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      setToken(t);
      authApi.getMe()
        .then(d => setUser(d))
        .catch(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
