import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateChatMessageDto {
  id?: string;
  userEmail: string;
  username?: string;
  sender: 'user' | 'staff' | 'ai';
  senderEmail?: string;
  message: string;
  parentMsgId?: string;
  parentMsgText?: string;
}

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Chạy dọn dẹp tin nhắn cũ hơn 24 giờ tự động mỗi 1 giờ
    this.cleanupTimer = setInterval(() => {
      this.autoCleanupOldMessages().catch(err => {
        this.logger.error(`Error auto cleaning chat messages: ${err.message}`);
      });
    }, 60 * 60 * 1000); // 1 hour

    // Chạy dọn dẹp 1 lần ngay khi khởi động
    this.autoCleanupOldMessages().catch(() => {});
  }

  async saveMessage(dto: CreateChatMessageDto) {
    const data: any = {
      userEmail: dto.userEmail,
      username: dto.username || dto.userEmail.split('@')[0],
      sender: dto.sender,
      senderEmail: dto.senderEmail,
      message: dto.message,
      status: 'sent',
      parentMsgId: dto.parentMsgId,
      parentMsgText: dto.parentMsgText,
    };
    if (dto.id) {
      data.id = dto.id;
    }
    const chatMsg = await this.prisma.chatMessage.create({ data });
    return chatMsg;
  }

  async getHistory(userEmail: string) {
    return this.prisma.chatMessage.findMany({
      where: { userEmail },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  async markSeen(userEmail: string) {
    await this.prisma.chatMessage.updateMany({
      where: {
        userEmail,
        sender: 'user',
        status: 'sent',
      },
      data: { status: 'seen' },
    });
    return { success: true };
  }

  async getSessions() {
    const rawSessions = await this.prisma.chatMessage.groupBy({
      by: ['userEmail'],
      _max: {
        createdAt: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
    });

    const sessions = await Promise.all(
      rawSessions.map(async (s) => {
        const lastMsg = await this.prisma.chatMessage.findFirst({
          where: { userEmail: s.userEmail },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            userEmail: s.userEmail,
            sender: 'user',
            status: 'sent',
          },
        });

        const hasStaffRequest = lastMsg?.message?.includes('@Staff') || lastMsg?.message?.includes('yêu cầu Staff');

        return {
          email: s.userEmail,
          username: lastMsg?.username || s.userEmail.split('@')[0],
          lastMessage: lastMsg?.message || '',
          lastMessageTime: lastMsg?.createdAt || s._max?.createdAt || new Date(),
          lastSender: lastMsg?.sender || 'user',
          status: hasStaffRequest ? 'CẦN STAFF HỖ TRỢ' : (unreadCount > 0 ? 'TIN NHẮN MỚI' : 'Đang hỗ trợ'),
          unreadCount,
        };
      })
    );

    return sessions;
  }

  async autoCleanupOldMessages() {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const result = await this.prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    if (result.count > 0) {
      this.logger.log(`🧹 Đã tự động xóa ${result.count} tin nhắn chat cũ hơn 24 giờ để tối ưu dung lượng Supabase.`);
    }
    return result;
  }
}
