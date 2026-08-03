'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, CheckCircle2, Sparkles } from 'lucide-react';
import { FeatureModuleItem, getModuleIcon } from '../../data/featureModules';

interface ModuleDetailModalProps {
  module: FeatureModuleItem | null;
  onClose: () => void;
  language: 'vi' | 'en';
}

export default function ModuleDetailModal({ module, onClose, language }: ModuleDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!module) return;

    // Handle ESC key press to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock body scroll when modal is open
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [module, onClose]);

  if (!module || !mounted) return null;

  const lang = language === 'en' ? 'en' : 'vi';
  const title = module.title[lang];
  const detailDesc = module.detailDescription[lang];
  const badge = module.badge ? module.badge[lang] : null;
  const highlights = module.highlights ? module.highlights[lang] : [];

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999, // Super high z-index to cover navbar and all headers
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)', // Semi-transparent dark overlay
        backdropFilter: 'blur(12px)', // Blurs entire page & navbar behind overlay
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'eigu-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={onClose}
    >
      {/* Glassmorphic Translucent Panel Container */}
      <div
        style={{
          position: 'relative',
          width: 'min(90vw, 960px)',
          maxHeight: 'min(85vh, 800px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)', // Translucent panel background
          backdropFilter: 'blur(24px)', // Glassmorphic blur showing background through panel
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${module.accentColor}60`,
          borderRadius: 20,
          boxShadow: `0 30px 70px -10px rgba(0,0,0,0.3), 0 0 45px ${module.accentColor}30`,
          overflow: 'hidden',
          animation: 'eigu-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${module.accentColor}25`,
                color: module.accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${module.accentColor}40`,
              }}
            >
              {getModuleIcon(module.iconName, 22)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'min(1.25rem, 4.5vw)',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>
                {badge && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 12,
                      backgroundColor: `${module.accentColor}30`,
                      color: module.accentColor,
                      border: `1px solid ${module.accentColor}60`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                {language === 'en' ? 'EIGU Platform Module' : 'Mô-đun Công Cụ EIGU Platform'}
              </span>
            </div>
          </div>

          {/* Close Button (X) */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* YouTube Video Embed Section (16:9 Responsive) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
              <Play size={16} style={{ color: module.accentColor, fill: module.accentColor }} />
              <span>{language === 'en' ? 'Video Tutorial & Overview' : 'Video Hướng Dẫn & Giới Thiệu Mô-đun'}</span>
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                borderRadius: 14,
                overflow: 'hidden',
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              }}
            >
              <iframe
                src={module.videoUrl}
                title={title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Detailed Description Section (Glass Container) */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: 20,
              backdropFilter: 'blur(10px)',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: 15,
                fontWeight: 700,
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={16} style={{ color: module.accentColor }} />
              {language === 'en' ? 'Detailed Module Overview' : 'Mô Tả Chi Tiết Mô-đun'}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: '#cbd5e1',
                fontWeight: 400,
                whiteSpace: 'pre-line',
              }}
            >
              {detailDesc}
            </p>
          </div>

          {/* Key Feature Highlights */}
          {highlights.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
                {language === 'en' ? 'Key Features & Capabilities' : 'Tính Năng Nổi Bật'}
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                }}
              >
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.035)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 10,
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      style={{ color: module.accentColor, flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, fontWeight: 500 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes eigu-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes eigu-scale-up {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
