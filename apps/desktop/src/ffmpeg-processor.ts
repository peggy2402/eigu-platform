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
 * Lớp chịu trách nhiệm nhận diện môi trường phần cứng.
 */
class CapabilityDetector {
  static isMac(): boolean {
    return process.platform === 'darwin';
  }

  static getVideoEncoder(): string {
    return this.isMac() ? 'h264_videotoolbox' : 'libx264';
  }

  static getEncoderOptions(): string[] {
    if (this.isMac()) {
      return ['-b:v 4000k', '-movflags +faststart', '-y'];
    } else {
      return ['-preset ultrafast', '-crf 23', '-movflags +faststart', '-y'];
    }
  }
}

/**
 * Quyết định chiến lược xử lý Video dựa trên Request.
 */
class RuleEngine {
  static requiresVideoTranscode(opts: any, isSegmentFormat: boolean, duration: number, splitSeconds: number): boolean {
    if (opts.aspectRatio && opts.aspectRatio !== 'original') return true;
    if (opts.noiseInjection) return true;
    if (opts.decimation) return true;
    if (opts.autoPartText && isSegmentFormat && splitSeconds > 0 && duration > 0 && Math.ceil(duration / splitSeconds) > 1) {
      return true; // DrawText filter
    }
    return false;
  }

  static requiresAudioTranscode(opts: any): boolean {
    if (opts.audioSpatialPanning) return true;
    return false;
  }
}

/**
 * Xây dựng và thực thi lệnh FFmpeg.
 */
class PipelineBuilder {
  private command: ffmpeg.FfmpegCommand;
  private inputPath: string;
  private outputPath: string;
  private request: VideoWorkflowRequest;
  private duration: number;
  private isCancelled: boolean = false;
  
  constructor(inputPath: string, outputPath: string, request: VideoWorkflowRequest, duration: number) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.request = request;
    this.duration = duration;
    this.command = ffmpeg(this.inputPath);
  }

  build() {
    const opts: any = this.request.options;
    const splitOpts = opts.splitMode || 'none';
    const isSegmentFormat = splitOpts.startsWith('split_');
    const splitSeconds = isSegmentFormat ? parseInt(splitOpts.split('_')[1]) * 60 : 0;

    const needVideoTranscode = RuleEngine.requiresVideoTranscode(opts, isSegmentFormat, this.duration, splitSeconds);
    const needAudioTranscode = RuleEngine.requiresAudioTranscode(opts);

    // 1. Setup Filters (if transcode)
    const videoFilters: string[] = [];
    if (needVideoTranscode) {
      if (opts.aspectRatio === '9:16') videoFilters.push("scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920");
      else if (opts.aspectRatio === '16:9') videoFilters.push("scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080");
      else if (opts.aspectRatio === '1:1') videoFilters.push("scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080");

      if (opts.decimation) videoFilters.push('mpdecimate');
      if (opts.noiseInjection) videoFilters.push('noise=alls=1:allf=t', 'eq=contrast=1.01:gamma=0.99');
      
      if (opts.autoPartText && isSegmentFormat && splitSeconds > 0) {
        const totalParts = Math.ceil(this.duration / splitSeconds);
        if (totalParts > 1) {
          videoFilters.push(`drawtext=fontfile='/System/Library/Fonts/Supplemental/Arial.ttf':text='Part %{eif\\:trunc(t/${splitSeconds})+1\\:d}/${totalParts}':fontcolor=white:fontsize=h/20:x=(w-text_w)/2:y=h*0.1:box=1:boxcolor=black@0.5:boxborderw=10`);
        }
      }
      
      if (videoFilters.length > 0) this.command.videoFilters(videoFilters);
    }

    if (needAudioTranscode) {
      const audioFilters: string[] = [];
      if (opts.audioSpatialPanning) audioFilters.push('pan=stereo|c0<c0+0*c1|c1<c1+0*c0');
      if (audioFilters.length > 0) this.command.audioFilters(audioFilters);
    }

    // 2. Setup Codecs
    if (needVideoTranscode) {
      this.command.videoCodec(CapabilityDetector.getVideoEncoder());
    } else {
      this.command.videoCodec('copy'); // Siêu tốc: Stream Copy
    }

    if (needAudioTranscode) {
      this.command.audioCodec('aac');
    } else {
      this.command.audioCodec('copy'); // Stream Copy cho âm thanh
    }

    // 3. Output Options (Metadata & Format)
    let outputOpts: string[] = [];
    if (needVideoTranscode) {
      outputOpts.push(...CapabilityDetector.getEncoderOptions());
    } else {
      outputOpts.push('-y'); // Cần overwrite
    }

    if (opts.metadataStripping) {
      outputOpts.push('-map_metadata -1', '-metadata title=""', '-metadata artist=""', '-metadata encoder="EIGU-Core"');
    }

    if (opts.splitMode === 'custom' && opts.customStart && opts.customEnd) {
      // Fast Seek (Cho cắt video thủ công, nếu dùng stream copy)
      // Lưu ý: với fluent-ffmpeg inputOptions -ss cần truyền vào command
      this.command.inputOptions([`-ss ${opts.customStart}`]);
      outputOpts.push(`-to ${opts.customEnd}`);
    } else if (isSegmentFormat) {
      outputOpts.push('-f segment');
      outputOpts.push(`-segment_time ${splitSeconds}`);
      outputOpts.push('-reset_timestamps 1');
      if (needVideoTranscode) {
        outputOpts.push(`-force_key_frames expr:gte(t,n_forced*${splitSeconds})`);
      }
    }

    if (outputOpts.length > 0) this.command.outputOptions(outputOpts);
  }

  execute(onProgress: (status: VideoWorkflowStatus) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      this.command.on('start', (cmdLine) => {
        console.log('[EIGU Pipeline Engine] Command:\n', cmdLine);
        onProgress({ taskId: this.request.taskId, status: 'processing', progress: 10, message: 'Đang chuẩn bị Pipeline xử lý...' });
      });

      this.command.on('progress', (progress) => {
        if (this.isCancelled) return;
        
        let percent = 10;
        
        // Tiến trình thông minh từ timemark
        if (progress.timemark && this.duration > 0) {
          const parts = progress.timemark.split(':');
          if (parts.length === 3) {
            const processedSeconds = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            percent = Math.max(10, Math.min(95, Math.floor((processedSeconds / this.duration) * 100)));
          }
        } else if (progress.percent) {
          percent = Math.max(10, Math.min(95, Math.floor(progress.percent)));
        }
        
        onProgress({ taskId: this.request.taskId, status: 'processing', progress: percent, message: `Đang chạy luồng Video Stream (${percent}%)...` });
      });

      this.command.on('end', () => {
        if (this.isCancelled) return;
        console.log('[EIGU Pipeline Engine] Hoàn tất!');
        onProgress({ taskId: this.request.taskId, status: 'completed', progress: 100, resultFilePath: this.outputPath, message: '✅ Hoàn tất toàn bộ quy trình!' });
        resolve(this.outputPath);
      });

      this.command.on('error', (err) => {
        if (this.isCancelled) return reject(new Error('Cancelled'));
        console.error('[EIGU Pipeline Engine] Lỗi:', err.message);
        reject(err);
      });

      this.command.save(this.outputPath);
    });
  }

  cancel() {
    this.isCancelled = true;
    this.command.kill('SIGKILL');
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
  
  let pipelineBuilder: PipelineBuilder | null = null;
  let isCancelled = false;

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

      const { app } = require('electron');
      const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
      if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
      }
      
      const targetDir = customOutputPath || defaultDir;
      const splitOpts = (request.options as any).splitMode;
      const isSegmentFormat = splitOpts && splitOpts.startsWith('split_');
      const fileName = isSegmentFormat ? `eigu_processed_${request.taskId}_%03d.mp4` : `eigu_processed_${request.taskId}.mp4`;
      const outputPath = path.join(targetDir, fileName);

      // Phase 1: Analyze
      const metadata = await VideoAnalyzer.analyze(inputPath);
      const duration = metadata.format.duration || 0;
      
      if (isCancelled) return reject(new Error('Cancelled'));
      onProgress({ taskId: request.taskId, status: 'processing', progress: 5, message: 'Đang xây dựng Rule-based Pipeline...' });

      // Phase 2: Build & Execute Pipeline
      pipelineBuilder = new PipelineBuilder(inputPath, outputPath, request, duration);
      pipelineBuilder.build();
      
      const result = await pipelineBuilder.execute(onProgress);
      resolve(result);

    } catch (err) {
      if (isCancelled) return reject(new Error('Cancelled'));
      reject(err);
    }
  });

  const cancel = () => {
    isCancelled = true;
    if (pipelineBuilder) {
      console.log('[EIGU FFmpeg Engine] Tiến trình đã bị hủy bởi người dùng.');
      pipelineBuilder.cancel();
    }
  };

  return { promise, cancel };
}
