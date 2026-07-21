import { Controller, Get, Post, Query, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoiceService } from './voice.service';

@ApiTags('Voice')
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('speakers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách giọng nói từ nhà cung cấp AI Voice' })
  @ApiQuery({ name: 'provider', required: true, enum: ['elevenlabs', 'omnivoice', 'self-hosted'] })
  async getSpeakers(@Query('provider') provider: string) {
    return this.voiceService.getSpeakers(provider);
  }

  @UseGuards(JwtAuthGuard)
  @Post('convert')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Biến đổi giọng nói trong file audio' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio'))
  async convert(
    @UploadedFile() audio: any,
    @Body('provider') provider: string,
    @Body('speaker_id') speakerId: string,
    @Body('text') text?: string,
  ) {
    if (!audio) throw new Error('File audio không được để trống');
    return this.voiceService.convertVoice(audio, provider, speakerId, text);
  }
}
