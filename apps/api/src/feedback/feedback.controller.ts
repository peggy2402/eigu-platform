import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('q') q?: string) {
    return this.feedbackService.findAll(q);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
