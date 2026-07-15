import { app, BrowserWindow } from 'electron';
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

  const mockTask: VideoWorkflowRequest = {
    taskId: 'TEST-1234',
    videoUrl: 'demo.mp4',
    options: {
      decimation: true,
      metadataStripping: true,
      audioSpatialPanning: false,
      noiseInjection: false
    }
  };

  fs.writeFileSync('demo.mp4', 'dummy video content');

  // Đợi 5 giây sau khi mở UI rồi tự động chạy Puppeteer
  setTimeout(async () => {
    try {
      const processedPath = await processVideoWithFFmpeg(mockTask, (status) => {
        socket.emit('reportProgress', status);
      });

      socket.emit('reportProgress', {
        taskId: mockTask.taskId,
        status: 'uploading',
        progress: 80,
        message: 'Mở Anti-detect Chromium...'
      });

      // Bật Chromium lên song song với giao diện Desktop UI
      await uploadToTikTok(mockTask, processedPath);
      
      socket.emit('reportProgress', {
        taskId: mockTask.taskId,
        status: 'completed',
        progress: 100,
        message: 'Upload hoàn tất!'
      });

    } catch (error) {
      console.error('Lỗi quy trình:', error);
    }
  }, 5000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
