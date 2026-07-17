import youtubedl from 'youtube-dl-exec';
import * as path from 'path';
import * as fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

export async function downloadYouTubeVideo(
  url: string,
  taskId: string,
  onProgress: (status: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    onProgress('Đang phân tích link YouTube...');
    
    const outputPath = path.join('/tmp', `youtube_raw_${taskId}.mp4`);
    
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    onProgress('Bắt đầu tải Video từ YouTube (Chế độ thực)...');
    
    const subprocess = youtubedl.exec(url, {
      output: outputPath,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      ffmpegLocation: ffmpegInstaller.path,
      concurrentFragments: 5,
      retries: 3,
      'no-playlist': true,
      'js-runtimes': 'node',
    } as any);

    let stderrBuffer = '';
    subprocess.stderr?.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
    });

    subprocess.on('close', (code) => {
      if (code === 0) {
        onProgress('✅ Tải YouTube hoàn tất!');
        resolve(outputPath);
      } else {
        const errMsg = stderrBuffer.split('\n').filter(l => l.trim()).slice(-3).join(' | ');
        console.error(`[Youtube-DL] Exit code ${code}, stderr: ${errMsg || '(empty)'}`);
        reject(new Error(`Lỗi tải YouTube (mã ${code}): ${errMsg || 'Không rõ nguyên nhân'}`));
      }
    });

    subprocess.on('error', (err) => {
      reject(err);
    });
  });
}
