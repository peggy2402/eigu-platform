'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/faq');
  }, [router]);

  return null;
}
