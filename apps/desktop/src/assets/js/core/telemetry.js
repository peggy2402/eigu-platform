/**
 * EIGU Platform - Bug Tracking, Error Telemetry & Performance Monitoring
 */
(function() {
  const errorLogs = [];
  const actionTrail = [];
  const MAX_LOGS = 100;
  const MAX_TRAIL = 20;

  // SVG Icons (inline, no emoji per AI_CONTEXT.md)
  const SVG_ALERT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  const SVG_SEARCH = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const SVG_CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const SVG_COPY = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const SVG_BUG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3 3 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>';

  // Tracking user click actions for Session Replay trail
  window.addEventListener('click', function(e) {
    const target = e.target;
    if (!target) return;
    const tag = target.tagName;
    const id = target.id ? `#${target.id}` : '';
    const text = (target.innerText || target.value || '').slice(0, 30).trim();
    actionTrail.push({
      time: new Date().toLocaleTimeString(),
      action: `Click <${tag}${id}> "${text}"`
    });
    if (actionTrail.length > MAX_TRAIL) actionTrail.shift();
  }, true);

  function captureError(err, type = 'JS_ERROR', extra = {}) {
    const timestamp = new Date().toISOString();
    const errorId = `TELE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const message = err.message || String(err);
    const stack = err.stack || extra.stack || 'No Stack Trace Available';
    const targetUrl = extra.url || window.location.href;

    const errorItem = {
      errorId,
      type,
      message,
      stack,
      targetUrl,
      timestamp,
      sessionTrail: [...actionTrail],
      extra
    };

    errorLogs.unshift(errorItem);
    if (errorLogs.length > MAX_LOGS) errorLogs.pop();

    console.error(`[EIGU Telemetry ${errorId}]`, message, stack);
    renderTelemetryUI();
    return errorItem;
  }

  // Global Unhandled Exception Handlers
  window.addEventListener('error', function(e) {
    captureError(e.error || e.message, 'UNHANDLED_ERROR', { filename: e.filename, lineno: e.lineno, colno: e.colno });
  });

  window.addEventListener('unhandledrejection', function(e) {
    captureError(e.reason || 'Unhandled Promise Rejection', 'PROMISE_REJECTION');
  });

  function copyBugToClipboard(log, btn) {
    const text = [
      `[${log.type}] ${log.errorId}`,
      `URL: ${log.targetUrl}`,
      `Message: ${log.message}`,
      `Time: ${log.timestamp}`,
      `Stack Trace:`,
      log.stack,
      `Session Trail:`,
      log.sessionTrail.map(t => `  ${t.time} - ${t.action}`).join('\n')
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = SVG_CHECK + ' Đã copy';
      btn.style.color = '#22c55e';
      setTimeout(() => { btn.innerHTML = original; btn.style.color = ''; }, 1500);
    }).catch(() => {});
  }

  function renderTelemetryUI() {
    const container = document.getElementById('telemetry-logs-list');
    if (!container) return;

    if (errorLogs.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">' + SVG_CHECK + ' Chưa ghi nhận lỗi hệ thống nào.</div>';
      return;
    }

    container.innerHTML = errorLogs.map((log, idx) => `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 10px; font-family: monospace; font-size: 12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <span style="font-weight: bold; color: #ef4444; display:inline-flex; align-items:center; gap:5px;">${SVG_ALERT} [${escapeHtml(log.type)}] ${escapeHtml(log.errorId)}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <button type="button" onclick="window.EIGU_TELEMETRY.copyBug(${idx}, this)" title="Sao chép thông tin Bug" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:2px 6px; display:inline-flex; align-items:center; gap:3px; border-radius:4px; transition:color 0.2s;" onmouseover="this.style.color='#38bdf8'" onmouseout="this.style.color='var(--text-muted)'">${SVG_COPY} Copy</button>
            <span style="color: var(--text-muted); font-weight: normal;">${new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
        <div style="color: var(--text-primary); margin-bottom: 6px; font-weight: 600;">
          URL: <span style="color: var(--accent);">${escapeHtml(log.targetUrl)}</span>
        </div>
        <div style="color: #f87171; margin-bottom: 8px; white-space: pre-wrap; word-break: break-all;">
          ${escapeHtml(log.message)}
        </div>
        <details>
          <summary style="cursor: pointer; color: var(--text-secondary); margin-bottom: 4px; display:inline-flex; align-items:center; gap:4px;">${SVG_SEARCH} Xem Stack Trace & Session Replay Trail</summary>
          <pre style="background: var(--bg-primary); padding: 8px; border-radius: 4px; overflow-x: auto; color: #94a3b8; font-size: 11px; margin-top: 6px;">${escapeHtml(log.stack)}</pre>
          <div style="margin-top: 6px; color: var(--text-muted); font-size: 11px;">
            <strong>Session Action Trail:</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0;">
              ${log.sessionTrail.map(t => `<li>${t.time} - ${escapeHtml(t.action)}</li>`).join('')}
            </ul>
          </div>
        </details>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.EIGU_TELEMETRY = {
    captureError,
    getErrorLogs: () => [...errorLogs],
    clearLogs: () => { errorLogs.length = 0; renderTelemetryUI(); },
    renderTelemetryUI,
    copyBug: (idx, btn) => { if (errorLogs[idx]) copyBugToClipboard(errorLogs[idx], btn); }
  };
})();
