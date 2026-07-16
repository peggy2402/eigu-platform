import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { VideoWorkflowRequest, VideoWorkflowStatus } from '@eigu-platform/shared';

// Gắn đường dẫn nhị phân FFmpeg (Tự động biên dịch sẵn cho Mac/Windows)
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Xử lý Video bằng FFmpeg dựa trên các yêu cầu lách thuật toán TikTok.
 */
export function processVideoWithFFmpeg(
  request: VideoWorkflowRequest,
  onProgress: (status: VideoWorkflowStatus) => void
): { promise: Promise<string>, cancel: () => void } {
  let command: ffmpeg.FfmpegCommand | null = null;
  let isCancelled = false;
  let mockInterval: any = null;

  const promise = new Promise<string>((resolve, reject) => {
    let inputPath = request.videoUrl;
    
    if (inputPath.startsWith('http')) {
      return reject(new Error(`Đầu vào FFmpeg không thể là URL (${inputPath}). Vui lòng tải Video xuống trước.`));
    }
    
    if (!fs.existsSync(inputPath)) {
      return reject(new Error(`File đầu vào không tồn tại: ${inputPath}`));
    }

    const outputPath = path.join('/tmp', `eigu_processed_${request.taskId}.mp4`);

    command = ffmpeg(inputPath);

    if (request.options.metadataStripping) {
      command.outputOptions(['-map_metadata -1', '-metadata title=""', '-metadata artist=""', '-metadata encoder="EIGU-Core"']);
    }

    const videoFilters: string[] = [];
    if (request.options.decimation) {
      videoFilters.push('mpdecimate', 'setpts=N/FRAME_RATE/TB');
    }
    if (request.options.noiseInjection) {
      videoFilters.push('noise=alls=1:allf=t', 'eq=contrast=1.01:gamma=0.99');
    }
    if (videoFilters.length > 0) command.videoFilters(videoFilters);

    const audioFilters: string[] = [];
    if (request.options.audioSpatialPanning) {
      audioFilters.push('pan=stereo|c0<c0+0*c1|c1<c1+0*c0');
    }
    if (audioFilters.length > 0) command.audioFilters(audioFilters);

    command.videoCodec('libx264').audioCodec('aac').outputOptions(['-preset fast', '-crf 23', '-movflags +faststart']);

    command.on('start', (cmdLine) => {
      console.log('[EIGU FFmpeg Engine] Kích hoạt lệnh:\n', cmdLine);
      onProgress({ taskId: request.taskId, status: 'processing', progress: 10, message: 'Đang khởi chạy bộ lọc C++ Anti-detect...' });
    });

    command.on('progress', (progress) => {
      if (isCancelled) return;
      const percent = progress.percent ? Math.max(10, Math.min(95, Math.floor(progress.percent))) : 50;
      onProgress({ taskId: request.taskId, status: 'processing', progress: percent, message: `Đang bẻ gãy cấu trúc Pixel & Hash Video (${percent}%)...` });
    });

    command.on('end', () => {
      if (isCancelled) return;
      console.log('[EIGU FFmpeg Engine] Hoàn tất quá trình băm!');
      onProgress({ taskId: request.taskId, status: 'completed', progress: 100, resultFilePath: outputPath, message: '✅ Hoàn tất toàn bộ quy trình!' });
      resolve(outputPath);
    });

    command.on('error', (err) => {
      if (isCancelled) return reject(new Error('Cancelled'));
      console.error('[EIGU FFmpeg Engine] Lỗi:', err.message);
      reject(err);
    });

    command.save(outputPath);
  });

  const cancel = () => {
    isCancelled = true;
    if (command) {
      console.log('[EIGU FFmpeg Engine] Tiến trình đã bị hủy bởi người dùng.');
      command.kill('SIGKILL');
    }
    if (mockInterval) clearInterval(mockInterval);
  };

  return { promise, cancel };
}
