import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Audit Logs (Nhật ký hoạt động)')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Ghi nhật ký hoạt động người dùng' })
  async createLog(@Body() dto: CreateAuditLogDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || dto.ipAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || dto.userAgent || 'Unknown Agent';

    return this.auditLogsService.createLog({
      ...dto,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent: typeof ip === 'string' ? ip : (Array.isArray(ip) ? ip[0] : '127.0.0.1'),
      device: dto.device || 'EIGU Client',
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê tổng quan dữ liệu thực cho Dashboard Admin & Reports' })
  async getStats() {
    return this.auditLogsService.getStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách nhật ký hoạt động' })
  async getLogs(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('module') module?: string,
    @Query('userEmail') userEmail?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const user = req?.user;

    return this.auditLogsService.getLogs({
      search,
      role,
      module,
      userEmail,
      page,
      limit,
      requesterEmail: user?.email,
      requesterRole: user?.role || 'user',
    });
  }
}
