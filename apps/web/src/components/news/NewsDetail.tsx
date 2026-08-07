'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, User, Share2, Copy, Check, Bookmark, Flame, MessageSquare } from 'lucide-react';
import type { NewsDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';
import NewsCommentSection from './NewsCommentSection';

interface NewsDetailProps {
  slug: string;
  onBack: () => void;
  onSelectRelated: (slug: string) => void;
}

export default function NewsDetail({ slug, onBack, onSelectRelated }: NewsDetailProps) {
  const { language } = useLanguage();
  const [article, setArticle] = useState<NewsDto | null>(null);
  const [related, setRelated] = useState<NewsDto[]>([]);
  const [latest, setLatest] = useState<NewsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const copyPageLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
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

          {/* Social Share Buttons */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px', margin: '32px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={16} style={{ color: 'var(--accent)' }} />
              <span>Chia sẻ bài viết này:</span>
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={copyPageLink}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
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
