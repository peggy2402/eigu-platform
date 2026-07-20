'use client';

export default function ActivitySection({ wsStatus }: { wsStatus: string }) {
  const statusText: Record<string, string> = {
    connected: 'Da ket noi',
    connecting: 'Dang ket noi...',
    disconnected: 'Mat ket noi',
  };
  const dotColor: Record<string, string> = {
    connected: '#10b981',
    connecting: '#f59e0b',
    disconnected: '#ef4444',
  };
  return (
    <div className="activity-section">
      <h3>Trạng thái kết nối</h3>
      <div className="activity-empty">
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
          background: dotColor[wsStatus] || '#ef4444', marginRight: 8 }}></span>
        WebSocket: {statusText[wsStatus] || wsStatus}
      </div>
    </div>
  );
}
