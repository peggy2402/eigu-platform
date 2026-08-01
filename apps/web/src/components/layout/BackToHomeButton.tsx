'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BackToHomeButtonProps {
  /** Optional custom text label */
  label?: string;
  /** Destination path. Defaults to '/' */
  href?: string;
  /** Placement variant: 'top-left' (absolute) | 'inline' (normal flow). Defaults to 'top-left' */
  variant?: 'top-left' | 'inline';
}

export default function BackToHomeButton({
  label,
  href = '/',
  variant = 'top-left',
}: BackToHomeButtonProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const defaultLabel = language === 'en' ? 'Home' : 'Trang chủ';
  const displayLabel = label || defaultLabel;

  const btn = (
    <button
      onClick={() => router.push(href)}
      className="back-to-home-btn"
      aria-label={displayLabel}
    >
      <ArrowLeft size={15} strokeWidth={2.5} />
      <Home size={13} strokeWidth={2} style={{ opacity: 0.75 }} />
      <span>{displayLabel}</span>
    </button>
  );

  if (variant === 'top-left') {
    return (
      <div className="back-to-home-wrapper">
        {btn}
      </div>
    );
  }

  return btn;
}
