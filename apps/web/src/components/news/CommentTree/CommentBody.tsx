import React, { useState, memo } from 'react';
import { Heart, HeartOff, CornerDownRight, Send, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
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
            <span style={{ fontSize: 10, fontWeight: 800, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(244, 63, 94, 0.25))', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.45)', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}>
              <ShieldCheck size={11} /> ADMIN
            </span>
          )}
          {comment.userRole === 'staff' && (
            <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.4)', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3, boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15)' }}>
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
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: 'var(--text-secondary)',
              padding: '3px 10px',
              borderRadius: 14,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            <span>{isCollapsed ? `${node.replyCount} phản hồi` : 'Thu gọn'}</span>
          </button>
        )}
      </div>

      {/* Comment Content Text */}
      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55, margin: '5px 0 9px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
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

      {/* Action Row: Heart Like, HeartOff Dislike, Reply */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Like Button (Heart) */}
        <button
          onClick={() => onReaction(comment.id, 'like')}
          style={{
            background: comment.userLiked
              ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.28) 0%, rgba(225, 29, 72, 0.38) 100%)'
              : 'rgba(244, 63, 94, 0.08)',
            border: comment.userLiked
              ? '1px solid rgba(244, 63, 94, 0.65)'
              : '1px solid rgba(244, 63, 94, 0.2)',
            color: comment.userLiked ? '#f43f5e' : '#fb7185',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: comment.userLiked ? '0 4px 14px rgba(244, 63, 94, 0.35)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Heart size={13} fill={comment.userLiked ? '#f43f5e' : 'none'} style={{ color: comment.userLiked ? '#f43f5e' : '#fb7185' }} />
          <span>{comment.likeCount || 0}</span>
        </button>

        {/* Dislike Button (HeartOff) */}
        <button
          onClick={() => onReaction(comment.id, 'dislike')}
          style={{
            background: comment.userDisliked
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(147, 51, 234, 0.38) 100%)'
              : 'rgba(168, 85, 247, 0.08)',
            border: comment.userDisliked
              ? '1px solid rgba(168, 85, 247, 0.65)'
              : '1px solid rgba(168, 85, 247, 0.2)',
            color: comment.userDisliked ? '#c084fc' : '#a855f7',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: comment.userDisliked ? '0 4px 14px rgba(168, 85, 247, 0.35)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <HeartOff size={13} style={{ color: comment.userDisliked ? '#c084fc' : '#a855f7' }} />
          <span>{comment.dislikeCount || 0}</span>
        </button>

        {/* Reply Button */}
        <button
          onClick={() => setReplyToId(isReplying ? null : comment.id)}
          style={{
            background: isReplying
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.35) 100%)'
              : 'rgba(99, 102, 241, 0.08)',
            border: isReplying
              ? '1px solid rgba(99, 102, 241, 0.65)'
              : '1px solid rgba(99, 102, 241, 0.22)',
            color: isReplying ? '#a5b4fc' : '#818cf8',
            padding: '4px 13px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: isReplying ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <CornerDownRight size={13} />
          <span>Trả lời</span>
        </button>
      </div>

      {/* Floating Reply Form */}
      {isReplying && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(255, 255, 255, 0.15)' }}>
          <textarea
            rows={2}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`Trả lời ${comment.userName}...`}
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 12, padding: 12, color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setReplyToId(null)}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              onClick={() => onPostReply(comment.id)}
              disabled={!replyText.trim()}
              className="btn-primary"
              style={{ padding: '6px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
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
