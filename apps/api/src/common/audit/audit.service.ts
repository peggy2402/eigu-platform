import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface AuditEntry {
  userId?: string
  userEmail?: string
  username?: string
  userRole?: string
  action: string
  module: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  device?: string
  payload?: any
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private prisma: PrismaService) {}

  async log(entry: AuditEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: entry.userId,
          userId: entry.userId,
          userEmail: entry.userEmail,
          username: entry.username,
          userRole: entry.userRole,
          action: entry.action,
          module: entry.module,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          device: entry.device,
          payload: entry.payload ? JSON.stringify(entry.payload) : null,
        },
      })
    } catch (e) {
      this.logger.error(`Failed to write audit log: ${(e as Error).message}`)
    }
  }
}
