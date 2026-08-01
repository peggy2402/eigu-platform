'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

interface BackToHomeButtonProps {
  /** Text label. Defaults to 'Trang chủ' */
  label?: string;
  /** Destination path. Defaults to '/' */
  href?: string;
  /** Placement variant: 'top-left' (absolute) | 'inline' (normal flow). Defaults to 'top-left' */
  variant?: 'top-left' | 'inline';
}

export default function BackToHomeButton({
  label = 'Trang chủ',
  href = '/',
  variant = 'top-left',
}: BackToHomeButtonProps) {
  const router = useRouter();

  const btn = (
    <button
      onClick={() => router.push(href)}
      className="back-to-home-btn"
      aria-label={label}
    >
      <ArrowLeft size={15} strokeWidth={2.5} />
      <Home size={13} strokeWidth={2} style={{ opacity: 0.75 }} />
      <span>{label}</span>
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
