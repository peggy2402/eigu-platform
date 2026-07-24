import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    this.logger.debug(`[GUARD] canActivate — headers.authorization present: ${!!req.headers['authorization']}`);
    if (req.headers['authorization']) {
      const preview = req.headers['authorization'].substring(0, 60);
      this.logger.debug(`[GUARD] Auth header preview: ${preview}...`);
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    this.logger.debug(`[GUARD] handleRequest — err: ${err?.message || 'null'}, user: ${user ? 'present' : 'null/undefined'}, info: ${info?.message || info || 'null'}`);

    if (err) {
      this.logger.warn(`[GUARD] REJECTING due to err: "${err.message}" | name: "${err.name}"`);
      throw err;
    }
    if (!user) {
      this.logger.warn(`[GUARD] REJECTING — user is falsy. info: ${JSON.stringify(info)}`);
      throw new UnauthorizedException('Unauthorized');
    }
    this.logger.debug(`[GUARD] AUTHENTICATED user: id=${user.id} role=${user.role}`);
    return user;
  }
}
