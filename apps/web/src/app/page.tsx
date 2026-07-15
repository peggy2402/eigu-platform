'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Settings2, ShieldCheck, Activity, Video, Smartphone, Globe } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: 'source',
    type: 'input',
    position: { x: 50, y: 150 },
    data: { label: '▶ Source Video (YouTube)' },
    style: { borderColor: '#6366f1' }
  },
  {
    id: 'ffmpeg',
    position: { x: 320, y: 150 },
    data: { label: '⚙ FFmpeg Decimation\n& Metadata Stripping' },
    style: { borderColor: '#10b981' }
  },
  {
    id: 'browser',
    position: { x: 620, y: 150 },
    data: { label: '🛡 Anti-detect Browser\n(SOCKS5 + WebRTC Block)' },
    style: { borderColor: '#ef4444' }
  },
  {
    id: 'tiktok',
    type: 'output',
    position: { x: 920, y: 150 },
    data: { label: '📱 TikTok Europe' },
    style: { borderColor: '#8b92a5' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'source', target: 'ffmpeg', animated: false },
  { id: 'e2-3', source: 'ffmpeg', target: 'browser', animated: false },
  { id: 'e3-4', source: 'browser', target: 'tiktok', animated: false },
];

export default function EiguDashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<string>('System Idle');
  const [progress, setProgress] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    // Kết nối đến API (NestJS Gateway) - Đảm bảo NestJS đang chạy ở cổng 3001
    const newSocket = io('http://localhost:3001/workflow');
    
    newSocket.on('connect', () => {
      console.log('Connected to Workflow Gateway');
    });

    newSocket.on('workflowUpdated', (data: any) => {
      setStatus(data.message || data.status);
      setProgress(data.progress);
      
      // Update hiệu ứng Animation trên luồng kết nối Node
      setEdges((eds) => eds.map(edge => {
        if (data.progress > 0 && data.progress < 40 && edge.id === 'e1-2') return { ...edge, animated: true };
        if (data.progress >= 40 && data.progress < 90 && edge.id === 'e2-3') return { ...edge, animated: true };
        if (data.progress >= 90 && edge.id === 'e3-4') return { ...edge, animated: true };
        return { ...edge, animated: false };
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const startWorkflow = () => {
    setIsRunning(true);
    setStatus('Initializing Engine...');
    setProgress(5);
    setEdges((eds) => eds.map(e => e.id === 'e1-2' ? { ...e, animated: true } : e));
    
    // Bản DEMO UI (Trong thực tế, bạn sẽ gửi REST POST request đến /api/workflow để kích hoạt thật)
    setTimeout(() => {
      setProgress(40);
      setStatus('FFmpeg: Stripping Metadata & Decimating Frames...');
      setEdges((eds) => eds.map(e => e.id === 'e2-3' ? { ...e, animated: true } : { ...e, animated: false }));
    }, 2000);
    
    setTimeout(() => {
      setProgress(85);
      setStatus('Anti-detect: Executing Human Bézier Mouse Curves...');
      setEdges((eds) => eds.map(e => e.id === 'e3-4' ? { ...e, animated: true } : { ...e, animated: false }));
    }, 5500);
    
    setTimeout(() => {
      setProgress(100);
      setStatus('Upload Completed Successfully!');
      setIsRunning(false);
      setEdges((eds) => eds.map(e => ({ ...e, animated: false })));
    }, 9000);
  };

  return (
    <div className="eigu-dashboard">
      <div className="eigu-sidebar">
        <div>
          <h1 className="eigu-title">EIGU Platform</h1>
          <div className="eigu-subtitle">MMO Automation Engine v1.0</div>
        </div>
        
        <div className="eigu-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Settings2 size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Configuration Profile</h3>
          </div>
          
          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14}/> Node IP:</span> 
              <span style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>SOCKS5 (EU)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14}/> WebRTC:</span> 
              <span style={{ color: '#10b981', fontWeight: 600 }}>Blocked UDP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Video size={14}/> Fingerprint:</span> 
              <span style={{ color: '#ef4444' }}>FFmpeg Stripped</span>
            </div>
          </div>
          
          <button 
            className="eigu-btn" 
            onClick={startWorkflow}
            disabled={isRunning}
          >
            {isRunning ? <Activity size={18} className="spin" /> : <Play size={18} fill="currentColor" />}
            {isRunning ? 'Processing Pipeline...' : 'Deploy Workflow'}
          </button>
        </div>

        <div className="eigu-card" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} color={progress === 100 ? '#10b981' : '#6366f1'} />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Live Telemetry</h3>
          </div>
          
          <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500, minHeight: '36px' }}>
            {status}
          </div>
          
          <div className="eigu-progress-container">
            <div 
              className="eigu-progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
            {progress}% Completed
          </div>
        </div>
      </div>
      
      <div className="eigu-flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.1)" gap={24} size={2} />
          <Controls style={{ backgroundColor: 'var(--bg-color-secondary)', border: '1px solid var(--glass-border)' }} />
        </ReactFlow>
      </div>
    </div>
  );
}
