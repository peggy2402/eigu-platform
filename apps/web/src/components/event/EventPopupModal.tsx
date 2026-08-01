'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { themeEventApi } from '../../lib/api';

interface ThemeEventData {
  season: string;
  seasonTitle: string;
  primaryColor: string;
  badgeText: string;
  isEventActive: boolean;
  eventTitle: string;
  eventSubtitle: string;
  eventBannerUrl: string;
  eventButtonText: string;
  eventButtonLink: string;
  eventNotice?: string;
}

interface EventPopupModalProps {
  onNavigatePricing: () => void;
}

export default function EventPopupModal({ onNavigatePricing }: EventPopupModalProps) {
  const [eventData, setEventData] = useState<ThemeEventData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkEvent() {
      try {
        const res = await themeEventApi.getConfig();
        if (isMounted && res && res.success && res.data) {
          const cfg = res.data;
          setEventData(cfg);

          // Apply seasonal CSS theme variables dynamically to the document root
          if (cfg.primaryColor) {
            document.documentElement.style.setProperty('--accent', cfg.primaryColor);
            document.documentElement.style.setProperty('--accent-glow', `${cfg.primaryColor}33`);
          }
          if (cfg.season) {
            document.documentElement.setAttribute('data-season', cfg.season);
          }

          // If Event is Active and not dismissed in current browser session, show Popup
          if (cfg.isEventActive) {
            const hasDismissed = sessionStorage.getItem('eigu_event_popup_dismissed');
            if (!hasDismissed) {
              setIsOpen(true);
            }
          }
        }
      } catch (err) {
        console.warn('Không thể nạp dữ liệu Sự kiện:', err);
      }
    }

    checkEvent();
    return () => { isMounted = false; };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('eigu_event_popup_dismissed', 'true');
  };

  const handleButtonClick = () => {
    handleClose();
    if (eventData?.eventButtonLink === '#pricing') {
      onNavigatePricing();
    } else if (eventData?.eventButtonLink) {
      window.location.href = eventData.eventButtonLink;
    }
  };

  if (!isOpen || !eventData || !eventData.isEventActive) {
    return null;
  }

  const bannerImg = eventData.eventBannerUrl || 'https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.25)',
          animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 20,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Đóng thông báo"
        >
          <X size={18} />
        </button>

        {/* Airplane Banner Image Header */}
        <div style={{ position: 'relative', width: '100%', height: 180, background: '#0a0a0f', overflow: 'hidden' }}>
          <img
            src={bannerImg}
            alt="Event Airplanes Banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.95) contrast(1.05)',
            }}
            onError={(e) => {
              (e.target as HTMLElement).setAttribute('src', 'https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp');
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, var(--bg-card) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 20,
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {eventData.seasonTitle || 'SỰ KIỆN NỔI BẬT'}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '20px 24px 28px' }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {eventData.eventTitle || 'Sự Kiện Mùa Thu - EIGU Platform'}
          </h3>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: 20,
            }}
          >
            {eventData.eventSubtitle || 'Khám phá ngay các tính năng tự động hóa chuyên sâu dành riêng cho Creator & Reuper.'}
          </p>

          {eventData.eventNotice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 22,
              }}
            >
              <Gift size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>{eventData.eventNotice}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleButtonClick}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
              cursor: 'pointer',
            }}
          >
            <span>{eventData.eventButtonText || 'Xem Bảng Giá Ngay'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
