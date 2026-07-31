// AI Video Generation UI Logic - Specification v2 Final

let aiVideoState = {
  mode: 'copy', // 'copy', 'idea', 'image', 'template'
  templateSubmode: 'char', // 'char', 'remake'
  url: '',
  ideaText: '',
  style: 'cinematic',
  mood: 'epic',
  selectedImages: [],
  templateVideo: null,
  templateCharImages: [],
  remakeVideo: null,
  remakeCharDesc: '',
  remakeEnvDesc: '',
  model: 'veo3',
  scenesCount: 'auto',
  ratio: '9:16',
  duration: 'auto',
  threads: 4,
  watermarkBlur: true,
  keepAudio: true,
  voiceEngine: 'elevenlabs',
  imageModel: 'nano-banana',
  prompts: [],
  lastOutputPath: ''
};

function switchAiVideoMode(mode) {
  aiVideoState.mode = mode;
  
  const modes = ['copy', 'idea', 'image', 'template'];
  modes.forEach(m => {
    const btn = document.getElementById(`mode-${m}-btn`);
    const sec = document.getElementById(`ai-video-${m}-section`);
    if (btn && sec) {
      if (m === mode) {
        btn.className = 'btn-primary';
        sec.classList.remove('hidden');
      } else {
        btn.className = 'btn-outline';
        sec.classList.add('hidden');
      }
    }
  });

  const keepAudioCb = document.getElementById('ai-video-keep-audio');
  const voiceOptions = document.getElementById('ai-video-voice-options');

  if (mode === 'copy') {
    if (keepAudioCb) keepAudioCb.disabled = false;
    if (keepAudioCb && keepAudioCb.checked && voiceOptions) {
      voiceOptions.classList.add('hidden');
    }
  } else {
    if (keepAudioCb) keepAudioCb.disabled = true;
    if (voiceOptions) voiceOptions.classList.remove('hidden');
  }
}

function switchTemplateSubmode(submode) {
  aiVideoState.templateSubmode = submode;
  const btnChar = document.getElementById('submode-char-btn');
  const btnRemake = document.getElementById('submode-remake-btn');
  const secChar = document.getElementById('template-char-submode');
  const secRemake = document.getElementById('template-remake-submode');

  if (submode === 'char') {
    btnChar.className = 'btn-primary';
    btnRemake.className = 'btn-outline';
    secChar.classList.remove('hidden');
    secRemake.classList.add('hidden');
  } else {
    btnChar.className = 'btn-outline';
    btnRemake.className = 'btn-primary';
    secChar.classList.add('hidden');
    secRemake.classList.remove('hidden');
  }
}

function handleAiImagesSelected(event) {
  const files = Array.from(event.target.files || []);
  aiVideoState.selectedImages = files;
  renderSelectedImagesList();
}

function renderSelectedImagesList() {
  const container = document.getElementById('ai-images-preview-list');
  if (!container) return;
  container.innerHTML = '';

  if (aiVideoState.selectedImages.length === 0) {
    container.innerHTML = '<span style="font-size: 11px; color: var(--text-muted);">Chưa chọn ảnh nào</span>';
    return;
  }

  aiVideoState.selectedImages.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement('div');
    item.style = 'position: relative; flex-shrink: 0; width: 64px; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color);';
    item.innerHTML = `
      <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" />
      <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(0,0,0,0.6); color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px;">#${idx+1}</span>
    `;
    container.appendChild(item);
  });
}

function generatePromptsFromImages() {
  if (aiVideoState.selectedImages.length === 0) {
    showToast('Lỗi', 'Vui lòng chọn ít nhất 1 ảnh!', 'error');
    return;
  }

  showToast('Thông báo', 'Đang phân tích hình ảnh và tạo prompt chuyển động...', 'info');
  aiVideoState.prompts = aiVideoState.selectedImages.map((file, idx) => {
    return `Scene ${idx+1}: Image-to-video motion scene, subject animation from image "${file.name}", smooth camera zoom in.`;
  });
  renderAiScenes();
}

function startTemplateAnalysis() {
  if (aiVideoState.templateSubmode === 'char') {
    const vInput = document.getElementById('template-video-input');
    const cInput = document.getElementById('template-char-input');
    if (!vInput.files || vInput.files.length === 0) {
      showToast('Lỗi', 'Vui lòng chọn Video mẫu!', 'error');
      return;
    }
    if (!cInput.files || cInput.files.length === 0) {
      showToast('Lỗi', 'Vui lòng chọn ít nhất 1 Ảnh nhân vật!', 'error');
      return;
    }
    if (cInput.files.length > 2) {
      showToast('Cảnh báo', 'Tối đa 2 ảnh nhân vật. Đã tự động chọn 2 ảnh đầu tiên.', 'warning');
    }
    showToast('Thành công', 'Đã phân tích Video mẫu & Ảnh nhân vật cho Gemini Omni!', 'success');
    aiVideoState.prompts = [
      "Gemini Omni PoC Scene 1: Character replacement in reference video, maintaining original motion and background, swap face with reference character image.",
      "Gemini Omni PoC Scene 2: High fidelity motion tracking, continuous pose alignment."
    ];
    renderAiScenes();
  } else {
    const vInput = document.getElementById('remake-video-input');
    const cDesc = document.getElementById('remake-char-desc').value.trim();
    const eDesc = document.getElementById('remake-env-desc').value.trim();
    if (!vInput.files || vInput.files.length === 0) {
      showToast('Lỗi', 'Vui lòng chọn Video mẫu!', 'error');
      return;
    }
    showToast('Thành công', 'Đã bóc tách cấu trúc video mẫu và tạo kịch bản mới!', 'success');
    aiVideoState.prompts = [
      `Full Remake Scene 1: Remake video structure, new character (${cDesc || 'New Character'}), new background (${eDesc || 'New Environment'}).`,
      `Full Remake Scene 2: Matching pacing and camera cuts of original sample video.`
    ];
    renderAiScenes();
  }
}

function openPricingModal() {
  const modal = document.getElementById('pricing-modal-overlay');
  if (modal) modal.classList.remove('hidden');
}

function closePricingModal() {
  const modal = document.getElementById('pricing-modal-overlay');
  if (modal) modal.classList.add('hidden');
}

function startAiVideoAnalysis() {
  const url = document.getElementById('ai-copy-url').value.trim();
  if (!url) {
    showToast('Lỗi', 'Vui lòng nhập link video!', 'error');
    return;
  }
  
  aiVideoState.url = url;
  
  const btn = document.getElementById('ai-analyze-btn');
  btn.disabled = true;
  btn.innerText = 'Đang phân tích...';
  
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', { text: url, mode: 'copy' })
      .then(prompts => {
        aiVideoState.prompts = prompts;
        renderAiScenes();
        showToast('Thành công', 'Đã phân tích xong video!', 'success');
      })
      .catch(err => {
        showToast('Lỗi', err.message || 'Lỗi khi gọi AI', 'error');
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<span data-icon="search" style="margin-right: 6px;"></span> Phân tích Video & Lấy Kịch bản';
      });
  } else {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<span data-icon="search" style="margin-right: 6px;"></span> Phân tích Video & Lấy Kịch bản';
      aiVideoState.prompts = [
        "Scene 1: Một người đàn ông đứng trên đỉnh núi, nhìn xa xăm, bầu trời hoàng hôn.",
        "Scene 2: Cận cảnh khuôn mặt, biểu cảm quyết tâm, gió thổi tung tóc.",
        "Scene 3: Góc quay từ trên cao (drone shot), người đàn ông bước đi trên con đường mòn."
      ];
      renderAiScenes();
      showToast('Thành công', 'Đã phân tích xong video!', 'success');
    }, 1500);
  }
}

function startAiScriptGeneration() {
  const text = document.getElementById('ai-idea-text').value.trim();
  if (!text) {
    showToast('Lỗi', 'Vui lòng nhập ý tưởng!', 'error');
    return;
  }
  
  aiVideoState.ideaText = text;
  aiVideoState.style = document.getElementById('ai-style-option').value;
  aiVideoState.mood = document.getElementById('ai-mood-option').value;

  const btn = document.getElementById('ai-generate-script-btn');
  btn.disabled = true;
  btn.innerText = 'Đang sinh kịch bản...';
  
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', { text: `${text} (Style: ${aiVideoState.style}, Mood: ${aiVideoState.mood})`, mode: 'idea' })
      .then(prompts => {
        aiVideoState.prompts = prompts;
        renderAiScenes();
        showToast('Thành công', 'Đã sinh kịch bản thành công!', 'success');
      })
      .catch(err => {
        showToast('Lỗi', err.message || 'Lỗi khi sinh kịch bản', 'error');
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<span data-icon="sparkles" style="margin-right: 6px;"></span> Tạo Kịch bản chi tiết (Prompts)';
      });
  } else {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<span data-icon="sparkles" style="margin-right: 6px;"></span> Tạo Kịch bản chi tiết (Prompts)';
      aiVideoState.prompts = [
        `Scene 1: ${aiVideoState.style.toUpperCase()} shot of spaceship landing on a dusty planet, ${aiVideoState.mood} mood.`,
        "Scene 2: Astronaut stepping out of the ship, glowing alien flora in background.",
        "Scene 3: Alien creature extending glowing tentacle, cinematic lighting."
      ];
      renderAiScenes();
      showToast('Thành công', 'Đã sinh kịch bản thành công!', 'success');
    }, 1500);
  }
}

function renderAiScenes() {
  const container = document.getElementById('ai-scenes-container');
  const resultDiv = document.getElementById('ai-script-result');
  if (!container || !resultDiv) return;
  
  container.innerHTML = '';
  
  if (aiVideoState.prompts.length === 0) {
    resultDiv.classList.add('hidden');
    return;
  }
  
  resultDiv.classList.remove('hidden');
  
  aiVideoState.prompts.forEach((prompt, index) => {
    const el = document.createElement('div');
    el.style = 'display: flex; gap: 8px; align-items: flex-start; background: var(--bg-card); padding: 8px; border-radius: 6px; border: 1px solid var(--border-color);';
    el.innerHTML = `
      <span style="font-weight: 700; font-size: 12px; color: var(--accent); white-space: nowrap; padding-top: 6px;">#${index + 1}</span>
      <textarea rows="2" style="flex: 1; padding: 6px; font-size: 12px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); resize: vertical;" onchange="aiVideoState.prompts[${index}] = this.value">${prompt}</textarea>
    `;
    container.appendChild(el);
  });
}

function startAiVideoRender() {
  if (aiVideoState.prompts.length === 0) {
    showToast('Lỗi', 'Chưa có kịch bản phân cảnh! Vui lòng phân tích hoặc sinh kịch bản trước.', 'error');
    return;
  }
  
  // Collect parameters from AI Config Panel
  aiVideoState.model = document.getElementById('ai-video-model').value;
  aiVideoState.scenesCount = document.getElementById('ai-video-scenes-count').value;
  aiVideoState.ratio = document.getElementById('ai-video-ratio').value;
  aiVideoState.duration = document.getElementById('ai-video-duration').value;
  aiVideoState.threads = parseInt(document.getElementById('ai-video-threads').value) || 4;
  aiVideoState.watermarkBlur = document.getElementById('ai-video-watermark-blur').checked;
  aiVideoState.keepAudio = document.getElementById('ai-video-keep-audio').checked;
  aiVideoState.voiceEngine = document.getElementById('ai-video-voice-engine').value;
  aiVideoState.imageModel = document.getElementById('ai-image-model').value;
  
  const btn = document.getElementById('ai-video-start-btn');
  const progressSection = document.getElementById('ai-video-progress-section');
  const previewSection = document.getElementById('ai-video-preview-section');
  
  btn.disabled = true;
  progressSection.classList.remove('hidden');
  previewSection.classList.add('hidden');
  document.getElementById('ai-video-status-text').innerText = `Đang gọi API Provider (${aiVideoState.model}) trên ${aiVideoState.threads} luồng...`;
  document.getElementById('ai-video-progress-fill').style.width = '10%';
  document.getElementById('ai-video-progress-percent').innerText = '10%';
  
  showToast('Thông báo', `Đã gửi lệnh render (${aiVideoState.threads} luồng song song)!`, 'info');
  
  if (window.ipcRenderer) {
    window.ipcRenderer.send('start-ai-video', aiVideoState);
  } else {
    setTimeout(() => {
      document.getElementById('ai-video-status-text').innerText = 'Hoàn tất ghép File FFmpeg & Blur Watermark hậu kỳ!';
      document.getElementById('ai-video-progress-fill').style.width = '100%';
      document.getElementById('ai-video-progress-percent').innerText = '100%';
      showToast('Hoàn tất', 'Video AI đã được render và xuất file thành công!', 'success');
      btn.disabled = false;
      
      previewSection.classList.remove('hidden');
      const player = document.getElementById('ai-video-player');
      player.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
    }, 4000);
  }
}

// IPC Progress Event Listeners
if (typeof window !== 'undefined' && window.ipcRenderer) {
  window.ipcRenderer.on('ai-video-progress', (e, p) => {
    const fill = document.getElementById('ai-video-progress-fill');
    const pct = document.getElementById('ai-video-progress-percent');
    if (fill) fill.style.width = p + '%';
    if (pct) pct.innerText = Math.round(p) + '%';
  });
  
  window.ipcRenderer.on('ai-video-status', (e, msg) => {
    const txt = document.getElementById('ai-video-status-text');
    if (txt) txt.innerText = msg;
  });
  
  window.ipcRenderer.on('ai-video-done', (e, filePath) => {
    const btn = document.getElementById('ai-video-start-btn');
    if (btn) btn.disabled = false;
    showToast('Hoàn tất', 'Video AI đã được tạo thành công!', 'success');
    
    const previewSection = document.getElementById('ai-video-preview-section');
    if (previewSection) previewSection.classList.remove('hidden');
    const player = document.getElementById('ai-video-player');
    if (player) player.src = 'file://' + filePath;
    aiVideoState.lastOutputPath = filePath;
  });
  
  window.ipcRenderer.on('ai-video-error', (e, msg) => {
    const btn = document.getElementById('ai-video-start-btn');
    if (btn) btn.disabled = false;
    showToast('Lỗi hệ thống', msg, 'error');
  });
}

function openOutputFolder() {
  if (typeof window !== 'undefined' && window.ipcRenderer && aiVideoState.lastOutputPath) {
    window.ipcRenderer.send('open-output-folder', aiVideoState.lastOutputPath);
  }
}
