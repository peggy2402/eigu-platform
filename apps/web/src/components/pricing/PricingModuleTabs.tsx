'use client';

import { Sparkles, Scissors, Clapperboard, RefreshCw, TrendingUp, DownloadCloud, Box } from 'lucide-react';
import type { PricingModuleDto } from '@eigu-platform/shared';

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
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '10px 12px', marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
      {modules.map(mod => {
        const isActive = mod.slug === activeSlug;
        const icon = iconMap[mod.icon] || <Box size={18} />;

        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod.slug)}
            className={`pricing-module-tab ${isActive ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {icon}
            <span>{mod.name}</span>
          </button>
        );
      })}
    </div>
  );
}
