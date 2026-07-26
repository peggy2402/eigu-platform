// Queue Store - Local queue management via IPC

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

const QueueStore = {
  jobs: [],
  activeJob: null,
  stats: { pending: 0, active: 0, completed: 0, failed: 0, cancelled: 0, total: 0 },

  _listeners: [],

  subscribe(fn) {
    this._listeners.push(fn)
    return () => { this._listeners = this._listeners.filter(l => l !== fn) }
  },

  _notify() {
    this._listeners.forEach(fn => fn({
      jobs: this.jobs,
      activeJob: this.activeJob,
      stats: this.stats,
    }))
  },

  async refreshStats() {
    try {
      const result = await IPC.invoke('render:queue')
      if (result) {
        this.stats = result.stats || { pending: 0, active: 0, completed: 0, failed: 0, cancelled: 0, total: 0 }
        this._notify()
      }
    } catch (e) { /* silent */ }
  },

  async submitRender(sceneId, options = {}) {
    try {
      const result = await IPC.invoke('render:submit', {
        sceneId,
        provider: options.provider || 'runway',
        model: options.model || 'gen3',
      })
      if (result.success) {
        this.activeJob = result.job
        this._notify()
        return result.job
      } else {
        throw new Error(result.error || 'Failed to submit render')
      }
    } catch (err) {
      throw err
    }
  },

  async cancelJob(jobId) {
    const result = await IPC.invoke('render:cancel', jobId)
    if (result?.success) {
      this.refreshStats()
    }
  },

  _handleQueueEvent(data) {
    if (data.type === 'job:progress') {
      const idx = this.jobs.findIndex(j => j.id === data.jobId)
      if (idx >= 0) {
        this.jobs[idx].progress = data.progress
      }
    }
    if (data.type === 'job:completed') {
      const idx = this.jobs.findIndex(j => j.id === data.jobId)
      if (idx >= 0) {
        this.jobs[idx].status = 'completed'
        this.jobs[idx].progress = 100
        this.jobs[idx].output = data.output
      }
    }
    if (data.type === 'job:failed') {
      const idx = this.jobs.findIndex(j => j.id === data.jobId)
      if (idx >= 0) {
        this.jobs[idx].status = 'failed'
        this.jobs[idx].error = data.error
      }
    }
    this._notify()
    this.refreshStats()
  },
}
