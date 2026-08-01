import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ThemeEventService } from './theme-event.service';
import { UpdateThemeEventDto } from './dto/update-theme-event.dto';

@Controller('theme-event')
export class ThemeEventController {
  constructor(private readonly themeEventService: ThemeEventService) {}

  /**
   * GET /api/theme-event
   * Endpoint công khai cho ca Website User & Desktop Admin lay cau hinh hien tai
   */
  @Get()
  async getConfig() {
    return this.themeEventService.getConfig();
  }

  /**
   * PATCH /api/theme-event
   * Endpoint Admin dung cap nhat giao dien & popup su kien
   */
  @Patch()
  async updateConfig(@Body() dto: UpdateThemeEventDto) {
    return this.themeEventService.updateConfig(dto);
  }
}
