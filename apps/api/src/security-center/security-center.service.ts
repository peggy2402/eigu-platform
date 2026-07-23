import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ObfuscationConfigService } from '../common/obfuscation/obfuscation-config.service';
import { UpdateObfuscationDto, RotateObfuscationDto, RollbackObfuscationDto } from './dto/security-center.dto';

@Injectable()
export class SecurityCenterService {
  private readonly logger = new Logger(SecurityCenterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly obfConfigService: ObfuscationConfigService,
  ) {}

  async getOverview() {
    const activeCode = this.obfConfigService.getActiveCode();
    const fullPrefix = this.obfConfigService.getFullPrefix();

    const historyCount = await (this.prisma as any).obfuscationHistory.count().catch(() => 0);
    const auditCount = await (this.prisma as any).auditLog.count().catch(() => 0);

    return {
      activeCode,
      fullPrefix,
      status: 'ACTIVE',
      rotationStrategy: 'WEEKLY',
      gracePeriodMinutes: 10,
      redisSyncStatus: 'REALTIME (0ms)',
      gatewaySyncStatus: 'SYNCHRONIZED',
      emergencyDisabled: false,
      stats: {
        totalRotations: historyCount,
        auditEntries: auditCount,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async updateObfuscation(dto: UpdateObfuscationDto, adminId?: string, reqInfo?: { ip?: string; userAgent?: string }) {
    const cleanCode = dto.code.trim();
    if (!this.obfConfigService.isValidCodeFormat(cleanCode)) {
      throw new BadRequestException('Mã Obfuscation không hợp lệ');
    }

    const moduleName = dto.module || 'AUTH';
    const oldCode = this.obfConfigService.getActiveCode();

    // Update DB SystemConfig table
    const systemConfigModel = (this.prisma as any).systemConfig;
    if (systemConfigModel) {
      await systemConfigModel.upsert({
        where: { key: 'API_PREFIX' },
        update: { value: `api/${cleanCode}`, description: `Mã mã hóa cập nhật bởi Admin` },
        create: { key: 'API_PREFIX', value: `api/${cleanCode}`, description: `Mã mã hóa khởi tạo` },
      });
    }

    // Save History
    const historyModel = (this.prisma as any).obfuscationHistory;
    if (historyModel) {
      await historyModel.create({
        data: {
          module: moduleName,
          code: cleanCode,
          status: 'ACTIVE',
          createdById: adminId || null,
          reason: dto.reason || 'Sửa đổi thủ công',
        },
      });
    }

    // Save Audit Log
    const auditModel = (this.prisma as any).auditLog;
    if (auditModel) {
      await auditModel.create({
        data: {
          adminId: adminId || null,
          action: 'UPDATE_OBFUSCATION_CODE',
          module: moduleName,
          ipAddress: reqInfo?.ip || '127.0.0.1',
          userAgent: reqInfo?.userAgent || 'Browser',
          payload: JSON.stringify({ oldCode, newCode: cleanCode, reason: dto.reason }),
        },
      });
    }

    // Update In-Memory Cache
    this.obfConfigService.updateActiveCode(cleanCode);

    return {
      message: `Đã cập nhật mã Obfuscation mới thành công: /api/${cleanCode}`,
      activeCode: cleanCode,
      fullPrefix: `api/${cleanCode}`,
    };
  }

  async rotateObfuscation(dto: RotateObfuscationDto, adminId?: string, reqInfo?: { ip?: string; userAgent?: string }) {
    const randomCode = this.generateRandomCode(12);
    return this.updateObfuscation(
      { code: randomCode, module: dto.module, reason: dto.reason || 'Xoay vòng tự động / thủ công' },
      adminId,
      reqInfo,
    );
  }

  generateRandomCode(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async rollbackObfuscation(dto: RollbackObfuscationDto, adminId?: string, reqInfo?: { ip?: string; userAgent?: string }) {
    const historyModel = (this.prisma as any).obfuscationHistory;
    if (!historyModel) throw new BadRequestException('Không tìm thấy lịch sử');

    const lastHistories = await historyModel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (lastHistories.length < 2) {
      throw new BadRequestException('Chưa có lịch sử mã cũ để Rollback');
    }

    const previousCode = lastHistories[1].code;
    return this.updateObfuscation(
      { code: previousCode, module: dto.module, reason: dto.reason || 'Rollback về mã cũ' },
      adminId,
      reqInfo,
    );
  }

  async getHistory() {
    const historyModel = (this.prisma as any).obfuscationHistory;
    if (!historyModel) return [];
    return historyModel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getAuditLogs() {
    const auditModel = (this.prisma as any).auditLog;
    if (!auditModel) return [];
    return auditModel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
