import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('target') target?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.notificationsService.findAll(q, target, sortBy);
  }

  @Post()
  async create(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('target') target?: string,
    @Body('ttl') ttl?: string,
  ) {
    return this.notificationsService.create(title, content, target, ttl);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('target') target: string,
    @Body('ttl') ttl?: string,
  ) {
    return this.notificationsService.update(id, title, content, target, ttl);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Patch('read-all')
  async markAllRead() {
    return this.notificationsService.markAllRead();
  }
}
