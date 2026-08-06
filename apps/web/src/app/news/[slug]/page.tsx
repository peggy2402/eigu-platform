'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import NewsDetail from '../../../components/news/NewsDetail';

export default function NewsSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header activePath="/news" onNavigate={path => router.push(path)} onOpenSettings={() => {}} onOpenFeedback={() => {}} />
      <main style={{ flex: 1, paddingTop: 100 }}>
        {slug ? (
          <NewsDetail
            slug={slug}
            onBack={() => router.push('/news')}
            onSelectRelated={newSlug => router.push(`/news/${newSlug}`)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 60 }}>Đang tải bài viết...</div>
        )}
      </main>
      <Footer onNavigate={path => router.push(path)} />
    </div>
  );
}
