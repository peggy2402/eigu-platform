import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import FormData = require('form-data');

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(userId: string, content: string, file?: any) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const feedbackCount = await this.prisma.feedback.count({
      where: {
        userId,
        createdAt: { gte: startOfDay }
      }
    });

    if (feedbackCount >= 3) {
      throw new ForbiddenException('Bạn chỉ được phép gửi tối đa 3 báo cáo mỗi ngày để tránh spam.');
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('Discord Webhook URL is not configured.');
    }

    const formData = new FormData();
    formData.append('content', `**Feedback mới từ hệ thống!**\n**User ID:** ${userId}\n**Nội dung:** ${content}`);
    
    if (file) {
      formData.append('file', file.buffer, { filename: file.originalname });
    }

    try {
      await axios.post(webhookUrl, formData, {
        headers: formData.getHeaders(),
      });
    } catch (e: any) {
      throw new Error('Failed to send to Discord: ' + e.message);
    }

    await this.prisma.feedback.create({
      data: {
        userId,
        content,
      }
    });

    return { success: true, message: 'Cảm ơn bạn đã góp ý!' };
  }
}
