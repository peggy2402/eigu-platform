'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { NewsCommentDto } from '@eigu-platform/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentTree } from './CommentTree/CommentTree';

interface NewsCommentSectionProps {
  newsId: string;
}

export default function NewsCommentSection({ newsId }: NewsCommentSectionProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [comments, setComments] = useState<NewsCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
      const userId = user?.id || '';
      const res = await fetch(`${apiBase}/public/news/${newsId}/comments?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [newsId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = useCallback(async (parentId?: string) => {
    if (!user) {
      alert(language === 'en' ? 'Please log in to post comments!' : 'Vui lòng đăng nhập tài khoản để gửi bình luận!');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      alert(language === 'en' ? 'Session expired. Please log in again.' : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
      const payload = {
        content: text.trim(),
        parentId,
        userName: user.username || user.email?.split('@')[0] || 'User',
        userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=6366f1&color=fff`,
      };

      const res = await fetch(`${apiBase}/public/news/${newsId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (parentId) {
          setReplyText('');
          setReplyToId(null);
        } else {
          setNewCommentText('');
        }
        await fetchComments();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || (language === 'en' ? 'Failed to post comment' : 'Gửi bình luận thất bại'));
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  }, [user, language, replyText, newCommentText, newsId, fetchComments]);

  const handleReaction = useCallback(async (commentId: string, type: 'like' | 'dislike') => {
    if (!user) {
      alert(language === 'en' ? 'Please log in to react to comments!' : 'Vui lòng đăng nhập tài khoản để thả cảm xúc cho bình luận!');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      alert(language === 'en' ? 'Session expired. Please log in again.' : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/public/news/comments/${commentId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        fetchComments();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || (language === 'en' ? 'Reaction failed' : 'Tương tác thất bại'));
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  }, [user, language, fetchComments]);

  return (
    <div style={{ marginTop: 48, borderTop: '1px solid var(--border-color)', paddingTop: 36 }}>
      {/* Header */}
      <h3 style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <MessageSquare size={22} style={{ color: 'var(--accent)' }} />
        <span>{language === 'en' ? 'Discussion & Community Comments' : 'Bình Luận & Thảo Luận Cộng Đồng'}</span>
        <span style={{ fontSize: 13, fontWeight: 700, background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '2px 10px', borderRadius: 14 }}>
          {comments.length}
        </span>
      </h3>

      {/* Primary Comment Input Box / Login Prompt */}
      {!user ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '28px 24px', textAlign: 'center', marginBottom: 32, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            {language === 'en' ? 'Log in to Participate in Discussion' : 'Đăng nhập để tham gia bình luận & tương tác'}
          </h4>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 auto 20px', maxWidth: 520, lineHeight: 1.5 }}>
            {language === 'en' ? 'Join our community to ask questions, share tips, and react to technical articles.' : 'Tài khoản thành viên được quyền tham gia thảo luận, trao đổi kinh nghiệm nuôi kênh & thả cảm xúc.'}
          </p>
          <a href="/auth/login" className="btn-primary" style={{ padding: '10px 26px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span>{language === 'en' ? 'Log In Now' : 'Đăng Nhập Ngay'}</span>
          </a>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 20, marginBottom: 36, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, border: '1.5px solid rgba(255,255,255,0.15)' }}>
              {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                rows={3}
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder={language === 'en' ? 'Share your thoughts, ask a question, or leave feedback...' : 'Viết bình luận của bạn về bài viết này...'}
                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  onClick={() => handlePostComment()}
                  disabled={submitting || !newCommentText.trim()}
                  className="btn-primary"
                  style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, opacity: !newCommentText.trim() ? 0.6 : 1 }}
                >
                  <Send size={15} />
                  <span>{language === 'en' ? 'Post Comment' : 'Gửi Bình Luận'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Root Comments Tree */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Đang tải danh sách bình luận...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={28} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>Chưa có bình luận nào</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hãy là người đầu tiên tham gia thảo luận về bài viết này!</span>
        </div>
      ) : (
        <CommentTree
          comments={comments}
          replyToId={replyToId}
          setReplyToId={setReplyToId}
          replyText={replyText}
          setReplyText={setReplyText}
          onPostReply={handlePostComment}
          onReaction={handleReaction}
          language={language}
          user={user}
        />
      )}
    </div>
  );
}
