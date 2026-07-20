'use client';

import { Scissors, Terminal } from 'lucide-react';

export default function AutomationView() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div className="activity-empty" style={{ textAlign: 'left', padding: 32 }}>
        <h3 style={{ marginBottom: 12 }}><Scissors size={18} style={{verticalAlign:'middle',marginRight:6}} /> Tự động cắt video</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Tính năng này hoạt động trên Desktop App. Mở ứng dụng EIGU Desktop để kéo thả video và bắt đầu xử lý.
        </p>
        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <Terminal size={16} style={{verticalAlign:'middle',marginRight:6,color:'var(--accent)'}} />
          <code style={{ color: 'var(--accent)', fontSize: 13 }}>npx nx serve desktop</code>
        </div>
      </div>
    </div>
  );
}
