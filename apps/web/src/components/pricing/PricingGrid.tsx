'use client';

import { useState, useEffect } from 'react';
import PricingCard from './PricingCard';
import type { PricingModuleDto, PricingTierDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { translatePricingText } from '../../lib/pricingTranslations';
import { pricingApi } from '../../lib/api';

interface PricingGridProps {
  moduleData: PricingModuleDto | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectTier: (tier: PricingTierDto, moduleSlug: string, payableDiffAmount?: number) => void;
}

export default function PricingGrid({ moduleData, loading, error, onRetry, onSelectTier }: PricingGridProps) {
  const { language } = useLanguage();
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      pricingApi.getMySubscriptions()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setSubscriptions(list);
        })
        .catch(err => console.warn('[PricingGrid] Subscriptions fetch error:', err));
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              height: 440,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          >
            <div>
              <div style={{ width: 120, height: 24, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '80%', height: 16, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 24 }} />
              <div style={{ width: 160, height: 36, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 20 }} />
            </div>
            <div style={{ width: '100%', height: 44, background: 'var(--bg-secondary)', borderRadius: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: 8 }}>Không thể tải dữ liệu bảng giá</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</p>
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!moduleData || !moduleData.tiers || moduleData.tiers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: 600, margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chưa có gói dịch vụ nào cho mô-đun này.</p>
      </div>
    );
  }

  const currentSub = subscriptions.find(s =>
    (moduleData?.slug && s.moduleSlug === moduleData.slug) ||
    (moduleData?.id && s.moduleId === moduleData.id)
  );

  const maxThreads = Math.max(...moduleData.tiers.map(t => t.threads), 1);

  const isEnterpriseCode = (code: string, label: string) =>
    code === 'enterprise' ||
    code.includes('enterprise') ||
    label.toLowerCase().includes('enterprise') ||
    label.toLowerCase().includes('doanh nghiệp');

  const standardTiers = moduleData.tiers.filter(t => !isEnterpriseCode(t.code, t.label));
  const enterpriseTiers = moduleData.tiers.filter(t => isEnterpriseCode(t.code, t.label));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Module Title & Tagline Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {translatePricingText(moduleData.name, language)}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          {translatePricingText(moduleData.tagline, language)}
        </p>
      </div>

      {/* Responsive Standard Vertical Cards Grid */}
      {standardTiers.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: enterpriseTiers.length > 0 ? 24 : 0,
          }}
        >
          {standardTiers.map(tier => (
            <PricingCard
              key={tier.id}
              tier={tier}
              moduleSlug={moduleData.slug}
              maxThreads={maxThreads}
              currentSub={currentSub}
              onSelectTier={(selectedTier, diffAmt) => onSelectTier(selectedTier, moduleData.slug, diffAmt)}
            />
          ))}
        </div>
      )}

      {/* Full-Width Horizontal Enterprise Card(s) */}
      {enterpriseTiers.map(tier => (
        <PricingCard
          key={tier.id}
          tier={tier}
          moduleSlug={moduleData.slug}
          maxThreads={maxThreads}
          isHorizontal={true}
          currentSub={currentSub}
          onSelectTier={(selectedTier, diffAmt) => onSelectTier(selectedTier, moduleData.slug, diffAmt)}
        />
      ))}
    </div>
  );
}
