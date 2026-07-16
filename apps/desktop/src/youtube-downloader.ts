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
      concurrentFragments: 10,
    } as any);

    subprocess.on('close', (code) => {
      if (code === 0) {
        onProgress('✅ Tải YouTube hoàn tất!');
        resolve(outputPath);
      } else {
        reject(new Error(`Lỗi tải YouTube, mã lỗi: ${code}`));
      }
    });

    subprocess.on('error', (err) => {
      reject(err);
    });
  });
}
