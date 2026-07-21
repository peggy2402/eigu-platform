function startWorkflow() {
  if (appState.mode !== 'local' && appState.mode !== 'youtube') return;
  const payloadType = appState.mode;
  const data = payloadType === 'local' ? appState.file.path : appState.youtubeLink;
  appState.mode = 'processing';
  appState.progress = 0;
  appState.status = 'Dang khoi tao...';
  appState.startTime = Date.now();
  renderAutomation();
  ipcRenderer.send('start-workflow', {
    type: payloadType, data, outputPath: appState.outputPath,
    options: { ...appState.options }
  });
}

function cancelWorkflow() {
  if (appState.mode !== 'processing') return;
  appState.status = 'Dang huy...';
  renderAutomation();
  ipcRenderer.send('cancel-workflow');
}

ipcRenderer.on('workflow-progress', (e, p) => { appState.progress = p; renderAutomation(); });
ipcRenderer.on('workflow-status', (e, payload) => {
  // Hỗ trợ tương thích ngược nếu payload vẫn là string (trong trường hợp backend cũ chưa update)
  const isObj = typeof payload === 'object' && payload !== null;
  const state = isObj ? payload.state : 'processing';
  const msg = isObj ? payload.message : payload;
  
  appState.status = msg;
  
  if (state === 'success') {
    appState.mode = 'idle'; appState.progress = 100;
    appState.status = msg; appState.file = null; appState.youtubeLink = '';
    appState.startTime = null;
    document.getElementById('youtube-input').value = '';
    document.getElementById('file-input').value = '';
    showToast('Hoàn tất tiến trình', 'Video đã được xử lý thành công.', 'success');
  } else if (state === 'error' || state === 'cancelled') {
    appState.progress = 0; appState.startTime = null;
    if (state === 'error') showToast('Tiến trình lỗi', msg, 'error');
    if (state === 'cancelled') showToast('Đã hủy', msg, 'warning');
    renderAutomation();
    
    setTimeout(() => {
      appState.mode = appState.file ? 'local' : (appState.youtubeLink ? 'youtube' : 'idle');
      renderAutomation();
    }, 500);
    return;
  }
  renderAutomation();
});
ipcRenderer.on('log', (e, msg) => addLog(msg));
