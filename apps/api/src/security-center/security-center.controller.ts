import { Controller, Get, Patch, Post, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityCenterService } from './security-center.service';
import { UpdateObfuscationDto, RotateObfuscationDto, GenerateRandomDto, RollbackObfuscationDto } from './dto/security-center.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Security Center')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityCenterController {
  constructor(private readonly securityCenterService: SecurityCenterService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ tài khoản Admin mới có quyền truy cập Security Center!');
    }
  }

  @Get('obfuscation')
  @ApiOperation({ summary: 'Lấy trạng thái tổng quan hệ thống Security Center (Chỉ Admin)' })
  async getOverview(@Req() req: any) {
    this.checkAdmin(req);
    return this.securityCenterService.getOverview();
  }

  @Patch('obfuscation')
  @ApiOperation({ summary: 'Thay đổi mã Obfuscation Prefix trực tiếp (Admin Dashboard)' })
  async updateObfuscation(@Body() dto: UpdateObfuscationDto, @Req() req: any) {
    this.checkAdmin(req);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.updateObfuscation(dto, adminId, { ip, userAgent });
  }

  @Post('obfuscation/rotate')
  @ApiOperation({ summary: 'Xoay vòng mã Obfuscation ngẫu nhiên tức thì (Chỉ Admin)' })
  async rotateObfuscation(@Body() dto: RotateObfuscationDto, @Req() req: any) {
    this.checkAdmin(req);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.rotateObfuscation(dto, adminId, { ip, userAgent });
  }

  @Post('obfuscation/generate')
  @ApiOperation({ summary: 'Tạo mã Obfuscation ngẫu nhiên an toàn (Chỉ Admin)' })
  async generateRandom(@Req() req: any, @Body() dto: GenerateRandomDto) {
    this.checkAdmin(req);
    const length = dto.length || 12;
    const generated = this.securityCenterService.generateRandomCode(length);
    return {
      generatedCode: generated,
      fullPreviewUrl: `http://localhost:3001/api/${generated}`,
    };
  }

  @Post('obfuscation/rollback')
  @ApiOperation({ summary: 'Rollback về mã Obfuscation cũ liền trước (Chỉ Admin)' })
  async rollbackObfuscation(@Body() dto: RollbackObfuscationDto, @Req() req: any) {
    this.checkAdmin(req);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.rollbackObfuscation(dto, adminId, { ip, userAgent });
  }

  @Get('history')
  @ApiOperation({ summary: 'Lịch sử thay đổi và xoay vòng mã Obfuscation (Chỉ Admin)' })
  async getHistory(@Req() req: any) {
    this.checkAdmin(req);
    return this.securityCenterService.getHistory();
  }

  @Get('audit')
  @ApiOperation({ summary: 'Nhật ký truy vết thao tác bảo mật (Audit Logs - Chỉ Admin)' })
  async getAuditLogs(@Req() req: any) {
    this.checkAdmin(req);
    return this.securityCenterService.getAuditLogs();
  }
}
