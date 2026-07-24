'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const I18N_TOAST: Record<string, Record<string, string>> = {
  vi: {
    toast_network_online_title: 'Đã kết nối lại',
    toast_network_online_desc: 'Hệ thống đã kết nối mạng thành công.',
    toast_network_offline_title: 'Mất kết nối',
    toast_network_offline_desc: 'Hệ thống cần phải có mạng thì mới sử dụng được.',
  },
  en: {
    toast_network_online_title: 'Connected',
    toast_network_online_desc: 'Network connection restored.',
    toast_network_offline_title: 'Disconnected',
    toast_network_offline_desc: 'A network connection is required to use the system.',
  },
};

function t(key: string): string {
  const lang = typeof window !== 'undefined' ? localStorage.getItem('eigu_language') || 'vi' : 'vi';
  const dict = I18N_TOAST[lang] ?? I18N_TOAST.vi;
  return dict[key] ?? key;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
  leaving: boolean;
}

interface ToastContextValue {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    if (description && ['success', 'error', 'warning', 'info'].includes(description)) {
      type = description as ToastType;
      description = undefined;
    }
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, title, description, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  useEffect(() => {
    const handleOnline = () => showToast(t('toast_network_online_title'), t('toast_network_online_desc'), 'success');
    const handleOffline = () => showToast(t('toast_network_offline_title'), t('toast_network_offline_desc'), 'error');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container" style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? 'out' : ''}`}>
            <div className="toast-icon-wrapper">
              {t.type === 'success' && <Check size={18} />}
              {t.type === 'error' && <X size={18} />}
              {t.type === 'warning' && <AlertTriangle size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.description && <div className="toast-desc">{t.description}</div>}
            </div>
            <button className="toast-close" onClick={() => dismiss(t.id)}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
