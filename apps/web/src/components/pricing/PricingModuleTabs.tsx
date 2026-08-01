'use client';

import { Sparkles, Scissors, Clapperboard, RefreshCw, TrendingUp, DownloadCloud, Box } from 'lucide-react';
import type { PricingModuleDto } from '@eigu-platform/shared';

import { useLanguage } from '../../contexts/LanguageContext';
import { translatePricingText } from '../../lib/pricingTranslations';

const iconMap: Record<string, React.ReactNode> = {
  'Sparkles': <Sparkles size={18} />,
  'Scissors': <Scissors size={18} />,
  'Clapperboard': <Clapperboard size={18} />,
  'RefreshCw': <RefreshCw size={18} />,
  'TrendingUp': <TrendingUp size={18} />,
  'DownloadCloud': <DownloadCloud size={18} />,
};

interface PricingModuleTabsProps {
  modules: PricingModuleDto[];
  activeSlug: string;
  onSelectModule: (slug: string) => void;
}

export default function PricingModuleTabs({ modules, activeSlug, onSelectModule }: PricingModuleTabsProps) {
  const { language } = useLanguage();

  return (
    <div
      className="pricing-module-tabs-bar"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '10px 4px',
        marginBottom: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        width: '100%',
      }}
    >
      {modules.map(mod => {
        const isActive = mod.slug === activeSlug;
        const icon = iconMap[mod.icon] || <Box size={17} />;
        const translatedName = translatePricingText(mod.name, language);

        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod.slug)}
            className={`pricing-module-tab ${isActive ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 15px',
              borderRadius: 'var(--radius)',
              fontSize: 13.5,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {icon}
            <span>{translatedName}</span>
          </button>
        );
      })}
    </div>
  );
}
