function sanitizeFileName(input) {
  if (!input || typeof input !== 'string') return 'Untitled_Project';
  let str = input.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/\s+/g, '_');
  str = str.replace(/[^a-zA-Z0-9_-]/g, '');
  str = str.replace(/_+/g, '_');
  str = str.replace(/^[-_]+|[-_]+$/g, '');
  if (!str) str = 'Untitled_Project';
  if (str.length > 100) str = str.substring(0, 100);
  return str;
}

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

const StudioStore = {
  project: null,
  filePath: null,
  scenes: [],
  characters: [],
  assets: [],
  brandKit: null,
  providers: [],
  timeline: null,
  selectedSceneId: null,
  selectedCharacterId: null,
  selectedTab: 'story',
  viewMode: 'storyboard',
  isDirty: false,
  isLoading: false,
  error: null,

  reset() {
    this.project = null;
    this.filePath = null;
    this.scenes = [];
    this.characters = [];
    this.assets = [];
    this.brandKit = null;
    this.providers = [];
    this.timeline = null;
    this.selectedSceneId = null;
    this.selectedCharacterId = null;
    this.selectedTab = 'story';
    this.viewMode = 'storyboard';
    this.isDirty = false;
    this.isLoading = false;
    this.error = null;
    this._notify();
  },

  _listeners: [],

  subscribe(fn) {
    this._listeners.push(fn)
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn)
    }
  },

  _notify() {
    this._listeners.forEach(fn => fn(this.getState()))
  },

  getState() {
    return {
      project: this.project,
      filePath: this.filePath,
      scenes: this.scenes,
      characters: this.characters,
      assets: this.assets,
      brandKit: this.brandKit,
      providers: this.providers,
      timeline: this.timeline,
      selectedSceneId: this.selectedSceneId,
      selectedTab: this.selectedTab,
      viewMode: this.viewMode,
      isDirty: this.isDirty,
      isLoading: this.isLoading,
      error: this.error,
    }
  },

  // ===== FILE OPERATIONS =====

  newProject(name, aspectRatio = '9:16') {
    const rawName = name || 'Dự án Video AI mới'
    const cleanName = sanitizeFileName(rawName)
    this.project = {
      id: 'proj_' + Date.now(),
      name: cleanName,
      description: 'Dự án kịch bản & phân cảnh Video AI',
      status: 'draft',
      aspectRatio: aspectRatio || '9:16',
      resolution: aspectRatio === '16:9' ? '1920x1080' : aspectRatio === '1:1' ? '1080x1080' : '1080x1920',
      fps: 30,
      cost: 0,
      totalScenes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.scenes = []
    this.characters = []
    this.assets = []
    this.selectedSceneId = null
    this.filePath = null
    this.isDirty = true
    this.error = null
    this.isLoading = false
    this._notify()
    return true
  },

  async openProject() {
    this.isLoading = true
    this._notify()
    try {
      const result = await IPC.invoke('project:openDialog')
      if (result.canceled) return false
      if (!result.success) throw new Error(result.error)
      this._loadFromEigu(result.project)
      this.filePath = result.filePath
      this.isDirty = false
      this.error = null
      return true
    } catch (err) {
      this.error = err.message
      return false
    } finally {
      this.isLoading = false
      this._notify()
    }
  },

  async saveProject() {
    if (!this.project) return false
    if (!this.filePath) {
      return await this.saveAsProject()
    }
    try {
      const payload = {
        project: this.project,
        scenes: this.scenes,
        characters: this.characters,
        assets: this.assets,
        brandKit: this.brandKit
      }
      console.log('[DEBUG StudioStore.saveProject] Invoking IPC project:save with payload:', payload)
      const result = await IPC.invoke('project:save', payload)
      console.log('[DEBUG StudioStore.saveProject] Received IPC result:', result)
      if (result && result.canceled) return false
      if (!result || !result.success) throw new Error(result?.error || 'Save failed')
      if (result.name && this.project) {
        this.project.name = result.name
      }
      this.isDirty = false
      console.log('[DEBUG StudioStore.saveProject] Setting isDirty = false, notifying subscribers. filePath:', this.filePath)
      this._notify()
      return true
    } catch (err) {
      console.error('[DEBUG StudioStore.saveProject] Error:', err.message)
      this.error = err.message
      this._notify()
      return false
    }
  },

  async saveAsProject() {
    if (!this.project) return false
    try {
      const payload = {
        project: this.project,
        scenes: this.scenes,
        characters: this.characters,
        assets: this.assets,
        brandKit: this.brandKit
      }
      console.log('[DEBUG StudioStore.saveAsProject] Invoking IPC project:saveAs with payload:', payload)
      const result = await IPC.invoke('project:saveAs', payload)
      console.log('[DEBUG StudioStore.saveAsProject] Received IPC result:', result)
      if (result && result.canceled) return false
      if (!result || !result.success) throw new Error(result?.error || 'SaveAs failed')
      if (result.name && this.project) {
        this.project.name = result.name
      }
      this.filePath = result.filePath
      this.isDirty = false
      console.log('[DEBUG StudioStore.saveAsProject] Updated store filePath:', this.filePath, 'isDirty:', this.isDirty, 'name:', this.project?.name)
      this._notify()
      return true
    } catch (err) {
      console.error('[DEBUG StudioStore.saveAsProject] Error:', err.message)
      this.error = err.message
      this._notify()
      return false
    }
  },

  async closeProject() {
    await IPC.invoke('project:close')
    this._reset()
  },

  _loadFromEigu(projectData) {
    this.project = projectData.project
    this.scenes = projectData.scenes || []
    this.characters = projectData.characters || []
    this.assets = projectData.assets || []
    this.brandKit = projectData.brandKit || null
    this.timeline = projectData.timeline || null
    this.selectedSceneId = projectData.scenes?.[0]?.id || null
  },

  _reset() {
    this.project = null
    this.filePath = null
    this.scenes = []
    this.characters = []
    this.assets = []
    this.brandKit = null
    this.timeline = null
    this.selectedSceneId = null
    this.selectedCharacterId = null
    this.isDirty = false
    this.isLoading = false
    this.error = null
    this._notify()
  },

  // ===== PROJECT METADATA =====

  updateProject(patch) {
    this.project = { ...this.project, ...patch }
    this.isDirty = true
    this._notify()
    IPC.invoke('project:update', patch)
  },

  // ===== SCENE OPERATIONS =====

  selectScene(sceneId) {
    this.selectedSceneId = sceneId
    this._notify()
  },

  async addScene(patch) {
    try {
      const result = await IPC.invoke('scene:create', patch || {
        prompt: 'New scene - describe what happens here',
        duration: 5,
        transition: 'cut',
        status: 'draft',
      })
      if (!result.success) throw new Error(result.error)
      this.scenes.push(result.scene)
      this.isDirty = true
      this._notify()
      return result.scene
    } catch (err) {
      this.error = err.message
      this._notify()
      return null
    }
  },

  async updateScene(sceneId, patch) {
    this.scenes = this.scenes.map(s => s.id === sceneId ? { ...s, ...patch } : s)
    this.isDirty = true
    this._notify()
    await IPC.invoke('scene:update', { sceneId, patch })
  },

  async removeScene(sceneId) {
    const result = await IPC.invoke('scene:delete', sceneId)
    if (result.success) {
      this.scenes = this.scenes.filter(s => s.id !== sceneId)
      if (this.selectedSceneId === sceneId) {
        this.selectedSceneId = this.scenes[0]?.id || null
      }
      this.isDirty = true
      this._notify()
    }
  },

  async reorderScenes(fromIndex, toIndex) {
    const scenes = [...this.scenes]
    const [moved] = scenes.splice(fromIndex, 1)
    scenes.splice(toIndex, 0, moved)
    this.scenes = scenes.map((s, i) => ({ ...s, index: i }))
    this.isDirty = true
    this._notify()
    await IPC.invoke('scene:reorder', { fromIndex, toIndex })
  },

  // ===== CHARACTER OPERATIONS =====

  async addCharacter(character) {
    const result = await IPC.invoke('character:create', character)
    if (result.success) {
      this.characters.push(result.character)
      this._notify()
      return result.character
    }
    return null
  },

  async updateCharacter(charId, patch) {
    this.characters = this.characters.map(c => c.id === charId ? { ...c, ...patch } : c)
    this._notify()
    await IPC.invoke('character:update', { characterId: charId, patch })
  },

  async removeCharacter(charId) {
    const result = await IPC.invoke('character:delete', charId)
    if (result.success) {
      this.characters = this.characters.filter(c => c.id !== charId)
      this._notify()
    }
  },

  // ===== ASSET OPERATIONS =====

  async importAsset(targetType) {
    const result = await IPC.invoke('asset:importDialog', targetType)
    if (result.success) {
      this.assets.push(result.asset)
      this.isDirty = true
      this._notify()
      return result.asset
    }
    return null
  },

  async removeAsset(assetId) {
    const result = await IPC.invoke('asset:remove', assetId)
    if (result.success) {
      this.assets = this.assets.filter(a => a.id !== assetId)
      this.isDirty = true
      this._notify()
    }
  },

  // ===== TAB / VIEW =====

  setSelectedTab(tab) {
    this.selectedTab = tab
    this._notify()
  },

  setViewMode(mode) {
    this.viewMode = mode
    this._notify()
  },
}

// Auto-save debounce
let studioAutoSaveTimer = null
StudioStore.subscribe((state) => {
  if (state.isDirty && state.filePath) {
    clearTimeout(studioAutoSaveTimer)
    studioAutoSaveTimer = setTimeout(() => StudioStore.saveProject(), 30000)
  }
})
