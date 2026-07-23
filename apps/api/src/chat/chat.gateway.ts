import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, type CreateChatMessageDto } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`[ChatWS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`[ChatWS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userEmail: string; role?: string }
  ) {
    if (!payload?.userEmail) return;

    const userRoom = `room:${payload.userEmail.toLowerCase()}`;
    client.join(userRoom);
    this.logger.debug(`[ChatWS] Client ${client.id} joined ${userRoom}`);

    if (payload.role === 'admin' || payload.role === 'staff') {
      client.join('staff_room');
      this.logger.debug(`[ChatWS] Client ${client.id} joined staff_room`);
    }
  }

  @SubscribeMessage('chat:send_message')
  async handleSendMessage(
    @MessageBody() dto: CreateChatMessageDto
  ) {
    if (!dto || !dto.userEmail || !dto.message) return;

    const userEmail = dto.userEmail.toLowerCase();
    
    // 1. Lưu vào Database Supabase
    const savedMsg = await this.chatService.saveMessage({
      ...dto,
      userEmail,
    });

    const userRoom = `room:${userEmail}`;

    // 2. Phát tin nhắn Real-time tới phòng User và phòng Staff
    this.server.to(userRoom).to('staff_room').emit('chat:message_received', savedMsg);

    // 3. Phát sự kiện cập nhật danh sách cuộc trò chuyện cho Staff console
    const sessions = await this.chatService.getSessions();
    this.server.to('staff_room').emit('chat:sessions_updated', sessions);

    // 4. Nếu người dùng tag @Eigu AI hoặc @AI -> AI Phản hồi tự động
    const msgText = dto.message.toLowerCase();
    if (dto.sender === 'user' && (msgText.includes('@eigu ai') || msgText.includes('@ai'))) {
      setTimeout(async () => {
        const cleanPrompt = dto.message.replace(/@eigu ai/gi, '').replace(/@ai/gi, '').trim();
        const aiResponseText = this.generateAiResponse(cleanPrompt);

        const aiMsg = await this.chatService.saveMessage({
          userEmail,
          sender: 'ai',
          message: aiResponseText,
          parentMsgId: savedMsg.id,
          parentMsgText: savedMsg.message,
        });

        this.server.to(userRoom).to('staff_room').emit('chat:message_received', aiMsg);
      }, 800);
    }
  }

  @SubscribeMessage('chat:mark_seen')
  async handleMarkSeen(
    @MessageBody() payload: { userEmail: string }
  ) {
    if (!payload?.userEmail) return;
    const userEmail = payload.userEmail.toLowerCase();
    await this.chatService.markSeen(userEmail);

    const userRoom = `room:${userEmail}`;
    this.server.to(userRoom).to('staff_room').emit('chat:status_updated', {
      userEmail,
      status: 'seen',
    });

    const sessions = await this.chatService.getSessions();
    this.server.to('staff_room').emit('chat:sessions_updated', sessions);
  }

  private generateAiResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('hướng dẫn') || lower.includes('dùng') || lower.includes('cách')) {
      return `🤖 **EIGU AI Assistant**: Bạn có thể chọn tab "Tự động hóa" -> Kéo thả video MP4 hoặc dán link YouTube để hệ thống tự động cắt ghép, chống MD5 và chèn logo. Nút "Chỉnh sửa nâng cao" hỗ trợ vi chỉnh màu sắc và lật hình ảnh.`;
    }
    if (lower.includes('lỗi') || lower.includes('không được') || lower.includes('hỏng')) {
      return `🤖 **EIGU AI Assistant**: Rất tiếc vì sự cố bạn gặp phải! Đội ngũ Staff đã được thông báo. Bạn có thể nhấn nút "Yêu cầu Nhân viên (Staff) hỗ trợ" để kết nối trực tiếp với hỗ trợ viên.`;
    }
    return `🤖 **EIGU AI Assistant**: Chào bạn! Tôi là trợ lý AI tự động của EIGU Platform. Tôi có thể giúp gì cho bạn về các công cụ cắt ghép video, reup TikTok/YouTube hay quản lý tài khoản?`;
  }
}
