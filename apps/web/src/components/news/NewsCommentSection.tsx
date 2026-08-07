'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Image as ImageIcon, Smile, AtSign, Star, LogIn } from 'lucide-react';
import type { NewsCommentDto } from '@eigu-platform/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { CommentTree } from './CommentTree/CommentTree';

interface NewsCommentSectionProps {
  newsId: string;
}

export default function NewsCommentSection({ newsId }: NewsCommentSectionProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
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
      showToast(
        language === 'en' ? 'Login Required' : 'Yêu cầu đăng nhập',
        language === 'en' ? 'Please log in to post comments!' : 'Vui lòng đăng nhập tài khoản để gửi bình luận!',
        'warning'
      );
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      showToast(
        language === 'en' ? 'Session Expired' : 'Phiên đăng nhập hết hạn',
        language === 'en' ? 'Session expired. Please log in again.' : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        'error'
      );
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
        showToast(
          language === 'en' ? 'Success' : 'Thành công',
          language === 'en' ? 'Comment posted successfully!' : 'Bình luận của bạn đã được gửi thành công!',
          'success'
        );
        if (parentId) {
          setReplyText('');
          setReplyToId(null);
        } else {
          setNewCommentText('');
        }
        await fetchComments();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(
          language === 'en' ? 'Error' : 'Lỗi gửi bình luận',
          errData.message || (language === 'en' ? 'Failed to post comment' : 'Gửi bình luận thất bại'),
          'error'
        );
      }
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      showToast(
        language === 'en' ? 'Error' : 'Lỗi gửi bình luận',
        err?.message || (language === 'en' ? 'Failed to post comment' : 'Gửi bình luận thất bại'),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  }, [user, language, replyText, newCommentText, newsId, fetchComments, showToast]);

  const handleReaction = useCallback(async (commentId: string, type: 'like' | 'dislike') => {
    if (!user) {
      showToast(
        language === 'en' ? 'Login Required' : 'Yêu cầu đăng nhập',
        language === 'en' ? 'Please log in to react to comments!' : 'Vui lòng đăng nhập tài khoản để thả cảm xúc cho bình luận!',
        'warning'
      );
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      showToast(
        language === 'en' ? 'Session Expired' : 'Phiên đăng nhập hết hạn',
        language === 'en' ? 'Session expired. Please log in again.' : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        'error'
      );
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
        showToast(
          language === 'en' ? 'Error' : 'Tương tác thất bại',
          errData.message || (language === 'en' ? 'Reaction failed' : 'Tương tác thất bại'),
          'error'
        );
      }
    } catch (err: any) {
      console.error('Reaction error:', err);
      showToast(
        language === 'en' ? 'Error' : 'Tương tác thất bại',
        err?.message || (language === 'en' ? 'Reaction failed' : 'Tương tác thất bại'),
        'error'
      );
    }
  }, [user, language, fetchComments, showToast]);

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
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 20,
            padding: '32px 24px',
            textAlign: 'center',
            marginBottom: 36,
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          }}
        >
          <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            {language === 'en' ? 'Log in to Participate in Discussion' : 'Đăng nhập để tham gia bình luận & tương tác'}
          </h4>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 auto 22px', maxWidth: 520, lineHeight: 1.6 }}>
            {language === 'en' ? 'Join our community to ask questions, share tips, and react to technical articles.' : 'Tài khoản thành viên được quyền tham gia thảo luận, trao đổi kinh nghiệm nuôi kênh & thả cảm xúc.'}
          </p>
          <a
            href="/auth/login"
            style={{
              padding: '11px 28px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.25s ease',
            }}
          >
            <LogIn size={15} />
            <span>{language === 'en' ? 'Log In Now' : 'Đăng Nhập Ngay'}</span>
          </a>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 24,
            padding: 24,
            marginBottom: 36,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          }}
        >
          {/* 1. Header Profile Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            {/* User Avatar with Green Live Status Dot */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid var(--bg-card)',
                }}
              />
            </div>

            {/* Username & Role Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {user?.username || user?.email}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '2px 10px',
                  borderRadius: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Star size={11} style={{ fill: '#818cf8' }} />
                <span>{language === 'en' ? 'EIGU Member' : 'Thành viên EIGU'}</span>
              </span>
            </div>
          </div>

          {/* 2. Textarea Box with Soft Accent Outline */}
          <div style={{ marginBottom: 18 }}>
            <textarea
              rows={3}
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder={language === 'en' ? 'Share your thoughts about this article...' : 'Hãy chia sẻ suy nghĩ của bạn về bài viết này...'}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '2px solid rgba(99, 102, 241, 0.45)',
                borderRadius: 16,
                padding: '16px 18px',
                color: 'var(--text-primary)',
                fontSize: 14.5,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
            />
          </div>

          {/* 3. Action Toolbar Row (Left Circle Icons + Right Submit Capsule Button) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            {/* Right Capsule Submit Button */}
            <button
              onClick={() => handlePostComment()}
              disabled={submitting || !newCommentText.trim()}
              style={{
                padding: '11px 28px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: newCommentText.trim()
                  ? 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)'
                  : 'rgba(129, 140, 248, 0.35)',
                color: '#ffffff',
                border: 'none',
                cursor: !newCommentText.trim() ? 'not-allowed' : 'pointer',
                boxShadow: newCommentText.trim() ? '0 6px 20px rgba(129, 140, 248, 0.4)' : 'none',
                opacity: !newCommentText.trim() ? 0.7 : 1,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <span>{submitting ? (language === 'en' ? 'Sending...' : 'Đang gửi...') : (language === 'en' ? 'Post Comment' : 'Đăng Bình Luận')}</span>
              <Send size={15} />
            </button>
          </div>

          {/* 4. Community Guidelines Amber Callout Banner (Bottom) */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '0 12px 12px 0',
              padding: '14px 18px',
              fontSize: 13.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#d97706', fontWeight: 800 }}>
              {language === 'en' ? 'Community Guidelines:' : 'Quy tắc cộng đồng:'}
            </strong>{' '}
            <span>
              {language === 'en'
                ? 'Please remain respectful and refrain from abusive language.'
                : 'Hãy giữ thái độ tôn trọng và tránh sử dụng ngôn từ đả kích nhé!'}
            </span>
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
