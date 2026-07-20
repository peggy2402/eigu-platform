const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const dropContent = document.getElementById('drop-content');
const fileInfoEl = document.getElementById('file-info');
const fileNameEl = document.getElementById('file-name');
const youtubeInput = document.getElementById('youtube-input');
const startBtn = document.getElementById('start-btn');
const cancelBtn = document.getElementById('cancel-btn');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const statusText = document.getElementById('status-text');
const logConsole = document.getElementById('log-console');
const outputPathDisplay = document.getElementById('output-path');

const splitModeSelect = document.getElementById('split-mode');
const customTimes = document.getElementById('custom-times');
const timeStartInput = document.getElementById('time-start');
const timeEndInput = document.getElementById('time-end');
const aspectRatioSelect = document.getElementById('aspect-ratio');
const autoPartInput = document.getElementById('auto-part');

function getFormattedTime() {
  const n = new Date();
  return n.toLocaleTimeString('en-GB',{hour12:false})+'.'+String(n.getMilliseconds()).padStart(3,'0');
}

function renderAutomation() {
  const isProcessing = appState.mode === 'processing';
  const isLocal = appState.mode === 'local';
  const isYoutube = appState.mode === 'youtube';

  startBtn.classList.toggle('hidden', isProcessing);
  cancelBtn.classList.toggle('hidden', !isProcessing);
  progressSection.classList.toggle('hidden', !isProcessing);
  startBtn.disabled = !(isLocal || isYoutube) || isProcessing;

  customTimes.classList.toggle('hidden', appState.options.splitMode !== 'custom');
  youtubeInput.disabled = isProcessing || isLocal;
  dropZone.classList.toggle('disabled', isProcessing || isYoutube);

  if (appState.file) {
    dropContent.style.display = 'none';
    fileInfoEl.classList.add('show');
    fileNameEl.textContent = appState.file.name;
    dropZone.style.borderColor = 'var(--success)';
  } else {
    dropContent.style.display = '';
    fileInfoEl.classList.remove('show');
    dropZone.style.borderColor = '';
  }

  progressFill.style.width = appState.progress + '%';
  progressPercent.textContent = appState.progress + '%';
  statusText.textContent = appState.status;

  const etaEl = document.getElementById('eta-display');
  if (appState.startTime && appState.progress > 0 && appState.progress < 100) {
    const elapsed = (Date.now() - appState.startTime) / 1000;
    const total = elapsed / (appState.progress / 100);
    const remaining = total - elapsed;
    if (remaining > 0 && isFinite(remaining)) {
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = Math.floor(remaining % 60);
      etaEl.textContent = `⏱ ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    }
  } else { etaEl.textContent = ''; }
}

function handleFileSelected(fileObj) {
  if (!fileObj || !fileObj.name.toLowerCase().endsWith('.mp4')) { alert('Chỉ hỗ trợ .mp4'); return; }
  const realPath = webUtils ? webUtils.getPathForFile(fileObj) : fileObj.path;
  appState.file = { path: realPath, name: fileObj.name };
  appState.youtubeLink = '';
  appState.mode = 'local';
  renderAutomation();
}

function handleClearFile() {
  if (appState.mode === 'processing') return;
  appState.file = null;
  appState.mode = 'idle';
  fileInput.value = '';
  renderAutomation();
}

fileInput.addEventListener('change', e => { if (e.target.files.length > 0) handleFileSelected(e.target.files[0]); });
dropZone.addEventListener('click', () => { if (appState.mode !== 'processing' && appState.mode !== 'youtube') fileInput.click(); });
dropZone.addEventListener('dragover', e => { e.preventDefault(); if (appState.mode !== 'processing' && appState.mode !== 'youtube') dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  if (appState.mode !== 'processing' && appState.mode !== 'youtube' && e.dataTransfer.files.length > 0) handleFileSelected(e.dataTransfer.files[0]);
});

youtubeInput.addEventListener('input', e => {
  const val = e.target.value.trim();
  appState.youtubeLink = val;
  appState.mode = val.length > 0 ? 'youtube' : (appState.file ? 'local' : 'idle');
  if (val.length > 0) appState.file = null;
  renderAutomation();
});

splitModeSelect.addEventListener('change', e => { appState.options.splitMode = e.target.value; renderAutomation(); });
timeStartInput.addEventListener('input', e => { appState.options.customStart = e.target.value; });
timeEndInput.addEventListener('input', e => { appState.options.customEnd = e.target.value; });
aspectRatioSelect.addEventListener('change', e => { appState.options.aspectRatio = e.target.value; });
autoPartInput.addEventListener('change', e => { appState.options.autoPartText = e.target.checked; });
document.getElementById('opt-metadata').addEventListener('change', e => { appState.options.metadataStripping = e.target.checked; });
document.getElementById('opt-noise').addEventListener('change', e => { appState.options.noiseInjection = e.target.checked; });
document.getElementById('opt-decimate').addEventListener('change', e => { appState.options.decimation = e.target.checked; });
document.getElementById('opt-audio').addEventListener('change', e => { appState.options.audioSpatialPanning = e.target.checked; });

    function addLog(msg) {
      let tagClass = 'tag-info', tag = '[INFO]';
      if (msg.includes('ERROR')||msg.includes('Loi')||msg.includes('loi')) { tagClass='tag-error'; tag='[ERROR]'; }
      else if (msg.includes('WARN')||msg.includes('canh bao')) { tagClass='tag-warn'; tag='[WARN]'; }
      else if (msg.includes('Hoan tat')||msg.includes('thanh cong')) { tagClass='tag-success'; tag='[SUCCESS]'; }
      else if (msg.includes('FFmpeg')||msg.includes('ffmpeg')) { tagClass='tag-ffmpeg'; tag='[FFMPEG]'; }
  const el = document.createElement('div'); el.className = 'log-entry';
  el.innerHTML = `<span class="log-time">${getFormattedTime()}</span><span class="log-tag ${tagClass}">${tag}</span><span class="log-msg">${msg}</span>`;
  logConsole.appendChild(el); logConsole.scrollTop = logConsole.scrollHeight;
}

async function selectOutputFolder() {
  const result = await ipcRenderer.invoke('select-output-folder');
  if (result) { appState.outputPath = result; outputPathDisplay.textContent = result; }
}
