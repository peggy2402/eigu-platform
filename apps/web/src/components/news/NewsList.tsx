'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, Eye, MessageSquare, ChevronRight, Sparkles, Newspaper } from 'lucide-react';
import type { NewsDto, NewsCategoryDto } from '@eigu-platform/shared';
import { useLanguage } from '../../contexts/LanguageContext';

interface NewsListProps {
  onSelectArticle: (slug: string) => void;
}

export default function NewsList({ onSelectArticle }: NewsListProps) {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsDto[]>([]);
  const [categories, setCategories] = useState<NewsCategoryDto[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
        let url = `${apiBase}/public/news?limit=24`;
        if (selectedCat) url += `&categoryId=${selectedCat}`;
        if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

        const [artRes, catRes] = await Promise.all([
          fetch(url),
          fetch(`${apiBase}/public/news/categories`),
        ]);

        if (artRes.ok) {
          const artData = await artRes.json();
          setArticles(artData.items || (Array.isArray(artData) ? artData : []));
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch (err) {
        console.error('Error fetching public news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCat, searchQuery]);

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';

  return (
    <section style={{ padding: '0 24px 80px', maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* Header Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, padding: '4px 14px', borderRadius: 20, marginBottom: 12 }}>
          <Newspaper size={15} />
          <span>{language === 'en' ? 'EIGU Platform Official News' : 'Tin Tức & Cập Nhật Tin Công Nghệ AI'}</span>
        </div>
        <h1 style={{ fontSize: 'min(2.6rem, 7vw)', fontWeight: 900, marginBottom: 12, color: 'var(--text-primary)' }}>
          {language === 'en' ? 'Latest News & Technical Guides' : 'Tin Tức & Hướng Dẫn Kỹ Thuật'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto', fontWeight: 500 }}>
          {language === 'en'
            ? 'Discover product updates, anti-detect FFmpeg algorithms, TikTok Beta growth strategies, and system announcements.'
            : 'Cập nhật tính năng mới, thuật toán lách bản quyền FFmpeg MD5 decimation, chiến lược xây kênh TikTok Beta và thông báo sự kiện.'}
        </p>
      </div>

      {/* Control Bar: Categories & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCat('')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: selectedCat === '' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
              background: selectedCat === '' ? 'var(--accent-glow)' : 'var(--bg-card)',
              color: selectedCat === '' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Tất Cả Bài Viết
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: selectedCat === cat.id ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                background: selectedCat === cat.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                color: selectedCat === cat.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 260 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? 'Search articles...' : 'Tìm kiếm bài viết...'}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* News Grid (Desktop 3 cols, Tablet 2 cols, Mobile 1 col) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Đang tải bài viết từ server...</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Newspaper size={36} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>Không tìm thấy bài viết nào</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Thử chọn danh mục khác hoặc thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {articles.map(item => {
            const publishedDate = new Date(item.publishedAt || item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item.slug)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                }}
                className="news-card-item"
              >
                {/* Card Thumbnail */}
                <div style={{ height: 190, width: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                  <img
                    src={item.thumbnail || defaultPlaceholder}
                    onError={e => { (e.target as HTMLElement).setAttribute('src', defaultPlaceholder); }}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    className="news-card-img"
                  />
                  {item.category && (
                    <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, background: 'rgba(10, 12, 18, 0.85)', backdropFilter: 'blur(8px)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 12, border: '1px solid var(--accent)' }}>
                      {item.category.name}
                    </span>
                  )}
                  {item.isFeatured && (
                    <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 800, background: 'rgba(234, 179, 8, 0.95)', color: '#000', padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={11} fill="#000" /> HOT
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary || 'Đọc bài viết để cập nhật chi tiết những hướng dẫn mới nhất từ EIGU Platform.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        <span>{item.readingTime || 1} phút</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={13} />
                        <span>{item.viewCount || 0}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare size={13} />
                        <span>{item.commentCount || 0}</span>
                      </span>
                    </div>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                      Đọc tiếp <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
