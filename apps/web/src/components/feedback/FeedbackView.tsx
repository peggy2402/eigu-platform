'use client';

export default function FeedbackView() {
  return (
    <div className="settings-container">
      <div className="settings-card" style={{ marginBottom: 16, border: '1px solid var(--accent)', background: 'var(--accent-glow)' }}>
        <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>Góp ý / Báo lỗi</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          Mọi ý kiến đóng góp hoặc báo lỗi của bạn sẽ giúp chúng tôi phát triển EIGU tốt hơn. (Giới hạn: 3 lần/ngày)
        </p>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            message: { value: string };
            file: { files: FileList };
            submitBtn: { disabled: boolean, innerText: string };
          };
          const msg = target.message.value.trim();
          if (!msg) return alert('Vui lòng nhập nội dung góp ý!');
          
          target.submitBtn.disabled = true;
          const oldText = target.submitBtn.innerText;
          target.submitBtn.innerText = 'Đang gửi...';

          try {
            const fd = new FormData();
            fd.append('message', msg);
            if (target.file.files[0]) {
              fd.append('image', target.file.files[0]);
            }
            
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/feedback/report', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: fd
            });
            const data = await res.json();
            
            if (!res.ok) {
              throw new Error(data.message || 'Lỗi gửi báo cáo');
            }
            
            (target as any).message.value = '';
            if ((target as any).file) (target as any).file.value = '';
          } catch (err: any) {
            alert(err.message);
          } finally {
            target.submitBtn.disabled = false;
            target.submitBtn.innerText = oldText;
          }
        }}>
          <textarea 
            name="message"
            placeholder="Mô tả lỗi hoặc góp ý của bạn..."
            rows={4}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 12, resize: 'vertical' }}
          />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Đính kèm hình ảnh (nếu có):</label>
            <label htmlFor="file-upload" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px 16px', border: '2px dashed var(--border-color)', borderRadius: 8,
              cursor: 'pointer', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}>
              <span style={{ marginBottom: 8 }}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
              <span style={{ fontSize: 13 }}>Nhấp để chọn ảnh hoặc kéo thả vào đây</span>
              <span id="file-name-display" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8 }}></span>
            </label>
            <input id="file-upload" type="file" name="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files?.[0];
              const display = document.getElementById('file-name-display');
              if (display) display.innerText = file ? file.name : '';
            }} />
          </div>
          <button name="submitBtn" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
            Gửi Báo Cáo
          </button>
        </form>
      </div>
    </div>
  );
}
