import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with OTP' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto, @Req() req: any) {
    const clientIp = this.extractIp(req);
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto, clientIp, userAgent);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refreshToken(@Body() dto: RefreshTokenDto, @Req() req: any) {
    const clientIp = this.extractIp(req);
    return this.authService.refreshToken(dto.refreshToken, clientIp);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string, @Req() req: any) {
    const clientIp = this.extractIp(req);
    return this.authService.getProfile(userId, clientIp);
  }

  private extractIp(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    let ip = forwarded ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]) : (req.socket?.remoteAddress || req.ip || '');
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1 (Localhost)';
    }
    return ip.replace('::ffff:', '');
  }
}
