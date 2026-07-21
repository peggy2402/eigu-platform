import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { app } from 'electron';
import * as crypto from 'crypto';

import { ApiKeyStore } from './api-key-store';

export class AIVideoPipeline {
  private taskId: string;
  private targetDir: string;
  
  // Lưu trữ danh sách key bị lỗi để tránh gọi lại trong phiên chạy này
  private static blacklistedKeys: Set<string> = new Set();

  constructor() {
    this.taskId = Date.now().toString();
    const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'ai_outputs', this.taskId);
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    this.targetDir = defaultDir;
  }

  /**
   * Lấy API Key khả dụng từ Database mã hóa (ưu tiên) hoặc .env làm fallback
   */
  private getApiKey(envVarName: string): string {
    // 1. Đọc từ ApiKeyStore (Đã được mã hoá Keychain/DPAPI an toàn)
    let keys = ApiKeyStore.getRawKeys(envVarName);

    // 2. Nếu trống, đọc làm phương án dự phòng từ file .env
    if (keys.length === 0) {
      const rawKeys = process.env[envVarName] || '';
      keys = rawKeys.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0);
    }
    
    // Lọc bỏ những key đã bị đánh dấu lỗi/hết tiền (blacklist)
    const validKeys = keys.filter(k => !AIVideoPipeline.blacklistedKeys.has(k));
    
    if (validKeys.length === 0) {
      if (keys.length > 0) {
        console.warn(`[AIVideoPipeline] Cảnh báo: Tất cả keys trong ${envVarName} đều đã bị lỗi/hết hạn.`);
      }
      return '';
    }

    // Chọn ngẫu nhiên một Key trong số các key còn chạy được để chia đều tải (Load Balancing)
    const selectedKey = validKeys[Math.floor(Math.random() * validKeys.length)];
    console.log(`[AIVideoPipeline] Đang sử dụng Key: ...${selectedKey.slice(-6)} (Tổng số key hoạt động: ${validKeys.length}/${keys.length})`);
    return selectedKey;
  }

  /**
   * Đánh dấu một API Key bị lỗi (hết tiền, sai key, rate limit) để xoay sang key khác
   */
  private reportBadKey(key: string) {
    if (key) {
      AIVideoPipeline.blacklistedKeys.add(key);
      console.error(`[AIVideoPipeline] ❌ Đã đưa key ...${key.slice(-6)} vào danh sách đen do gặp lỗi.`);
    }
  }

  /**
   * Sinh Kịch bản phân cảnh (Prompts) dựa trên LLM (Gemini / OpenAI)
   */
  public async generatePrompts(input: string, mode: 'copy' | 'idea'): Promise<string[]> {
    console.log(`[AIVideoPipeline] Sinh kịch bản chế độ: ${mode}`);
    
    const geminiKey = this.getApiKey('GEMINI_API_KEY');
    const openaiKey = this.getApiKey('OPENAI_API_KEY');
    
    if (!geminiKey && !openaiKey) {
      console.log('[AIVideoPipeline] Không tìm thấy API Key khả dụng nào, sử dụng kịch bản mẫu.');
      return new Promise((resolve) => {
        setTimeout(() => {
          if (mode === 'idea') {
            resolve([
              "Scene 1: Cinematic shot of a spaceship landing on a dusty red planet, highly detailed, 4k.",
              "Scene 2: Astronaut stepping out of the ship, glowing alien flora in the background, 8k resolution.",
              "Scene 3: Alien creature extending a glowing tentacle to communicate, cinematic lighting."
            ]);
          } else {
            resolve([
              "Scene 1: A man standing on a mountain peak at sunset, looking into the distance, cinematic.",
              "Scene 2: Close up of his determined face, wind blowing his hair, highly detailed.",
              "Scene 3: Drone shot revealing the vast mountain range as he walks down the trail, 4k."
            ]);
          }
        }, 1500);
      });
    }

    let currentKey = '';
    try {
      if (geminiKey) {
        currentKey = geminiKey;
        console.log('[AIVideoPipeline] Đang sử dụng Gemini API để sinh kịch bản...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are an expert AI video prompt engineer. Break down the user's idea into distinct 5-8 second video generation prompts. Return ONLY a JSON array of strings. Idea: ${input}` }]
            }]
          })
        });
        
        if (response.status === 429 || response.status === 403 || response.status === 400) {
          this.reportBadKey(geminiKey);
          throw new Error('Key Gemini bị giới hạn hoặc lỗi cấu hình.');
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
      } 
      
      if (openaiKey) {
        currentKey = openaiKey;
        console.log('[AIVideoPipeline] Đang sử dụng OpenAI API để sinh kịch bản...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert AI video prompt engineer. Break down the user\'s idea into distinct 5-8 second video generation prompts. Return ONLY a JSON array of strings.'
              },
              {
                role: 'user',
                content: `Generate scenes for this ${mode}: ${input}`
              }
            ]
          })
        });
        
        if (response.status === 429 || response.status === 402) {
          this.reportBadKey(openaiKey);
          throw new Error('Key OpenAI hết tiền hoặc bị rate limit.');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('[AIVideoPipeline] Lỗi khi gọi API Sinh kịch bản:', err);
      // Xoay vòng thử lại bằng key khác nếu có lỗi xảy ra
      this.reportBadKey(currentKey);
      throw new Error('Lỗi khi sinh kịch bản từ LLM API. Vui lòng thử lại để hệ thống xoay key!');
    }
    return [];
  }

  /**
   * Gọi API tạo video (Fal.ai / Replicate)
   */
  public async generateVideoWithAI(prompt: string, model: string, index: number, onProgress: (p: number) => void): Promise<string> {
    console.log(`[AIVideoPipeline] Đang render cảnh ${index} bằng model ${model}...`);
    
    // Check key pool cho Fal.ai
    const falKey = this.getApiKey('FAL_KEY');
    
    if (falKey) {
      console.log(`[AIVideoPipeline] Kết nối Fal.ai với Key: ...${falKey.slice(-6)}`);
      // Thực hiện gọi Fal API thật
      // TODO: const response = await fetch("https://queue.fal.run/fal-ai/kling-video...", { headers: { Authorization: `Key ${falKey}` } });
    }
    
    return new Promise((resolve, reject) => {
      // Mock tiến trình Render
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        onProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          const mockFile = path.join(this.targetDir, `scene_${index}.mp4`);
          fs.writeFileSync(mockFile, 'mock-video-data'); 
          resolve(mockFile);
        }
      }, 500); 
    });
  }

  /**
   * Ghép các video lại với nhau bằng FFmpeg
   */
  public async concatVideos(videoPaths: string[], onProgress: (p: number) => void): Promise<string> {
    console.log(`[AIVideoPipeline] Đang ghép ${videoPaths.length} video...`);
    const outputPath = path.join(this.targetDir, `final_ai_video_${this.taskId}.mp4`);
    
    // Nếu đây là file mock (không phải video thật), chúng ta không thể gọi ffmpeg thật
    // Ta sẽ kiểm tra kích thước file, nếu là file mock (size < 100 bytes) thì trả về luôn để tránh crash FFmpeg
    const isMock = videoPaths.some(p => fs.statSync(p).size < 1000);
    if (isMock) {
      console.log('[AIVideoPipeline] Phát hiện file mock, bỏ qua FFmpeg concat để tránh lỗi.');
      return new Promise((resolve) => {
        setTimeout(() => {
          onProgress(100);
          resolve(outputPath);
        }, 1000);
      });
    }

    return new Promise((resolve, reject) => {
      // Tạo file list txt cho FFmpeg concat demuxer
      const listPath = path.join(this.targetDir, 'files.txt');
      const fileContent = videoPaths.map(p => `file '${p}'`).join('\n');
      fs.writeFileSync(listPath, fileContent);

      const cmd = ffmpeg()
        .input(listPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy']) // Nối nhanh không cần encode lại nếu cùng định dạng
        .save(outputPath);

      cmd.on('progress', (progress) => {
        // progress.percent is often unavailable for concat, so we fake it or use timemark
        onProgress(progress.percent || 50);
      });

      cmd.on('end', () => {
        fs.unlinkSync(listPath); // Xóa file list tạm
        onProgress(100);
        resolve(outputPath);
      });

      cmd.on('error', (err) => {
        reject(err);
      });
    });
  }
}
