import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử cuộc trò chuyện theo Email' })
  @ApiQuery({ name: 'userEmail', required: true })
  async getHistory(@Query('userEmail') userEmail: string) {
    if (!userEmail) return [];
    return this.chatService.getHistory(userEmail.toLowerCase());
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách các cuộc trò chuyện dành cho Staff/Admin' })
  async getSessions() {
    return this.chatService.getSessions();
  }

  @Delete('cleanup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tự động dọn dẹp các tin nhắn chat cũ hơn 24 giờ' })
  async cleanupOldMessages() {
    return this.chatService.autoCleanupOldMessages();
  }
}
