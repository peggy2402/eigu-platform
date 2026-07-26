// AI Video Generation UI Logic

let aiVideoState = {
  mode: 'copy', // 'copy', 'idea', 'image'
  url: '',
  ideaText: '',
  images: [], // List of image objects { name, path, url }
  model: 'veo3',
  scenesCount: 'auto',
  ratio: '9:16',
  keepAudio: true,
  voiceEngine: 'elevenlabs',
  prompts: [],
  lastOutputPath: ''
};

function switchAiVideoMode(mode) {
  aiVideoState.mode = mode;
  
  const btnCopy = document.getElementById('mode-copy-btn');
  const btnIdea = document.getElementById('mode-idea-btn');
  const btnImage = document.getElementById('mode-image-btn');
  const copySection = document.getElementById('ai-video-copy-section');
  const ideaSection = document.getElementById('ai-video-idea-section');
  const imageSection = document.getElementById('ai-video-image-section');
  const voiceOptions = document.getElementById('ai-video-voice-options');
  const keepAudioCb = document.getElementById('ai-video-keep-audio');
  
  btnCopy.className = mode === 'copy' ? 'btn-primary' : 'btn-outline';
  btnIdea.className = mode === 'idea' ? 'btn-primary' : 'btn-outline';
  if (btnImage) btnImage.className = mode === 'image' ? 'btn-primary' : 'btn-outline';
  
  if (copySection) copySection.classList.toggle('hidden', mode !== 'copy');
  if (ideaSection) ideaSection.classList.toggle('hidden', mode !== 'idea');
  if (imageSection) imageSection.classList.toggle('hidden', mode !== 'image');
  
  if (mode === 'copy') {
    if (keepAudioCb) keepAudioCb.disabled = false;
    if (voiceOptions && keepAudioCb) {
      voiceOptions.classList.toggle('hidden', keepAudioCb.checked);
    }
  } else {
    if (keepAudioCb) keepAudioCb.disabled = true;
    if (voiceOptions) voiceOptions.classList.remove('hidden');
  }
}

function handleAiImageSelect(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgObj = {
        name: file.name,
        path: file.path || file.name,
        dataUrl: e.target.result
      };
      aiVideoState.images.push(imgObj);
      renderAiImagePreviewList();
    };
    reader.readAsDataURL(file);
  });
}

function renderAiImagePreviewList() {
  const container = document.getElementById('ai-image-preview-list');
  if (!container) return;
  container.innerHTML = '';

  aiVideoState.images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.style = 'position: relative; width: 72px; height: 72px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-card);';
    
    const imgEl = document.createElement('img');
    imgEl.src = img.dataUrl;
    imgEl.style = 'width: 100%; height: 100%; object-fit: cover;';

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '×';
    removeBtn.style = 'position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; line-height: 16px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      aiVideoState.images.splice(idx, 1);
      renderAiImagePreviewList();
    };

    item.appendChild(imgEl);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

function startAiImageScriptGeneration() {
  if (aiVideoState.images.length === 0) {
    showToast('Lỗi', 'Vui lòng chọn ít nhất 1 hình ảnh nguồn!', 'error');
    return;
  }

  const btn = document.getElementById('ai-image-analyze-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang phân tích ảnh & sinh kịch bản...';
  }

  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', {
      images: aiVideoState.images.map(img => img.path),
      mode: 'image'
    })
    .then(res => {
      let prompts = Array.isArray(res) ? res : (res && res.success ? res.prompts : null);
      if (!prompts) {
        showToast('Lỗi AI Director', (res && res.error) || 'Lỗi khi phân tích ảnh', 'error');
        return;
      }
      aiVideoState.prompts = prompts;
      renderAiScenes();
      showToast('Thành công', 'Đã sinh kịch bản Image-to-Video thành công!', 'success');
    })
    .catch(err => {
      showToast('Lỗi AI Director', err.message || 'Lỗi khi phân tích ảnh', 'error');
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Phân tích Ảnh & Sinh Kịch bản';
      }
    });
  } else {
    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Phân tích Ảnh & Sinh Kịch bản';
      }
      aiVideoState.prompts = aiVideoState.images.map((img, idx) => 
        `Scene ${idx + 1}: Chuyển động camera mượt mà biến bức ảnh "${img.name}" thành đoạn video sống động 3D.`
      );
      renderAiScenes();
      showToast('Thành công', 'Đã sinh kịch bản Image-to-Video thành công!', 'success');
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Listeners
  const keepAudioCb = document.getElementById('ai-video-keep-audio');
  if (keepAudioCb) {
    keepAudioCb.addEventListener('change', (e) => {
      const voiceOptions = document.getElementById('ai-video-voice-options');
      if (e.target.checked && aiVideoState.mode === 'copy') {
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
  btn.innerText = 'Đang phân tích...';
  
  // IPC call
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', { text: url, mode: 'copy' })
      .then(res => {
        let prompts = Array.isArray(res) ? res : (res && res.success ? res.prompts : null);
        if (!prompts) {
          showToast('Lỗi AI Director', (res && res.error) || 'Lỗi khi phân tích video', 'error');
          return;
        }
        aiVideoState.prompts = prompts;
        renderAiScenes();
        showToast('Thành công', 'Đã phân tích xong video!', 'success');
      })
      .catch(err => {
        showToast('Lỗi AI Director', err.message || 'Lỗi khi gọi AI', 'error');
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
  btn.innerText = 'Đang sinh kịch bản...';
  
  // IPC call
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('ai-video-generate-prompts', { text: text, mode: 'idea' })
      .then(res => {
        let prompts = Array.isArray(res) ? res : (res && res.success ? res.prompts : null);
        if (!prompts) {
          showToast('Lỗi AI Director', (res && res.error) || 'Lỗi khi sinh kịch bản', 'error');
          return;
        }
        aiVideoState.prompts = prompts;
        renderAiScenes();
        showToast('Thành công', 'Đã sinh kịch bản thành công!', 'success');
      })
      .catch(err => {
        showToast('Lỗi AI Director', err.message || 'Lỗi khi gọi AI', 'error');
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
