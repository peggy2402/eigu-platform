import type { Metadata } from 'next';
import NewsDetailClient from './NewsDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://eigu.site').replace(/\/$/, '');
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

  try {
    const res = await fetch(`${apiBase}/public/news/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const article = await res.json();
      const title = article.title || 'Bài viết tin tức';
      const description = article.summary || 'Đọc bài viết mới nhất tại EIGU Platform';
      let image = article.thumbnail || `${siteUrl}/logo.png`;
      if (image && !image.startsWith('http')) {
        image = `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`;
      }
      const pageUrl = `${siteUrl}/news/${slug}`;

      return {
        title: `${title} | EIGU Platform`,
        description,
        openGraph: {
          title,
          description,
          url: pageUrl,
          siteName: 'EIGU Platform',
          type: 'article',
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata for news page:', err);
  }

  return {
    title: 'Chi tiết bài viết | EIGU Platform',
    description: 'Nền tảng tự động hóa video AI & MMO Reup',
  };
}

export default async function NewsSlugPage({ params }: Props) {
  const { slug } = await params;
  return <NewsDetailClient slug={slug} />;
}
