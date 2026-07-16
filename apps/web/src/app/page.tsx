'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { io } from 'socket.io-client';
import WorkflowNode from '../components/WorkflowNode';
import { Play, SquareActivity, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 250, y: 50 },
    data: { label: 'Tệp Video Nguồn', status: 'waiting', progress: 0 },
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 250, y: 200 },
    data: { label: 'Xử lý FFmpeg (MD5/Metadata)', status: 'waiting', progress: 0 },
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 250, y: 350 },
    data: { label: 'Puppeteer Anti-detect', status: 'waiting', progress: 0 },
  },
  {
    id: '4',
    type: 'workflowNode',
    position: { x: 250, y: 500 },
    data: { label: 'TikTok Server', status: 'waiting', progress: 0 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
];

export default function Dashboard() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [systemStatus, setSystemStatus] = useState('Idle');
  const [isConnected, setIsConnected] = useState(false);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  useEffect(() => {
    // Kết nối WebSocket tới NestJS API
    const socket = io('http://localhost:3001/workflow', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('workflowUpdated', (data: any) => {
      setSystemStatus(data.message || data.status);
      
      setNodes((nds) =>
        nds.map((node) => {
          // Xử lý hiệu ứng FFmpeg
          if (node.id === '2' && data.status === 'processing' && data.progress < 100) {
            return { ...node, data: { ...node.data, status: 'processing', progress: data.progress } };
          }
          if (node.id === '2' && data.status === 'processing' && data.progress === 100) {
            return { ...node, data: { ...node.data, status: 'completed', progress: 100 } };
          }
          
          // Xử lý hiệu ứng Upload
          if (node.id === '3' && data.status === 'uploading') {
            return { ...node, data: { ...node.data, status: 'processing', progress: data.progress } };
          }
          if (node.id === '3' && data.status === 'completed') {
            return { ...node, data: { ...node.data, status: 'completed', progress: 100 } };
          }

          if (node.id === '4' && data.status === 'completed') {
            return { ...node, data: { ...node.data, status: 'completed', progress: 100 } };
          }

          if (node.id === '1' && data.status === 'processing') {
            return { ...node, data: { ...node.data, status: 'completed', progress: 100 } };
          }

          return node;
        })
      );

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === 'e1-2' && data.status === 'processing') {
            return { ...edge, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } };
          }
          if (edge.id === 'e2-3' && data.status === 'uploading') {
            return { ...edge, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } };
          }
          if (edge.id === 'e3-4' && data.status === 'completed') {
            return { ...edge, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } };
          }
          return edge;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRunMock = async () => {
    // Có thể gọi API POST để trigger Desktop Worker ở đây
    alert('Vui lòng chạy lệnh: npx nx serve desktop để Worker nhận lệnh!');
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#020617', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ padding: '8px', backgroundColor: '#3b82f6', borderRadius: '8px' }}>
            <Server size={24} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>EIGU Platform</h1>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>SYSTEM STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#ef4444', boxShadow: isConnected ? '0 0 10px #10b981' : '0 0 10px #ef4444' }} />
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
              {isConnected ? 'API Gateway Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>LATEST ACTIVITY</div>
          <motion.div 
            key={systemStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#60a5fa', fontSize: '14px', lineHeight: '1.5', padding: '12px', backgroundColor: '#1e3a8a20', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}
          >
            {systemStatus}
          </motion.div>
        </div>

        <div
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            width: '100%', 
            padding: '14px', 
            backgroundColor: isConnected ? '#1e293b' : '#0f172a', 
            color: isConnected ? '#34d399' : '#64748b', 
            border: isConnected ? '1px dashed #34d399' : '1px dashed #334155', 
            borderRadius: '8px', 
            fontSize: '14px', 
            fontWeight: '500',
            textAlign: 'center'
          }}
        >
          {isConnected ? 'Sẵn sàng nhận lệnh từ Desktop' : 'Đang chờ API kết nối...'}
        </div>
      </div>

      {/* Main Flow Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={16} size={1} />
          <Controls style={{ backgroundColor: '#1e293b', fill: 'white' }} />
        </ReactFlow>
      </div>
    </div>
  );
}
