import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TreeGutter } from './TreeGutter';
import { CommentAvatar } from './CommentAvatar';
import { CommentBody } from './CommentBody';
import type { FlatCommentNode, SharedCommentHandlers } from './TreeTypes';

export interface CommentRowProps extends SharedCommentHandlers {
  node: FlatCommentNode;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
}

export const CommentRow = memo(function CommentRow({
  node,
  isCollapsed,
  onToggleCollapse,
  ...handlers
}: CommentRowProps) {
  const isRoot = node.depth === 0;
  const avatarSize = isRoot ? 36 : 28;

  return (
    <div
      className="comment-thread-item"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}
    >
      {/* 1. Indent Spacer Gutter */}
      <TreeGutter depth={node.depth} />

      {/* 2. Content Container with Avatar & Body */}
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          flex: 1,
          minWidth: 0,
        }}
      >
        <CommentAvatar
          commentId={node.comment.id}
          userName={node.comment.userName}
          userRole={node.comment.userRole}
          avatarSize={avatarSize}
          isRoot={isRoot}
        />

        <CommentBody
          node={node}
          isRoot={isRoot}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          {...handlers}
        />
      </motion.div>
    </div>
  );
});
