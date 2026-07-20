import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post('report')
  @UseInterceptors(FileInterceptor('image'))
  async report(
    @Req() req: any,
    @Body('message') message: string,
    @UploadedFile() image?: any
  ) {
    return this.feedbackService.submitFeedback(req.user.userId || req.user.id, message, image);
  }
}
