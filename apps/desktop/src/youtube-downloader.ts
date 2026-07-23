import youtubedl from 'youtube-dl-exec';
import * as path from 'path';
import * as fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

function parseYouTubeErrorMessage(rawError: string): string {
  if (rawError.includes('Video unavailable') || rawError.includes('restricted')) {
    return 'Video này bị hạn chế độ tuổi, riêng tư hoặc bị chặn theo vùng (Restricted Video). Vui lòng thử link YouTube khác hoặc dùng file MP4 từ máy.';
  }
  if (rawError.includes('Private video')) {
    return 'Video này đặt ở chế độ riêng tư (Private Video), không thể tải được.';
  }
  if (rawError.includes('Sign in if you') || rawError.includes('age-restricted')) {
    return 'Video này yêu cầu đăng nhập xác nhận độ tuổi trên YouTube.';
  }
  if (rawError.includes('Incomplete YouTube ID') || rawError.includes('Not a valid URL')) {
    return 'Đường dẫn YouTube không hợp lệ. Vui lòng kiểm tra lại URL.';
  }
  return rawError;
}

export function downloadYouTubeVideo(
  url: string,
  taskId: string,
  onProgress: (status: string) => void
): { promise: Promise<string>; cancel: () => void } {
  let isCancelled = false;
  let subprocess: any = null;
  const outputPath = path.join('/tmp', `youtube_raw_${taskId}.mp4`);

  const promise = new Promise<string>((resolve, reject) => {
    onProgress('Đang phân tích link YouTube...');
    
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch (e) {}
    }

    if (isCancelled) {
      return reject(new Error('Cancelled'));
    }

    onProgress('Bắt đầu tải Video từ YouTube (Chế độ thực)...');
    
    subprocess = youtubedl.exec(url, {
      output: outputPath,
      format: 'bestvideo+bestaudio/best',
      mergeOutputFormat: 'mp4',
      ffmpegLocation: ffmpegInstaller.path,
      concurrentFragments: 5,
      retries: 5,
      'no-playlist': true,
      'js-runtimes': 'node',
      'no-check-certificates': true,
      'geo-bypass': true,
      'extractor-args': 'youtube:player_client=android,web',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    } as any);

    // Prevent UnhandledPromiseRejectionWarning in Node.js when yt-dlp child process exits with non-zero code
    subprocess.catch((_err: any) => {
      // Ignored here; handled safely below in 'close' / 'error' events
    });

    let stderrBuffer = '';
    subprocess.stderr?.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
    });

    subprocess.on('close', (code: number | null) => {
      if (isCancelled) {
        console.log('[Youtube-DL] Tiến trình tải YouTube đã bị hủy bởi người dùng.');
        if (fs.existsSync(outputPath)) {
          try { fs.unlinkSync(outputPath); } catch (e) {}
        }
        return reject(new Error('Cancelled'));
      }

      if (code === 0) {
        onProgress('✅ Tải YouTube hoàn tất!');
        resolve(outputPath);
      } else {
        const rawErrMsg = stderrBuffer.split('\n').filter(l => l.trim()).slice(-3).join(' | ');
        console.error(`[Youtube-DL] Exit code ${code}, stderr: ${rawErrMsg || '(empty)'}`);
        const userFriendlyMsg = parseYouTubeErrorMessage(rawErrMsg);
        reject(new Error(`Lỗi tải YouTube: ${userFriendlyMsg}`));
      }
    });

    subprocess.on('error', (err: any) => {
      if (isCancelled) return reject(new Error('Cancelled'));
      reject(err);
    });
  });

  const cancel = () => {
    isCancelled = true;
    if (subprocess) {
      try {
        subprocess.kill('SIGKILL');
      } catch (e) {}
    }
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        try { fs.unlinkSync(outputPath); } catch (e) {}
      }
    }, 500);
  };

  return { promise, cancel };
}


