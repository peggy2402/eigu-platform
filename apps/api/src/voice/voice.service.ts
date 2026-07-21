import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as os from 'os';
import FormData = require('form-data');

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface VoiceSpeaker {
  id: string;
  name: string;
  accent?: string;
  gender?: string;
  previewUrl?: string;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  async getSpeakers(provider: string): Promise<{ speakers: VoiceSpeaker[] }> {
    switch (provider) {
      case 'elevenlabs':
        return this.getElevenLabsVoices();
      case 'omnivoice':
        return this.getOmniVoiceVoices();
      case 'self-hosted':
        return this.getSelfHostedVoices();
      default:
        throw new HttpException(`Provider "${provider}" không được hỗ trợ`, HttpStatus.BAD_REQUEST);
    }
  }

  async convertVoice(
    audio: MulterFile,
    provider: string,
    speakerId: string,
    text?: string,
  ): Promise<{ audio: string; format: string }> {
    switch (provider) {
      case 'elevenlabs':
        return this.convertElevenLabs(audio, speakerId);
      case 'omnivoice':
        return this.convertOmniVoiceApi(audio, speakerId, text);
      case 'self-hosted':
        return this.convertSelfHosted(audio, speakerId, text);
      default:
        throw new HttpException(`Provider "${provider}" không được hỗ trợ`, HttpStatus.BAD_REQUEST);
    }
  }

  // ─── ElevenLabs ──────────────────────────────────

  private async getElevenLabsVoices(): Promise<{ speakers: VoiceSpeaker[] }> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new HttpException('ElevenLabs API key chưa được cấu hình.', HttpStatus.SERVICE_UNAVAILABLE);
    }
    try {
      const { data } = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
        timeout: 10000,
      });
      const speakers: VoiceSpeaker[] = (data.voices || []).map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        accent: v.labels?.accent || undefined,
        gender: v.labels?.gender || undefined,
        previewUrl: v.preview_url || `https://api.elevenlabs.io/v1/voices/${v.voice_id}/preview`,
      }));
      return { speakers };
    } catch (err: any) {
      this.logger.error(`ElevenLabs API error: ${err.message}`);
      throw new HttpException('Không thể kết nối ElevenLabs API.', HttpStatus.BAD_GATEWAY);
    }
  }

  private async convertElevenLabs(
    audio: MulterFile,
    speakerId: string,
  ): Promise<{ audio: string; format: string }> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new HttpException('ElevenLabs API key chưa được cấu hình.', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const form = new FormData();
      form.append('audio', audio.buffer, {
        filename: audio.originalname || 'input.wav',
        contentType: audio.mimetype || 'audio/wav',
      });
      form.append('model_id', 'eleven_english_sts_v2');

      const { data } = await axios.post(
        `https://api.elevenlabs.io/v1/voice-conversion`,
        form,
        {
          headers: {
            'xi-api-key': apiKey,
            ...form.getHeaders(),
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        },
      );

      const outDir = path.join(os.tmpdir(), 'eigu-voice');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `converted_${Date.now()}.mp3`);
      fs.writeFileSync(outPath, Buffer.from(data));

      return { audio: outPath, format: 'mp3' };
    } catch (err: any) {
      this.logger.error(`ElevenLabs convert error: ${err.message}`);
      throw new HttpException('Lỗi khi biến đổi giọng nói qua ElevenLabs.', HttpStatus.BAD_GATEWAY);
    }
  }

  // ─── OmniVoice qua inference.sh ────────────────
  // inference.sh là API proxy cho OmniVoice model
  // API key lấy tại https://app.inference.sh/settings/keys

  private async getOmniVoiceVoices(): Promise<{ speakers: VoiceSpeaker[] }> {
    return {
      speakers: [
        { id: 'female, british accent', name: 'Nữ giọng Anh', accent: 'british', gender: 'female' },
        { id: 'male, american accent', name: 'Nam giọng Mỹ', accent: 'american', gender: 'male' },
        { id: 'female, low pitch, american accent', name: 'Nữ trầm giọng Mỹ', accent: 'american', gender: 'female' },
        { id: 'male, low pitch, british accent', name: 'Nam trầm giọng Anh', accent: 'british', gender: 'male' },
        { id: 'female, high pitch', name: 'Nữ cao độ', gender: 'female' },
        { id: 'male, moderate pitch', name: 'Nam trung bình', gender: 'male' },
        { id: 'child', name: 'Trẻ em', gender: 'child' },
        { id: 'elderly, american accent', name: 'Người già giọng Mỹ', accent: 'american' },
      ],
    };
  }

  private async convertOmniVoiceApi(
    audio: MulterFile,
    speakerId: string,
    text?: string,
  ): Promise<{ audio: string; format: string }> {
    const apiKey = process.env.OMNI_VOICE_API_KEY;
    if (!apiKey) {
      throw new HttpException(
        'OMNI_VOICE_API_KEY chưa được cấu hình. Lấy key tại https://app.inference.sh/settings/keys',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const input: any = {
        mode: 'voice_cloning',
        ref_audio: '',
        ref_text: '',
        instruct: speakerId || 'female, british accent',
        speed: 1.0,
      };

      if (text) {
        input.text = text;
      }

      const { data } = await axios.post(
        'https://api.inference.sh/v1/apps/infsh/omnivoice/run',
        { input },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        },
      );

      const audioUrl = data?.output?.audio;
      if (!audioUrl) {
        throw new Error('Không nhận được audio từ inference.sh');
      }

      // Download audio from the returned URL
      const { data: audioData } = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const outDir = path.join(os.tmpdir(), 'eigu-voice');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `converted_${Date.now()}.wav`);
      fs.writeFileSync(outPath, Buffer.from(audioData));

      return { audio: outPath, format: 'wav' };
    } catch (err: any) {
      this.logger.error(`OmniVoice inference.sh error: ${err.message}`);
      throw new HttpException(
        `Lỗi OmniVoice API: ${err.response?.data?.message || err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // ─── Self-hosted OmniVoice (Python sidecar) ─────

  private async getSelfHostedVoices(): Promise<{ speakers: VoiceSpeaker[] }> {
    const host = process.env.OMNIVOICE_HOST || 'http://127.0.0.1:8765';
    try {
      const { data } = await axios.get(`${host}/voices`, { timeout: 5000 });
      return { speakers: data.speakers || [] };
    } catch {
      return {
        speakers: [
          { id: 'default', name: 'Default (local model)' },
        ],
      };
    }
  }

  private async convertSelfHosted(
    audio: MulterFile,
    speakerId: string,
    text?: string,
    refAudio?: string,
  ): Promise<{ audio: string; format: string }> {
    const mode = process.env.OMNIVOICE_MODE || 'python';

    if (mode === 'python') {
      return this.runOmniVoicePython(audio, speakerId, text);
    }

    const host = process.env.OMNIVOICE_HOST || 'http://127.0.0.1:8765';
    try {
      const form = new FormData();
      form.append('audio', audio.buffer, {
        filename: audio.originalname || 'input.wav',
        contentType: audio.mimetype || 'audio/wav',
      });
      if (speakerId) form.append('speaker_id', speakerId);
      if (text) form.append('text', text);

      const { data } = await axios.post(`${host}/convert`, form, {
        headers: { ...form.getHeaders() },
        responseType: 'arraybuffer',
        timeout: 300000,
      });

      const outDir = path.join(os.tmpdir(), 'eigu-voice');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `converted_${Date.now()}.wav`);
      fs.writeFileSync(outPath, Buffer.from(data));

      return { audio: outPath, format: 'wav' };
    } catch (err: any) {
      this.logger.error(`Self-hosted OmniVoice error: ${err.message}`);
      throw new HttpException('Lỗi khi chạy OmniVoice local.', HttpStatus.BAD_GATEWAY);
    }
  }

  private async runOmniVoicePython(
    audio: MulterFile,
    speakerId: string,
    _text?: string,
  ): Promise<{ audio: string; format: string }> {
    const scriptPath = path.resolve(__dirname, '../../../scripts/omnivoice_infer.py');
    const venvDir = process.env.OMNIVOICE_VENV || path.resolve(__dirname, '../../../scripts/venv');
    const pythonBin = path.join(venvDir, 'bin', 'python3');

    if (!fs.existsSync(scriptPath)) {
      throw new HttpException(
        'Self-hosted OmniVoice chưa được cài đặt. Chạy: bash apps/api/scripts/setup_omnivoice.sh',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (!fs.existsSync(pythonBin)) {
      throw new HttpException(
        `Không tìm thấy Python venv tại ${pythonBin}. Chạy: bash apps/api/scripts/setup_omnivoice.sh`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    const tmpDir = path.join(os.tmpdir(), 'eigu-voice');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const inputPath = path.join(tmpDir, `input_${Date.now()}.wav`);
    fs.writeFileSync(inputPath, audio.buffer);

    const outputPath = path.join(tmpDir, `output_${Date.now()}.wav`);

    return new Promise((resolve, reject) => {
      const args = [scriptPath, '--input', inputPath, '--output', outputPath];
      if (speakerId) args.push('--instruct', speakerId);

      const proc = spawn(pythonBin, args);
      let stderr = '';

      proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

      proc.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(outputPath)) {
          this.logger.error(`OmniVoice Python error: ${stderr}`);
          reject(new HttpException(`OmniVoice Python failed: ${stderr}`, HttpStatus.INTERNAL_SERVER_ERROR));
          return;
        }
        resolve({ audio: outputPath, format: 'wav' });
      });

      proc.on('error', (err) => {
        this.logger.error(`OmniVoice Python spawn error: ${err.message}`);
        reject(new HttpException('Không thể chạy OmniVoice. Kiểm tra venv.', HttpStatus.INTERNAL_SERVER_ERROR));
      });
    });
  }
}
