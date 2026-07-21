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
ipcRenderer.on('workflow-status', (e, msg) => {
  appState.status = msg;
  if (msg.includes('Hoan tat toan bo quy trinh!')) {
    appState.mode = 'idle'; appState.progress = 100;
    appState.status = 'Hoan tat!'; appState.file = null; appState.youtubeLink = '';
    appState.startTime = null;
    showToast('Hoàn tất tiến trình', 'Video đã được xử lý thành công.', 'success');
  } else if (msg.includes('Loi') || msg.includes('Da huy')) {
    appState.progress = 0; appState.startTime = null;
    if (msg.includes('Loi')) showToast('Tiến trình lỗi', 'Đã xảy ra lỗi trong quá trình xử lý.', 'error');
    if (msg.includes('Da huy')) showToast('Đã hủy', 'Tiến trình đã bị hủy bởi người dùng.', 'warning');
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
