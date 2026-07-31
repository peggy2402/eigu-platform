'use client';

import { Check, Zap, Sparkles } from 'lucide-react';
import type { PricingTierDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';

interface PricingCardProps {
  tier: PricingTierDto;
  moduleSlug: string;
  maxThreads: number;
  onSelectTier: (tier: PricingTierDto) => void;
}

export default function PricingCard({ tier, moduleSlug, maxThreads, onSelectTier }: PricingCardProps) {
  const { t, language } = useLanguage();
  const isTrial = tier.code === 'trial' || tier.billingPeriod === 'trial';
  const isPopular = tier.badge?.includes('PHỔ BIẾN') || tier.code === 'pro';

  // Logic tính % thread progress bar
  let threadPercentage = 0;
  if (tier.threads === 0) {
    threadPercentage = 100;
  } else if (maxThreads > 0) {
    threadPercentage = Math.min(100, Math.round((tier.threads / maxThreads) * 100));
  }

  const freeLabel = language === 'en' ? 'Free' : 'Miễn phí';
  const machinesLabel = language === 'en' ? 'Concurrent machines:' : 'Số máy dùng:';
  const threadsLabel = language === 'en' ? 'Processing threads:' : 'Số luồng xử lý:';
  const resolutionLabel = language === 'en' ? 'Resolution:' : 'Độ phân giải:';
  const featuresLabel = language === 'en' ? 'Key Features' : 'Tính năng nổi bật';

  return (
    <div
      className={`pricing-card ${isPopular ? 'popular' : ''}`}
      style={{
        background: isPopular ? 'linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
        border: isPopular ? '2px solid var(--accent)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isPopular ? '0 12px 32px rgba(99, 102, 241, 0.25)' : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Dynamic Badge */}
      {tier.badge && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 20,
            background: isPopular ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {isPopular ? t('pricing_popular') : (tier.badge === 'TRẢI NGHIỆM MIỄN PHÍ' ? t('pricing_trial_badge') : tier.badge)}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {tier.label}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', minHeight: 38, lineHeight: 1.4 }}>
          {tier.tagline}
        </p>
      </div>

      {/* Pricing Section */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        {tier.formattedOriginalPrice && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 2 }}>
            {tier.formattedOriginalPrice}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: isPopular ? 'var(--accent)' : 'var(--text-primary)' }}>
            {tier.price === 0 ? freeLabel : tier.formattedPrice}
          </span>
          {tier.price > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {isTrial ? `/ ${tier.trialDays || 7} ${t('pricing_days')}` : `/ ${t('pricing_month')}`}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('pricing_vat')}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelectTier(tier)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          border: isPopular ? 'none' : '1px solid var(--accent)',
          background: isPopular ? 'var(--accent)' : 'rgba(99, 102, 241, 0.1)',
          color: isPopular ? '#fff' : 'var(--accent)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isPopular ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isPopular && <Sparkles size={16} />}
        {t('pricing_select')}
      </button>

      {/* Specs (Machines, Threads & Resolution) */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{machinesLabel}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {tier.machines === 0 ? t('pricing_unlimited') : `${tier.machines} ${language === 'en' ? 'machines' : 'máy'}`}
          </span>
        </div>

        {/* Thread Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{threadsLabel}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {tier.threads === 0 ? `∞ ${t('pricing_unlimited')}` : `${tier.threads} ${t('pricing_threads')}`}
            </span>
          </div>
          <div style={{ height: 6, width: '100%', background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${threadPercentage}%`,
                background: isPopular ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'var(--accent)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {tier.resolution && tier.resolution !== '-' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{resolutionLabel}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tier.resolution}</span>
          </div>
        )}
      </div>

      {/* Features List */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
          {featuresLabel}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(tier.features || []).map((feat, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }}>
                <Check size={15} />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
