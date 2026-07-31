import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateModuleDto, UpdateModuleDto, CreateTierDto, UpdateTierDto, CreateBadgeDto } from './dto/create-pricing.dto';

@Controller()
export class PricingController {
  constructor(private pricingService: PricingService) {}

  /**
   * Public GET /pricing (hoặc legacy /GetInfoPrice)
   * Lấy danh sách bảng giá các modules & tiers
   */
  @Get('pricing')
  async getPricing(@Query('m') moduleSlug?: string) {
    const data = await this.pricingService.getPricing(moduleSlug);
    return { success: true, data };
  }

  @Get('GetInfoPrice')
  async getLegacyInfoPrice(@Query('m') moduleSlug?: string) {
    const data = await this.pricingService.getPricing(moduleSlug);
    return { success: true, data };
  }

  /**
   * Admin GET /pricing/admin
   * Lấy toàn bộ dữ liệu modules, tiers (kể cả inactive) & badges
   */
  @Get('pricing/admin')
  async getAdminPricing() {
    const data = await this.pricingService.getAdminPricing();
    return { success: true, ...data };
  }

  /**
   * Admin Mutations
   */
  @Post('pricing/modules')
  async createModule(@Body() dto: CreateModuleDto) {
    const res = await this.pricingService.createModule(dto);
    return { success: true, data: res };
  }

  @Patch('pricing/modules/:id')
  async updateModule(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    const res = await this.pricingService.updateModule(id, dto);
    return { success: true, data: res };
  }

  @Delete('pricing/modules/:id')
  async deleteModule(@Param('id') id: string) {
    await this.pricingService.deleteModule(id);
    return { success: true, message: 'Đã xóa module' };
  }

  @Post('pricing/tiers')
  async createTier(@Body() dto: CreateTierDto) {
    const res = await this.pricingService.createTier(dto);
    return { success: true, data: res };
  }

  @Patch('pricing/tiers/:id')
  async updateTier(@Param('id') id: string, @Body() dto: UpdateTierDto) {
    const res = await this.pricingService.updateTier(id, dto);
    return { success: true, data: res };
  }

  @Delete('pricing/tiers/:id')
  async deleteTier(@Param('id') id: string) {
    await this.pricingService.deleteTier(id);
    return { success: true, message: 'Đã xóa tier' };
  }

  @Post('pricing/badges')
  async createBadge(@Body() dto: CreateBadgeDto) {
    const res = await this.pricingService.createBadge(dto);
    return { success: true, data: res };
  }
}

