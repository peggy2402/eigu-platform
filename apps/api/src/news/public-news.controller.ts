import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateCommentDto, CommentReactionDto, CommentReportDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('public/news')
export class PublicNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findPublicList(@Query() query: QueryNewsDto) {
    return this.newsService.findPublicList(query);
  }

  @Get('latest')
  async getLatestPublic(@Query('limit') limit?: number) {
    return this.newsService.getLatestPublic(limit ? Number(limit) : 5);
  }

  @Get('categories')
  async getCategories() {
    return this.newsService.getCategories();
  }

  @Get('tags')
  async getTags() {
    return this.newsService.getTags();
  }

  @Get('related')
  async getRelatedPublic(@Query('slug') slug: string, @Query('categoryId') categoryId?: string, @Query('limit') limit?: number) {
    return this.newsService.getRelatedPublic(slug, categoryId, limit ? Number(limit) : 4);
  }

  @Get('search')
  async searchPublic(@Query('q') q: string, @Query() query: QueryNewsDto) {
    return this.newsService.findPublicList({ ...query, search: q });
  }

  @Get(':slug')
  async findPublicOneBySlug(@Param('slug') slug: string) {
    return this.newsService.findPublicOneBySlug(slug);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.newsService.getComments(id, userId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(@Param('id') newsId: string, @Body() dto: CreateCommentDto, @Req() req: any) {
    return this.newsService.createComment(newsId, dto, req.user);
  }

  @Post('comments/:id/reaction')
  @UseGuards(JwtAuthGuard)
  async reactionComment(@Param('id') commentId: string, @Body() dto: CommentReactionDto, @Req() req: any) {
    return this.newsService.reactionComment(commentId, dto, req.user.id);
  }

  @Post('comments/:id/report')
  @UseGuards(JwtAuthGuard)
  async reportComment(@Param('id') commentId: string, @Body() dto: CommentReportDto, @Req() req: any) {
    return this.newsService.reportComment(commentId, dto, req.user.id);
  }
}
