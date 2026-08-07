'use client';

import { Check, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PricingTierDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { translatePricingText } from '../../lib/pricingTranslations';

interface PricingCardProps {
  tier: PricingTierDto;
  moduleSlug: string;
  maxThreads: number;
  isHorizontal?: boolean;
  onSelectTier: (tier: PricingTierDto, payableDiffAmount?: number) => void;
  currentSub?: any;
}

export default function PricingCard({ tier, moduleSlug, maxThreads, isHorizontal, onSelectTier, currentSub }: PricingCardProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const isTrial = tier.code === 'trial' || tier.billingPeriod === 'trial';
  const isPopular = tier.badge?.includes('PHỔ BIẾN') || tier.code === 'pro';
  const isEnterprise = isHorizontal || tier.code === 'enterprise' || tier.code.includes('enterprise') || tier.label.toLowerCase().includes('enterprise') || tier.label.toLowerCase().includes('doanh nghiệp');

  const freeLabel = language === 'en' ? 'Free' : 'Miễn phí';
  const machinesLabel = language === 'en' ? 'Concurrent machines:' : 'Số máy dùng:';
  const threadsLabel = language === 'en' ? 'Processing threads:' : 'Số luồng xử lý:';
  const resolutionLabel = language === 'en' ? 'Resolution:' : 'Độ phân giải:';
  const featuresLabel = language === 'en' ? 'Key Features' : 'Tính năng nổi bật';

  const currentBalance = Number(user?.balance || 0);

  // Active Subscription Upgrade Logic
  const currentTierPrice = currentSub ? Number(currentSub.price || currentSub.tierPrice || currentSub.tier?.price || 0) : 0;
  const isCurrent = currentSub && (currentSub.tierId === tier.id || currentSub.tierCode === tier.code);
  const isHigher = currentSub && !isCurrent && tier.price > currentTierPrice;
  const isLower = currentSub && !isCurrent && tier.price < currentTierPrice;
  const payableDiffAmount = isHigher ? (tier.price - currentTierPrice) : 0;

  const deductedBal = Math.min(currentBalance, payableDiffAmount);
  const netVietQR = Math.max(0, payableDiffAmount - currentBalance);

  // Horizontal Enterprise Layout
  if (isEnterprise) {
    return (
      <div
        className="pricing-card enterprise-horizontal-card"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(20, 24, 38, 0.95) 0%, rgba(14, 16, 26, 0.98) 100%)',
          border: isCurrent ? '2px solid var(--accent)' : '1.5px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 24,
          padding: '28px 36px',
          position: 'relative',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 28,
          marginTop: 18,
          overflow: 'visible',
        }}
      >
        {/* Top Right Badge */}
        {isCurrent ? (
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: 28,
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px var(--accent-glow)',
              zIndex: 10,
            }}
          >
            ✓ GÓI ĐANG DÙNG
          </div>
        ) : (tier.badge || tier.discount > 0) && (
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: 28,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              zIndex: 10,
            }}
          >
            {translatePricingText(tier.badge, language) || (language === 'en' ? `SAVE ${tier.discount || 50}%` : `GIẢM ${tier.discount || 50}%`)}
          </div>
        )}

        {/* Left Column */}
        <div style={{ flex: '1 1 540px', minWidth: 280 }}>
          <div style={{ marginBottom: 18 }}>
            <h3 className="enterprise-title" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
              {translatePricingText(tier.label, language) || (language === 'en' ? 'Enterprise Plan (30 Machines)' : 'Gói Doanh Nghiệp (30 Máy)')}
            </h3>
            <p className="enterprise-subtitle" style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              {translatePricingText(tier.tagline, language) || (language === 'en' ? 'Comprehensive cost-optimized solution for media/marketing companies.' : 'Giải pháp toàn diện tối ưu chi phí cho công ty media/marketing.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px 24px' }}>
            {(tier.features && tier.features.length >= 4
              ? tier.features
              : [
                  'Full tính năng Gói Pro',
                  '30 máy hoạt động cùng lúc',
                  'Hỗ trợ ưu tiên 24/7',
                  'Không giới hạn Video/tháng',
                  'Giảm thêm 10% khi thanh toán năm',
                ]
            ).map((feat, idx) => (
              <div key={idx} className="enterprise-feat-item" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 500 }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, fontSize: 14 }}>✓</span>
                <span>{translatePricingText(feat, language)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0, textAlign: 'right', paddingTop: 10 }}>
          {tier.formattedOriginalPrice && (
            <div className="enterprise-orig-price" style={{ fontSize: 14, textDecoration: 'line-through', marginBottom: 2 }}>
              {tier.formattedOriginalPrice}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span className="enterprise-price" style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.5px' }}>
              {tier.formattedPrice || '9.999.000 đ'}
            </span>
            <span className="enterprise-price-sub" style={{ fontSize: 14, fontWeight: 500 }}>
              / {t('pricing_month') || 'tháng'}
            </span>
          </div>

          {isHigher && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', marginBottom: 8, lineHeight: 1.4 }}>
              <div>Trừ gói cũ ({currentTierPrice.toLocaleString('vi-VN')}đ) ➔ Chênh lệch: <strong style={{ color: 'var(--accent)' }}>+{payableDiffAmount.toLocaleString('vi-VN')}đ</strong></div>
              {currentBalance > 0 && (
                <div style={{ color: netVietQR === 0 ? '#22c55e' : '#38bdf8', fontWeight: 700 }}>
                  {netVietQR === 0
                    ? `✓ Đủ số dư ví (${currentBalance.toLocaleString('vi-VN')}đ)`
                    : `Trừ ví ${deductedBal.toLocaleString('vi-VN')}đ ➔ Cần nạp: ${netVietQR.toLocaleString('vi-VN')}đ`}
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          {isCurrent ? (
            <button
              disabled
              style={{
                padding: '12px 32px',
                borderRadius: 14,
                fontSize: 14.5,
                fontWeight: 800,
                cursor: 'not-allowed',
                border: '1.5px solid var(--accent)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={16} /> Gói cước đang dùng
            </button>
          ) : isLower ? (
            <button
              disabled
              style={{
                padding: '12px 32px',
                borderRadius: 14,
                fontSize: 14.5,
                fontWeight: 600,
                cursor: 'not-allowed',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
              }}
            >
              Gói cấp thấp hơn
            </button>
          ) : (
            <button
              onClick={() => onSelectTier(tier, payableDiffAmount)}
              style={{
                padding: '12px 32px',
                borderRadius: 14,
                fontSize: 14.5,
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: 'var(--accent)',
                color: '#ffffff',
                boxShadow: '0 6px 20px var(--accent-glow)',
                transition: 'all 0.25s ease',
              }}
            >
              {isHigher
                ? (netVietQR === 0
                  ? `Nâng cấp (Trừ ${payableDiffAmount.toLocaleString('vi-VN')}đ ví) →`
                  : `Nâng cấp (Nạp ${netVietQR.toLocaleString('vi-VN')}đ) →`)
                : (t('pricing_select') || 'Chọn gói này')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Standard Vertical Card Layout
  let threadPercentage = 0;
  if (tier.threads === 0) {
    threadPercentage = 100;
  } else if (maxThreads > 0) {
    threadPercentage = Math.min(100, Math.round((tier.threads / maxThreads) * 100));
  }

  return (
    <div
      className={`pricing-card ${isPopular ? 'popular' : ''}`}
      style={{
        background: isPopular ? 'linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
        border: isCurrent ? '2px solid var(--accent)' : (isPopular ? '2px solid var(--accent)' : '1px solid var(--border-color)'),
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isCurrent ? '0 12px 32px var(--accent-glow)' : (isPopular ? '0 12px 32px var(--accent-glow)' : '0 4px 16px rgba(0,0,0,0.2)'),
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Dynamic Badge */}
      {isCurrent ? (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 20,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}
        >
          ✓ GÓI CƯỚC ĐANG DÙNG
        </div>
      ) : tier.badge && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 20,
            background: 'var(--accent)',
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
          {isPopular ? t('pricing_popular') : (tier.badge === 'TRẢI NGHIỆM MIỄN PHÍ' ? t('pricing_trial_badge') : translatePricingText(tier.badge, language))}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {translatePricingText(tier.label, language)}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', minHeight: 38, lineHeight: 1.4 }}>
          {translatePricingText(tier.tagline, language)}
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
          <span style={{ fontSize: 32, fontWeight: 800, color: isPopular || isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>
            {tier.price === 0 ? freeLabel : tier.formattedPrice}
          </span>
          {tier.price > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {isTrial ? `/ ${tier.trialDays || 7} ${t('pricing_days')}` : `/ ${t('pricing_month')}`}
            </span>
          )}
        </div>
        {isHigher && (
          <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.4 }}>
            <div style={{ color: 'var(--text-muted)' }}>
              Trừ gói cũ ({currentTierPrice.toLocaleString('vi-VN')}đ) ➔ Chênh lệch: <strong style={{ color: 'var(--accent)' }}>+{payableDiffAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
            {currentBalance > 0 && (
              <div style={{ color: netVietQR === 0 ? '#22c55e' : '#38bdf8', fontWeight: 700, marginTop: 2 }}>
                {netVietQR === 0
                  ? `✓ Đủ số dư ví (${currentBalance.toLocaleString('vi-VN')}đ)`
                  : `Trừ ví ${deductedBal.toLocaleString('vi-VN')}đ ➔ Cần nạp: ${netVietQR.toLocaleString('vi-VN')}đ`}
              </div>
            )}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('pricing_vat')}
        </div>
      </div>

      {/* CTA Button */}
      {isCurrent ? (
        <button
          disabled
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 800,
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent)',
            border: '1.5px solid var(--accent)',
            cursor: 'not-allowed',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <CheckCircle2 size={16} /> Gói cước đang dùng
        </button>
      ) : isLower ? (
        <button
          disabled
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            cursor: 'not-allowed',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Gói cấp thấp hơn
        </button>
      ) : (
        <button
          onClick={() => onSelectTier(tier, payableDiffAmount)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'var(--accent)',
            color: '#ffffff',
            boxShadow: '0 4px 16px var(--accent-glow)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.25s ease',
          }}
        >
          {isHigher ? (
            <>
              <Sparkles size={16} />
              {netVietQR === 0
                ? `Nâng cấp (Trừ ${payableDiffAmount.toLocaleString('vi-VN')}đ ví) →`
                : `Nâng cấp (Nạp ${netVietQR.toLocaleString('vi-VN')}đ) →`}
            </>
          ) : (
            <>
              {isPopular && <Sparkles size={16} />}
              {t('pricing_select')}
            </>
          )}
        </button>
      )}

      {/* Specs */}
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
                background: 'var(--accent)',
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
              <span>{translatePricingText(feat, language)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
