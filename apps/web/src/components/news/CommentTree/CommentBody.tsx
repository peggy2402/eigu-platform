import React, { useState, memo } from 'react';
import { ThumbsUp, ThumbsDown, CornerDownRight, Send, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
import type { FlatCommentNode, SharedCommentHandlers } from './TreeTypes';

export interface CommentBodyProps extends SharedCommentHandlers {
  node: FlatCommentNode;
  isRoot: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
}

export const CommentBody = memo(function CommentBody({
  node,
  isRoot,
  isCollapsed,
  onToggleCollapse,
  replyToId,
  setReplyToId,
  replyText,
  setReplyText,
  onPostReply,
  onReaction,
  language,
}: CommentBodyProps) {
  const [showFullText, setShowFullText] = useState(false);
  const comment = node.comment;
  const isLong = comment.content.length > 240;
  const isReplying = replyToId === comment.id;

  const createdTime = new Date(comment.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
      {/* Header Row: Name, Badges, Timestamp, Collapse Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: isRoot ? 14 : 13.5, color: 'var(--text-primary)' }}>
            {comment.userName}
          </span>

          {/* Role Badges */}
          {comment.userRole === 'admin' && (
            <span style={{ fontSize: 10, fontWeight: 800, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(244, 63, 94, 0.2))', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <ShieldCheck size={11} /> ADMIN
            </span>
          )}
          {comment.userRole === 'staff' && (
            <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.35)', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Sparkles size={11} /> STAFF
            </span>
          )}

          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            • {createdTime}
          </span>
        </div>

        {/* Collapse / Expand Sub-thread Button */}
        {node.hasReplies && (
          <button
            onClick={() => onToggleCollapse(comment.id)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
          >
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            <span>{isCollapsed ? `${node.replyCount} phản hồi` : 'Thu gọn'}</span>
          </button>
        )}
      </div>

      {/* Comment Content Text */}
      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55, margin: '4px 0 8px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
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

      {/* Action Row: Like, Dislike, Reply */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Like Button */}
        <button
          onClick={() => onReaction(comment.id, 'like')}
          style={{
            background: comment.userLiked ? 'var(--accent-glow)' : 'var(--bg-primary)',
            border: comment.userLiked ? '1px solid var(--accent)' : '1px solid var(--border-color)',
            color: comment.userLiked ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '4px 11px',
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s',
          }}
        >
          <ThumbsUp size={12} style={{ fill: comment.userLiked ? 'var(--accent)' : 'none' }} />
          <span>{comment.likeCount || 0}</span>
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => onReaction(comment.id, 'dislike')}
          style={{
            background: comment.userDisliked ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-primary)',
            border: comment.userDisliked ? '1px solid #ef4444' : '1px solid var(--border-color)',
            color: comment.userDisliked ? '#f87171' : 'var(--text-secondary)',
            padding: '4px 11px',
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s',
          }}
        >
          <ThumbsDown size={12} style={{ fill: comment.userDisliked ? '#ef4444' : 'none' }} />
          <span>{comment.dislikeCount || 0}</span>
        </button>

        {/* Reply Button */}
        <button
          onClick={() => setReplyToId(isReplying ? null : comment.id)}
          style={{
            background: isReplying ? 'var(--accent-glow)' : 'var(--bg-primary)',
            border: isReplying ? '1px solid var(--accent)' : '1px solid var(--border-color)',
            color: isReplying ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '4px 13px',
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s',
          }}
        >
          <CornerDownRight size={12} />
          <span>Trả lời</span>
        </button>
      </div>

      {/* Floating Reply Form */}
      {isReplying && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-color)' }}>
          <textarea
            rows={2}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`Trả lời ${comment.userName}...`}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setReplyToId(null)}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              onClick={() => onPostReply(comment.id)}
              disabled={!replyText.trim()}
              className="btn-primary"
              style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={12} />
              <span>Gửi phản hồi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
