import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.usersService.findAll(q, role, sortBy);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/ban')
  async toggleBan(
    @Param('id') id: string,
    @Body() body: { isBanned: boolean; bannedUntil?: string | null; banReason?: string | null },
  ) {
    return this.usersService.toggleBan(id, body.isBanned, body.bannedUntil, body.banReason);
  }

  // Tab Permission endpoints
  @Get(':id/tab-permissions')
  async getTabPermissions(@Param('id') id: string) {
    return this.usersService.getTabPermissions(id);
  }

  @Patch(':id/tab-permissions')
  async setTabPermissions(
    @Param('id') id: string,
    @Body('tabPermissions') tabPermissions: { tabKey: string; visible: boolean }[],
  ) {
    return this.usersService.setTabPermissions(id, tabPermissions);
  }

  @Get(':id/tabs')
  async getTabs(@Param('id') id: string) {
    return this.usersService.getTabPermissions(id);
  }

  @Patch(':id/tabs')
  async updateAllowedTabs(@Param('id') id: string, @Body('allowedTabs') allowedTabs: string) {
    return this.usersService.updateAllowedTabs(id, allowedTabs);
  }
}
