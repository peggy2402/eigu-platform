import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {
    this.initTransporter();
  }

  private async initTransporter() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.debug('Test email account: ' + testAccount.user);
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, otp: string, purpose: string) {
    if (!this.transporter) {
      throw new InternalServerErrorException('Email service not initialized');
    }
    const info = await this.transporter.sendMail({
      from: '"EIGU Platform" <noreply@eigu.platform>',
      to: email,
      subject: `Your OTP for ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6366f1;">EIGU Platform</h2>
          <p>Your OTP code for <strong>${purpose}</strong>:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; background: #f3f4f6; border-radius: 8px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    this.logger.debug(`OTP sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.debug('Ethereal preview: ' + previewUrl);
    }
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) {
      throw new BadRequestException('Email already registered');
    }
    const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: { email: dto.email, username: dto.username, passwordHash, otpCode: otp, otpExpiresAt },
    });

    await this.sendOtpEmail(dto.email, otp, 'Email Verification');
    return { message: 'OTP sent to email. Please verify.', userId: user.id };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('Email already verified');
    if (!user.otpCode || !user.otpExpiresAt) throw new BadRequestException('No OTP requested');
    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiresAt) throw new BadRequestException('OTP expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    return this.generateTokens(user.id, user.email, user.role, user.username);
  }

  async login(dto: LoginDto, clientIp?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { username: dto.identifier },
        ],
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    // Kiểm tra Ban tạm thời / Ban vĩnh viễn
    if (user.isBanned) {
      if (user.bannedUntil) {
        const now = new Date();
        if (now < user.bannedUntil) {
          const formattedUntil = user.bannedUntil.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
          });
          throw new UnauthorizedException({
            isBanned: true,
            bannedUntil: user.bannedUntil,
            banReason: user.banReason,
            message: `Tài khoản của bạn đang bị khóa (Ban) đến ${formattedUntil}. Vui lòng liên hệ Admin!`,
          });
        } else {
          // Đã hết hạn Ban -> Tự động gỡ Ban
          await this.prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, bannedUntil: null, banReason: null },
          });
        }
      } else {
        throw new UnauthorizedException({
          isBanned: true,
          bannedUntil: null,
          banReason: user.banReason,
          message: 'Tài khoản của bạn đã bị khóa (Ban) vĩnh viễn do vi phạm quy định. Vui lòng liên hệ Admin!',
        });
      }
    }

    // Xử lý HĐH & Thiết bị thực tế từ Client payload hoặc User-Agent
    let os = dto.os;
    if (!os && userAgent) {
      if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
      else if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    }

    const device = dto.device || 'EIGU Desktop Client';

    // Cập nhật thông tin đăng nhập thực tế
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastIp: clientIp || '127.0.0.1 (Localhost)',
        lastOs: os || (process.platform === 'darwin' ? 'macOS' : 'Windows'),
        lastDevice: device,
        lastActiveAt: new Date(),
      },
    });

    return this.generateTokens(user.id, user.email, user.role, user.username);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, an OTP has been sent.' };

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt },
    });

    await this.sendOtpEmail(email, otp, 'Password Reset');
    return { message: 'If the email exists, an OTP has been sent.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (!user.otpCode || !user.otpExpiresAt) throw new BadRequestException('No OTP requested');
    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiresAt) throw new BadRequestException('OTP expired');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, otpCode: null, otpExpiresAt: null },
    });

    return { message: 'Password reset successfully' };
  }

  async refreshToken(refreshToken: string, clientIp?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'eigu-dev-secret-key',
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastActiveAt: new Date(),
          ...(clientIp ? { lastIp: clientIp } : {}),
        },
      });
      return this.generateTokens(user.id, user.email, user.role, user.username);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string, clientIp?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, isVerified: true, isBanned: true, bannedUntil: true, banReason: true, createdAt: true, hiddenTabs: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.isBanned) {
      if (user.bannedUntil) {
        if (new Date() < user.bannedUntil) {
          throw new UnauthorizedException({
            isBanned: true,
            bannedUntil: user.bannedUntil,
            banReason: user.banReason,
            message: 'Tài khoản của bạn đang bị khóa (Ban).',
          });
        } else {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, bannedUntil: null, banReason: null },
          });
        }
      } else {
        throw new UnauthorizedException({
          isBanned: true,
          bannedUntil: null,
          banReason: user.banReason,
          message: 'Tài khoản của bạn đã bị khóa (Ban) vĩnh viễn.',
        });
      }
    }

    // Cập nhật lastActiveAt thời gian thực khi user lấy profile
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveAt: new Date(),
        ...(clientIp ? { lastIp: clientIp } : {}),
      },
    });

    // Lấy tab permissions (merge với ALL_TABS để có default visible=true)
    const tabPerms = await this.usersService.getTabPermissions(userId);

    return {
      ...user,
      tabPermissions: tabPerms.map(tp => ({ tabKey: tp.tabKey, visible: tp.visible })),
    };
  }

  private async generateTokens(userId: string, email: string, role: string, username?: string | null) {
    const payload = { sub: userId, email, role, username };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m' as const,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d' as const,
      secret: process.env.JWT_SECRET || 'eigu-dev-secret-key',
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
      select: { hiddenTabs: true },
    });

    // Lấy tab permissions (merge với ALL_TABS để có default visible=true)
    const tabPerms = await this.usersService.getTabPermissions(userId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
        username,
        hiddenTabs: user.hiddenTabs,
        tabPermissions: tabPerms.map(tp => ({ tabKey: tp.tabKey, visible: tp.visible })),
      },
    };
  }
}
