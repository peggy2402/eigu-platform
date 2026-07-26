import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { app } from 'electron';
import * as crypto from 'crypto';

import { ApiKeyStore } from './api-key-store.service';
import { getProjectMediaDir } from '../utils/path.utils';

export class AIVideoPipeline {
  private taskId: string;
  private targetDir: string;
  
  // Lưu trữ danh sách key bị lỗi để tránh gọi lại trong phiên chạy này
  private static blacklistedKeys: Set<string> = new Set();

  constructor(projectFilePath?: string) {
    this.taskId = Date.now().toString();
    if (projectFilePath) {
      this.targetDir = getProjectMediaDir(projectFilePath);
    } else {
      this.targetDir = '';
    }
  }

  public getTargetDir(): string {
    return this.targetDir;
  }

  /**
   * Lấy API Key khả dụng từ Database mã hóa (ưu tiên) hoặc .env làm fallback
   */
  private getApiKey(envVarName: string): string {
    let keys = ApiKeyStore.getRawKeys(envVarName);

    if (keys.length === 0) {
      const rawKeys = process.env[envVarName] || '';
      keys = rawKeys.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0);
    }
    
    const validKeys = keys.filter(k => !AIVideoPipeline.blacklistedKeys.has(k));
    
    if (validKeys.length === 0) {
      if (keys.length > 0) {
        console.warn(`[AIVideoPipeline] Cảnh báo: Tất cả keys trong ${envVarName} đều đã bị lỗi/hết hạn.`);
      }
      return '';
    }

    const selectedKey = validKeys[Math.floor(Math.random() * validKeys.length)];
    console.log(`[AIVideoPipeline] Đang sử dụng Key: ...${selectedKey.slice(-6)} (Tổng số key hoạt động: ${validKeys.length}/${keys.length})`);
    return selectedKey;
  }

  /**
   * Đánh dấu một API Key bị lỗi để xoay sang key khác
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
  public async generatePrompts(input: string, mode: 'copy' | 'idea' | 'image', images: string[] = []): Promise<string[]> {
    console.log(`[AIVideoPipeline] Sinh kịch bản chế độ: ${mode}`);
    
    const geminiKey = this.getApiKey('GEMINI_API_KEY');
    const openaiKey = this.getApiKey('OPENAI_API_KEY');
    
    if (!geminiKey && !openaiKey) {
      throw new Error('Chưa cấu hình API Key cho Gemini hoặc OpenAI — Vui lòng vào Cài đặt > Provider để thêm API Key trước khi tạo kịch bản.');
    }

    let currentKey = geminiKey || openaiKey;
    const systemPrompt = `You are a professional video prompt engineer. Create detailed video scene generation prompts for AI video models based on the user request. Respond in JSON array format containing strings for scenes. Example: ["Scene 1: ...", "Scene 2: ..."]`;

    try {
      if (geminiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nUser Input (${mode}): ${input}` }]
            }]
          })
        });

        if (response.status === 429 || response.status === 402) {
          this.reportBadKey(geminiKey);
          throw new Error('Key Gemini API bị hết hạn hoặc rate limit.');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Generate scenes for this ${mode}: ${input}` }
            ]
          })
        });
        
        if (response.status === 429 || response.status === 402) {
          this.reportBadKey(openaiKey);
          throw new Error('Key OpenAI hết tiền hoặc bị rate limit.');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('OpenAI API không trả về nội dung hợp lệ.');
        }
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
      }
    } catch (err) {
      console.error('[AIVideoPipeline] Lỗi khi gọi API Sinh kịch bản:', err);
      this.reportBadKey(currentKey);
      throw new Error('Lỗi khi sinh kịch bản từ LLM API. Vui lòng thử lại để hệ thống xoay key!');
    }
  }

  /**
   * Gọi API tạo video thật (Fal.ai API)
   */
  public async generateVideoWithAI(
    prompt: string,
    model: string = 'fal-ai/hunyuan-video',
    sceneId: string | number = 1,
    onProgress?: (p: number) => void
  ): Promise<string> {
    if (!this.targetDir) {
      throw new Error('Vui lòng lưu dự án (Ctrl+S) trước khi thực hiện Render. Video render cần được nén và quản lý cạnh tệp dự án.');
    }

    console.log(`[AIVideoPipeline] Đang render cảnh ${sceneId} bằng model ${model}...`);
    
    const falKey = this.getApiKey('FAL_KEY');
    if (!falKey) {
      throw new Error('Chưa cấu hình API Key cho Fal.ai (FAL_KEY) — Vui lòng vào Cài đặt > Provider để thêm API Key trước khi Render.');
    }

    const sceneFileName = typeof sceneId === 'string' && sceneId.startsWith('scene_')
      ? `${sceneId}.mp4`
      : `scene_${sceneId}.mp4`;
    const outputPath = path.join(this.targetDir, sceneFileName);

    console.log(`[AIVideoPipeline] Đang gọi Fal.ai API thật cho Cảnh: ${sceneId} (Key: ...${falKey.slice(-6)})`);
    if (onProgress) onProgress(10);

    try {
      const modelEndpoint = model.includes('/') ? model : `fal-ai/${model}`;
      const queueUrl = `https://queue.fal.run/${modelEndpoint}`;
      
      const submitRes = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: '16:9'
        })
      });

      if (!submitRes.ok) {
        const errText = await submitRes.text();
        if (submitRes.status === 401 || submitRes.status === 403) {
          this.reportBadKey(falKey);
        }
        throw new Error(`Fal.ai API Error (${submitRes.status}): ${errText}`);
      }

      const submitData = await submitRes.json();
      const requestId = submitData.request_id;
      const statusUrl = submitData.status_url || `https://queue.fal.run/${modelEndpoint}/requests/${requestId}/status`;
      const responseUrl = submitData.response_url || `https://queue.fal.run/${modelEndpoint}/requests/${requestId}`;

      if (onProgress) onProgress(30);

      // Poll status until completed
      let status = 'IN_QUEUE';
      let attempts = 0;
      while (status !== 'COMPLETED' && attempts < 120) {
        attempts++;
        await new Promise(r => setTimeout(r, 2500));
        
        const statusRes = await fetch(statusUrl, {
          headers: { 'Authorization': `Key ${falKey}` }
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          status = statusData.status;
          const progressPercent = Math.min(90, 30 + Math.floor(attempts * 1.5));
          if (onProgress) onProgress(progressPercent);
          
          if (status === 'FAILED') {
            throw new Error(`Fal.ai render job failed: ${JSON.stringify(statusData.error || statusData)}`);
          }
        }
      }

      if (status !== 'COMPLETED') {
        throw new Error('Timeout: Render job trên Fal.ai vượt quá thời gian chờ tối đa (5 phút).');
      }

      const resultRes = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${falKey}` }
      });
      const resultData = await resultRes.json();
      const videoUrl = resultData.video?.url || resultData.video_url || resultData.videos?.[0]?.url;

      if (!videoUrl) {
        throw new Error('Fal.ai API không trả về URL video hợp lệ.');
      }

      if (onProgress) onProgress(95);

      console.log(`[AIVideoPipeline] Đang tải video từ URL trả về: ${videoUrl}`);
      const vidRes = await fetch(videoUrl);
      if (!vidRes.ok) {
        throw new Error(`Không thể tải file video từ Fal.ai URL (${vidRes.status}): ${vidRes.statusText}`);
      }

      const arrayBuffer = await vidRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (!fs.existsSync(this.targetDir)) {
        fs.mkdirSync(this.targetDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, buffer);

      if (onProgress) onProgress(100);
      console.log(`[AIVideoPipeline] ✅ Ghi video THẬT thành công xuống đĩa: ${outputPath} (${buffer.length} bytes)`);
      return outputPath;

    } catch (err: any) {
      console.error('[AIVideoPipeline] Lỗi gọi Fal.ai API:', err);
      this.reportBadKey(falKey);
      throw err;
    }
  }

  /**
   * Ghép các video lại với nhau bằng FFmpeg
   */
  public async concatVideos(videoPaths: string[], onProgress: (p: number) => void): Promise<string> {
    console.log(`[AIVideoPipeline] Đang ghép ${videoPaths.length} video bằng FFmpeg...`);
    const outputPath = path.join(this.targetDir, `final_ai_video_${this.taskId}.mp4`);
    
    for (const p of videoPaths) {
      if (!fs.existsSync(p)) {
        throw new Error(`File video phân cảnh không tồn tại để ghép: ${p}`);
      }
    }

    return new Promise((resolve, reject) => {
      const listPath = path.join(this.targetDir, 'files.txt');
      const fileContent = videoPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
      fs.writeFileSync(listPath, fileContent);

      const cmd = ffmpeg()
        .input(listPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .save(outputPath);

      cmd.on('progress', (progress) => {
        onProgress(Math.min(99, progress.percent || 50));
      });

      cmd.on('end', () => {
        try { fs.unlinkSync(listPath); } catch (e) {}
        onProgress(100);
        resolve(outputPath);
      });

      cmd.on('error', (err) => {
        try { fs.unlinkSync(listPath); } catch (e) {}
        reject(err);
      });
    });
  }
}
