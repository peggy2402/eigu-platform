import type { Metadata } from 'next';
import NewsDetailClient from './NewsDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://eigu.site').replace(/\/$/, '');
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

  let title = 'Chi tiết bài viết';
  let description = 'Đọc bài viết tin tức mới nhất tại EIGU Platform';
  let imageUrl = `${siteUrl}/logo.png`;

  try {
    const res = await fetch(`${apiBase}/public/news/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const article = await res.json();
      if (article.title) title = article.title;
      if (article.summary) description = article.summary;
      if (article.thumbnail) {
        imageUrl = article.thumbnail.startsWith('http')
          ? article.thumbnail
          : `${siteUrl}${article.thumbnail.startsWith('/') ? '' : '/'}${article.thumbnail}`;
      }
    }
  } catch (err) {
    console.error('Error generating metadata for news page:', err);
  }

  const pageUrl = `${siteUrl}/news/${slug}`;

  return {
    metadataBase: new URL(siteUrl),
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
          url: imageUrl,
          secureUrl: imageUrl,
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
      images: [imageUrl],
    },
  };
}

export default async function NewsSlugPage({ params }: Props) {
  const { slug } = await params;
  return <NewsDetailClient slug={slug} />;
}
