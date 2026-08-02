'use client';

import React, { useState } from 'react';
import { FEATURE_MODULES, FeatureModuleItem, getModuleIcon } from '../../data/featureModules';
import ModuleDetailModal from './ModuleDetailModal';
import { useLanguage } from '../../contexts/LanguageContext';

export default function FeatureModulesSection() {
  const { t, language } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<FeatureModuleItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lang = language === 'en' ? 'en' : 'vi';

  return (
    <section style={{ padding: '40px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        {/* Airplanes Illustration */}
        <div style={{ marginBottom: 16 }}>
          <img
            src="https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp"
            alt="Airplanes Illustration"
            style={{
              maxWidth: 100,
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              filter: 'drop-shadow(0 10px 20px var(--accent-glow))',
            }}
          />
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          {t('feat_title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          {language === 'en'
            ? 'Tailored for every stage of high-scale MMO content creation (Click a card to view video guide)'
            : 'Được thiết kế chuyên biệt cho từng giai đoạn sáng tạo nội dung MMO (Bấm vào thẻ để xem video hướng dẫn)'}
        </p>
      </div>

      {/* 6 Feature Module Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}
      >
        {FEATURE_MODULES.map((item) => {
          const isHovered = hoveredId === item.id;
          const title = item.title[lang];
          const desc = item.desc[lang];

          return (
            <div
              key={item.id}
              onClick={() => setSelectedModule(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: 'var(--bg-card)',
                border: `1px solid ${isHovered ? item.accentColor : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered
                  ? `0 0 20px ${item.accentGlow}, inset 0 0 15px ${item.accentColor}10, 0 12px 28px rgba(0,0,0,0.4)`
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                overflow: 'hidden',
              }}
            >
              {/* Subtle accent glow background blob on hover */}
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: item.accentColor,
                  filter: 'blur(50px)',
                  opacity: isHovered ? 0.25 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Module Icon Container */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: isHovered ? `${item.accentColor}25` : `${item.accentColor}15`,
                  color: item.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  transition: 'all 0.25s ease',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isHovered ? `0 0 16px ${item.accentGlow}` : 'none',
                }}
              >
                {getModuleIcon(item.iconName, 24)}
              </div>

              {/* Title & Short Description */}
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: isHovered ? '#ffffff' : 'var(--text-primary)',
                  transition: 'color 0.2s ease',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {desc}
              </p>

              {/* Subtle Click Indicator Hint on Hover */}
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: item.accentColor,
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>{language === 'en' ? 'Click to view details & video →' : 'Xem chi tiết & video hướng dẫn →'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <ModuleDetailModal
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
        language={language}
      />
    </section>
  );
}
