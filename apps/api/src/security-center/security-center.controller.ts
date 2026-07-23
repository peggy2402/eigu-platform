import { Controller, Get, Patch, Post, Body, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityCenterService } from './security-center.service';
import { UpdateObfuscationDto, RotateObfuscationDto, GenerateRandomDto, RollbackObfuscationDto } from './dto/security-center.dto';

@ApiTags('Security Center')
@ApiBearerAuth()
@Controller('security')
export class SecurityCenterController {
  constructor(private readonly securityCenterService: SecurityCenterService) {}

  @Get('obfuscation')
  @ApiOperation({ summary: 'Lấy trạng thái tổng quan hệ thống Security Center & Active Obfuscation Code' })
  async getOverview() {
    return this.securityCenterService.getOverview();
  }

  @Patch('obfuscation')
  @ApiOperation({ summary: 'Thay đổi mã Obfuscation Prefix trực tiếp (Admin Dashboard)' })
  async updateObfuscation(@Body() dto: UpdateObfuscationDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.updateObfuscation(dto, adminId, { ip, userAgent });
  }

  @Post('obfuscation/rotate')
  @ApiOperation({ summary: 'Xoay vòng mã Obfuscation ngẫu nhiên tức thì' })
  async rotateObfuscation(@Body() dto: RotateObfuscationDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.rotateObfuscation(dto, adminId, { ip, userAgent });
  }

  @Post('obfuscation/generate')
  @ApiOperation({ summary: 'Tạo mã Obfuscation ngẫu nhiên an toàn' })
  async generateRandom(@Body() dto: GenerateRandomDto) {
    const length = dto.length || 12;
    const generated = this.securityCenterService.generateRandomCode(length);
    return {
      generatedCode: generated,
      fullPreviewUrl: `http://localhost:3001/api/${generated}`,
    };
  }

  @Post('obfuscation/rollback')
  @ApiOperation({ summary: 'Rollback về mã Obfuscation cũ liền trước' })
  async rollbackObfuscation(@Body() dto: RollbackObfuscationDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const adminId = req.user?.id;

    return this.securityCenterService.rollbackObfuscation(dto, adminId, { ip, userAgent });
  }

  @Get('history')
  @ApiOperation({ summary: 'Lịch sử thay đổi và xoay vòng mã Obfuscation' })
  async getHistory() {
    return this.securityCenterService.getHistory();
  }

  @Get('audit')
  @ApiOperation({ summary: 'Nhật ký truy vết thao tác bảo mật (Audit Logs)' })
  async getAuditLogs() {
    return this.securityCenterService.getAuditLogs();
  }
}
