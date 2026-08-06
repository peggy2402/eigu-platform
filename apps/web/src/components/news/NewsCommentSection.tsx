'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CornerDownRight, Flag, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import type { NewsCommentDto } from '@eigu-platform/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

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

  const fetchComments = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/eigu-v1-t24v02c03';
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
  };

  useEffect(() => {
    fetchComments();
  }, [newsId, user]);

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/eigu-v1-t24v02c03';
      const payload = {
        content: text.trim(),
        parentId,
        userName: user?.username || user?.email?.split('@')[0] || 'Khách ghé thăm',
        userAvatar: user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=6366f1&color=fff` : undefined,
      };

      const res = await fetch(`${apiBase}/public/news/${newsId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, type: 'like' | 'dislike') => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/eigu-v1-t24v02c03';
      const userId = user?.id || 'guest-session-' + Date.now();
      await fetch(`${apiBase}/public/news/comments/${commentId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId }),
      });
      fetchComments();
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
        <span>{language === 'en' ? 'Discussion & Comments' : 'Bình Luận & Thảo Luận'}</span>
        <span style={{ fontSize: 13, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 12 }}>
          {comments.length}
        </span>
      </h3>

      {/* Primary Comment Input */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0, fontSize: 14 }}>
            {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'K'}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              rows={3}
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder={language === 'en' ? 'Share your opinion or ask a question...' : 'Viết bình luận của bạn về bài viết này...'}
              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={() => handlePostComment()}
                disabled={submitting || !newCommentText.trim()}
                className="btn-primary"
                style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: !newCommentText.trim() ? 0.6 : 1 }}
              >
                <Send size={14} />
                <span>{language === 'en' ? 'Post Comment' : 'Gửi Bình Luận'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Comment Tree */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>⏳ Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
          💬 Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              replyText={replyText}
              setReplyText={setReplyText}
              onPostReply={handlePostComment}
              onReaction={handleReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replyToId,
  setReplyToId,
  replyText,
  setReplyText,
  onPostReply,
  onReaction,
  level = 0,
}: {
  comment: NewsCommentDto;
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onPostReply: (parentId: string) => void;
  onReaction: (id: string, type: 'like' | 'dislike') => void;
  level?: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const isLong = comment.content.length > 240;
  const isReplying = replyToId === comment.id;

  const createdTime = new Date(comment.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ marginLeft: Math.min(level * 24, 72), borderLeft: level > 0 ? '2px solid var(--border-color)' : 'none', paddingLeft: level > 0 ? 14 : 0, transition: 'all 0.2s' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              {comment.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{comment.userName}</span>
                {comment.userRole === 'admin' && (
                  <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>
                    ADMIN
                  </span>
                )}
                {comment.userRole === 'staff' && (
                  <span style={{ fontSize: 10, background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>
                    STAFF
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{createdTime}</div>
            </div>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              <span>{collapsed ? `Hiện ${comment.replies.length} phản hồi` : 'Thu gọn'}</span>
            </button>
          )}
        </div>

        {/* Comment Content */}
        <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6, margin: '8px 0', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {isLong && !showFullText ? `${comment.content.slice(0, 240)}...` : comment.content}
          {isLong && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 700, marginLeft: 6 }}
            >
              {showFullText ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          <button
            onClick={() => onReaction(comment.id, 'like')}
            style={{ background: 'none', border: 'none', color: comment.userLiked ? 'var(--accent)' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: comment.userLiked ? 700 : 400 }}
          >
            <ThumbsUp size={14} />
            <span>{comment.likeCount || 0}</span>
          </button>
          <button
            onClick={() => onReaction(comment.id, 'dislike')}
            style={{ background: 'none', border: 'none', color: comment.userDisliked ? '#f87171' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: comment.userDisliked ? 700 : 400 }}
          >
            <ThumbsDown size={14} />
            <span>{comment.dislikeCount || 0}</span>
          </button>
          <button
            onClick={() => setReplyToId(isReplying ? null : comment.id)}
            style={{ background: 'none', border: 'none', color: isReplying ? 'var(--accent)' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
          >
            <CornerDownRight size={14} />
            <span>Trả lời</span>
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-color)' }}>
            <textarea
              rows={2}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Trả lời ${comment.userName}...`}
              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 10, color: 'var(--text-primary)', fontSize: 13 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setReplyToId(null)}
                style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={() => onPostReply(comment.id)}
                disabled={!replyText.trim()}
                className="btn-primary"
                style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Sub Replies */}
      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {comment.replies.map(r => (
            <CommentItem
              key={r.id}
              comment={r}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              replyText={replyText}
              setReplyText={setReplyText}
              onPostReply={onPostReply}
              onReaction={onReaction}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
