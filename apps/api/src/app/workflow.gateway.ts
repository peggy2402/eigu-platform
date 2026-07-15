import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoWorkflowStatus } from '@eigu-platform/shared';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong thực tế sẽ cấu hình chặt chẽ hơn
  },
  namespace: '/workflow'
})
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Node kết nối thành công: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Node ngắt kết nối: ${client.id}`);
  }

  /**
   * Lắng nghe thông điệp từ ứng dụng Desktop (Electron)
   * và phát sóng lại cho Web Dashboard (React Flow)
   */
  @SubscribeMessage('reportProgress')
  handleReportProgress(@MessageBody() status: VideoWorkflowStatus): void {
    console.log(`[API Gateway] Cập nhật Task ${status.taskId}: ${status.progress}% - ${status.status}`);
    if (status.message) {
      console.log(`   -> Chi tiết: ${status.message}`);
    }
    
    // Broadcast dữ liệu theo thời gian thực tới tất cả Client đang kết nối
    this.server.emit('workflowUpdated', status);
  }
}
