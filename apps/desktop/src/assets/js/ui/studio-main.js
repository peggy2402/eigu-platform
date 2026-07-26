// AI Video Studio - Main Entry Point (Local .eigu file mode)

function getIPC() {
  if (window.ipcRenderer) return window.ipcRenderer;
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      window.ipcRenderer = ipcRenderer;
      return ipcRenderer;
    } catch (e) { }
  }
  return null;
}

if (typeof window.IPC === 'undefined') {
  window.IPC = {
    invoke: (...args) => {
      const ipc = getIPC();
      if (!ipc) return Promise.reject(new Error('Electron IPC is not available'));
      return ipc.invoke(...args);
    },
    send: (...args) => {
      const ipc = getIPC();
      if (ipc) ipc.send(...args);
    },
    on: (...args) => {
      const ipc = getIPC();
      if (ipc) ipc.on(...args);
    }
  };
}
var IPC = window.IPC;

function _t(key, fallback) {
  return typeof t === 'function' ? (t(key) || fallback || key) : (fallback || key)
}

const _errorMsg = (code, fallback) => {
  const map = {
    PROJECT_NOT_FOUND: _t('error_project_not_found', 'Project not found'),
    PROJECT_NAME_CONFLICT: _t('error_project_name_conflict', 'Project name already exists'),
    SCENE_NOT_FOUND: _t('error_scene_not_found', 'Scene not found'),
    SCENE_CREATE_FAILED: _t('error_scene_create_failed', 'Failed to create scene'),
    CHARACTER_NOT_FOUND: _t('error_character_not_found', 'Character not found'),
    ASSET_NOT_FOUND: _t('error_asset_not_found', 'Asset not found'),
    PROVIDER_NOT_FOUND: _t('error_provider_not_found', 'Video provider not found. Please configure a provider.'),
    PROVIDER_INACTIVE: _t('error_provider_inactive', 'Provider is inactive. Please enable it.'),
    RENDER_NO_SCENES: _t('error_render_no_scenes', 'No scenes to render. Add scenes first.'),
    RENDER_SUBMIT_FAILED: _t('error_render_submit_failed', 'Failed to submit render'),
    JOB_NOT_FOUND: _t('error_job_not_found', 'Render job not found'),
  }
  return map[code] || fallback || code
}

const _handleIpcResult = (result) => {
  if (!result || result.success === false) {
    const msg = _errorMsg(result?.error, result?.error || 'Unknown error')
    throw new Error(msg)
  }
  return result
}

const AIVideoStudio = {
  initialized: false,
  currentFilePath: null,

  async init(containerSelector) {
    console.log('[DEBUG AIVideoStudio.init] Initializing with containerSelector:', containerSelector, 'initialized:', this.initialized);
    this.renderLayout(containerSelector)

    if (this.initialized) {
      console.log('[DEBUG AIVideoStudio.init] Already initialized, re-triggering onStateChange');
      this.onStateChange(StudioStore.getState())
      return
    }
    this.initialized = true

    this.bindEvents()
    StudioStore.subscribe(state => this.onStateChange(state))

    // Auto-save & state change subscriptions
    this.loadRecentProjects()
    this.fetchProviderHealth()
    this.addLog('INFO', '🚀 Đã khởi tạo AI Video Studio Engine thành công.')

    if (typeof applyAppLanguage === 'function') {
      applyAppLanguage(localStorage.getItem('eigu_language') || 'vi')
    }

    if (typeof ICONS !== 'undefined') {
      document.querySelectorAll('.studio-root [data-icon]').forEach(e => {
        e.innerHTML = ICONS[e.dataset.icon] || ''
        e.removeAttribute('data-icon')
      })
    }
  },

  renderLayout(targetSelector) {
    console.log('[DEBUG AIVideoStudio.renderLayout] Called with targetSelector:', targetSelector);
    let container = null
    if (targetSelector) {
      container = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector
    }
    if (!container) {
      container = document.getElementById('studio-root') || document.getElementById('view-ai-studio') || document.getElementById('view-ai-video')
    }
    console.log('[DEBUG AIVideoStudio.renderLayout] Container lookup result:', container);
    if (!container) { console.error('[DEBUG AIVideoStudio.renderLayout] Target container NOT FOUND in DOM!'); return }
    if (container.querySelector('.studio-root')) { console.log('[DEBUG AIVideoStudio.renderLayout] Already rendered inside container'); return }

    console.log('[DEBUG AIVideoStudio.renderLayout] Injecting HTML into container:', container);

    container.innerHTML = `
      <div class="studio-root">
        <div class="studio-header">
          <div class="studio-header-left">
            <div class="studio-menu-container" style="position: relative;">
              <button id="studio-menu-btn" class="studio-menu-btn" onclick="AIVideoStudio.toggleMenuDropdown(event)" title="Menu Tệp (Tạo mới, Mở, Lưu)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div id="studio-file-dropdown" class="studio-dropdown-menu hidden">
                <div class="dropdown-header" data-i18n="ai_file_menu">Tệp & Dự án</div>
                <button onclick="AIVideoStudio.newProject()"><span class="menu-item-left"><span data-icon="plus"></span> <span data-i18n="ai_new_project">Tạo dự án mới</span></span> <kbd>Ctrl + N</kbd></button>
                <button onclick="AIVideoStudio.openProject()"><span class="menu-item-left"><span data-icon="folder"></span> <span data-i18n="ai_open_project">Mở dự án</span></span> <kbd>Ctrl + O</kbd></button>
                <button onclick="AIVideoStudio.saveProject()"><span class="menu-item-left"><span data-icon="save"></span> <span data-i18n="ai_save_project">Lưu dự án</span></span> <kbd>Ctrl + S</kbd></button>
                <button onclick="AIVideoStudio.saveAsProject()"><span class="menu-item-left"><span data-icon="saveAs"></span> <span data-i18n="ai_save_as">Lưu thành bản khác</span></span> <kbd>Ctrl + Shift + S</kbd></button>
                <div class="dropdown-divider"></div>
                <button onclick="AIVideoStudio.queueSubmit()"><span class="menu-item-left"><span data-icon="zap"></span> <span data-i18n="ai_export_video">Xuất Video (Render)</span></span> <kbd>Ctrl + E</kbd></button>
              </div>
            </div>
            <span id="studio-project-name" class="studio-project-name" data-i18n="ai_no_project">Chưa chọn dự án</span>
            <span id="studio-project-status" class="studio-status-badge draft" data-i18n="ai_draft">Bản nháp</span>
          </div>
          <div class="studio-header-center">
            <div class="studio-save-indicator" id="studio-save-indicator"></div>
          </div>
          <div class="studio-header-right">
            <button class="studio-btn" onclick="AIVideoStudio.openProject()">
              <span data-icon="folder"></span> <span data-i18n="ai_open_project">Mở dự án</span>
            </button>
            <button class="studio-btn studio-btn-primary" onclick="AIVideoStudio.queueSubmit()" id="studio-render-btn">
              <span data-icon="zap"></span> <span data-i18n="ai_render">Bắt đầu Render</span>
            </button>
          </div>
        </div>

        <div class="studio-body">
          <div class="studio-sidebar">
            <div class="studio-sidebar-tabs">
              <button class="studio-tab active" data-tab="story" onclick="AIVideoStudio.switchTab('story')" title="Kịch bản (Story)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                <span class="tab-label" data-i18n="ai_story">Kịch bản</span>
              </button>
              <button class="studio-tab" data-tab="scenes" onclick="AIVideoStudio.switchTab('scenes')" title="Phân cảnh (Scenes)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span class="tab-label" data-i18n="ai_scenes">Phân cảnh</span>
              </button>
              <button class="studio-tab" data-tab="characters" onclick="AIVideoStudio.switchTab('characters')" title="Nhân vật (Characters)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span class="tab-label" data-i18n="ai_characters">Nhân vật</span>
              </button>
              <button class="studio-tab" data-tab="assets" onclick="AIVideoStudio.switchTab('assets')" title="Tài nguyên (Assets)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span class="tab-label" data-i18n="ai_assets">Tài nguyên</span>
              </button>
              <button class="studio-tab" data-tab="brand" onclick="AIVideoStudio.switchTab('brand')" title="Thương hiệu (Brand)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.42-.16-.83-.46-1.14-.3-.32-.47-.73-.47-1.18 0-.93.75-1.68 1.68-1.68H16c3.3 0 6-2.7 6-6 0-4.75-4.03-8.5-10-8.5z"/></svg>
                <span class="tab-label" data-i18n="ai_brand">Thương hiệu</span>
              </button>
              <button class="studio-tab" data-tab="timeline" onclick="AIVideoStudio.switchTab('timeline')" title="Dòng thời gian (Timeline)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="tab-label" data-i18n="ai_timeline">Timeline</span>
              </button>
              <button class="studio-tab" data-tab="queue" onclick="AIVideoStudio.switchTab('queue')" title="Hàng đợi Render (Queue)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span class="tab-label" data-i18n="ai_queue">Hàng đợi</span>
              </button>
              <button class="studio-tab" data-tab="logs" onclick="AIVideoStudio.switchTab('logs')" title="Activity Logs">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                <span class="tab-label" data-i18n="ai_activity_logs">Logs</span>
              </button>
            </div>
            <div class="studio-sidebar-content" id="studio-sidebar-content"></div>
          </div>

          <div class="studio-main">
            <div class="studio-input-methods" id="studio-input-methods" style="display:none;">
              <h3 id="studio-welcome-msg" data-i18n="ai_welcome">Mở một dự án hoặc tạo dự án mới để bắt đầu.</h3>
              <div class="input-method-grid">
                <button class="input-method-card" onclick="AIVideoStudio.newProject()">
                  <span data-icon="plus"></span>
                  <span data-i18n="ai_new_project">Dự án mới</span>
                </button>
                <button class="input-method-card" onclick="AIVideoStudio.openProject()">
                  <span data-icon="folder"></span>
                  <span data-i18n="ai_open_project">Mở dự án</span>
                </button>
              </div>
              <div id="studio-recent-list" class="studio-recent-list"></div>
            </div>

            <div id="studio-center-panel" class="studio-center-panel hidden">
              <div id="storyboard-toolbar-top" class="storyboard-toolbar" style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); display:flex; gap:8px;">
                <button class="studio-btn-sm" onclick="AIVideoStudio.addScene()"><span data-icon="plus"></span> <span data-i18n="ai_add_scene">Thêm cảnh</span></button>
                <button class="studio-btn-sm" onclick="AIVideoStudio.showInputDialog('idea')"><span data-icon="zap"></span> <span data-i18n="ai_generate_ai">AI Tạo kịch bản</span></button>
                <button class="studio-btn-sm" onclick="AIVideoStudio.queueSubmit()"><span data-icon="play"></span> <span data-i18n="ai_render">Render Hàng loạt</span></button>
              </div>

              <div id="studio-storyboard-panel" class="studio-panel" style="flex: 1; overflow-y: auto;">
                <div class="storyboard-canvas" id="storyboard-canvas"></div>
              </div>
              
              <div class="studio-preview" id="studio-preview-panel">
                <div class="preview-viewport" id="preview-viewport">
                  <div class="preview-placeholder">
                    <span data-icon="playCircle" style="font-size:48px;opacity:0.3"></span>
                    <p data-i18n="ai_select_scene">Chọn một phân cảnh để xem trước</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Logs Console Panel -->
            <div class="studio-logs-console" id="studio-logs-console">
              <div class="logs-console-header">
                <div class="logs-console-title">
                  <span data-icon="terminal"></span> <span data-i18n="ai_activity_logs">Nhật ký hoạt động (Activity Logs)</span>
                  <span class="logs-count-badge" id="logs-count-badge">1 logs</span>
                </div>
                <div class="logs-console-actions">
                  <button class="studio-btn-xs" onclick="AIVideoStudio.copyLogs()" title="Sao chép Logs">
                    <span data-icon="copy"></span> <span data-i18n="ai_copy_logs">Sao chép Logs</span>
                  </button>
                  <button class="studio-btn-xs" onclick="AIVideoStudio.clearLogs()" title="Xóa Logs">
                    <span data-icon="trash"></span> <span data-i18n="ai_clear_logs">Xóa Logs</span>
                  </button>
                </div>
              </div>
              <div class="logs-output-body" id="studio-logs-output">
                <div class="log-line info"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-tag">[SYSTEM]</span> 🚀 Đã khởi động AI Video Studio Pipeline.</div>
              </div>
            </div>
          </div>

          <div class="studio-properties" id="studio-properties">
            <div class="properties-placeholder">
              <p data-i18n="ai_select_scene_props">Chọn một phân cảnh để chỉnh sửa thuộc tính</p>
            </div>
          </div>
        </div>

        <div class="studio-footer">
          <div class="footer-provider-status" id="footer-provider-status">
            <span class="provider-dot" id="footer-provider-dot"></span>
            <span id="footer-provider-text" data-i18n="ai_providers_loading">Đang kiểm tra AI Providers...</span>
          </div>
          <div class="footer-cost" id="footer-cost">
            <span data-i18n="ai_cost">Chi phí</span>: $0.00
          </div>
          <div class="footer-queue-status" id="footer-queue-status">
            <span data-i18n="ai_queue">Hàng đợi</span>: 0 <span data-i18n="ai_pending">đang chờ</span>
          </div>
        </div>
      </div>
    `

    this.injectStyles()
  },

  injectStyles() {
    if (document.getElementById('studio-css')) return
    const link = document.createElement('link')
    link.id = 'studio-css'
    link.rel = 'stylesheet'
    link.href = 'css/studio.css'
    document.head.appendChild(link)
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('studio-file-dropdown')
      const menuBtn = document.getElementById('studio-menu-btn')
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (menuBtn && (menuBtn.contains(e.target) || menuBtn === e.target)) return
        if (!dropdown.contains(e.target)) {
          dropdown.classList.add('hidden')
        }
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' && e.shiftKey) {
          e.preventDefault()
          this.saveAsProject()
        } else if (e.key === 's') {
          e.preventDefault()
          this.saveProject()
        } else if (e.key === 'o') {
          e.preventDefault()
          this.openProject()
        } else if (e.key === 'n') {
          e.preventDefault()
          this.newProject()
        } else if (e.key === 'e') {
          e.preventDefault()
          this.queueSubmit()
        }
      }
    })

    // Listen for queue events from main process
    if (IPC) {
      IPC.on('queue:event', (event, data) => {
        QueueStore._handleQueueEvent(data)
        if (data.type === 'job:completed' || data.type === 'job:failed') {
          this.loadJobList()
          this.addLog(data.type === 'job:completed' ? 'SUCCESS' : 'ERROR', `Render Job ${data.jobId}: ${data.type}`)
        }
      })

      IPC.on('ai-video-status', (event, statusText) => {
        this.addLog('RENDER', statusText)
      })

      IPC.on('ai-video-done', (event, finalFile) => {
        this.addLog('SUCCESS', `🎉 Hoàn tất video: ${finalFile}`)
      })

      IPC.on('recent-project:file-missing', (event, data) => {
        const missingPath = data?.filePath || data
        this.addLog('WARN', `⚠️ Phát hiện tệp dự án bị xóa trên đĩa: ${missingPath}`)
        showToast(_t('toast_warning', 'Cảnh báo tệp'), `Tệp dự án ${missingPath} đã bị xóa ngoài đĩa.`, 'warning')
        this.renderRecentList()
      })

      IPC.on('recent-project:updated', () => {
        this.renderRecentList()
      })

      IPC.on('active-project:file-deleted', (event, data) => {
        const projName = data?.name || 'dự án'
        this.addLog('ERROR', `❌ Tệp dự án "${projName}.eigu" đã bị xóa hoặc di chuyển khỏi hệ thống. Phiên làm việc đã được đóng.`)
        showToast(_t('toast_error', 'Đóng phiên dự án'), `Tệp dự án "${projName}.eigu" đã bị xóa hoặc di chuyển khỏi hệ thống. Phiên làm việc đã được đóng.`, 'error')
        StudioStore.reset()
        this.showInputMethods()
      })
    }
  },

  onStateChange(state) {
    this.updateHeader(state)
    this.updateSidebar(state)

    const centerPanel = document.getElementById('studio-center-panel')
    const inputMethods = document.getElementById('studio-input-methods')
    const hasProject = !!state.project
    const hasScenes = state.scenes && state.scenes.length > 0

    if (!hasProject && !state.isLoading) {
      if (centerPanel) centerPanel.classList.add('hidden')
      if (inputMethods) {
        inputMethods.style.display = ''
        this.renderRecentList()
      }
      const canvas = document.getElementById('storyboard-canvas')
      if (canvas) canvas.innerHTML = ''
    } else {
      if (centerPanel) centerPanel.classList.remove('hidden')
      if (inputMethods) inputMethods.style.display = 'none'
    }

    if (state.isLoading && !state.project) {
      const canvas = document.getElementById('storyboard-canvas')
      if (canvas) canvas.innerHTML = '<div class="storyboard-loading"><span data-icon="spinner"></span> Đang tải dự án...</div>'
    } else if (hasProject) {
      this.updateStoryboard(state)
    }
    this.updatePreview(state)
    this.updateProperties(state)
    this.updateFooter(state)
    this.reprocessIcons()
  },

  // ===== FILE OPERATIONS =====

  async newProject() {
    const dialogResult = await this.showNewProjectModal()
    if (!dialogResult) return

    const { name, aspectRatio } = dialogResult
    StudioStore.newProject(name, aspectRatio)
    this.addLog('INFO', `📁 Đã khởi tạo dự án "${name}" trong bộ nhớ.`)
    showToast(_t('toast_success', 'Thành công'), `Đã tạo dự án "${name}". Nhấn Ctrl+S để chọn nơi lưu file.`, 'success')
    this.showStudioPanels()
    this.onStateChange(StudioStore.getState())
  },

  showNewProjectModal() {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'studio-modal-overlay'
      overlay.innerHTML = `
        <div class="studio-modal" style="min-width: 380px;">
          <div class="studio-modal-header" style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Tạo Dự Án Video AI Mới</div>
          
          <div style="margin-bottom: 14px; text-align: left;">
            <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Tên dự án:</label>
            <input type="text" id="modal-project-name" class="studio-modal-input" value="Dự án Video AI mới" style="width:100%; box-sizing: border-box;" />
          </div>

          <div style="margin-bottom: 16px; text-align: left;">
            <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Tỉ lệ khung hình (Aspect Ratio):</label>
            <select id="modal-project-ratio" class="prop-select" style="width:100%;">
              <option value="9:16">9:16 (TikTok, Reels, Shorts)</option>
              <option value="16:9">16:9 (YouTube, HD Video)</option>
              <option value="1:1">1:1 (Instagram Feed)</option>
            </select>
          </div>

          <div class="studio-modal-actions">
            <button class="studio-btn studio-btn-secondary" id="modal-project-cancel">Hủy</button>
            <button class="studio-btn studio-btn-primary" id="modal-project-ok">Tạo dự án</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)

      const nameInput = overlay.querySelector('#modal-project-name')
      const ratioSelect = overlay.querySelector('#modal-project-ratio')

      overlay.querySelector('#modal-project-ok').onclick = () => {
        const name = nameInput.value.trim() || 'Dự án mới'
        const aspectRatio = ratioSelect.value
        overlay.remove()
        resolve({ name, aspectRatio })
      }

      overlay.querySelector('#modal-project-cancel').onclick = () => {
        overlay.remove()
        resolve(null)
      }

      setTimeout(() => nameInput?.focus(), 100)
    })
  },

  async openProject() {
    const success = await StudioStore.openProject()
    if (success) {
      this.showStudioPanels()
      this.addLog('INFO', `📂 Đã mở thành công tệp dự án: ${StudioStore.filePath}`)
      showToast(_t('toast_success', 'Thành công'), 'Đã mở dự án thành công!', 'success')
    }
  },

  async saveProject() {
    console.log('[DEBUG studio-main saveProject] Called. StudioStore.filePath BEFORE save:', StudioStore.filePath, 'isDirty:', StudioStore.isDirty)
    if (!StudioStore.filePath) {
      console.log('[DEBUG studio-main saveProject] filePath is null, delegating to saveAsProject()')
      return await this.saveAsProject()
    }
    const success = await StudioStore.saveProject()
    console.log('[DEBUG studio-main saveProject] StudioStore.saveProject result:', success, 'filePath:', StudioStore.filePath, 'isDirty:', StudioStore.isDirty)
    if (success) {
      this.addLog('INFO', `💾 Đã lưu thành công tệp dự án: ${StudioStore.filePath}`)
      showToast(_t('toast_success', 'Thành công'), 'Đã lưu tệp dự án thành công!', 'success')
    }
  },

  async saveAsProject() {
    console.log('[DEBUG studio-main saveAsProject] Called in studio-main.js')
    const result = await StudioStore.saveAsProject()
    console.log('[DEBUG studio-main saveAsProject] Result from StudioStore:', result, 'filePath:', StudioStore.filePath, 'isDirty:', StudioStore.isDirty)
    if (result) {
      showToast(_t('toast_success', 'Success'), 'Project saved!', 'success')
    }
  },

  async loadRecentProjects() {
    const recent = await IPC.invoke('project:recent')
    if (Array.isArray(recent)) {
      StudioStore.recentProjects = recent
    }
  },

  renderRecentList() {
    const el = document.getElementById('studio-recent-list')
    if (!el) return
    IPC.invoke('project:recent').then(projects => {
      if (!projects || projects.length === 0) {
        el.innerHTML = ''
        return
      }
      el.innerHTML = `
        <h4 style="margin:16px 0 8px;color:var(--text-secondary);font-size:13px;" data-i18n="ai_recent">Recent Projects</h4>
        ${projects.slice(0, 10).map(p => {
          const isMissing = !!p.isMissing
          return `
            <div class="recent-project-item ${isMissing ? 'missing' : ''}" onclick="AIVideoStudio.openRecent('${p.filePath.replace(/'/g, "\\'")}', ${isMissing})">
              <div style="display:flex;flex-direction:column;gap:2px;">
                <span class="recent-project-name">${p.name}</span>
                <span class="recent-project-meta">${isMissing ? '⚠️ Không tìm thấy file' : `${p.sceneCount} scenes · ${new Date(p.updatedAt).toLocaleDateString()}`}</span>
              </div>
              ${isMissing ? `
                <button class="btn-remove-recent" onclick="event.stopPropagation(); AIVideoStudio.removeRecent('${p.filePath.replace(/'/g, "\\'")}')">
                  Xóa khỏi danh sách
                </button>
              ` : ''}
            </div>
          `
        }).join('')}
      `
      this.reprocessIcons()
    }).catch(() => { })
  },

  async openRecent(filePath, isMissing) {
    if (isMissing) {
      showToast(_t('toast_error', 'Lỗi mở file'), `Không tìm thấy file dự án tại ${filePath}. File có thể đã bị xóa hoặc di chuyển.`, 'error')
      return
    }
    try {
      const result = await IPC.invoke('project:openPath', filePath)
      if (!result || !result.success) throw new Error(result?.error || 'File not found')
      StudioStore._loadFromEigu(result.project)
      StudioStore.filePath = result.filePath
      StudioStore.isDirty = false
      StudioStore._notify()
      this.showStudioPanels()
      showToast(_t('toast_success', 'Success'), 'Project opened!', 'success')
    } catch (err) {
      showToast(_t('toast_error', 'Lỗi'), `Không tìm thấy file dự án tại ${filePath}. File có thể đã bị xóa hoặc di chuyển.`, 'error')
      this.renderRecentList()
    }
  },

  async removeRecent(filePath) {
    try {
      if (IPC) {
        await IPC.invoke('project:removeRecent', filePath)
      }
    } catch (e) { }
    showToast(_t('toast_info', 'Đã xóa'), 'Đã loại bỏ dự án khỏi danh sách gần đây', 'info')
    this.renderRecentList()
  },

  showInputMethods() {
    document.getElementById('studio-input-methods')?.style.removeProperty('display')
    document.getElementById('studio-storyboard-panel')?.classList.add('hidden')
    this.renderRecentList()
  },

  showStudioPanels() {
    const inputMethods = document.getElementById('studio-input-methods')
    if (inputMethods) inputMethods.style.display = 'none'
    document.getElementById('studio-center-panel')?.classList.remove('hidden')
    document.getElementById('studio-storyboard-panel')?.classList.remove('hidden')
  },

  // ===== ERROR CODE DISPLAY =====

  showErrorFromCode(errorCode, message) {
    const translated = _errorMsg(errorCode, message)
    showToast(_t('toast_error', 'Error'), translated, 'error')
  },

  // ===== TAB SWITCHING =====

  switchTab(tab) {
    StudioStore.setSelectedTab(tab)
    document.querySelectorAll('.studio-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab))
    this.renderSidebarContent(tab)
    this.reprocessIcons()
    if (tab === 'queue') {
      this.loadJobList()
    } else {
      clearInterval(this._queuePollTimer)
      this._queuePollTimer = null
    }
  },

  // ===== MENU DROPDOWN =====

  toggleMenuDropdown(e) {
    if (e) e.stopPropagation()
    const dropdown = document.getElementById('studio-file-dropdown')
    if (!dropdown) return
    dropdown.classList.toggle('hidden')
  },

  // ===== ACTIVITY LOGS =====

  _logsCount: 1,
  addLog(type = 'INFO', message = '') {
    const output = document.getElementById('studio-logs-output')
    const badge = document.getElementById('logs-count-badge')
    if (!output) return

    this._logsCount++
    if (badge) badge.textContent = `${this._logsCount} logs`

    const time = new Date().toLocaleTimeString()
    const typeLower = type.toLowerCase()

    const div = document.createElement('div')
    div.className = `log-line ${typeLower}`
    div.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-tag">[${type.toUpperCase()}]</span> ${escapeHtml(message)}`

    output.appendChild(div)
    output.scrollTop = output.scrollHeight
  },

  copyLogs() {
    const output = document.getElementById('studio-logs-output')
    if (!output) return
    const text = output.innerText || output.textContent
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(_t('toast_success', 'Success'), '✅ Đã sao chép toàn bộ Activity Logs vào Clipboard!', 'success')
      }).catch(() => {
        this._fallbackCopyText(text)
      })
    } else {
      this._fallbackCopyText(text)
    }
  },

  _fallbackCopyText(text) {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast(_t('toast_success', 'Success'), '✅ Đã sao chép toàn bộ Activity Logs vào Clipboard!', 'success')
  },

  clearLogs() {
    const output = document.getElementById('studio-logs-output')
    const badge = document.getElementById('logs-count-badge')
    if (output) {
      this._logsCount = 0
      if (badge) badge.textContent = '0 logs'
      output.innerHTML = `<div class="log-line info"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-tag">[SYSTEM]</span> Đã xóa nhật ký hoạt động.</div>`
    }
  },

  renderLogsTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    return `
      <div class="sidebar-section-title">${tFn('ai_activity_logs')}</div>
      <div style="padding: 10px; font-size: 12px; color: var(--text-secondary);">
        <p style="margin-bottom: 8px;">Nhật ký hoạt động chi tiết của Module AI Video Studio.</p>
        <button class="studio-btn-sm full-width" onclick="AIVideoStudio.copyLogs()">
          <span data-icon="copy"></span> ${tFn('ai_copy_logs')}
        </button>
      </div>
    `
  },

  renderSidebarContent(tab) {
    const content = document.getElementById('studio-sidebar-content')
    if (!content) return
    const state = StudioStore.getState()

    switch (tab) {
      case 'story': content.innerHTML = this.renderStoryTab(state); break
      case 'scenes': content.innerHTML = this.renderScenesTab(state); break
      case 'characters': content.innerHTML = this.renderCharactersTab(state); break
      case 'assets': content.innerHTML = this.renderAssetsTab(state); break
      case 'brand': content.innerHTML = this.renderBrandTab(state); break
      case 'timeline': content.innerHTML = this.renderTimelineTab(state); break
      case 'queue': content.innerHTML = this.renderQueueTab(state); this.startQueuePolling(); break
      case 'logs': content.innerHTML = this.renderLogsTab(state); break
    }
    this.reprocessIcons()
  },

  _queuePollTimer: null,
  startQueuePolling() {
    clearInterval(this._queuePollTimer)
    this._queuePollTimer = setInterval(() => {
      this.loadJobList()
    }, 10000)
  },

  // ===== RENDER TABS =====

  renderStoryTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    return `
      <div class="sidebar-section-title">${tFn('ai_storyboard')}</div>
      <div class="sidebar-story-list">
        ${state.scenes.length === 0 ? '<p class="text-muted">' + tFn('ai_select_scene') + '</p>' :
        state.scenes.map((s, i) => `
            <div class="story-list-item ${s.id === state.selectedSceneId ? 'active' : ''}"
                 onclick="StudioStore.selectScene('${s.id}')" draggable="true">
              <span class="story-index">${i + 1}</span>
              <div class="story-preview-text">${(s.prompt || '').substring(0, 50)}...</div>
              <span class="story-duration">${s.duration}s</span>
              <button class="story-delete-btn" onclick="event.stopPropagation();AIVideoStudio.deleteScene('${s.id}')" title="Delete scene">&times;</button>
            </div>
          `).join('')
      }
      </div>
      <button class="studio-btn-sm full-width" onclick="AIVideoStudio.addScene()">
        <span data-icon="plus"></span> ${tFn('ai_add_scene')}
      </button>
    `
  },

  renderScenesTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    return `
      <div class="sidebar-section-title">${tFn('ai_scenes')} (${state.scenes.length})</div>
      <div class="sidebar-scene-list">
        ${state.scenes.map((s, i) => `
          <div class="scene-list-item ${s.id === state.selectedSceneId ? 'active' : ''}"
               onclick="StudioStore.selectScene('${s.id}')">
            <div class="scene-header">
              <span class="scene-number">#${i + 1}</span>
              <span class="scene-status status-${s.status}">${s.status}</span>
            </div>
            <div class="scene-meta">${s.duration}s · ${s.transition} · ${s.camera?.angle || 'auto'}</div>
            ${s.status === 'failed' ? `<button class="scene-retry-btn" onclick="event.stopPropagation();AIVideoStudio.retryScene('${s.id}')">Retry</button>` : ''}
          </div>
        `).join('')}
      </div>
    `
  },

  renderCharactersTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    return `
      <div class="sidebar-section-title">${tFn('ai_characters')}</div>
      <div class="sidebar-char-list">
        ${state.characters.length === 0 ?
        '<p class="text-muted">No characters yet</p>' :
        state.characters.map(c => `
            <div class="char-list-item">
              <div class="char-avatar">${(c.name || '?')[0]}</div>
              <div class="char-info">
                <span class="char-name">${c.name}</span>
                <span class="char-style">${c.style || 'realistic'} · ${c.age || 'adult'}</span>
              </div>
              <button class="char-edit-btn" onclick="event.stopPropagation();AIVideoStudio.editCharacter('${c.id}')" title="Edit">&#9998;</button>
              <button class="char-delete-btn" onclick="event.stopPropagation();AIVideoStudio.deleteCharacter('${c.id}')" title="Delete">&times;</button>
            </div>
          `).join('')
      }
      </div>
      <button class="studio-btn-sm full-width" onclick="AIVideoStudio.openCharacterModal()">
        <span data-icon="plus"></span> ${tFn('ai_new_character')}
      </button>
    `
  },

  renderAssetsTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    const grouped = {}
    for (const a of state.assets) {
      if (!grouped[a.type]) grouped[a.type] = []
      grouped[a.type].push(a)
    }
    const allTypes = ['image', 'video', 'audio', 'music', 'logo', 'intro', 'outro']
    return `
      <div class="sidebar-section-title">${tFn('ai_assets')}</div>
      <div class="sidebar-asset-types">
        ${allTypes.map(type => `
          <div class="asset-type-item" onclick="AIVideoStudio.openAssetUpload('${type}')">
            <span>${type}</span>
            <span>${(grouped[type] || []).length}</span>
          </div>
        `).join('')}
      </div>
      <div class="sidebar-asset-list">
        ${state.assets.length === 0 ? '<p class="text-muted">No assets yet</p>' :
        state.assets.map(a => `
            <div class="asset-list-item">
              ${a.type === 'image' && a.embedded ? `<span class="asset-icon">img</span>` : `<span class="asset-icon">${a.type[0]}</span>`}
              <div class="asset-info">
                <span class="asset-name">${a.originalName || a.filename}</span>
                <span class="asset-meta">${a.mimeType || a.type} · ${a.size ? (a.size / 1024).toFixed(1) + 'KB' : '?'} ${a.embedded ? '(embedded)' : '(link)'}</span>
              </div>
              <button class="asset-delete-btn" onclick="event.stopPropagation();AIVideoStudio.deleteAsset('${a.id}')" title="Delete">&times;</button>
            </div>
          `).join('')
      }
      </div>
    `
  },

  renderBrandTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    const bk = state.brandKit || {}
    return `
      <div class="sidebar-section-title">${tFn('ai_brand_kit')}</div>
      <div class="brand-kit-form">
        <label>Logo</label>
        <input class="prop-input" value="${bk.logo || ''}" placeholder="Asset path" onchange="AIVideoStudio.updateBrand({ logo: this.value })" />
        <label>${tFn('ai_primary_color')}</label>
        <input type="color" value="${bk.colors?.primary || '#6366f1'}" onchange="AIVideoStudio.updateBrand({ colors: { ...(StudioStore.brandKit?.colors || {}), primary: this.value } })" />
        <label>${tFn('ai_secondary_color')}</label>
        <input type="color" value="${bk.colors?.secondary || '#22c55e'}" onchange="AIVideoStudio.updateBrand({ colors: { ...(StudioStore.brandKit?.colors || {}), secondary: this.value } })" />
        <label>${tFn('ai_cta_text')}</label>
        <input class="prop-input" value="${bk.cta || ''}" placeholder="Shop now" onchange="AIVideoStudio.updateBrand({ cta: this.value })" />
        <label>${tFn('ai_brand_voice')}</label>
        <input class="prop-input" value="${bk.brandVoice || ''}" placeholder="Professional, friendly" onchange="AIVideoStudio.updateBrand({ brandVoice: this.value })" />
        <label>${tFn('ai_brand_style')}</label>
        <input class="prop-input" value="${bk.visualStyle || ''}" placeholder="Minimal, modern" onchange="AIVideoStudio.updateBrand({ visualStyle: this.value })" />
      </div>
    `
  },

  renderTimelineTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    if (state.scenes.length === 0) {
      return `<p class="text-muted">${tFn('ai_select_scene')}</p>`
    }
    let totalDuration = 0
    const tracks = state.scenes.map((s, i) => {
      const start = totalDuration
      totalDuration += s.duration || 5
      return { ...s, trackStart: start, trackEnd: totalDuration, index: i }
    })
    const pxPerSec = 60

    const videoTrack = tracks.map(s => `
      <div class="timeline-clip video-clip" style="left:${s.trackStart * pxPerSec}px;width:${(s.duration || 5) * pxPerSec}px;"
           onclick="StudioStore.selectScene('${s.id}')" title="${(s.prompt || '').substring(0, 40)}">
        Scene ${s.index + 1}
      </div>
    `).join('')

    return `
      <div class="sidebar-section-title">${tFn('ai_timeline')}</div>
      <div class="timeline-container">
        <div class="timeline-ruler" style="width:${Math.max(totalDuration * pxPerSec, 400)}px;">
          ${Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) =>
      `<div class="timeline-ruler-mark" style="left:${i * pxPerSec}px;"><span>${i}s</span></div>`
    ).join('')}
        </div>
        <div class="timeline-track timeline-video-track" style="width:${Math.max(totalDuration * pxPerSec, 400)}px;">
          <span class="timeline-track-label">Video</span>
          ${videoTrack}
        </div>
      </div>
      <div class="timeline-info">${tFn('ai_total_duration')}: ${totalDuration.toFixed(1)}s | ${tracks.length} scenes</div>
    `
  },

  renderQueueTab(state) {
    const tFn = typeof t === 'function' ? t : k => k
    const stats = QueueStore.stats || {}
    const jobs = QueueStore.jobs || []
    return `
      <div class="sidebar-section-title">${tFn('ai_render_queue')}</div>
      <div class="queue-stats">
        <div>${tFn('ai_pending')}: <strong>${stats.pending || 0}</strong></div>
        <div>${tFn('ai_active')}: <strong>${stats.active || 0}</strong></div>
        <div>${tFn('ai_completed')}: <strong>${stats.completed || 0}</strong></div>
        <div>${tFn('ai_failed')}: <strong>${stats.failed || 0}</strong></div>
        <div>Cancelled: <strong>${stats.cancelled || 0}</strong></div>
      </div>
      <div class="queue-job-list">
        ${jobs.length === 0 ? '<p class="text-muted">No render jobs</p>' :
        jobs.map(j => `
            <div class="queue-job-item status-${j.status}">
              <div class="job-header">
                <span class="job-type">${j.type}</span>
                <span class="job-status status-${j.status}">${j.status}</span>
              </div>
              <div class="job-meta">${j.provider || '?'} · Scene ${(state.scenes.findIndex(s => s.id === j.sceneId) + 1) || '?'}</div>
              ${j.status === 'processing' && j.progress != null ? `<div class="job-progress"><div class="job-progress-bar" style="width:${j.progress}%"></div></div>` : ''}
              ${j.error ? `<div class="job-error">${j.error}</div>` : ''}
              <div class="job-actions">
                ${['queued', 'processing'].includes(j.status) ? `<button class="studio-btn-xs" onclick="AIVideoStudio.cancelJob('${j.id}')">${tFn('ai_cancel')}</button>` : ''}
                ${j.status === 'failed' ? `<button class="studio-btn-xs" onclick="AIVideoStudio.retryJob('${j.id}')">${tFn('ai_retry')}</button>` : ''}
              </div>
            </div>
          `).join('')
      }
      </div>
      ${state.filePath ? `
        <button class="studio-btn full-width" onclick="AIVideoStudio.queueSubmit()">
          <span data-icon="zap"></span> <span data-i18n="ai_submit_all">Submit Render</span>
        </button>
      ` : ''}
    `
  },

  // ===== STORYBOARD =====

  updateStoryboard(state) {
    const canvas = document.getElementById('storyboard-canvas')
    if (state.scenes.length === 0) {
      const projName = state.project?.name || 'Dự án mới'
      canvas.innerHTML = `
        <div class="storyboard-empty-state" style="padding: 50px 20px; text-align: center; color: var(--text-secondary); max-width: 500px; margin: 40px auto; background: rgba(30, 41, 59, 0.5); border: 1px dashed var(--border-color); border-radius: 12px;">
          <span data-icon="sparkles" style="font-size: 40px; color: var(--accent-color); display: block; margin-bottom: 12px;"></span>
          <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 16px; font-weight: 700;">Dự án "${projName}" đã sẵn sàng!</h4>
          <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5;">Tệp dự án .eigu đã được khởi tạo thành công. Bấm chọn thao tác dưới đây để bắt đầu soạn phân cảnh video:</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="studio-btn studio-btn-primary" onclick="AIVideoStudio.addScene()">+ Thêm cảnh mới</button>
            <button class="studio-btn studio-btn-secondary" onclick="AIVideoStudio.showInputDialog('idea')">✨ AI Tạo kịch bản</button>
          </div>
        </div>
      `
      this.reprocessIcons()
      return
    }

    canvas.innerHTML = state.scenes.map((s, i) => {
      const thumbHtml = s.output
        ? `<video src="file://${s.output}" muted></video>`
        : s.status === 'failed'
          ? `<span data-icon="alert"></span>`
          : `<span data-icon="image"></span>`
      const statusClass = s.status === 'failed' ? 'status-failed' : s.status === 'queued' || s.status === 'processing' ? 'status-processing' : 'status-draft'
      return `
      <div class="scene-card ${s.id === state.selectedSceneId ? 'selected' : ''}"
           onclick="StudioStore.selectScene('${s.id}')"
           draggable="true" data-index="${i}">
        <div class="scene-card-thumb">${thumbHtml}</div>
        <div class="scene-card-info">
          <span class="scene-card-number">Scene ${i + 1} ${s.duration ? `&middot; ${s.duration}s` : ''}</span>
          <span class="scene-card-prompt">${s.prompt ? escapeHtml(s.prompt) : 'No prompt'}</span>
        </div>
        <div class="scene-card-status ${statusClass}">
          <span>${s.status}</span>
          ${s.status === 'failed' ? `<button class="scene-retry-btn-sm" onclick="event.stopPropagation();AIVideoStudio.retryScene('${s.id}')" title="Retry">&#x21bb;</button>` : ''}
          <button class="scene-card-delete" onclick="event.stopPropagation();AIVideoStudio.deleteScene('${s.id}')" title="Delete">&times;</button>
        </div>
      </div>`
    }).join('')
  },

  // ===== PREVIEW =====

  updatePreview(state) {
    const viewport = document.getElementById('preview-viewport')
    if (!viewport) return

    const scene = state.scenes.find(s => s.id === state.selectedSceneId)
    if (!scene) {
      viewport.innerHTML = `
        <div class="preview-placeholder">
          <span data-icon="playCircle" style="font-size:48px;opacity:0.3"></span>
          <p>Select a scene to preview</p>
        </div>
      `
      return
    }

    const aspectStyle = state.project?.aspectRatio?.replace(':', '/') || '16/9'
    viewport.innerHTML = `
      <div class="preview-container" style="aspect-ratio: ${aspectStyle}; max-height: 400px; background: #000; border-radius: 8px; overflow: hidden;">
        ${scene.output
        ? `<video src="file://${scene.output}" controls style="width:100%;height:100%;object-fit:contain;"></video>`
        : scene.status === 'failed'
          ? `<div class="preview-status-screen error"><span data-icon="alert"></span><span>${scene.error || 'Render failed'}</span></div>`
          : scene.status === 'completed'
            ? `<div class="preview-status-screen"><span data-icon="checkCircle"></span><span>Scene ${scene.index + 1}: Rendered</span></div>`
            : `<div class="preview-status-screen pending">
                   <span data-icon="clock"></span>
                   <span>Scene ${scene.index + 1}: ${scene.status || 'draft'}</span>
                   <small style="opacity:0.6">${(scene.prompt || '').substring(0, 80) || 'No prompt yet'}</small>
                 </div>`
      }
      </div>
    `
  },

  // ===== PROPERTIES =====

  updateProperties(state) {
    const panel = document.getElementById('studio-properties')
    if (!panel) return

    const scene = state.scenes.find(s => s.id === state.selectedSceneId)
    if (!scene) {
      panel.innerHTML = '<div class="properties-placeholder"><p>Select a scene to edit properties</p></div>'
      return
    }

    panel.innerHTML = `
      <div class="properties-header">
        Scene ${scene.index + 1}: ${(scene.prompt || 'Untitled').substring(0, 40)}
        <span class="prop-status status-${scene.status}">${scene.status}</span>
      </div>
      <div class="properties-scroll">
        <!-- Section 1: Nội dung -->
        <div class="prop-section">
          <div class="prop-section-title"><span data-icon="fileText"></span> Nội dung</div>
          <div class="prop-group">
            <label data-i18n="prop_prompt">Prompt chính</label>
            <textarea class="prop-textarea" rows="3" placeholder="Mô tả phân cảnh..."
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { prompt: this.value })">${scene.prompt || ''}</textarea>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_negative_prompt">Negative Prompt (Loại trừ)</label>
            <textarea class="prop-textarea" rows="2" placeholder="blurry, distorted..."
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { negativePrompt: this.value })">${scene.negativePrompt || ''}</textarea>
          </div>
        </div>

        <!-- Section 2: Hình ảnh -->
        <div class="prop-section">
          <div class="prop-section-title"><span data-icon="video"></span> Hình ảnh & Máy quay</div>
          <div class="prop-row">
            <div class="prop-group">
              <label data-i18n="prop_duration">Thời lượng (s)</label>
              <input type="number" class="prop-input" value="${scene.duration}" min="1" max="30"
                onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { duration: parseFloat(this.value) })" />
            </div>
            <div class="prop-group">
              <label data-i18n="prop_seed">Seed</label>
              <input type="number" class="prop-input" value="${scene.seed || ''}" placeholder="Ngẫu nhiên"
                onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { seed: parseInt(this.value) || undefined })" />
            </div>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_transition">Chuyển cảnh (Transition)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { transition: this.value })">
              ${['cut', 'fade', 'dissolve', 'slide', 'zoom', 'wipe'].map(t =>
      `<option value="${t}" ${scene.transition === t ? 'selected' : ''}>${t}</option>`
    ).join('')}
            </select>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_camera">Góc quay (Camera)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { camera: { angle: this.value, movement: 'static' } })">
              ${['wide', 'medium', 'closeup', 'extreme-closeup', 'aerial', 'POV'].map(c =>
      `<option value="${c}" ${scene.camera?.angle === c ? 'selected' : ''}>${c}</option>`
    ).join('')}
            </select>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_lighting">Ánh sáng (Lighting)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { lighting: this.value })">
              ${['natural', 'dramatic', 'neon', 'golden-hour', 'moody', 'studio'].map(l =>
      `<option value="${l}" ${scene.lighting === l ? 'selected' : ''}>${l}</option>`
    ).join('')}
            </select>
          </div>
        </div>

        <!-- Section 3: Âm thanh -->
        <div class="prop-section">
          <div class="prop-section-title"><span data-icon="volume2"></span> Âm thanh & Lồng tiếng</div>
          <div class="prop-group">
            <label data-i18n="prop_voiceline">Lời thoại (Voice Line)</label>
            <textarea class="prop-textarea" rows="2" placeholder="Nhập lời thoại..."
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { voiceLine: this.value })">${scene.voiceLine || ''}</textarea>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_music_mood">Cảm xúc nhạc (Music Mood)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { musicMood: this.value })">
              ${['', 'upbeat', 'cinematic', 'calm', 'corporate', 'ambient', 'motivation', 'sad'].map(m =>
      `<option value="${m}" ${scene.musicMood === m ? 'selected' : ''}>${m || 'Không chọn'}</option>`
    ).join('')}
            </select>
          </div>
        </div>

        <!-- Section 4: Nhân vật & Cảm xúc -->
        <div class="prop-section">
          <div class="prop-section-title"><span data-icon="user"></span> Nhân vật & Cảm xúc</div>
          <div class="prop-group">
            <label data-i18n="prop_character">Nhân vật chính</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { characterIds: [this.value] })">
              <option value="">Không có</option>
              ${state.characters.map(c =>
      `<option value="${c.id}" ${(scene.characterIds || []).includes(c.id) ? 'selected' : ''}>${c.name}</option>`
    ).join('')}
            </select>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_emotion">Biểu cảm (Emotion)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { emotion: this.value })">
              ${['neutral', 'happy', 'sad', 'angry', 'surprised'].map(e =>
      `<option value="${e}" ${scene.emotion === e ? 'selected' : ''}>${e}</option>`
    ).join('')}
            </select>
          </div>
          <div class="prop-locks">
            <label class="lock-checkbox"><input type="checkbox" ${scene.lockFace ? 'checked' : ''}
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { lockFace: this.checked })" /> Khóa Khuôn mặt</label>
            <label class="lock-checkbox"><input type="checkbox" ${scene.lockStyle ? 'checked' : ''}
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { lockStyle: this.checked })" /> Khóa Phong cách</label>
            <label class="lock-checkbox"><input type="checkbox" ${scene.lockOutfit ? 'checked' : ''}
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { lockOutfit: this.checked })" /> Khóa Trang phục</label>
            <label class="lock-checkbox"><input type="checkbox" ${scene.lockSeed ? 'checked' : ''}
              onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { lockSeed: this.checked })" /> Khóa Seed</label>
          </div>
        </div>

        <!-- Section 5: Provider & Trạng thái -->
        <div class="prop-section">
          <div class="prop-section-title"><span data-icon="activity"></span> Provider & Trạng thái</div>
          <div class="prop-group">
            <label data-i18n="prop_provider">Nền tảng Render (Provider)</label>
            <select class="prop-select" onchange="AIVideoStudio.updateSceneProperty('${scene.id}', { providerId: this.value })">
              <option value="">Mặc định (Veo 3)</option>
              ${(state.providers || []).map(p =>
      `<option value="${p.name}" ${scene.providerId === p.name ? 'selected' : ''}>${p.displayName}</option>`
    ).join('')}
            </select>
          </div>
          <div class="prop-group">
            <label data-i18n="prop_status">Trạng thái hiện tại</label>
            <div class="scene-status-large status-${scene.status}">${scene.status}</div>
            ${scene.renderTime ? `<div class="prop-meta">Thời gian render: ${scene.renderTime}s</div>` : ''}
            ${scene.cost ? `<div class="prop-meta">Chi phí: $${scene.cost.toFixed(2)}</div>` : ''}
          </div>
          ${scene.error ? `<div class="prop-error">Lỗi: ${scene.error}</div>` : ''}
          ${scene.status === 'failed' ? `<button class="studio-btn-sm full-width" onclick="AIVideoStudio.retryScene('${scene.id}')">Thử lại (Retry)</button>` : ''}
        </div>
      </div>
    `
  },

  // ===== HEADER / FOOTER =====

  updateHeader(state) {
    console.log('[DEBUG updateHeader] Called with isDirty:', state?.isDirty, 'filePath:', state?.filePath, 'projectName:', state?.project?.name)
    const nameEl = document.getElementById('studio-project-name')
    const status = document.getElementById('studio-project-status')
    const indicator = document.getElementById('studio-save-indicator')

    const tFn = typeof t === 'function' ? t : k => k
    if (state.project) {
      const dirtyMark = state.isDirty ? ' *' : ''
      if (nameEl) nameEl.textContent = `${state.project.name}${dirtyMark}`
      if (status) {
        status.className = `studio-status-badge ${state.project.status || 'draft'}`
        status.textContent = tFn('ai_' + (state.project.status || 'draft')) || state.project.status
      }
    } else {
      if (nameEl) nameEl.textContent = tFn('ai_no_project')
      if (status) {
        status.className = 'studio-status-badge draft'
        status.textContent = ''
      }
    }
    if (indicator) {
      indicator.textContent = ''
    }
  },

  updateFooter(state) {
    const tFn = typeof t === 'function' ? t : k => k
    const costEl = document.getElementById('footer-cost')
    const queueEl = document.getElementById('footer-queue-status')

    const totalScenes = state.scenes?.length || 0
    const renderedScenes = state.scenes?.filter(s => s.status === 'completed')?.length || 0
    const totalCost = state.scenes?.reduce((acc, s) => acc + (s.cost || 0), 0) || state.project?.cost || 0
    const totalRenderTime = state.scenes?.reduce((acc, s) => acc + (s.renderTime || 0), 0) || 0

    if (costEl) {
      costEl.innerHTML = `${tFn('ai_cost')}: $${totalCost.toFixed(2)}`
    }
    if (queueEl) {
      queueEl.innerHTML = `Stats: ${renderedScenes}/${totalScenes} scenes (${totalRenderTime}s) · Queue: ${QueueStore.stats?.pending || 0}`
    }
  },

  updateSidebar(state) { },

  // ===== PROVIDER HEALTH =====

  async fetchProviderHealth() {
    try {
      const providers = await IPC.invoke('provider:health')
      const dot = document.getElementById('footer-provider-dot')
      const text = document.getElementById('footer-provider-text')
      const activeCount = providers.filter(p => p.status === 'available').length
      const avgLatency = providers[0]?.latencyMs || 25
      if (dot) dot.className = `provider-dot ${activeCount > 0 ? 'active' : 'inactive'}`
      if (text) text.textContent = activeCount > 0
        ? `${activeCount}/${providers.length} ready (${avgLatency}ms)`
        : 'No providers available'

      StudioStore.providers = await IPC.invoke('provider:list')
    } catch (e) { /* silent */ }
  },

  // ===== SCENE OPERATIONS =====

  async addScene() {
    const sceneId = 'scene_' + (StudioStore.scenes.length + 1) + '_' + Date.now().toString().slice(-4)
    const newScene = {
      id: sceneId,
      index: StudioStore.scenes.length,
      prompt: 'Phân cảnh mới - Nhập mô tả kịch bản tại đây...',
      negativePrompt: 'blurry, low quality',
      duration: 5,
      transition: 'cut',
      camera: { angle: 'medium', movement: 'static' },
      lighting: 'natural',
      emotion: 'neutral',
      status: 'pending'
    }
    StudioStore.addScene(newScene)
    StudioStore.selectScene(sceneId)
    this.reprocessIcons()
    this.addLog('INFO', `➕ Đã thêm Phân cảnh mới (Scene ${StudioStore.scenes.length}).`)
    showToast(_t('toast_success', 'Success'), 'Đã thêm Phân cảnh mới!', 'success')
  },

  async updateSceneProperty(sceneId, patch) {
    StudioStore.updateScene(sceneId, patch)
  },

  async deleteScene(sceneId) {
    const confirmed = await this.confirmAction('Delete this scene?')
    if (!confirmed) return
    await StudioStore.removeScene(sceneId)
    this.addLog('INFO', `🗑️ Đã xóa phân cảnh ${sceneId}`)
    showToast(_t('toast_success', 'Success'), 'Scene deleted', 'success')
    this.reprocessIcons()
  },

  async retryScene(sceneId) {
    StudioStore.updateScene(sceneId, { status: 'pending', error: null })
    if (IPC) {
      await IPC.invoke('scene:update', { sceneId, patch: { status: 'pending', error: null } }).catch(() => { })
    }
    this.addLog('INFO', `🔄 Khởi động lại Render cho Scene ${sceneId}`)
    showToast(_t('toast_success', 'Success'), 'Scene reset for retry', 'success')
  },

  // ===== RENDER =====

  async queueSubmit() {
    if (!StudioStore.filePath) {
      showToast(_t('toast_error', 'Lỗi Render'), 'Vui lòng lưu dự án (Ctrl+S) trước khi thực hiện Render. Video render cần được nén và quản lý cạnh tệp dự án.', 'error')
      this.addLog('WARN', '⚠️ Từ chối lệnh Render: Dự án chưa được lưu ra đĩa (Ctrl+S).')
      return
    }

    if (!StudioStore.scenes || StudioStore.scenes.length === 0) {
      showToast(_t('toast_info', 'Info'), 'Chưa có phân cảnh nào để render! Vui lòng thêm cảnh.', 'info')
      return
    }

    const renderBtn = document.getElementById('studio-render-btn')
    if (renderBtn) renderBtn.disabled = true

    this.addLog('RENDER', `🎬 Đã gửi lệnh Render Hàng loạt cho ${StudioStore.scenes.length} phân cảnh...`)
    showToast(_t('toast_info', 'Info'), 'Đang gửi lệnh Render xuống hệ thống...', 'info')

    // Mark scenes as processing
    StudioStore.scenes = StudioStore.scenes.map(s => ({ ...s, status: 'processing', error: null }))
    StudioStore._notify()

    if (IPC) {
      IPC.send('start-ai-video', {
        prompts: StudioStore.scenes.map(s => s.prompt),
        model: 'veo3',
        ratio: StudioStore.project?.aspectRatio || '9:16'
      })
    } else {
      if (renderBtn) renderBtn.disabled = true
      this.addLog('ERROR', '❌ Không thể kết nối tới Render Engine (IPC unavailable)')
      showToast(_t('toast_error', 'Lỗi'), 'Không thể kết nối tới Render Engine (IPC unavailable)', 'error')
    }
  },

  async loadJobList() {
    try {
      if (IPC) {
        const result = await IPC.invoke('render:queue')
        if (result) {
          QueueStore.jobs = result.jobs || []
          QueueStore.stats = result.stats || { pending: 0, active: 0, completed: 0, failed: 0, cancelled: 0, total: 0 }
          QueueStore._notify()
        }
      }
    } catch (e) { /* silent */ }
  },

  async retryJob(jobId) {
    if (IPC) {
      const result = await IPC.invoke('render:retry', jobId)
      if (result?.success) {
        showToast(_t('toast_success', 'Success'), 'Job retry queued', 'success')
        this.loadJobList()
      }
    }
  },

  async cancelJob(jobId) {
    if (IPC) {
      const result = await IPC.invoke('render:cancel', jobId)
      if (result?.success) {
        showToast(_t('toast_success', 'Success'), 'Job cancelled', 'success')
        this.loadJobList()
      }
    }
  },

  // ===== BRAND KIT =====

  async updateBrand(patch) {
    StudioStore.brandKit = { ...(StudioStore.brandKit || {}), ...patch }
    StudioStore._notify()
    if (IPC) await IPC.invoke('brandKit:update', patch).catch(() => { })
  },

  // ===== CHARACTERS =====

  async editCharacter(charId) {
    const c = StudioStore.characters.find(ch => ch.id === charId)
    if (!c) return
    const newName = await this.showModalPrompt('Character name:', c.name)
    if (!newName || newName === c.name) return
    await StudioStore.updateCharacter(charId, { name: newName })
    showToast(_t('toast_success', 'Success'), 'Character updated!', 'success')
  },

  async deleteCharacter(charId) {
    const confirmed = await this.confirmAction('Delete this character?')
    if (!confirmed) return
    await StudioStore.removeCharacter(charId)
    showToast(_t('toast_success', 'Success'), 'Character deleted', 'success')
    this.reprocessIcons()
  },

  async openCharacterModal() {
    const name = await this.showModalPrompt('Character name:')
    if (!name) return
    const character = {
      id: 'char_' + Math.random().toString(36).slice(2, 10),
      name,
      appearance: '',
      clothing: '',
      style: 'realistic',
      personality: '',
      voiceId: null,
      referenceImages: [],
      generationSettings: {},
      lockedAttributes: [],
      version: 1,
    }
    await StudioStore.addCharacter(character)
    showToast(_t('toast_success', 'Success'), 'Character created!', 'success')
  },

  // ===== ASSETS =====

  async deleteAsset(assetId) {
    const confirmed = await this.confirmAction('Delete this asset?')
    if (!confirmed) return
    await StudioStore.removeAsset(assetId)
    showToast(_t('toast_success', 'Success'), 'Asset deleted', 'success')
    this.reprocessIcons()
  },

  openAssetUpload(type) {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        if (IPC) {
          const result = await IPC.invoke('asset:importPath', file.path || file.name)
          if (result && result.success) {
            StudioStore.assets.push(result.asset)
            StudioStore._notify()
            showToast(_t('toast_success', 'Success'), `${type} uploaded!`, 'success')
            this.reprocessIcons()
            return
          }
        }
        showToast(_t('toast_error', 'Lỗi'), 'Không thể nhập tài nguyên (IPC unavailable)', 'error')
      } catch (err) {
        showToast(_t('toast_error', 'Error'), err.message, 'error')
      }
    }
    input.click()
  },

  // ===== INPUT DIALOG =====

  async showInputDialog(method) {
    if (!StudioStore.project) {
      showToast(_t('toast_info', 'Info'), 'Vui lòng mở hoặc tạo dự án trước khi sử dụng AI Tạo kịch bản!', 'info')
      return
    }
    const title = method === 'idea' ? 'Ý tưởng / Kịch bản' : method.toUpperCase()
    const input = await this.showModalTextarea(`Nhập nội dung ${title}:`, `Dán ý tưởng hoặc mô tả kịch bản để AI tự động phân tách các phân cảnh (Scenes)...`)
    if (!input) return

    showToast(_t('toast_info', 'Info'), 'Đang sinh kịch bản phân cảnh từ AI...', 'info')
    try {
      let response = null
      if (IPC) {
        response = await IPC.invoke('ai-video-generate-prompts', { text: input, mode: method })
      }
      
      let prompts = []
      if (Array.isArray(response)) {
        prompts = response
      } else if (response && response.success && Array.isArray(response.prompts)) {
        prompts = response.prompts
      } else if (response && response.error) {
        showToast(_t('toast_error', 'Lỗi AI Director'), response.error, 'error')
        return
      }

      if (!Array.isArray(prompts) || prompts.length === 0) {
        const fallbackMsg = (response && response.error) ? response.error : 'Không thể khởi tạo kịch bản từ AI Director (IPC/Engine response empty)';
        showToast(_t('toast_error', 'Lỗi AI Director'), fallbackMsg, 'error')
        return
      }
      StudioStore.scenes = prompts.map((p, i) => ({
        id: `scene_${i + 1}_${Date.now().toString().slice(-4)}`,
        index: i,
        prompt: p,
        negativePrompt: 'blurry, noise, low quality',
        duration: 5,
        transition: i === 0 ? 'cut' : 'fade',
        camera: { angle: i % 2 === 0 ? 'drone' : 'closeup', movement: 'pan' },
        lighting: 'cinematic',
        emotion: 'dynamic',
        status: 'pending'
      }))
      StudioStore.selectedSceneId = StudioStore.scenes[0].id
      StudioStore.isDirty = true
      StudioStore._notify()
      showToast(_t('toast_success', 'Success'), `Đã sinh ${prompts.length} phân cảnh AI thành công!`, 'success')
    } catch (err) {
      showToast(_t('toast_error', 'Lỗi AI Director'), err.message || 'Lỗi khi sinh kịch bản AI', 'error')
    }
  },

  async generateFromAI() {
    if (!StudioStore.filePath) return
    const scene = await StudioStore.addScene({
      prompt: 'AI generated scene',
      duration: 5,
      transition: 'cut',
      status: 'draft',
    })
    if (scene) this.reprocessIcons()
  },

  // ===== MODALS =====

  showModalPrompt(message, defaultValue = '') {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'studio-modal-overlay'
      overlay.innerHTML = `
        <div class="studio-modal">
          <div class="studio-modal-header">${message}</div>
          <input type="text" class="studio-modal-input" id="modal-prompt-input" value="${defaultValue}" autofocus />
          <div class="studio-modal-actions">
            <button class="studio-btn studio-btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button class="studio-btn studio-btn-primary" id="modal-ok-btn">OK</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)
      const input = overlay.querySelector('#modal-prompt-input')
      overlay.querySelector('#modal-ok-btn').onclick = () => { overlay.remove(); resolve(input.value) }
      overlay.querySelector('#modal-cancel-btn').onclick = () => { overlay.remove(); resolve(null) }
      input.onkeydown = e => {
        if (e.key === 'Enter') { overlay.remove(); resolve(input.value) }
        if (e.key === 'Escape') { overlay.remove(); resolve(null) }
      }
      setTimeout(() => input?.focus(), 100)
    })
  },

  showModalTextarea(title, placeholder = '') {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'studio-modal-overlay'
      overlay.innerHTML = `
        <div class="studio-modal" style="min-width:500px;">
          <div class="studio-modal-header">${title}</div>
          <textarea class="studio-modal-textarea" id="modal-textarea-input" placeholder="${placeholder}" rows="6"></textarea>
          <div class="studio-modal-actions">
            <button class="studio-btn" id="modal-textarea-cancel-btn">Cancel</button>
            <button class="studio-btn studio-btn-primary" id="modal-textarea-ok-btn">OK</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)
      const input = overlay.querySelector('#modal-textarea-input')
      overlay.querySelector('#modal-textarea-ok-btn').onclick = () => { overlay.remove(); resolve(input.value) }
      overlay.querySelector('#modal-textarea-cancel-btn').onclick = () => { overlay.remove(); resolve(null) }
      input.onkeydown = e => { if (e.key === 'Escape') { overlay.remove(); resolve(null) } }
      setTimeout(() => input?.focus(), 100)
    })
  },

  confirmAction(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'studio-modal-overlay'
      overlay.innerHTML = `
        <div class="studio-modal" style="max-width: 400px;">
          <div class="studio-modal-header" style="font-size: 14px; color: var(--text-primary); margin-bottom: 8px;">${message}</div>
          <div class="studio-modal-actions" style="justify-content: center;">
            <button class="studio-btn studio-btn-secondary" id="confirm-no-btn">Cancel</button>
            <button class="studio-btn studio-btn-primary" id="confirm-yes-btn" style="background: #dc2626; border-color: #dc2626;">Delete</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)
      overlay.querySelector('#confirm-yes-btn').onclick = () => { overlay.remove(); resolve(true) }
      overlay.querySelector('#confirm-no-btn').onclick = () => { overlay.remove(); resolve(false) }
      overlay.querySelector('.studio-modal').onkeydown = e => {
        if (e.key === 'Escape') { overlay.remove(); resolve(false) }
      }
      setTimeout(() => overlay.querySelector('#confirm-no-btn')?.focus(), 100)
    })
  },

  reprocessIcons() {
    if (typeof ICONS !== 'undefined') {
      document.querySelectorAll('.studio-root [data-icon]').forEach(e => {
        e.innerHTML = ICONS[e.dataset.icon] || ''
        e.removeAttribute('data-icon')
      })
    }
  },
}

const originalSwitchView = window.switchView
window.switchView = function (view, ...args) {
  if (view === 'ai-studio' || view === 'ai-video') { AIVideoStudio.init('#studio-root') }
  if (originalSwitchView) { return originalSwitchView(view, ...args) }
}
