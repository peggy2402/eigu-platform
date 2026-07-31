'use client';

import PricingCard from './PricingCard';
import type { PricingModuleDto, PricingTierDto } from '@eigu-platform/shared';

interface PricingGridProps {
  moduleData: PricingModuleDto | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectTier: (tier: PricingTierDto, moduleSlug: string) => void;
}

export default function PricingGrid({ moduleData, loading, error, onRetry, onSelectTier }: PricingGridProps) {
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

  // Calculate max threads for calculating relative progress percentage
  const maxThreads = Math.max(...moduleData.tiers.map(t => t.threads), 1);

  return (
    <div>
      {/* Module Title & Tagline Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {moduleData.name}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          {moduleData.tagline}
        </p>
      </div>

      {/* Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {moduleData.tiers.map(tier => (
          <PricingCard
            key={tier.id}
            tier={tier}
            moduleSlug={moduleData.slug}
            maxThreads={maxThreads}
            onSelectTier={selectedTier => onSelectTier(selectedTier, moduleData.slug)}
          />
        ))}
      </div>
    </div>
  );
}
