import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
      console.log('[Ethereal] Test email account:', testAccount.user);
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
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('[Ethereal] Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, otpCode: otp, otpExpiresAt },
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

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    return this.generateTokens(user.id, user.email, user.role);
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'eigu-dev-secret-key',
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isVerified: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m' as const,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d' as const,
      secret: process.env.JWT_SECRET || 'eigu-dev-secret-key',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }
}
