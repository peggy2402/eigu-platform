import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AffiliateService } from './affiliate.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AdminUpdatePayoutDto } from './dto/admin-update-payout.dto';

@ApiTags('Affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiOperation({ summary: 'Lấy thông tin tổng quan số liệu tiếp thị liên kết cá nhân' })
  async getStats(@Req() req: any) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.getStats(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  @ApiOperation({ summary: 'Danh sách người dùng đã đăng ký qua mã giới thiệu' })
  async getReferrals(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.getReferrals(userId, Number(page) || 1, Number(limit) || 10);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('commissions')
  @ApiOperation({ summary: 'Lịch sử hoa hồng tiếp thị liên kết nhận được' })
  async getCommissions(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.getCommissions(userId, Number(page) || 1, Number(limit) || 10);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('payout-request')
  @ApiOperation({ summary: 'Gửi yêu cầu rút tiền số dư hoa hồng về tài khoản ngân hàng' })
  async createPayoutRequest(@Req() req: any, @Body() dto: CreatePayoutDto) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.createPayoutRequest(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('payouts')
  @ApiOperation({ summary: 'Lịch sử yêu cầu rút tiền của tài khoản' })
  async getPayouts(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.getPayouts(userId, Number(page) || 1, Number(limit) || 10);
  }

  @Post('click/:code')
  @ApiOperation({ summary: 'Ghi nhận lượt nhấp công khai vào link tiếp thị liên kết' })
  async recordClick(
    @Param('code') code: string,
    @Req() req: any,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
    return this.affiliateService.recordClick(code, Array.isArray(ipAddress) ? ipAddress[0] : ipAddress, userAgent);
  }

  // ==========================================
  // ADMIN API ENDPOINTS
  // ==========================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/payouts')
  @ApiOperation({ summary: '[ADMIN/STAFF] Danh sách tất cả các yêu cầu rút tiền affiliate' })
  async getAdminPayouts(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'staff') {
      throw new ForbiddenException('Chỉ tài khoản Admin hoặc Staff mới có quyền truy cập');
    }
    return this.affiliateService.getAdminPayouts(status, Number(page) || 1, Number(limit) || 20);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/payouts/:id')
  @ApiOperation({ summary: '[ADMIN/STAFF] Phê duyệt hoặc từ chối đơn rút tiền affiliate' })
  async updatePayoutStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AdminUpdatePayoutDto,
  ) {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'staff') {
      throw new ForbiddenException('Chỉ tài khoản Admin hoặc Staff mới có quyền truy cập');
    }
    const adminId = req.user.id || req.user.userId || req.user.sub;
    return this.affiliateService.updatePayoutStatus(id, dto, adminId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  @ApiOperation({ summary: '[ADMIN] Báo cáo thống kê affiliate toàn hệ thống' })
  async getAdminStats(@Req() req: any) {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'staff') {
      throw new ForbiddenException('Chỉ tài khoản Admin hoặc Staff mới có quyền truy cập');
    }
    return this.affiliateService.getAdminStats();
  }
}
