import { Controller, Get, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử cuộc trò chuyện của người dùng đăng nhập' })
  async getHistory(@Req() req: any) {
    const userEmail = req.user?.email;
    if (!userEmail) return [];
    return this.chatService.getHistory(userEmail.toLowerCase());
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách các cuộc trò chuyện dành cho Staff/Admin' })
  async getSessions(@Req() req: any) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      return [];
    }
    return this.chatService.getSessions();
  }

  @Delete('cleanup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tự động dọn dẹp các tin nhắn chat cũ hơn 24 giờ (Chỉ Admin)' })
  async cleanupOldMessages(@Req() req: any) {
    if (req.user?.role !== 'admin') {
      return { count: 0 };
    }
    return this.chatService.autoCleanupOldMessages();
  }
}
