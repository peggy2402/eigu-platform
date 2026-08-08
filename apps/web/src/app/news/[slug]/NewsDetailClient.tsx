'use client';

import { useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import NewsDetail from '../../../components/news/NewsDetail';

interface NewsDetailClientProps {
  slug: string;
}

export default function NewsDetailClient({ slug }: NewsDetailClientProps) {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header activePath="/news" onNavigate={path => router.push(path)} onOpenSettings={() => {}} onOpenFeedback={() => {}} />
      <main style={{ flex: 1, paddingTop: 100 }}>
        <NewsDetail
          slug={slug}
          onBack={() => router.push('/news')}
          onSelectRelated={newSlug => router.push(`/news/${newSlug}`)}
        />
      </main>
      <Footer onNavigate={path => router.push(path)} />
    </div>
  );
}
