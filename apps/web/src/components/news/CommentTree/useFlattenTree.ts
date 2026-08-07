import { useMemo } from 'react';
import type { NewsCommentDto } from '@eigu-platform/shared';
import type { FlatCommentNode } from './TreeTypes';

/**
 * Pure DFS Tree Flattening Algorithm (The VSCode / Reddit Enterprise Pattern)
 * Converts a nested comment tree into a 1D Flat Array metadata list.
 */
export function flattenCommentTree(
  comments: NewsCommentDto[],
  collapsedIds: Set<string>,
  depth = 0,
  ancestorHasNextSibling: boolean[] = []
): FlatCommentNode[] {
  const result: FlatCommentNode[] = [];

  comments.forEach((c, idx) => {
    const isLastSibling = idx === comments.length - 1;
    const replies = c.replies || [];
    const hasReplies = replies.length > 0;
    const isCollapsed = collapsedIds.has(c.id);

    result.push({
      comment: c,
      depth,
      isLastSibling,
      ancestorHasNextSibling: [...ancestorHasNextSibling],
      hasReplies,
      replyCount: replies.length,
    });

    // If node has replies and is not collapsed, flatten its children
    if (hasReplies && !isCollapsed) {
      // Ancestor stack for children: append whether this level has a next sibling (!isLastSibling)
      const childAncestors = [...ancestorHasNextSibling, !isLastSibling];
      const childNodes = flattenCommentTree(replies, collapsedIds, depth + 1, childAncestors);
      result.push(...childNodes);
    }
  });

  return result;
}

export function useFlattenTree(comments: NewsCommentDto[], collapsedIds: Set<string>) {
  return useMemo(() => {
    return flattenCommentTree(comments, collapsedIds);
  }, [comments, collapsedIds]);
}
