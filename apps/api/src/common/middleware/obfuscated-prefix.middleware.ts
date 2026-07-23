import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SystemConfigService } from '../../system-config/system-config.service';

@Injectable()
export class ObfuscatedPrefixMiddleware implements NestMiddleware {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl || req.url;

    // Allow static docs or root api health
    if (originalUrl === '/api' || originalUrl === '/api/' || originalUrl.startsWith('/api/docs')) {
      return next();
    }

    if (!originalUrl.startsWith('/api/')) {
      return next();
    }

    const queryString = originalUrl.includes('?') ? '?' + originalUrl.split('?')[1] : '';
    const cleanUrl = originalUrl.split('?')[0];
    const parts = cleanUrl.split('/').filter(Boolean); // e.g. ['api', 'v2-test-2026', 'auth', 'login']

    if (parts.length >= 2) {
      const candidateCode = parts[1]; // e.g. 'v2-test-2026' or 'system-config'

      // Allow public bootstrap endpoint if URL is /api/system-config/bootstrap
      if (candidateCode === 'system-config') {
        const rest = parts.slice(1).join('/'); // 'system-config/bootstrap'
        req.url = '/' + rest + queryString;
        return next();
      }

      // If URL is /api/:code/system-config/bootstrap
      const subPath = parts.slice(2).join('/');
      if (subPath === 'system-config/bootstrap') {
        req.url = '/system-config/bootstrap' + queryString;
        return next();
      }

      // Get active obfuscation code from DB SystemConfig
      const activeConfig = await this.systemConfigService.getBootstrapConfig();
      let activeCode = activeConfig.apiPrefix;
      if (activeCode.startsWith('api/')) {
        activeCode = activeCode.replace(/^api\//, '');
      }

      // Check if candidate obfuscation code matches active DB code
      if (candidateCode === activeCode) {
        // Strip obfuscation code segment and rewrite req.url to controller path relative to /api mount (/auth/login)
        const restPath = parts.slice(2).join('/');
        req.url = '/' + restPath + queryString;
        return next();
      } else {
        // Invalid or outdated obfuscation code -> Return 404 without leaking path
        return res.status(404).json({
          statusCode: 404,
          errorId: `ERR_${Date.now()}_INVALID_OBF`,
          timestamp: new Date().toISOString(),
          message: 'Yêu cầu không hợp lệ hoặc tài nguyên không tồn tại',
        });
      }
    }

    next();
  }
}
