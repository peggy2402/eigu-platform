import { EventEmitter } from 'events'

export interface JobEvent {
  jobId: string
  projectId: string
  sceneId?: string
  type: string
  status: string
  progress?: number
  error?: string
  timestamp: Date
  metadata?: any
}

export interface ProjectEvent {
  projectId: string
  userId?: string
  action: string
  payload?: any
  timestamp: Date
}

class AIVideoEventBus extends EventEmitter {
  emitJobEvent(event: JobEvent) {
    this.emit('job:' + event.status, event)
    this.emit('job:*', event)
  }

  emitProjectEvent(event: ProjectEvent) {
    this.emit('project:' + event.action, event)
    this.emit('project:*', event)
  }
}

export const aiVideoEventBus = new AIVideoEventBus()
