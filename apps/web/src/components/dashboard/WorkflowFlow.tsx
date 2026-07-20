'use client';

import { useEffect, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { io, Socket } from 'socket.io-client';

const initialNodes = [
  { id: '1', type: 'workflow', position: { x: 50, y: 100 }, data: { label: 'Tap Video Nguon', status: 'idle' } },
  { id: '2', type: 'workflow', position: { x: 280, y: 100 }, data: { label: 'Xu ly FFmpeg', status: 'idle' } },
  { id: '3', type: 'workflow', position: { x: 510, y: 100 }, data: { label: 'Anti-detect Browser', status: 'idle' } },
  { id: '4', type: 'workflow', position: { x: 740, y: 100 }, data: { label: 'TikTok Server', status: 'idle' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#353849', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#353849' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#353849', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#353849' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#353849', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#353849' } },
];

export default function WorkflowFlow({ onWsStatus }: { onWsStatus: (s: string) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io('http://localhost:3001/workflow', { transports: ['websocket', 'polling'] });
    socketRef.current = s;
    s.on('connect', () => onWsStatus('connected'));
    s.on('disconnect', () => onWsStatus('disconnected'));
    s.on('connect_error', () => onWsStatus('disconnected'));
    s.on('workflowUpdated', (data: { nodeId: string; status: string }) => {
      setNodes(nds => nds.map(n => n.id === data.nodeId ? { ...n, data: { ...n.data, status: data.status } } : n));
    });
    return () => { s.disconnect(); };
  }, [setNodes, onWsStatus]);

  return (
    <div style={{ height: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#1a1c25" gap={20} />
        <Controls />
        <MiniMap style={{ background: '#111218' }} nodeColor="#2a2d3a" maskColor="rgba(0,0,0,0.6)" />
      </ReactFlow>
    </div>
  );
}
