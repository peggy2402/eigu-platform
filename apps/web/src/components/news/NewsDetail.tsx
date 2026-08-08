'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, User, Share2, Copy, Check, Bookmark, Flame, MessageSquare } from 'lucide-react';
import type { NewsDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';
import NewsCommentSection from './NewsCommentSection';

import { useToast } from '../../contexts/ToastContext';

interface NewsDetailProps {
  slug: string;
  onBack: () => void;
  onSelectRelated: (slug: string) => void;
}

export default function NewsDetail({ slug, onBack, onSelectRelated }: NewsDetailProps) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [article, setArticle] = useState<NewsDto | null>(null);
  const [related, setRelated] = useState<NewsDto[]>([]);
  const [latest, setLatest] = useState<NewsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const getShareableUrl = () => {
    if (typeof window === 'undefined') return '';

    // Allow optional custom domain override via NEXT_PUBLIC_SHARE_DOMAIN
    const customShareDomain = process.env.NEXT_PUBLIC_SHARE_DOMAIN;
    if (customShareDomain) {
      const cleanDomain = customShareDomain.replace(/\/$/, '');
      const path = window.location.pathname.startsWith('/news')
        ? window.location.pathname
        : `/news/${slug}`;
      return `${cleanDomain}${path}`;
    }

    // Default: Always take the exact active webpage URL currently being viewed
    if (!window.location.pathname.includes(slug)) {
      return `${window.location.origin}/news/${slug}`;
    }

    return window.location.href;
  };

  useEffect(() => {
    setShareUrl(getShareableUrl());
  }, [slug]);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      setLoading(true);
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
        const [artRes, relRes, latRes] = await Promise.all([
          fetch(`${apiBase}/public/news/${slug}`),
          fetch(`${apiBase}/public/news/related?slug=${slug}&limit=4`),
          fetch(`${apiBase}/public/news/latest?limit=5`),
        ]);

        if (artRes.ok) {
          const artData = await artRes.json();
          setArticle(artData);
        }
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelated(Array.isArray(relData) ? relData : []);
        }
        if (latRes.ok) {
          const latData = await latRes.json();
          setLatest(Array.isArray(latData) ? latData : []);
        }
      } catch (err) {
        console.error('Error loading article detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = (platform: 'facebook' | 'zalo' | 'telegram' | 'x', e: React.MouseEvent) => {
    e.preventDefault();
    const currentUrl = shareUrl || getShareableUrl();
    if (!currentUrl) return;

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = article ? encodeURIComponent(article.title) : '';

    let shareTarget = '';
    switch (platform) {
      case 'facebook':
        shareTarget = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'zalo':
        shareTarget = `https://zalo.me/share?url=${encodedUrl}`;
        break;
      case 'telegram':
        shareTarget = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'x':
        shareTarget = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (shareTarget) {
      window.open(shareTarget, '_blank', 'noopener,noreferrer,width=600,height=550');
    }
  };

  const copyPageLink = () => {
    const currentUrl = shareUrl || getShareableUrl();
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast(
        language === 'en' ? 'Link Copied' : 'Đã sao chép link',
        language === 'en' ? 'Article link has been copied to clipboard' : 'Đã sao chép liên kết bài viết vào khay nhớ tạm',
        'success'
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Đang tải nội dung bài viết...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: 40, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Không tìm thấy bài viết</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Bài viết này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <button onClick={onBack} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} />
          <span>Quay lại Tin tức</span>
        </button>
      </div>
    );
  }

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
  const publishedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 24 }}
      >
        <ArrowLeft size={16} />
        <span>{language === 'en' ? 'Back to All Articles' : 'Quay lại danh sách bài viết'}</span>
      </button>

      {/* Main 2-Column Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 40 }} className="news-detail-grid">
        {/* LEFT COLUMN (70%): Main Content & Comments */}
        <div>
          {/* Category Badge */}
          {article.category && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 12px', borderRadius: 16 }}>
                {article.category.name}
              </span>
            </div>
          )}

          {/* Article Title */}
          <h1 style={{ fontSize: 'min(2.4rem, 6vw)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 16 }}>
            {article.title}
          </h1>

          {/* Article Meta Bar */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{article.authorName || 'EIGU Staff'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} />
              <span>{publishedDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} />
              <span>{article.readingTime || 1} phút đọc</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} />
              <span>{article.viewCount || 0} lượt xem</span>
            </div>
          </div>

          {/* Main Thumbnail Image */}
          {article.thumbnail && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28, border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <img
                src={article.thumbnail}
                onError={e => { (e.target as HTMLElement).setAttribute('src', defaultPlaceholder); }}
                alt={article.title}
                style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Summary Callout Box */}
          {article.summary && (
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--accent)', padding: '16px 20px', borderRadius: '0 12px 12px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
              {article.summary}
            </div>
          )}

          {/* Render HTML Article Content */}
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)' }}
            className="news-article-html-body"
          />

          {/* Tags List */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Thẻ tags:</span>
              {article.tags.map(t => (
                <span key={t.id} style={{ fontSize: 12, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 12 }}>
                  #{t.name}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Bar with Platform Buttons */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '16px 20px',
              margin: '32px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={16} style={{ color: 'var(--accent)' }} />
              <span>{language === 'en' ? 'Share this article:' : 'Chia sẻ bài viết này:'}</span>
            </span>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Facebook Share */}
              <a
                href={shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(article?.title || '')}` : '#'}
                onClick={(e) => handleShare('facebook', e)}
                target="_blank"
                rel="noopener noreferrer"
                title="Chia sẻ lên Facebook"
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'rgba(24, 119, 242, 0.12)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  color: '#1877F2',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
              </a>

              {/* Zalo Share */}
              <a
                href={shareUrl ? `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}` : '#'}
                onClick={(e) => handleShare('zalo', e)}
                target="_blank"
                rel="noopener noreferrer"
                title="Chia sẻ lên Zalo"
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'rgba(0, 104, 255, 0.12)',
                  border: '1px solid rgba(0, 104, 255, 0.3)',
                  color: '#0068FF',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900 }}>ZALO</span>
              </a>

              {/* Telegram Share */}
              <a
                href={shareUrl ? `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}` : '#'}
                onClick={(e) => handleShare('telegram', e)}
                target="_blank"
                rel="noopener noreferrer"
                title="Chia sẻ qua Telegram"
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'rgba(34, 158, 217, 0.12)',
                  border: '1px solid rgba(34, 158, 217, 0.3)',
                  color: '#229ED9',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.761-.17.712-.435.952-.69 0.975-.555.051-.977-.367-1.514-.719-.84-.551-1.314-.894-2.128-1.43-.941-.62-.331-.96.205-1.518.14-.146 2.577-2.362 2.624-2.563.006-.025.011-.118-.044-.167s-.136-.032-.195-.019c-.083.019-1.408.895-3.974 2.628-.376.259-.716.386-1.02.379-.336-.008-.984-.19-1.466-.347-.591-.192-1.06-.294-1.019-.62.021-.17.256-.345.704-.525 2.768-1.205 4.614-2.001 5.538-2.387 2.635-1.1 3.181-1.291 3.538-1.297.078-.001.254.019.367.111.096.079.123.186.136.262.012.076.027.248.016.388z"/></svg>
                <span>Telegram</span>
              </a>

              {/* Twitter / X Share */}
              <a
                href={shareUrl ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}` : '#'}
                onClick={(e) => handleShare('x', e)}
                target="_blank"
                rel="noopener noreferrer"
                title="Chia sẻ lên X (Twitter)"
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X</span>
              </a>

              {/* One-Click Copy Link Button */}
              <button
                onClick={copyPageLink}
                style={{
                  padding: '7px 14px',
                  borderRadius: 10,
                  border: copied ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid var(--accent)',
                  background: copied ? 'rgba(34, 197, 94, 0.15)' : 'var(--accent-glow)',
                  color: copied ? '#4ade80' : 'var(--accent)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                <span>{copied ? 'Đã sao chép link' : 'Sao chép link'}</span>
              </button>
            </div>
          </div>

          {/* Comment Section Component */}
          <NewsCommentSection newsId={article.id} />
        </div>

        {/* RIGHT COLUMN (30%): Sidebar */}
        <div>
          {/* Related Articles Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bookmark size={16} style={{ color: 'var(--accent)' }} />
              <span>Bài Viết Liên Quan</span>
            </h3>
            {related.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chưa có bài viết liên quan</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {related.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRelated(item.slug)}
                    style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <div style={{ width: 68, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-primary)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <img
                        src={item.thumbnail || defaultPlaceholder}
                        onError={e => { (e.target as HTMLElement).setAttribute('src', defaultPlaceholder); }}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h4>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Articles Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={16} style={{ color: '#f97316' }} />
              <span>Mới Cập Nhật</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {latest.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectRelated(item.slug)}
                  style={{ cursor: 'pointer', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}
                >
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} /> {item.viewCount || 0} lượt xem
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MessageSquare size={12} /> {item.commentCount || 0} bình luận
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
