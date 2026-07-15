import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, PlayCircle, Loader2, XCircle, Settings } from 'lucide-react';

const WorkflowNode = ({ data, isConnectable }: any) => {
  const { label, status, progress, icon } = data;

  let borderColor = '#334155';
  let shadow = 'none';
  let StatusIcon = Settings;
  let iconColor = '#94a3b8';

  if (status === 'processing') {
    borderColor = '#3b82f6';
    shadow = '0 0 15px rgba(59, 130, 246, 0.4)';
    StatusIcon = Loader2;
    iconColor = '#60a5fa';
  } else if (status === 'completed') {
    borderColor = '#10b981';
    shadow = '0 0 15px rgba(16, 185, 129, 0.4)';
    StatusIcon = CheckCircle2;
    iconColor = '#34d399';
  } else if (status === 'failed') {
    borderColor = '#ef4444';
    shadow = '0 0 15px rgba(239, 68, 68, 0.4)';
    StatusIcon = XCircle;
    iconColor = '#f87171';
  } else if (status === 'waiting') {
    StatusIcon = PlayCircle;
  }

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#0f172a',
        border: `2px solid ${borderColor}`,
        boxShadow: shadow,
        color: 'white',
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#64748b' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {status === 'processing' ? (
          <StatusIcon className="animate-spin" size={24} color={iconColor} />
        ) : (
          <StatusIcon size={24} color={iconColor} />
        )}
        <div style={{ fontWeight: '600', fontSize: '15px' }}>{label}</div>
      </div>

      {(status === 'processing' || progress > 0) && (
        <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: borderColor,
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      )}

      {status === 'processing' && (
        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
          {progress.toFixed(0)}%
        </div>
      )}

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#64748b' }} />
    </div>
  );
};

export default memo(WorkflowNode);
