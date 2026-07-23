import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { VideoWorkflowStatus } from '@eigu-platform/shared';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/workflow'
})
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WorkflowGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('reportProgress')
  handleReportProgress(@MessageBody() status: VideoWorkflowStatus): void {
    this.logger.debug(`Task ${status.taskId}: ${status.progress}% - ${status.status}`);
    this.server.emit('workflowUpdated', status);
  }
}
