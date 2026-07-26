import { Logger } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { aiVideoEventBus, JobEvent, ProjectEvent } from './events/ai-video-events'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ai-video',
})
export class AIVideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AIVideoGateway.name)

  @WebSocketServer()
  server: Server

  constructor() {
    aiVideoEventBus.on('job:*', (event: JobEvent) => {
      this.broadcastJobEvent(event)
    })
    aiVideoEventBus.on('project:*', (event: ProjectEvent) => {
      this.broadcastProjectEvent(event)
    })
  }

  handleConnection(client: Socket) {
    this.logger.debug(`[AIVideoWS] Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`[AIVideoWS] Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join:project')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string; userId?: string },
  ) {
    if (payload?.projectId) {
      client.join(`project:${payload.projectId}`)
      this.logger.debug(`[AIVideoWS] Client ${client.id} joined project:${payload.projectId}`)
    }
    if (payload?.userId) {
      client.join(`user:${payload.userId}`)
    }
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string },
  ) {
    if (payload?.projectId) {
      client.leave(`project:${payload.projectId}`)
    }
  }

  private broadcastJobEvent(event: JobEvent) {
    const room = `project:${event.projectId}`
    const channel = `job:${event.status}`

    this.server.to(room).emit(channel, {
      jobId: event.jobId,
      projectId: event.projectId,
      sceneId: event.sceneId,
      type: event.type,
      status: event.status,
      progress: event.progress,
      error: event.error,
      timestamp: event.timestamp,
      metadata: event.metadata,
    })

    this.server.to(room).emit('job:updated', event)
  }

  private broadcastProjectEvent(event: ProjectEvent) {
    const room = `project:${event.projectId}`
    const channel = `project:${event.action}`

    this.server.to(room).emit(channel, {
      projectId: event.projectId,
      action: event.action,
      payload: event.payload,
      timestamp: event.timestamp,
    })
  }
}
