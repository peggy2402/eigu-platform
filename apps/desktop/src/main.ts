import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { io } from 'socket.io-client';
import { VideoWorkflowRequest } from '@eigu-platform/shared';
import { processVideoWithFFmpeg } from './ffmpeg-processor';
import { uploadToTikTok } from './browser-automation';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 350,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#161821'
  });

  // Tải file HTML giao diện của Desktop App trực tiếp từ mã nguồn
  const htmlPath = path.resolve(process.cwd(), 'apps/desktop/src/assets/index.html');
  mainWindow.loadFile(htmlPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  console.log('🚀 Khởi động EIGU Desktop Engine...');

  // Kết nối đến NestJS API
  const socket = io('http://localhost:3001/workflow');
  
  socket.on('connect', () => {
    console.log('✅ Đã kết nối tới API Gateway');
  });

  // Lắng nghe sự kiện từ giao diện UI khi người dùng ấn nút Xử lý
  ipcMain.on('start-workflow', async (event, payload) => {
    try {
      const { type, data } = payload;
      let videoSource = data;
      
      if (type === 'youtube') {
        event.reply('workflow-status', `Đang tải video từ YouTube: ${data}`);
        // Simulate YouTube download for prototype
        await new Promise(r => setTimeout(r, 2000));
        videoSource = 'youtube-download.mp4';
        fs.writeFileSync(videoSource, 'dummy youtube content');
      } else {
        event.reply('workflow-status', `Đã nhận file Local: ${data}`);
      }

      const task: VideoWorkflowRequest = {
        taskId: `TASK-${Date.now()}`,
        videoUrl: videoSource,
        options: {
          decimation: true,
          metadataStripping: true,
          audioSpatialPanning: false,
          noiseInjection: false
        }
      };

      event.reply('workflow-status', 'Đang xử lý Video qua FFmpeg...');
      const processedPath = await processVideoWithFFmpeg(task, (status) => {
        socket.emit('reportProgress', status);
      });

      event.reply('workflow-status', 'Mở trình duyệt Anti-detect tải lên TikTok...');
      socket.emit('reportProgress', {
        taskId: task.taskId,
        status: 'uploading',
        progress: 80,
        message: 'Mở Anti-detect Chromium...'
      });

      await uploadToTikTok(task, processedPath);
      
      socket.emit('reportProgress', {
        taskId: task.taskId,
        status: 'completed',
        progress: 100,
        message: 'Upload hoàn tất!'
      });
      event.reply('workflow-status', '✅ Hoàn tất toàn bộ quy trình!');

    } catch (error) {
      console.error('Lỗi quy trình:', error);
      event.reply('workflow-status', '❌ Lỗi quy trình (Xem terminal)');
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
