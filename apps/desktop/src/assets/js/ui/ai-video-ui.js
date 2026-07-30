// AI Video Generation UI Logic

let aiVideoState = {
  mode: 'copy', // 'copy' hoặc 'idea'
  url: '',
  ideaText: '',
  model: 'veo3',
  scenesCount: 'auto',
  ratio: '9:16',
  keepAudio: true,
  voiceEngine: 'elevenlabs',
  prompts: []
};

function switchAiVideoMode(mode) {
  aiVideoState.mode = mode;
  
  const btnCopy = document.getElementById('mode-copy-btn');
  const btnIdea = document.getElementById('mode-idea-btn');
  const copySection = document.getElementById('ai-video-copy-section');
  const ideaSection = document.getElementById('ai-video-idea-section');
  const voiceOptions = document.getElementById('ai-video-voice-options');
  const keepAudioCb = document.getElementById('ai-video-keep-audio');
  
  if (mode === 'copy') {
    btnCopy.className = 'btn-primary';
    btnIdea.className = 'btn-outline';
    copySection.classList.remove('hidden');
    ideaSection.classList.add('hidden');
    
    keepAudioCb.disabled = false;
    if (keepAudioCb.checked) {
      voiceOptions.classList.add('hidden');
    }
  } else {
    btnCopy.className = 'btn-outline';
    btnIdea.className = 'btn-primary';
    copySection.classList.add('hidden');
    ideaSection.classList.remove('hidden');
    
    keepAudioCb.disabled = true;
    voiceOptions.classList.remove('hidden'); // Idea mode always needs voice if there is dialogue
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Listeners
  const keepAudioCb = document.getElementById('ai-video-keep-audio');
  if (keepAudioCb) {
    keepAudioCb.addEventListener('change', (e) => {
      const voiceOptions = document.getElementById('ai-video-voice-options');
      if (e.target.checked) {
        voiceOptions.classList.add('hidden');
      } else {
        voiceOptions.classList.remove('hidden');
      }
    });
  }
});

function startAiVideoAnalysis() {
  const url = document.getElementById('ai-copy-url').value.trim();
  if (!url) {
    showToast('Lỗi', 'Vui lòng nhập link video!', 'error');
    return;
  }
  
  aiVideoState.url = url;
  
  const btn = document.getElementById('ai-analyze-btn');
  btn.disabled = true;
  btn.innerText = 'Đang phân tích... (Giả lập)';
  
  // IPC call
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
        btn.innerText = 'Phân tích Video & Lấy Kịch bản';
      });
  } else {
    // Fallback UI mock
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = 'Phân tích Video & Lấy Kịch bản';
      aiVideoState.prompts = [
        "Scene 1: Một người đàn ông đứng trên đỉnh núi, nhìn xa xăm, bầu trời hoàng hôn.",
        "Scene 2: Cận cảnh khuôn mặt, biểu cảm quyết tâm, gió thổi tung tóc.",
        "Scene 3: Góc quay từ trên cao (drone shot), người đàn ông bước đi trên con đường mòn."
      ];
      renderAiScenes();
      showToast('Thành công', 'Đã phân tích xong video!', 'success');
    }, 2000);
  }
}

function startAiScriptGeneration() {
  const text = document.getElementById('ai-idea-text').value.trim();
  if (!text) {
    showToast('Lỗi', 'Vui lòng nhập ý tưởng!', 'error');
    return;
  }
  
  aiVideoState.ideaText = text;
  
  const btn = document.getElementById('ai-generate-script-btn');
  btn.disabled = true;
  btn.innerText = 'Đang sinh kịch bản... (Giả lập)';
  
  // IPC call
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', { text: text, mode: 'idea' })
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
        btn.innerText = 'Tạo Kịch bản chi tiết (Prompts)';
      });
  } else {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = 'Tạo Kịch bản chi tiết (Prompts)';
      aiVideoState.prompts = [
        "Scene 1: Tàu vũ trụ hạ cánh xuống hành tinh đỏ, cát bụi mịt mù.",
        "Scene 2: Phi hành gia bước ra khỏi tàu, nhìn thấy một sinh vật lạ phát sáng.",
        "Scene 3: Sinh vật lạ vươn xúc tu ra giao tiếp, phi hành gia đưa tay ra chạm vào."
      ];
      renderAiScenes();
      showToast('Thành công', 'Đã sinh kịch bản thành công!', 'success');
    }, 2000);
  }
}

function renderAiScenes() {
  const container = document.getElementById('ai-scenes-container');
  const resultDiv = document.getElementById('ai-script-result');
  
  container.innerHTML = '';
  
  if (aiVideoState.prompts.length === 0) {
    resultDiv.classList.add('hidden');
    return;
  }
  
  resultDiv.classList.remove('hidden');
  
  aiVideoState.prompts.forEach((prompt, index) => {
    const el = document.createElement('div');
    el.style = 'padding: 8px; background: var(--bg-card); border-radius: 4px; border: 1px solid var(--border-color); font-size: 13px; color: var(--text-primary);';
    el.innerText = prompt;
    container.appendChild(el);
  });
}

function startAiVideoRender() {
  if (aiVideoState.prompts.length === 0) {
    showToast('Lỗi', 'Chưa có kịch bản phân cảnh! Vui lòng phân tích hoặc sinh kịch bản trước.', 'error');
    return;
  }
  
  // Update state from UI
  aiVideoState.model = document.getElementById('ai-video-model').value;
  aiVideoState.scenesCount = document.getElementById('ai-video-scenes-count').value;
  aiVideoState.ratio = document.getElementById('ai-video-ratio').value;
  aiVideoState.keepAudio = document.getElementById('ai-video-keep-audio').checked;
  aiVideoState.voiceEngine = document.getElementById('ai-video-voice-engine').value;
  
  // UI Loading state
  const btn = document.getElementById('ai-video-start-btn');
  const progressSection = document.getElementById('ai-video-progress-section');
  const previewSection = document.getElementById('ai-video-preview-section');
  
  btn.disabled = true;
  progressSection.classList.remove('hidden');
  previewSection.classList.add('hidden');
  document.getElementById('ai-video-status-text').innerText = 'Đang gọi API tạo video...';
  document.getElementById('ai-video-progress-fill').style.width = '10%';
  document.getElementById('ai-video-progress-percent').innerText = '10%';
  
  // Send IPC to backend (giả lập)
  showToast('Thông báo', 'Đã gửi lệnh render xuống hệ thống!', 'info');
  
  if (window.ipcRenderer) {
    window.ipcRenderer.send('start-ai-video', aiVideoState);
  } else {
    // Giả lập hoàn thành sau 5s
    setTimeout(() => {
      document.getElementById('ai-video-status-text').innerText = 'Hoàn tất ghép File FFmpeg!';
      document.getElementById('ai-video-progress-fill').style.width = '100%';
      document.getElementById('ai-video-progress-percent').innerText = '100%';
      showToast('Hoàn tất', 'Video AI đã được render và ghép thành công!', 'success');
      btn.disabled = false;
      
      // Show preview
      previewSection.classList.remove('hidden');
      const player = document.getElementById('ai-video-player');
      player.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
      
    }, 5000);
  }
}

// Lắng nghe tiến trình từ backend
if (window.ipcRenderer) {
  window.ipcRenderer.on('ai-video-progress', (e, p) => {
    document.getElementById('ai-video-progress-fill').style.width = p + '%';
    document.getElementById('ai-video-progress-percent').innerText = Math.round(p) + '%';
  });
  
  window.ipcRenderer.on('ai-video-status', (e, msg) => {
    document.getElementById('ai-video-status-text').innerText = msg;
  });
  
  window.ipcRenderer.on('ai-video-done', (e, filePath) => {
    const btn = document.getElementById('ai-video-start-btn');
    btn.disabled = false;
    showToast('Hoàn tất', 'Video AI đã được tạo thành công!', 'success');
    
    const previewSection = document.getElementById('ai-video-preview-section');
    previewSection.classList.remove('hidden');
    const player = document.getElementById('ai-video-player');
    
    // Convert absolute path to standard file:// URL for Chromium
    player.src = 'file://' + filePath;
    aiVideoState.lastOutputPath = filePath;
  });
  
  window.ipcRenderer.on('ai-video-error', (e, msg) => {
    const btn = document.getElementById('ai-video-start-btn');
    btn.disabled = false;
    showToast('Lỗi hệ thống', msg, 'error');
  });
}

function openOutputFolder() {
  if (window.ipcRenderer && aiVideoState.lastOutputPath) {
    window.ipcRenderer.send('open-output-folder', aiVideoState.lastOutputPath);
  }
}
