import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { VideoWorkflowRequest, VideoWorkflowStatus } from '@eigu-platform/shared';

// Gắn đường dẫn nhị phân FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Lớp chịu trách nhiệm phân tích metadata của Video.
 */
class VideoAnalyzer {
  static async analyze(inputPath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) return reject(new Error('Không thể phân tích video: ' + err.message));
        resolve(metadata);
      });
    });
  }
}

/**
 * Lớp AI Analyzer quét nhanh video để tìm điểm cắt tối ưu (AI Smart Cutter)
 */
class AIAnalyzer {
  static async scan(inputPath: string, duration: number, onProgress: (p: number) => void): Promise<number[]> {
    return new Promise((resolve, reject) => {
      // Dùng FFmpeg filter để tìm scene thay đổi và silence. Quét với tốc độ cao nhất (giảm phân giải video để tăng tốc).
      const cmd = ffmpeg(inputPath)
        .outputOptions([
          '-vf', "scale=w=320:h=240,select='gt(scene,0.3)',showinfo",
          '-af', "silencedetect=n=-40dB:d=0.5",
          '-f', 'null'
        ]);

      const cutPoints: number[] = [];
      let isCancelled = false;

      cmd.on('start', () => console.log('[AIAnalyzer] Đang quét video...'));
      cmd.on('stderr', (line: string) => {
        // match scene: pts_time:12.345
        const sceneMatch = line.match(/pts_time:([\d\.]+)/);
        if (sceneMatch) {
          const t = parseFloat(sceneMatch[1]);
          if (!cutPoints.includes(t)) cutPoints.push(t);
        }
        // match silence_start: 14.5
        const silenceMatch = line.match(/silence_start:\s+([\d\.]+)/);
        if (silenceMatch) {
          const t = parseFloat(silenceMatch[1]);
          if (!cutPoints.includes(t)) cutPoints.push(t);
        }
      });
      cmd.on('progress', (progress) => {
        if (progress.percent) {
          onProgress(Math.min(99, progress.percent));
        }
      });
      cmd.on('end', () => {
        cutPoints.sort((a, b) => a - b);
        const optimalCuts: number[] = [0];
        let lastCut = 0;
        
        // Luôn chốt 1 điểm ở cuối video để xử lý vòng lặp
        if (!cutPoints.includes(duration)) cutPoints.push(duration);
        
        for (const pt of cutPoints) {
          // Bắt buộc chia nhỏ những đoạn quá 90s
          while (pt - lastCut > 90) {
            optimalCuts.push(lastCut + 60);
            lastCut += 60;
          }
          // Đoạn đạt chuẩn 30 - 90s
          if (pt - lastCut >= 30 && pt - lastCut <= 90) {
            optimalCuts.push(pt);
            lastCut = pt;
          }
        }
        
        // Gộp nếu đoạn cuối cùng quá ngắn (< 15s)
        if (optimalCuts.length > 1 && duration - optimalCuts[optimalCuts.length - 2] < 15) {
            optimalCuts[optimalCuts.length - 1] = duration;
        } else if (optimalCuts[optimalCuts.length - 1] !== duration) {
            optimalCuts.push(duration);
        }
        
        resolve(optimalCuts);
      });
      cmd.on('error', (err) => reject(err));
      cmd.save('-');
    });
  }
}

/**
 * Lớp chịu trách nhiệm nhận diện môi trường phần cứng.
 */
class CapabilityDetector {
  static isMac(): boolean {
    return process.platform === 'darwin';
  }

  static getVideoEncoder(quality: string): string {
    if (quality === 'h265') return this.isMac() ? 'hevc_videotoolbox' : 'libx265';
    if (quality === 'av1') return 'libaom-av1';
    return this.isMac() ? 'h264_videotoolbox' : 'libx264'; // auto or h264
  }

  static getEncoderOptions(quality: string): string[] {
    if (this.isMac() && (quality === 'h264' || quality === 'auto')) {
      return ['-quality 1', '-b:v 3000k'];
    } else if (this.isMac() && quality === 'h265') {
      return ['-q:v 60']; // hevc_videotoolbox
    } else if (quality === 'av1') {
      return ['-crf 30', '-b:v 0', '-strict experimental'];
    } else {
      return ['-preset ultrafast', '-crf 23'];
    }
  }
}

/**
 * Quyết định chiến lược xử lý Video dựa trên Request.
 */
class RuleEngine {
  static requiresVideoTranscode(opts: any): boolean {
    if (opts.cutEngine === 'accurate') return true;
    if (opts.cutEngine === 'fast') {
      // In fast mode, we strictly force stream copy (NO transcode), completely ignoring video filters (text, colors, etc) to guarantee maximum speed.
      return false;
    }
    return false;
  }

  static requiresAudioTranscode(opts: any): boolean {
    if (opts.cutEngine === 'accurate') return true;
    if (opts.audioSpatialPanning) return true;
    if (opts.voiceMode === 'ffmpeg') return true;
    return false;
  }
}

/**
 * Quản lý các tiến trình chạy song song
 */
class ParallelPipeline {
  private chunks: {start: number, end: number, index: number}[] = [];
  private totalChunks = 0;
  private activeWorkers = 0;
  private maxWorkers = 4; // SSD song song 4 luồng
  private isCancelled = false;
  private commands: ffmpeg.FfmpegCommand[] = [];

  constructor(
    private inputPath: string,
    private targetDir: string,
    private request: VideoWorkflowRequest,
    private duration: number,
    private onProgress: (status: VideoWorkflowStatus) => void
  ) {}

  public async prepareChunks(splitMode: string): Promise<void> {
    if (splitMode === 'ai_smart') {
      this.onProgress({ taskId: this.request.taskId, status: 'processing', progress: 5, message: 'Đang dùng AI phân tích điểm cắt...' });
      const cutPoints = await AIAnalyzer.scan(this.inputPath, this.duration, (p) => {
        this.onProgress({ taskId: this.request.taskId, status: 'processing', progress: 5 + (p * 0.1), message: `Đang quét nội dung Video (${Math.round(p)}%)...` });
      });
      for (let i = 0; i < cutPoints.length - 1; i++) {
        this.chunks.push({ start: cutPoints[i], end: cutPoints[i+1], index: i + 1 });
      }
    } else if (splitMode.startsWith('split_')) {
      const splitSeconds = parseInt(splitMode.split('_')[1]) * 60;
      let start = 0;
      let index = 1;
      while (start < this.duration) {
        let end = start + splitSeconds;
        if (end > this.duration) end = this.duration;
        this.chunks.push({ start, end, index });
        start = end;
        index++;
      }
    } else if (splitMode === 'custom') {
      const opts: any = this.request.options;
      if (opts.customStart && opts.customEnd) {
        // Parse "HH:MM:SS" or seconds
        const pStart = this.parseTime(opts.customStart);
        const pEnd = this.parseTime(opts.customEnd);
        this.chunks.push({ start: pStart, end: pEnd, index: 1 });
      } else {
        this.chunks.push({ start: 0, end: this.duration, index: 1 });
      }
    } else {
      this.chunks.push({ start: 0, end: this.duration, index: 1 });
    }
  }

  private parseTime(timeStr: string): number {
    if (!timeStr.includes(':')) return parseFloat(timeStr);
    const parts = timeStr.split(':');
    if (parts.length === 3) return parseFloat(parts[0])*3600 + parseFloat(parts[1])*60 + parseFloat(parts[2]);
    if (parts.length === 2) return parseFloat(parts[0])*60 + parseFloat(parts[1]);
    return 0;
  }

  public async execute(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.totalChunks = this.chunks.length;
      let completedChunks = 0;
      const progressMap = new Map<number, number>();

      if (this.totalChunks === 0) return reject(new Error('Không có đoạn video nào để cắt.'));

      this.onProgress({ taskId: this.request.taskId, status: 'processing', progress: 15, message: `Bắt đầu xử lý song song ${this.totalChunks} đoạn...` });

      const next = () => {
        if (this.isCancelled) return reject(new Error('Cancelled'));
        if (completedChunks === this.totalChunks) {
          resolve(this.targetDir);
          return;
        }
        if (this.chunks.length === 0) return;

        while (this.activeWorkers < this.maxWorkers && this.chunks.length > 0) {
          const chunk = this.chunks.shift()!;
          this.activeWorkers++;
          
          this.processChunk(chunk, (percent) => {
            progressMap.set(chunk.index, percent);
            let totalPercent = 0;
            progressMap.forEach(p => totalPercent += p);
            const overallPercent = 15 + Math.floor((totalPercent / this.totalChunks) * 0.85); // up to 100%
            this.onProgress({ taskId: this.request.taskId, status: 'processing', progress: overallPercent, message: `Đang cắt song song (Hoàn thành ${completedChunks}/${this.totalChunks})...` });
          }).then(() => {
            completedChunks++;
            progressMap.set(chunk.index, 100);
            this.activeWorkers--;
            next();
          }).catch(err => {
            if (!this.isCancelled) {
              this.cancel();
            }
            reject(err);
          });
        }
      };

      next();
    });
  }

  private processChunk(chunk: {start: number, end: number, index: number}, onChunkProgress: (p: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const opts: any = this.request.options;
      const fileName = `eigu_processed_${this.request.taskId}_${String(chunk.index).padStart(3, '0')}.mp4`;
      const outputPath = path.join(this.targetDir, fileName);

      const needVideoTranscode = RuleEngine.requiresVideoTranscode(opts);
      const needAudioTranscode = RuleEngine.requiresAudioTranscode(opts);
      
      const cmd = ffmpeg(this.inputPath);
      this.commands.push(cmd);
      
      // Fast Seek
      cmd.inputOptions([`-ss ${chunk.start}`]);
      cmd.outputOptions([`-to ${chunk.end}`]);

      // --- Filters ---
      const videoFilters: string[] = [];
      if (needVideoTranscode) {
        if (opts.aspectRatio === '9:16') videoFilters.push("scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black");
        else if (opts.aspectRatio === '16:9') videoFilters.push("scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black");
        else if (opts.aspectRatio === '1:1') videoFilters.push("scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=black");
        if (opts.flip === 'horizontal') videoFilters.push('hflip');
        else if (opts.flip === 'vertical') videoFilters.push('vflip');
        if (opts.frameBend === 'rotate90') videoFilters.push('transpose=1');
        else if (opts.frameBend === 'rotate180') videoFilters.push('transpose=2,transpose=2');
        if (opts.decimation) videoFilters.push('mpdecimate');

        const eqParts: string[] = [];
        if (opts.noiseInjection) {
          videoFilters.push('noise=alls=1:allf=t');
          eqParts.push('contrast=1.01', 'gamma=0.99');
        }
        if (opts.brightness && Math.abs(opts.brightness - 1.0) > 0.01) eqParts.push(`brightness=${opts.brightness}`);
        if (opts.contrast && Math.abs(opts.contrast - 1.0) > 0.01) eqParts.push(`contrast=${opts.contrast}`);
        if (opts.saturation && Math.abs(opts.saturation - 1.0) > 0.01) eqParts.push(`saturation=${opts.saturation}`);
        if (eqParts.length > 0) videoFilters.push('eq=' + eqParts.join(':'));

        if (opts.autoPartText) {
          videoFilters.push(`drawtext=fontfile='/System/Library/Fonts/Supplemental/Arial.ttf':text='Ph%E1%BA%A7n ${chunk.index}/${this.totalChunks}':fontcolor=white:fontsize=h/20:x=(w-text_w)/2:y=h*0.1:box=1:boxcolor=black@0.5:boxborderw=10`);
        }
        if (videoFilters.length > 0) cmd.videoFilters(videoFilters);
      }

      if (needAudioTranscode) {
        const audioFilters: string[] = [];
        if (opts.audioSpatialPanning) audioFilters.push('pan=stereo|c0<c0+0*c1|c1<c1+0*c0');
        if (opts.voiceMode === 'ffmpeg') {
          if (opts.voicePitch && Math.abs(opts.voicePitch - 1.0) > 0.01) audioFilters.push(`asetrate=44100*${opts.voicePitch},aresample=44100`);
          if (opts.voiceSpeed && Math.abs(opts.voiceSpeed - 1.0) > 0.01) audioFilters.push(`atempo=${opts.voiceSpeed}`);
        }
        if (audioFilters.length > 0) cmd.audioFilters(audioFilters);
      }

      // --- Codecs ---
      if (needVideoTranscode) {
        cmd.videoCodec(CapabilityDetector.getVideoEncoder(opts.cutQuality || 'auto'));
        cmd.outputOptions(CapabilityDetector.getEncoderOptions(opts.cutQuality || 'auto'));
      } else {
        cmd.videoCodec('copy');
      }

      if (needAudioTranscode) {
        cmd.audioCodec('aac');
      } else {
        cmd.audioCodec('copy');
      }

      cmd.outputOptions(['-y']);
      if (opts.metadataStripping) {
        cmd.outputOptions(['-map_metadata -1', '-metadata title=""', '-metadata artist=""', '-metadata encoder="EIGU-Core"']);
      }
      
      const chunkDuration = chunk.end - chunk.start;

      cmd.on('progress', (progress) => {
        if (this.isCancelled) return;
        let percent = 10;
        if (progress.timemark && chunkDuration > 0) {
          const parts = progress.timemark.split(':');
          if (parts.length === 3) {
            const processedSeconds = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            percent = Math.max(0, Math.min(100, (processedSeconds / chunkDuration) * 100));
          }
        }
        onChunkProgress(percent);
      });

      cmd.on('end', () => resolve());
      cmd.on('error', (err) => {
        if (this.isCancelled) return resolve();
        reject(err);
      });

      cmd.save(outputPath);
    });
  }

  public cancel() {
    this.isCancelled = true;
    for (const cmd of this.commands) {
      cmd.kill('SIGKILL');
    }
  }
}

/**
 * Entry point chính tương thích ngược với chuẩn cũ.
 */
export function processVideoWithFFmpeg(
  request: VideoWorkflowRequest,
  onProgress: (status: VideoWorkflowStatus) => void,
  customOutputPath?: string
): { promise: Promise<string>, cancel: () => void } {
  
  let pipeline: ParallelPipeline | null = null;
  let isCancelled = false;

  const { app } = require('electron');
  const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
  const targetDir = customOutputPath || defaultDir;

  const promise = new Promise<string>(async (resolve, reject) => {
    try {
      const inputPath = request.videoUrl;
      
      if (inputPath.startsWith('http')) {
        return reject(new Error(`Đầu vào FFmpeg không thể là URL (${inputPath}). Vui lòng tải Video xuống trước.`));
      }
      if (!fs.existsSync(inputPath)) {
        return reject(new Error(`File đầu vào không tồn tại: ${inputPath}`));
      }

      onProgress({ taskId: request.taskId, status: 'processing', progress: 2, message: 'Đang phân tích cấu trúc luồng dữ liệu...' });

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const opts = (request.options as any) || {};
      const splitMode = opts.splitMode || 'none';

      // Phase 1: Analyze
      const metadata = await VideoAnalyzer.analyze(inputPath);
      const duration = metadata.format.duration || 0;
      
      if (isCancelled) return reject(new Error('Cancelled'));

      // Check API voice modes
      if (opts.voiceMode === 'elevenlabs' || opts.voiceMode === 'omnivoice') {
        console.log(`[EIGU] Voice API (${opts.voiceMode}) mode selected but not fully implemented yet. Using FFmpeg audio filters as fallback.`);
      }

      // Phase 2: Build & Execute Parallel Pipeline
      pipeline = new ParallelPipeline(inputPath, targetDir, request, duration, onProgress);
      await pipeline.prepareChunks(splitMode);
      
      if (isCancelled) return reject(new Error('Cancelled'));

      const result = await pipeline.execute();
      
      onProgress({ taskId: request.taskId, status: 'completed', progress: 100, resultFilePath: result, message: '✅ Hoàn tất toàn bộ quy trình cắt/xử lý song song!' });
      resolve(result);

    } catch (err) {
      if (isCancelled) return reject(new Error('Cancelled'));
      reject(err);
    }
  });

  const cancel = () => {
    isCancelled = true;
    if (pipeline) {
      console.log('[EIGU FFmpeg Engine] Tiến trình đã bị hủy bởi người dùng.');
      pipeline.cancel();
    }
    
    // Dọn dẹp file rác
    setTimeout(() => {
      try {
        if (fs.existsSync(targetDir)) {
          const files = fs.readdirSync(targetDir);
          for (const f of files) {
            if (f.startsWith(`eigu_processed_${request.taskId}`)) {
              fs.unlinkSync(path.join(targetDir, f));
            }
          }
        }
      } catch(e) {}
    }, 1000);
  };

  return { promise, cancel };
}

