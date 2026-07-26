import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      throw new ForbiddenException('Chỉ Admin hoặc Staff mới có quyền xem danh sách người dùng!');
    }
    return this.usersService.findAll(q, role, sortBy);
  }

  @Patch(':id/role')
  async updateRole(@Req() req: any, @Param('id') id: string, @Body('role') role: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền cập nhật Role!');
    }
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/ban')
  async toggleBan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { isBanned: boolean; bannedUntil?: string | null; banReason?: string | null },
  ) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      throw new ForbiddenException('Chỉ Admin hoặc Staff mới có quyền Ban người dùng!');
    }
    return this.usersService.toggleBan(id, body.isBanned, body.bannedUntil, body.banReason);
  }

  // Tab Permission endpoints
  @Get(':id/tab-permissions')
  async getTabPermissions(@Req() req: any, @Param('id') id: string) {
    const requesterId = req.user?.id || req.user?.userId;
    if (req.user?.role !== 'admin' && requesterId !== id) {
      throw new ForbiddenException('Bạn không có quyền xem Tab Permission của người khác!');
    }
    return this.usersService.getTabPermissions(id);
  }

  @Patch(':id/tab-permissions')
  async setTabPermissions(
    @Req() req: any,
    @Param('id') id: string,
    @Body('tabPermissions') tabPermissions: { tabKey: string; visible: boolean }[],
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền thay đổi Tab Permission!');
    }
    return this.usersService.setTabPermissions(id, tabPermissions);
  }

  @Get(':id/tabs')
  async getTabs(@Req() req: any, @Param('id') id: string) {
    const requesterId = req.user?.id || req.user?.userId;
    if (req.user?.role !== 'admin' && requesterId !== id) {
      throw new ForbiddenException('Bạn không có quyền xem Tab Permission của người khác!');
    }
    return this.usersService.getTabPermissions(id);
  }

  @Patch(':id/tabs')
  async updateAllowedTabs(@Req() req: any, @Param('id') id: string, @Body('allowedTabs') allowedTabs: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền thay đổi Tab Permission!');
    }
    return this.usersService.updateAllowedTabs(id, allowedTabs);
  }
}
