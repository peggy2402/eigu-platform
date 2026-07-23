import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ObfuscationConfigService implements OnModuleInit {
  private readonly logger = new Logger(ObfuscationConfigService.name);
  private activeCode: string = 'v2-test-2026';
  private previousCode: string | null = null;
  private gracePeriodExpiresAt: Date | null = null;
  private validCodesSet: Set<string> = new Set(['v2-test-2026']);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncConfigFromDb();
  }

  public async syncConfigFromDb(): Promise<void> {
    try {
      const model = (this.prisma as any).systemConfig;
      if (!model) return;

      const item = await model.findUnique({ where: { key: 'API_PREFIX' } });
      if (item && item.value) {
        let clean = item.value.trim().replace(/^\//, '').replace(/\/$/, '');
        if (clean.startsWith('api/')) clean = clean.substring(4);
        if (clean && clean !== 'api') {
          this.updateActiveCode(clean);
        }
      }
    } catch (e: any) {
      this.logger.warn(`Could not load API_PREFIX from DB, using active local code: ${e?.message}`);
    }
  }

  public updateActiveCode(newCode: string, gracePeriodMinutes: number = 10): void {
    let clean = newCode.trim().replace(/^\//, '').replace(/\/$/, '');
    if (clean.startsWith('api/')) clean = clean.substring(4);

    if (!this.isValidCodeFormat(clean)) {
      this.logger.warn(`Rejected invalid obfuscation code format: "${newCode}"`);
      return;
    }

    if (this.activeCode && this.activeCode !== clean) {
      this.previousCode = this.activeCode;
      this.gracePeriodExpiresAt = new Date(Date.now() + gracePeriodMinutes * 60000);
      this.validCodesSet.add(this.previousCode);
    }

    this.activeCode = clean;
    this.validCodesSet.add(clean);
    this.logger.log(`🔒 Active Obfuscation Code set to: "${clean}" (Previous: "${this.previousCode || 'none'}")`);
  }

  public isValidCodeFormat(code: string): boolean {
    if (!code || code === 'api') return true;
    const regex = /^[a-zA-Z0-9_-]{3,64}$/;
    return regex.test(code);
  }

  public isCodeValid(candidate: string): boolean {
    if (candidate === 'api' || candidate === 'docs' || candidate === 'bootstrap') return true;

    // Check Active Code
    if (this.activeCode === candidate) return true;

    // Check Previous Code within Grace Period
    if (this.previousCode === candidate) {
      if (this.gracePeriodExpiresAt && new Date() <= this.gracePeriodExpiresAt) {
        return true;
      } else {
        // Expired grace period
        this.validCodesSet.delete(this.previousCode);
        this.previousCode = null;
        this.gracePeriodExpiresAt = null;
        return false;
      }
    }

    return this.validCodesSet.has(candidate);
  }

  public getActiveCode(): string {
    return this.activeCode;
  }

  public getPreviousCode(): string | null {
    return this.previousCode;
  }

  public getFullPrefix(): string {
    return `api/${this.activeCode}`;
  }
}
