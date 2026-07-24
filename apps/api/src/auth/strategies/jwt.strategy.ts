import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  username?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'eigu-dev-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(`[JWT_VALIDATE] validate() CALLED. Payload: ${JSON.stringify(payload)}`);
    this.logger.debug(`[JWT_VALIDATE] Looking up user by sub: "${payload.sub}"`);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      this.logger.warn(`[JWT_VALIDATE] User NOT FOUND for sub: "${payload.sub}"`);
      throw new UnauthorizedException('User not found');
    }
    this.logger.debug(`[JWT_VALIDATE] User FOUND: id=${user.id} role=${user.role}`);
    return { id: user.id, email: user.email, role: user.role };
  }
}
