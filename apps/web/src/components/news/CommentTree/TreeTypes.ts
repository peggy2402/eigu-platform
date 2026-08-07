import type { NewsCommentDto } from '@eigu-platform/shared';

// Column indent width per depth level
export const COLUMN_WIDTH = 36;
export const LINE_WIDTH = 2;
export const LINE_COLOR = 'rgba(255, 255, 255, 0.25)';

export interface FlatCommentNode {
  comment: NewsCommentDto;
  depth: number;
  isLastSibling: boolean;
  ancestorHasNextSibling: boolean[];
  hasReplies: boolean;
  replyCount: number;
}

export interface SharedCommentHandlers {
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onPostReply: (parentId: string) => void;
  onReaction: (id: string, type: 'like' | 'dislike') => void;
  language: string;
  user: any;
}
