import React, { memo } from 'react';

export interface CommentAvatarProps {
  commentId: string;
  userName: string;
  userRole?: string | null;
  avatarSize: number;
  isRoot: boolean;
}

export const CommentAvatar = memo(function CommentAvatar({
  commentId,
  userName,
  userRole,
  avatarSize,
  isRoot,
}: CommentAvatarProps) {
  const avatarInitial = userName.charAt(0).toUpperCase();

  return (
    <div
      data-avatar-id={commentId}
      style={{
        width: avatarSize,
        height: avatarSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          background: userRole === 'admin'
            ? 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'
            : userRole === 'staff'
            ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: '#fff',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isRoot ? 14 : 11.5,
          border: '1.5px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 3,
        }}
      >
        {avatarInitial}
      </div>
    </div>
  );
});
