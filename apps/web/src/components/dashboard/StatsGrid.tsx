'use client';

import { Video, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function StatsGrid({ wsStatus }: { wsStatus: string }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon"><Video size={28} /></div>
        <div className="stat-value">0</div>
        <div className="stat-label">Video đã xử lý</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><CheckCircle2 size={28} /></div>
        <div className="stat-value">0</div>
        <div className="stat-label">Đã upload</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><Clock size={28} /></div>
        <div className="stat-value">0</div>
        <div className="stat-label">Đang chờ</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><Zap size={28} /></div>
        <div className="stat-value">
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: wsStatus === 'connected' ? '#10b981' : '#ef4444', marginRight: 8 }}></span>
          1
        </div>
        <div className="stat-label">Desktop Worker</div>
      </div>
    </div>
  );
}
