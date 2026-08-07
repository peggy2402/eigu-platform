import {
  Injectable,
  OnModuleInit,
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
import * as fs from 'fs';
import * as path from 'path';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {
    this.initTransporter();
  }

  async onModuleInit() {
    await this.seedDefaultUser();
  }

  private async seedDefaultUser() {
    try {
      const passwordHash = await bcrypt.hash('123456', 10);

      // Seed Admin User
      const existingAdmin = await this.prisma.user.findFirst({
        where: { OR: [{ email: 'admin@eigu.com' }, { username: 'admin' }] }
      });
      if (!existingAdmin) {
        await this.prisma.user.create({
          data: {
            email: 'admin@eigu.com',
            username: 'admin',
            passwordHash,
            isVerified: true,
            role: 'admin',
            balance: 1000000,
          }
        });
        this.logger.log('Default admin user created: admin / 123456');
      } else {
        await this.prisma.user.update({
          where: { id: existingAdmin.id },
          data: { passwordHash, isVerified: true, role: 'admin' }
        });
      }

      // Seed Staff User
      const existingStaff = await this.prisma.user.findFirst({
        where: { OR: [{ email: 'staff@eigu.com' }, { username: 'staff' }] }
      });
      if (!existingStaff) {
        await this.prisma.user.create({
          data: {
            email: 'staff@eigu.com',
            username: 'staff',
            passwordHash,
            isVerified: true,
            role: 'staff',
            balance: 500000,
          }
        });
        this.logger.log('Default staff user created: staff / 123456');
      } else {
        await this.prisma.user.update({
          where: { id: existingStaff.id },
          data: { passwordHash, isVerified: true, role: 'staff' }
        });
      }

      // Seed Demo User
      const existingUser = await this.prisma.user.findFirst({
        where: { OR: [{ email: 'user@eigu.com' }, { username: 'user' }] }
      });
      if (!existingUser) {
        await this.prisma.user.create({
          data: {
            email: 'user@eigu.com',
            username: 'user',
            passwordHash,
            isVerified: true,
            role: 'user',
            balance: 150000,
          }
        });
        this.logger.log('Default demo user created: user / 123456');
      } else {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash, isVerified: true, role: 'user' }
        });
      }

    } catch (err: any) {
      this.logger.error('Failed to seed default users:', err.message);
    }
  }

  private async initTransporter() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || (smtpUser?.includes('gmail') ? 'smtp.gmail.com' : 'smtp.resend.com');
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpSecure = process.env.SMTP_SECURE !== 'false';

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });
      this.logger.log(`[SMTP] Transporter initialized for ${smtpUser} via ${smtpHost}:${smtpPort}`);
    } else {
      this.logger.warn('[SMTP WARN] SMTP_USER or SMTP_PASS missing from environment variables');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        });
        this.logger.log(`[SMTP] Ethereal test account initialized: ${testAccount.user}`);
      } catch (err: any) {
        this.logger.error(`[SMTP ERROR] Failed to create Ethereal test account: ${err?.message}`);
      }
    }
  }

  private async sendViaResendHttp(apiKey: string, sender: string, to: string, subject: string, html: string) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `EIGU Platform <${sender}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Resend HTTP API Error ${res.status}: ${data.message || data.error || JSON.stringify(data)}`);
    }
    return data;
  }

  async testSmtp(targetEmail: string) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : undefined;
    const smtpHost = process.env.SMTP_HOST || 'not set';
    const smtpPort = process.env.SMTP_PORT || 'not set';
    const smtpSecure = process.env.SMTP_SECURE || 'not set';
    const smtpFrom = process.env.SMTP_FROM || 'not set';
    const resendKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith('re_') ? process.env.SMTP_PASS : null);

    const diag: any = {
      timestamp: new Date().toISOString(),
      mode: resendKey ? 'RESEND_HTTPS_REST_API (Port 443)' : 'NODEMAILER_SMTP (Raw TCP Socket)',
      env: {
        SMTP_USER: smtpUser || 'MISSING',
        SMTP_PASS: smtpPass || 'MISSING',
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_SECURE: smtpSecure,
        SMTP_FROM: smtpFrom,
        RESEND_API_KEY_DETECTED: !!resendKey,
      },
      result: '',
      error: null,
    };

    const sender = process.env.SMTP_FROM || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@') ? process.env.SMTP_USER : 'noreply@eigu.site');
    const testOtp = this.generateOtp();
    const subject = `[EIGU Platform] Test Diagnostic OTP Email ${testOtp}`;
    const html = `<p>Test OTP Code: <strong>${testOtp}</strong></p>`;

    if (resendKey) {
      try {
        const result = await this.sendViaResendHttp(resendKey, sender, targetEmail, subject, html);
        diag.result = `SUCCESS: Resend HTTPS REST API sent email to ${targetEmail} (ID: ${result.id})`;
        return diag;
      } catch (err: any) {
        diag.result = 'FAILED: Error during Resend HTTPS REST API send';
        diag.error = {
          message: err?.message,
          stack: err?.stack,
        };
        return diag;
      }
    }

    if (!this.transporter) {
      await this.initTransporter();
    }

    if (!this.transporter) {
      diag.result = 'FAILED: Transporter could not be initialized';
      return diag;
    }

    try {
      await this.transporter.verify();
      const info = await this.transporter.sendMail({
        from: `"EIGU Platform" <${sender}>`,
        to: targetEmail,
        subject: subject,
        html: html,
      });

      diag.result = `SUCCESS: SMTP sent email to ${targetEmail} (MessageID: ${info.messageId})`;
      return diag;
    } catch (err: any) {
      diag.result = 'FAILED: Error during SMTP connection or sendMail';
      diag.error = {
        message: err?.message,
        code: err?.code,
        command: err?.command,
        response: err?.response,
        stack: err?.stack,
      };
      return diag;
    }
  }

  private getLogoSrc(): string {
    try {
      const pathsToTry = [
        path.join(process.cwd(), 'apps/web/public/logo.png'),
        path.join(process.cwd(), 'dist/apps/web/public/logo.png'),
        path.join(process.cwd(), 'public/logo.png'),
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          return `data:image/png;base64,${buf.toString('base64')}`;
        }
      }
    } catch (e) {
      // fallback
    }
    return 'https://eigu.site/logo.png';
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, otp: string, purpose: string) {
    const resendKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith('re_') ? process.env.SMTP_PASS : null);
    const sender = process.env.SMTP_FROM || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@') ? process.env.SMTP_USER : 'noreply@eigu.site');
    const subject = `[EIGU Platform] Mã xác thực OTP ${otp} - ${purpose}`;
    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EIGU Platform - OTP Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: #13141f; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); overflow: hidden;">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td style="padding: 32px 28px 24px 28px; background: linear-gradient(180deg, rgba(99, 102, 241, 0.18) 0%, rgba(19, 20, 31, 0) 100%); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <img src="${this.getLogoSrc()}" alt="EIGU Logo" width="52" height="52" style="display: block; margin: 0 auto 12px auto; border-radius: 12px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);" />
              <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">EIGU Platform</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">AI Video Automation & MMO Growth Engine</div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              
              <!-- VIETNAMESE SECTION -->
              <div style="margin-bottom: 24px; text-align: center;">
                <h1 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Mã Xác Thực OTP</h1>
                <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin: 0;">
                  Mã 6 số bên dưới dùng để <strong>xác thực tài khoản EIGU Platform</strong> của bạn:
                </p>
              </div>

              <!-- OTP CODE BOX -->
              <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%); border: 1.5px solid #6366f1; border-radius: 14px; padding: 20px 12px; text-align: center; margin-bottom: 24px; box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.15);">
                <div style="font-size: 36px; font-weight: 900; color: #818cf8; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; margin-left: 10px;">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #a5b4fc; margin-top: 8px; font-weight: 600;">
                  Mã có hiệu lực trong vòng 10 phút
                </div>
              </div>

              <!-- VIETNAMESE NOTICE -->
              <p style="font-size: 12.5px; color: #94a3b8; line-height: 1.6; text-align: center; margin: 0 0 20px 0; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                Vì lý do bảo mật, tuyệt đối <strong>không chia sẻ mã OTP này</strong> cho bất kỳ ai.
              </p>

              <!-- DIVIDER -->
              <div style="border-top: 1px dashed rgba(255, 255, 255, 0.12); margin: 20px 0;"></div>

              <!-- ENGLISH SECTION -->
              <div style="text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
                <div style="font-weight: 700; color: #94a3b8; margin-bottom: 2px;">English Summary</div>
                Your 6-digit OTP verification code is <strong style="color: #cbd5e1;">${otp}</strong>. Valid for 10 minutes. Please do not share this code with anyone.
              </div>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 20px 24px; background: #0f1019; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
                Cần trợ giúp? Truy cập website: <a href="https://eigu.site" style="color: #818cf8; text-decoration: none; font-weight: 600;">eigu.site</a>
              </div>
              <div style="font-size: 11px; color: #475569;">
                © 2026 EIGU Platform. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 1. If Resend API Key is available, use Resend HTTPS REST API (Port 443 - Never blocked on Render)
    if (resendKey) {
      try {
        const result = await this.sendViaResendHttp(resendKey, sender, email, subject, html);
        this.logger.log(`[Resend HTTP API] Successfully sent OTP to ${email} (ID: ${result.id})`);
        return;
      } catch (err: any) {
        this.logger.error(`[Resend HTTP API ERROR] Failed to send OTP email to ${email}: ${err?.message}`, err?.stack);
      }
    }

    // 2. Nodemailer SMTP Fallback (Raw TCP Socket)
    if (!this.transporter) {
      await this.initTransporter();
    }
    if (!this.transporter) {
      this.logger.error('[SMTP ERROR] Email service transporter could not be initialized');
      return;
    }
    const mailPromise = (async () => {
      try {
        const info = await this.transporter!.sendMail({
          from: `"EIGU Platform" <${sender}>`,
          to: email,
          subject: `[EIGU Platform] Mã xác thực OTP ${otp} - ${purpose}`,
          html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EIGU Platform - OTP Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: #13141f; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); overflow: hidden;">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td style="padding: 32px 28px 24px 28px; background: linear-gradient(180deg, rgba(99, 102, 241, 0.18) 0%, rgba(19, 20, 31, 0) 100%); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <img src="${this.getLogoSrc()}" alt="EIGU Logo" width="52" height="52" style="display: block; margin: 0 auto 12px auto; border-radius: 12px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);" />
              <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">EIGU Platform</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">AI Video Automation & MMO Growth Engine</div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              
              <!-- VIETNAMESE SECTION -->
              <div style="margin-bottom: 24px; text-align: center;">
                <h1 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Mã Xác Thực OTP</h1>
                <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin: 0;">
                  Mã 6 số bên dưới dùng để <strong>xác thực tài khoản EIGU Platform</strong> của bạn:
                </p>
              </div>

              <!-- OTP CODE BOX -->
              <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%); border: 1.5px solid #6366f1; border-radius: 14px; padding: 20px 12px; text-align: center; margin-bottom: 24px; box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.15);">
                <div style="font-size: 36px; font-weight: 900; color: #818cf8; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; margin-left: 10px;">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #a5b4fc; margin-top: 8px; font-weight: 600;">
                  Mã có hiệu lực trong vòng 10 phút
                </div>
              </div>

              <!-- VIETNAMESE NOTICE -->
              <p style="font-size: 12.5px; color: #94a3b8; line-height: 1.6; text-align: center; margin: 0 0 20px 0; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                Vì lý do bảo mật, tuyệt đối <strong>không chia sẻ mã OTP này</strong> cho bất kỳ ai.
              </p>

              <!-- DIVIDER -->
              <div style="border-top: 1px dashed rgba(255, 255, 255, 0.12); margin: 20px 0;"></div>

              <!-- ENGLISH SECTION -->
              <div style="text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
                <div style="font-weight: 700; color: #94a3b8; margin-bottom: 2px;">English Summary</div>
                Your 6-digit OTP verification code is <strong style="color: #cbd5e1;">${otp}</strong>. Valid for 10 minutes. Please do not share this code with anyone.
              </div>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 20px 24px; background: #0f1019; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
                Cần trợ giúp? Truy cập website: <a href="https://eigu.site" style="color: #818cf8; text-decoration: none; font-weight: 600;">eigu.site</a>
              </div>
              <div style="font-size: 11px; color: #475569;">
                © 2026 EIGU Platform. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        });
        this.logger.log(`[SMTP] Successfully sent OTP to ${email} (MessageID: ${info.messageId})`);
      } catch (err: any) {
        this.logger.error(`[SMTP ERROR] Failed to send OTP email to ${email}: ${err?.message}`, err?.stack);
      }
    })();

    // Non-blocking timeout: if SMTP socket takes > 6s, let HTTP response unblock while email sends in background
    const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => {
      this.logger.warn(`[SMTP WARN] Email send for ${email} exceeded 6s, proceeding in background`);
      resolve();
    }, 6000));

    await Promise.race([mailPromise, timeoutPromise]);
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

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại trong hệ thống');
    if (user.isVerified) throw new BadRequestException('Email đã được xác thực rồi');

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt },
    });

    await this.sendOtpEmail(email, otp, 'Email Verification');

    return { message: 'OTP mới đã được gửi tới email của bạn' };
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

    if (!user.isVerified) {
      const otp = this.generateOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpiresAt },
      });
      await this.sendOtpEmail(user.email, otp, 'Email Verification');
      throw new UnauthorizedException({ message: 'Email not verified', email: user.email });
    }

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

    // Tự động ghi nhận Nhật ký hoạt động (AuditLog) cho Đăng nhập
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          username: user.username,
          userRole: user.role,
          action: 'LOGIN',
          module: 'auth',
          ipAddress: clientIp || '127.0.0.1',
          userAgent: userAgent || 'Unknown Agent',
          device: device,
          payload: JSON.stringify({ os: os || process.platform, device, loginTime: new Date().toISOString() }),
        },
      });
    } catch (e) {
      // Non-blocking catch for audit log
    }

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
      select: { id: true, email: true, username: true, role: true, isVerified: true, isBanned: true, bannedUntil: true, banReason: true, createdAt: true, hiddenTabs: true, balance: true },
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
      balance: Number(user.balance || 0),
      tabPermissions: tabPerms.map(tp => ({ tabKey: tp.tabKey, visible: tp.visible })),
    };
  }

  private async generateTokens(userId: string, email: string, role: string, username?: string | null) {
    const payload = { sub: userId, email, role, username };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      secret: process.env.JWT_SECRET || 'eigu-dev-secret-key',
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
      select: { hiddenTabs: true, balance: true },
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
        balance: Number(user.balance || 0),
        hiddenTabs: user.hiddenTabs,
        tabPermissions: tabPerms.map(tp => ({ tabKey: tp.tabKey, visible: tp.visible })),
      },
    };
  }
}
