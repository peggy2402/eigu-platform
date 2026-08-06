import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateCategoryDto, CreateTagDto } from './dto/category-tag.dto';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll(@Query() query: QueryNewsDto, @Req() req: any) {
    // Both Admin and Staff can list news in Admin/Staff desktop UI
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ tài khoản Admin hoặc Staff mới có quyền truy cập');
    }
    return this.newsService.findAll(query);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ Admin/Staff mới có quyền xem thống kê');
    }
    return this.newsService.getStatistics();
  }

  @Get('categories')
  async getCategories() {
    return this.newsService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền tạo danh mục tin tức');
    }
    return this.newsService.createCategory(dto);
  }

  @Get('tags')
  async getTags() {
    return this.newsService.getTags();
  }

  @Post('tags')
  async createTag(@Body() dto: CreateTagDto, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền tạo thẻ tag');
    }
    return this.newsService.createTag(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateNewsDto, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ Admin/Staff mới có quyền đăng bài viết');
    }
    return this.newsService.create(dto, req.user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ Admin/Staff mới có quyền chỉnh sửa bài viết');
    }
    return this.newsService.update(id, dto, req.user);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.newsService.softDelete(id, req.user);
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ Admin/Staff mới có quyền xuất bản bài viết');
    }
    return this.newsService.publish(id);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Req() req: any) {
    return this.newsService.archive(id, req.user);
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (!['admin', 'staff'].includes(role)) {
      throw new ForbiddenException('Chỉ Admin/Staff mới có quyền nhân bản bài viết');
    }
    return this.newsService.duplicate(id, req.user);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
