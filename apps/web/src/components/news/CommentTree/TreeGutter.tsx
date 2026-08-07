import React, { memo } from 'react';
import { COLUMN_WIDTH } from './TreeTypes';

export interface TreeGutterProps {
  depth: number;
}

export const TreeGutter = memo(function TreeGutter({ depth }: TreeGutterProps) {
  if (depth === 0) return null;

  return (
    <div
      style={{
        width: depth * COLUMN_WIDTH,
        flexShrink: 0,
        alignSelf: 'stretch',
        pointerEvents: 'none',
      }}
    />
  );
});