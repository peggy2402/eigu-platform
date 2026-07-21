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

let fetchInfoTimeout = null;

async function fetchVideoInfo(url) {
  const previewCard = document.getElementById('video-preview-card');
  if (!previewCard) return;

  if (!url) {
    previewCard.innerHTML = `
      <span data-icon="youtube" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px; opacity: 0.5;"></span>
      <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500;">Thông tin Video</p>
      <span style="color: var(--text-muted); font-size: 12px; margin-top: 4px; max-width: 80%;">Thumbnail và thời lượng sẽ hiển thị tại đây khi bạn chọn file hoặc dán link.</span>
    `;
    if (window.feather) window.feather.replace();
    return;
  }

  previewCard.innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">Đang tải thông tin...</span>`;
  
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);

    previewCard.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('${data.thumbnail_url}') center/cover no-repeat; opacity: 0.15; filter: blur(8px);"></div>
      <div style="z-index: 1; display: flex; flex-direction: column; align-items: center; width: 100%;">
        <img src="${data.thumbnail_url}" style="max-height: 90px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin-bottom: 12px;" />
        <h4 style="font-size: 13px; font-weight: 600; color: var(--text-primary); text-align: center; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 90%; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${data.title}</h4>
        <span style="font-size: 12px; color: var(--accent); font-weight: 500;">${data.author_name || 'YouTube'}</span>
      </div>
    `;
  } catch (err) {
    previewCard.innerHTML = `
      <span data-icon="alert-circle" style="font-size: 24px; color: var(--danger); margin-bottom: 8px;"></span>
      <p style="color: var(--danger); font-size: 13px;">Không thể lấy thông tin video</p>
      <span style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">Vui lòng kiểm tra lại đường dẫn YouTube</span>
    `;
    if (window.feather) window.feather.replace();
  }
}

function handleFileSelected(fileObj) {
  if (!fileObj || !fileObj.name.toLowerCase().endsWith('.mp4')) { alert('Chỉ hỗ trợ .mp4'); return; }
  const realPath = window.webUtils ? window.webUtils.getPathForFile(fileObj) : fileObj.path;
  appState.file = { path: realPath, name: fileObj.name };
  appState.youtubeLink = '';
  appState.mode = 'local';
  renderAutomation();

  const previewCard = document.getElementById('video-preview-card');
  if (previewCard) {
    previewCard.innerHTML = `
      <span data-icon="video" style="font-size: 32px; color: var(--accent); margin-bottom: 12px;"></span>
      <p style="color: var(--text-primary); font-size: 14px; font-weight: 500; text-align: center; max-width: 90%; word-break: break-all;">${fileObj.name}</p>
      <span style="color: var(--success); font-size: 12px; margin-top: 4px;">Đã sẵn sàng xử lý</span>
    `;
    if (window.feather) window.feather.replace();
  }
}

function handleClearFile() {
  if (appState.mode === 'processing') return;
  appState.file = null;
  appState.mode = 'idle';
  fileInput.value = '';
  renderAutomation();
  
  const val = youtubeInput.value.trim();
  if (val) {
    youtubeInput.dispatchEvent(new Event('input'));
  } else {
    fetchVideoInfo('');
  }
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

  clearTimeout(fetchInfoTimeout);
  if (val.includes('youtube.com') || val.includes('youtu.be')) {
    fetchInfoTimeout = setTimeout(() => {
      fetchVideoInfo(val);
    }, 600);
  } else if (val === '') {
    fetchVideoInfo('');
  }
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

/* Advanced Editing Controls */
document.getElementById('opt-flip').addEventListener('change', e => { appState.options.flip = e.target.value; });
document.getElementById('opt-brightness').addEventListener('input', e => { appState.options.brightness = parseFloat(e.target.value) || 1.0; });
document.getElementById('opt-contrast').addEventListener('input', e => { appState.options.contrast = parseFloat(e.target.value) || 1.0; });
document.getElementById('opt-saturation').addEventListener('input', e => { appState.options.saturation = parseFloat(e.target.value) || 1.0; });
document.getElementById('opt-frame-bend').addEventListener('change', e => { appState.options.frameBend = e.target.value; });
document.getElementById('opt-voice').addEventListener('change', e => {
  appState.options.voiceMode = e.target.value;
  const ffmpegConfig = document.getElementById('voice-ffmpeg-config');
  const apiConfig = document.getElementById('voice-api-config');
  ffmpegConfig.classList.toggle('hidden', e.target.value !== 'ffmpeg');
  apiConfig.classList.toggle('hidden', e.target.value !== 'elevenlabs' && e.target.value !== 'omnivoice' && e.target.value !== 'self-hosted');
  if (e.target.value === 'elevenlabs' || e.target.value === 'omnivoice' || e.target.value === 'self-hosted') {
    fetchVoiceSpeakers(e.target.value);
  }
});
document.getElementById('voice-pitch').addEventListener('input', e => { appState.options.voicePitch = parseFloat(e.target.value) || 1.0; });
document.getElementById('voice-speed').addEventListener('input', e => { appState.options.voiceSpeed = parseFloat(e.target.value) || 1.0; });
document.getElementById('voice-speaker').addEventListener('change', e => { appState.options.voiceSpeaker = e.target.value; });

async function fetchVoiceSpeakers(provider) {
  const select = document.getElementById('voice-speaker');
  select.innerHTML = '<option value="">Đang tải...</option>';
  select.disabled = true;

  if (!accessToken) {
    select.innerHTML = '<option value="">Vui lòng đăng nhập trước</option>';
    return;
  }

  try {
    const data = await apiFetch(`/voice/speakers?provider=${provider}`);
    select.innerHTML = '<option value="">Chọn giọng nói...</option>';
    (data.speakers || []).forEach(s => {
      select.innerHTML += `<option value="${s.id}">${s.name}${s.accent ? ' (' + s.accent + ')' : ''}</option>`;
    });
    select.disabled = false;
  } catch (err) {
    console.error('[Voice] fetchSpeakers error:', err.message || err);
    select.innerHTML = `<option value="">Lỗi: ${err.message || 'Không thể kết nối server'}</option>`;
  }
}

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
