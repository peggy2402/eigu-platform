import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ObfuscationConfigService } from './obfuscation-config.service';

@Injectable()
export class ObfuscationPrefixMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ObfuscationPrefixMiddleware.name);

  constructor(private readonly obfConfigService: ObfuscationConfigService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const rawUrl = req.originalUrl || req.url;
    const isDev = process.env.NODE_ENV !== 'production';

    // 1. Bypass Static / Docs / Health / Root API / System Config Bootstrap / Security
    if (
      rawUrl === '/api' ||
      rawUrl === '/api/' ||
      rawUrl.startsWith('/api/docs') ||
      rawUrl === '/api/bootstrap' ||
      rawUrl.startsWith('/api/bootstrap') ||
      rawUrl === '/api/system-config/bootstrap' ||
      rawUrl.startsWith('/api/system-config/bootstrap') ||
      rawUrl.startsWith('/api/security')
    ) {
      return next();
    }

    // 2. Anti Traversal & Malformed Attack Protection
    if (rawUrl.includes('..') || rawUrl.includes('//') || rawUrl.includes('\\')) {
      if (isDev) {
        this.logger.warn(`[ObfuscationMW] Rejected Traversal Attack: ${rawUrl}`);
      }
      return this.sendStealthNotFound(res);
    }

    if (!rawUrl.startsWith('/api/')) {
      return next();
    }

    // 3. Extract obfCode
    const queryString = rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : '';
    const cleanUrl = rawUrl.split('?')[0];
    const parts = cleanUrl.split('/').filter(Boolean); // ['api', 'v2-test-2026', 'notifications']

    if (parts.length < 2) {
      return this.sendStealthNotFound(res);
    }

    const candidateCode = parts[1]; // e.g. 'v2-test-2026'

    // 4. Validate Token against ObfuscationConfigService (Active + Grace Period L1 Cache)
    const isValidFormat = this.obfConfigService.isValidCodeFormat(candidateCode);
    const isValidCode = isValidFormat && this.obfConfigService.isCodeValid(candidateCode);

    if (isDev) {
      this.logger.debug(
        `[ObfuscationMW] Method: ${req.method} | Incoming: ${rawUrl} | Code: "${candidateCode}" | Valid: ${isValidCode}`,
      );
    }

    if (!isValidCode) {
      return this.sendStealthNotFound(res);
    }

    // 5. Perform Transparent Pre-Routing URL Rewrite
    // Incoming: /api/v2-test-2026/notifications?page=1
    // req.originalUrl remains: /api/v2-test-2026/notifications?page=1
    // req.url becomes: /api/notifications?page=1
    const restPath = parts.slice(2).join('/');
    const rewrittenPath = `/api/${restPath}${queryString}`;

    req.url = rewrittenPath;

    if (isDev) {
      this.logger.debug(`[ObfuscationMW] Rewrote req.url -> "${req.url}" (originalUrl: "${req.originalUrl}")`);
    }

    return next();
  }

  private sendStealthNotFound(res: Response): void {
    res.status(404).json({
      statusCode: 404,
      errorId: `ERR_${Date.now()}_STEALTH`,
      timestamp: new Date().toISOString(),
      message: 'Yêu cầu không hợp lệ hoặc tài nguyên không tồn tại',
    });
  }
}
