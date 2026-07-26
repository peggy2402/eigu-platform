import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('report')
  @UseInterceptors(FileInterceptor('image'))
  async report(
    @Req() req: any,
    @Body('message') message: string,
    @UploadedFile() image?: any
  ) {
    return this.feedbackService.submitFeedback(req.user.userId || req.user.id, message, image);
  }

  @Get()
  async findAll(@Req() req: any, @Query('q') q?: string) {
    return this.feedbackService.findAll(req.user.id || req.user.userId, req.user.role, q);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền xóa báo cáo góp ý!');
    }
    return this.feedbackService.remove(id);
  }
}
