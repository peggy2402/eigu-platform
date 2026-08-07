import { memo } from 'react';

export interface TreeConnectorProps {
  ancestorLines?: boolean[];
  isLastSibling?: boolean;
  avatarSize?: number;
}

// Completely hidden connector lines per user request
export const TreeConnector = memo(function TreeConnector() {
  return null;
});
