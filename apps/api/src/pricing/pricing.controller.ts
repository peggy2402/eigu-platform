import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateModuleDto, UpdateModuleDto, CreateTierDto, UpdateTierDto, CreateBadgeDto } from './dto/create-pricing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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
   * User GET /pricing/my-subscriptions
   * Lấy danh sách gói cước đang kích hoạt của User
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pricing/my-subscriptions')
  @ApiOperation({ summary: 'Lấy danh sách các gói dịch vụ mô-đun đang kích hoạt của tôi' })
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    const data = await this.pricingService.getUserSubscriptions(userId);
    return { success: true, data };
  }

  /**
   * User POST /pricing/subscribe
   * Nâng cấp / Mua gói cước mô-đun bằng số dư
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pricing/subscribe')
  @ApiOperation({ summary: 'Nâng cấp / Mua gói dịch vụ mô-đun bằng số dư tài khoản' })
  async subscribeTier(
    @Req() req: any,
    @Body() body: { moduleId: string; tierId: string },
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.pricingService.subscribeModuleTier(userId, body.moduleId, body.tierId);
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
   * Admin GET /pricing/admin/all-subscriptions
   * Lấy danh sách đăng ký gói cước dịch vụ của toàn bộ User
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pricing/admin/all-subscriptions')
  @ApiOperation({ summary: 'Admin xem tất cả gói cước dịch vụ đã mua của mọi User' })
  async getAllUserSubscriptionsAdmin() {
    const data = await this.pricingService.getAllUserSubscriptionsAdmin();
    return { success: true, data };
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

