// Zustand-like store cho AI Video Studio (vanilla JS)
// Single source of truth cho toàn bộ studio state

const StudioStore = {
  // State
  project: null,
  filePath: null,
  scenes: [],
  characters: [],
  assets: [],
  brandKit: null,
  timeline: null,
  selectedSceneId: null,
  selectedCharacterId: null,
  selectedTab: 'story',
  viewMode: 'storyboard',
  isDirty: false,
  isLoading: false,
  error: null,

  // Listeners
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
      timeline: this.timeline,
      selectedSceneId: this.selectedSceneId,
      selectedTab: this.selectedTab,
      viewMode: this.viewMode,
      isDirty: this.isDirty,
      isLoading: this.isLoading,
      error: this.error,
    }
  },

  // Actions
  async newProject(name, saveDir, aspectRatio = '9:16') {
    this.isLoading = true
    this._notify()
    try {
      if (window.ipcRenderer) {
        const res = await window.ipcRenderer.invoke('project:new', { name, saveDir, aspectRatio })
        if (res && res.success) {
          this.filePath = res.filePath
          this.project = res.project || {
            id: 'proj_' + Date.now(),
            name,
            aspectRatio,
            status: 'draft',
            createdAt: new Date().toISOString()
          }
          this.scenes = [
            {
              id: 'scene_1',
              index: 0,
              prompt: 'Cảnh 1: Nhập mô tả kịch bản phân cảnh tại đây...',
              negativePrompt: 'blurry, noise',
              duration: 5,
              transition: 'cut',
              camera: { angle: 'medium', movement: 'static' },
              lighting: 'natural',
              status: 'pending'
            }
          ]
          this.selectedSceneId = 'scene_1'
          this.isDirty = false
          this.error = null
          this._notify()
          return true
        } else if (res && !res.success) {
          this.error = res.error || 'Lỗi khi khởi tạo tệp dự án .eigu'
          this._notify()
          return false
        }
      }
      this.filePath = (saveDir ? saveDir + '/' : 'Downloads/eigu/') + name + '.eigu'
      this.project = {
        id: 'proj_' + Date.now(),
        name,
        aspectRatio,
        status: 'draft',
        createdAt: new Date().toISOString()
      }
      this.scenes = [
        {
          id: 'scene_1',
          index: 0,
          prompt: 'Cảnh 1: Nhập mô tả kịch bản phân cảnh tại đây...',
          negativePrompt: 'blurry, noise',
          duration: 5,
          transition: 'cut',
          camera: { angle: 'medium', movement: 'static' },
          lighting: 'natural',
          status: 'pending'
        }
      ]
      this.selectedSceneId = 'scene_1'
      this.isDirty = false
      this.error = null
      this._notify()
      return true
    } catch (err) {
      this.error = err.message
      return false
    } finally {
      this.isLoading = false
      this._notify()
    }
  },

  async openProject() {
    this.isLoading = true
    this._notify()
    try {
      if (window.ipcRenderer) {
        const res = await window.ipcRenderer.invoke('project:openDialog')
        if (res && res.success) {
          this.filePath = res.filePath
          this._loadFromEigu(res.project)
          return true
        }
      }
      return false
    } catch (err) {
      this.error = err.message
      return false
    } finally {
      this.isLoading = false
      this._notify()
    }
  },

  _loadFromEigu(proj) {
    if (!proj) return
    this.project = {
      id: proj.id || 'proj_' + Date.now(),
      name: proj.name || 'Dự án Video AI',
      aspectRatio: proj.aspectRatio || '9:16',
      status: proj.status || 'draft',
      cost: proj.cost || 0
    }
    this.scenes = proj.scenes || []
    this.characters = proj.characters || []
    this.assets = proj.assets || []
    this.brandKit = proj.brandKit || null
    this.selectedSceneId = this.scenes[0]?.id || null
    this.isDirty = false
    this._notify()
  },

  // Actions
  async loadProject(projectId) {
    this.isLoading = true
    this._notify()
    try {
      const apiUrl = await window.ipcRenderer.invoke('get-api-config').then(c => c.apiUrl)
      const res = await fetch(`${apiUrl}/ai-video/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('eigu_access_token')}` },
      })
      if (!res.ok) throw new Error('Failed to load project')
      const data = await res.json()
      this.project = data
      this.scenes = data.scenes || []
      this.characters = data.characters || []
      this.assets = data.assets || []
      this.selectedSceneId = data.scenes?.[0]?.id || null
      this.isDirty = false
    } catch (err) {
      this.error = err.message
    } finally {
      this.isLoading = false
      this._notify()
    }
  },

  async saveProject() {
    if (!this.project) return
    try {
      const apiUrl = await window.ipcRenderer.invoke('get-api-config').then(c => c.apiUrl)
      const res = await fetch(`${apiUrl}/ai-video/projects/${this.project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('eigu_access_token')}`,
        },
        body: JSON.stringify({
          name: this.project.name,
          description: this.project.description,
          category: this.project.category,
          aspectRatio: this.project.aspectRatio,
          tags: this.project.tags,
        }),
      })
      if (!res.ok) throw new Error('Failed to save project')
      this.isDirty = false
      this._notify()
      return true
    } catch (err) {
      this.error = err.message
      this._notify()
      return false
    }
  },

  updateProject(patch) {
    this.project = { ...this.project, ...patch }
    this.isDirty = true
    this._notify()
  },

  selectScene(sceneId) {
    this.selectedSceneId = sceneId
    this._notify()
  },

  addScene(scene) {
    this.scenes.push(scene)
    this.isDirty = true
    this._notify()
  },

  updateScene(sceneId, patch) {
    this.scenes = this.scenes.map(s => s.id === sceneId ? { ...s, ...patch } : s)
    this.isDirty = true
    this._notify()
  },

  removeScene(sceneId) {
    this.scenes = this.scenes.filter(s => s.id !== sceneId)
    if (this.selectedSceneId === sceneId) {
      this.selectedSceneId = this.scenes[0]?.id || null
    }
    this.isDirty = true
    this._notify()
  },

  reorderScenes(fromIndex, toIndex) {
    const scenes = [...this.scenes]
    const [moved] = scenes.splice(fromIndex, 1)
    scenes.splice(toIndex, 0, moved)
    this.scenes = scenes.map((s, i) => ({ ...s, index: i }))
    this.isDirty = true
    this._notify()
  },

  addCharacter(character) {
    this.characters.push(character)
    this._notify()
  },

  updateCharacter(charId, patch) {
    this.characters = this.characters.map(c => c.id === charId ? { ...c, ...patch } : c)
    this._notify()
  },

  removeCharacter(charId) {
    this.characters = this.characters.filter(c => c.id !== charId)
    this._notify()
  },

  setSelectedTab(tab) {
    this.selectedTab = tab
    this._notify()
  },

  setViewMode(mode) {
    this.viewMode = mode
    this._notify()
  },

  reset() {
    this.project = null
    this.scenes = []
    this.characters = []
    this.assets = []
    this.brandKit = null
    this.timeline = null
    this.selectedSceneId = null
    this.isDirty = false
    this.isLoading = false
    this.error = null
    this._notify()
  },
}

// Auto-save debounce
let autoSaveTimer = null
StudioStore.subscribe(() => {
  if (StudioStore.isDirty && StudioStore.project?.id) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => StudioStore.saveProject(), 5000)
  }
})
