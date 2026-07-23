import { Controller, Get, Patch, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('SystemConfig')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('bootstrap')
  @ApiOperation({ summary: 'Lấy cấu hình Bootstrap công khai (Public Bootstrap for Desktop/Mobile Client)' })
  async getBootstrap() {
    return this.systemConfigService.getBootstrapConfig();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật cấu hình hệ thống DB (Chỉ Admin)' })
  async updateConfig(@CurrentUser() user: any, @Body() body: { key: string; value: string; description?: string }) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền cập nhật cấu hình hệ thống DB!');
    }
    return this.systemConfigService.setConfig(body.key, body.value, body.description);
  }
}
