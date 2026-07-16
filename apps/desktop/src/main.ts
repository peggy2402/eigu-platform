import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { io, Socket } from 'socket.io-client';
import { VideoWorkflowRequest } from '@eigu-platform/shared';
import { processVideoWithFFmpeg } from './ffmpeg-processor';
import { uploadToTikTok } from './browser-automation';
import { downloadYouTubeVideo } from './youtube-downloader';
import * as fs from 'fs';

// Bắt và chuyển tiếp toàn bộ Log ra UI
function redirectLogsToUI(window: BrowserWindow) {
  const originalLog = console.log;
  console.log = (...args) => {
    try {
      originalLog(...args);
    } catch (e) {
      // Bỏ qua lỗi EPIPE khi pipe stdout bị ngắt
    }
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    if (window && !window.isDestroyed()) {
      try {
        window.webContents.send('log', msg);
      } catch (e) {}
    }
  };
  
  const originalError = console.error;
  console.error = (...args) => {
    try {
      originalError(...args);
    } catch (e) {
      // Bỏ qua lỗi EPIPE
    }
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    if (window && !window.isDestroyed()) {
      try {
        window.webContents.send('log', `[ERROR] ${msg}`);
      } catch (e) {}
    }
  };
}

let mainWindow: BrowserWindow | null = null;
let socket: Socket;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
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

  // Kích hoạt chuyển tiếp Log
  if (mainWindow) {
    redirectLogsToUI(mainWindow);
  }
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
  let cancelCurrentWorkflow: (() => void) | null = null;

  ipcMain.on('start-workflow', async (event, payload) => {
    try {
      const taskId = `task_${Date.now()}`;
      if (payload.type === 'local' || payload.type === 'youtube') {
        let finalInputPath = payload.data;
        
        if (payload.type === 'youtube') {
          console.log(`[Main Process] Bắt đầu tải video từ YouTube: ${payload.data}`);
          event.reply('workflow-status', 'Đang kết nối tới máy chủ YouTube...');
          
          finalInputPath = await downloadYouTubeVideo(payload.data, taskId, (statusMsg) => {
            console.log(`[Youtube-DL] ${statusMsg}`);
            event.reply('workflow-status', statusMsg);
            socket.emit('reportProgress', {
              taskId,
              status: 'processing',
              progress: 5,
              message: statusMsg
            });
          });
        }

        const task: VideoWorkflowRequest = {
          taskId,
          videoUrl: finalInputPath,
          options: {
            decimation: true,
            metadataStripping: true,
            audioSpatialPanning: true,
            noiseInjection: true
          }
        };

        event.reply('workflow-status', 'Đang xử lý Video qua FFmpeg...');
        
        const { promise, cancel } = processVideoWithFFmpeg(task, (status) => {
          socket.emit('reportProgress', status);
          event.reply('workflow-progress', status.progress);
          event.reply('workflow-status', status.message);
        });
        
        cancelCurrentWorkflow = cancel;
        
        const processedPath = await promise;
        cancelCurrentWorkflow = null;

        event.reply('workflow-status', '✅ Hoàn tất toàn bộ quy trình!');
      }

    } catch (error: any) {
      console.error('Lỗi quy trình:', error.message);
      if (error.message === 'Cancelled') {
        event.reply('workflow-status', '❌ Đã hủy tiến trình');
      } else {
        event.reply('workflow-status', '❌ Lỗi hệ thống: ' + error.message);
      }
    }
  });

  ipcMain.on('cancel-workflow', (event) => {
    console.log('[Main Process] Yêu cầu hủy tiến trình từ UI');
    if (cancelCurrentWorkflow) {
      cancelCurrentWorkflow();
      cancelCurrentWorkflow = null;
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
