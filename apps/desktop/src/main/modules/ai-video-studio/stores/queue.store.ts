const QueueStore = {
  jobs: [],
  activeJob: null,
  stats: { pending: 0, active: 0, completed: 0, failed: 0, total: 0 },

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

  async refreshStats(projectId) {
    try {
      const apiUrl = await window.ipcRenderer.invoke('get-api-config').then(c => c.apiUrl)
      const res = await fetch(`${apiUrl}/ai-video/queue${projectId ? `?projectId=${projectId}` : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('eigu_access_token')}` },
      })
      if (res.ok) {
        this.stats = await res.json()
        this._notify()
      }
    } catch (e) {
      // silent
    }
  },

  async submitRender(projectId, options = {}) {
    try {
      const apiUrl = await window.ipcRenderer.invoke('get-api-config').then(c => c.apiUrl)
      const res = await fetch(`${apiUrl}/ai-video/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('eigu_access_token')}`,
        },
        body: JSON.stringify({ projectId, ...options }),
      })
      if (!res.ok) throw new Error('Failed to submit render')
      const data = await res.json()
      this.activeJob = data
      this._notify()
      return data
    } catch (err) {
      throw err
    }
  },

  async cancelJob(jobId) {
    try {
      const apiUrl = await window.ipcRenderer.invoke('get-api-config').then(c => c.apiUrl)
      await fetch(`${apiUrl}/ai-video/queue/${jobId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('eigu_access_token')}` },
      })
      this.refreshStats()
    } catch (e) { /* silent */ }
  },
}
