import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import FormData from 'form-data';

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

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const emailStr = user?.email || 'Chưa cập nhật';
    const usernameStr = user?.username ? `@${user.username}` : 'Chưa đặt';

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('Discord Webhook URL is not configured.');
    }

    const formattedContent = `🚀 **BÁO CÁO PHẢN HỒI (FEEDBACK MỚI)** 🚀\n` +
      `📧 **Email:** ${emailStr}\n` +
      `👤 **Username:** ${usernameStr}\n` +
      `🆔 **User ID:** \`${userId}\` \n` +
      `📝 **Nội dung góp ý:**\n> ${content.replace(/\n/g, '\n> ')}\n` +
      `⏰ **Thời gian gửi:** <t:${Math.floor(Date.now() / 1000)}:F>`;

    const formData = new FormData();
    formData.append('content', formattedContent);
    
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

  async findAll(q?: string) {
    const where: any = {};
    if (q) {
      where.OR = [
        { content: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { username: { contains: q, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async remove(id: string) {
    return this.prisma.feedback.delete({
      where: { id },
    });
  }
}
