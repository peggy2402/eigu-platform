import React, { useState, useCallback, useLayoutEffect, useEffect, useRef, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { NewsCommentDto } from '@eigu-platform/shared';
import { useFlattenTree } from './useFlattenTree';
import { CommentRow } from './CommentRow';
import { LINE_COLOR, LINE_WIDTH } from './TreeTypes';
import type { SharedCommentHandlers } from './TreeTypes';

export interface CommentTreeProps extends SharedCommentHandlers {
  comments: NewsCommentDto[];
}

export const CommentTree = memo(function CommentTree({
  comments,
  ...handlers
}: CommentTreeProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [svgPaths, setSvgPaths] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleCollapse = useCallback((commentId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  // 1. Flatten the recursive comment tree into a 1D DFS Flat Array
  const flatNodes = useFlattenTree(comments, collapsedIds);

  // 2. Measure REAL DOM Avatar Positions & Compute SVG Paths
  const recomputePaths = useCallback(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;
    const containerRect = containerEl.getBoundingClientRect();

    const avatarEls = containerEl.querySelectorAll<HTMLDivElement>('[data-avatar-id]');
    const avatarMap = new Map<string, HTMLDivElement>();
    avatarEls.forEach(el => {
      const id = el.getAttribute('data-avatar-id');
      if (id) avatarMap.set(id, el);
    });

    const paths: string[] = [];

    flatNodes.forEach(node => {
      const parentId = node.comment.parentId;
      if (!parentId) return;

      const parentEl = avatarMap.get(parentId);
      const childEl = avatarMap.get(node.comment.id);

      if (parentEl && childEl) {
        const pRect = parentEl.getBoundingClientRect();
        const cRect = childEl.getBoundingClientRect();

        const x1 = pRect.left - containerRect.left + pRect.width / 2;
        const y1 = pRect.top - containerRect.top + pRect.height / 2;
        const x2 = cRect.left - containerRect.left;
        const y2 = cRect.top - containerRect.top + cRect.height / 2;

        if (x2 > x1 && y2 > y1) {
          const radius = Math.min(12, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 2);
          const d = `M ${x1},${y1} V ${y2 - radius} Q ${x1},${y2} ${x1 + radius},${y2} H ${x2}`;
          paths.push(d);
        }
      }
    });

    setSvgPaths(paths);
  }, [flatNodes]);

  // Recompute paths on layout / node changes
  useLayoutEffect(() => {
    recomputePaths();
    // Also schedule microtask & frame updates for animations
    const frameId = requestAnimationFrame(recomputePaths);
    return () => cancelAnimationFrame(frameId);
  }, [flatNodes, handlers.replyToId, handlers.replyText, recomputePaths]);

  // Attach ResizeObserver to container to catch all dynamic height shifts (text wrap, font load, etc.)
  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    const observer = new ResizeObserver(() => {
      recomputePaths();
    });
    observer.observe(containerEl);

    // Also observe all children rows for height changes
    const rowEls = containerEl.querySelectorAll('.comment-thread-item');
    rowEls.forEach(row => observer.observe(row));

    return () => observer.disconnect();
  }, [recomputePaths]);

  // Recompute on window resize
  useEffect(() => {
    window.addEventListener('resize', recomputePaths);
    return () => window.removeEventListener('resize', recomputePaths);
  }, [recomputePaths]);

  return (
    <div
      ref={containerRef}
      className="comment-tree-container"
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      {/* Single Measured SVG Overlay Layer */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {svgPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={LINE_COLOR}
            strokeWidth={LINE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Flat List of Comment Rows */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence initial={false}>
          {flatNodes.map((node) => (
            <CommentRow
              key={node.comment.id}
              node={node}
              isCollapsed={collapsedIds.has(node.comment.id)}
              onToggleCollapse={handleToggleCollapse}
              {...handlers}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CommentTree;
