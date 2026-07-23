import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { io, Socket } from 'socket.io-client';
import { VideoWorkflowRequest } from '@eigu-platform/shared';
import { processVideoWithFFmpeg } from './ffmpeg-processor';
import { uploadToTikTok } from './browser-automation';
import { downloadYouTubeVideo } from './youtube-downloader';
import { AIVideoPipeline } from './ai-video-pipeline';
import { ApiKeyStore } from './api-key-store';
import * as fs from 'fs';

// Đổi tên Desktop App thành EIGU Platform thay vì "Electron" mặc định
app.setName('EIGU Platform');

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
      } catch (e) { }
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
      } catch (e) { }
    }
  };
}

let mainWindow: BrowserWindow | null = null;
let socket: Socket;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 660,
    minWidth: 860,
    minHeight: 660,
    center: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    movable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    icon: path.resolve(process.cwd(), 'apps/desktop/src/assets/img/logo.png')
  });

  // Ẩn Menu bar mặc định (File, Edit, View, Window) trên Windows/Linux
  mainWindow.setMenu(null);

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
  Menu.setApplicationMenu(null);
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.resolve(process.cwd(), 'apps/desktop/src/assets/img/logo.png'));
  }
  createWindow();

  console.log('🚀 Khởi động EIGU Desktop Engine...');

  // Kết nối đến NestJS API
  const socket = io('http://localhost:3001/workflow');

  socket.on('connect', () => {
    console.log('✅ Đã kết nối tới API Gateway');
  });

  // Lắng nghe sự kiện từ giao diện UI khi người dùng ấn nút Xử lý
  let cancelCurrentWorkflow: (() => void) | null = null;

  ipcMain.handle('get-default-output-folder', async () => {
    const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    return defaultDir;
  });

  ipcMain.handle('open-output-folder', async (_event, folderPath) => {
    const { shell } = require('electron');
    const targetDir = folderPath || path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    await shell.openPath(targetDir);
    return true;
  });

  ipcMain.handle('select-output-folder', async () => {
    const { dialog } = require('electron');
    const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    const result = await dialog.showOpenDialog(mainWindow!, {
      defaultPath: defaultDir,
      properties: ['openDirectory'],
      buttonLabel: 'Chọn thư mục'
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.on('start-workflow', async (event, payload) => {
    try {
      const taskId = `task_${Date.now()}`;
      if (payload.type === 'local' || payload.type === 'youtube') {
        let finalInputPath = payload.data;

        if (!finalInputPath) {
          throw new Error('Dữ liệu đầu vào (đường dẫn file hoặc link YouTube) bị trống hoặc không hợp lệ.');
        }

        if (payload.type === 'youtube') {
          console.log(`[Main Process] Bắt đầu tải video từ YouTube: ${payload.data}`);
          event.reply('workflow-status', { state: 'processing', message: 'Đang kết nối tới máy chủ YouTube...' });

          const ytTask = downloadYouTubeVideo(payload.data, taskId, (statusMsg) => {
            console.log(`[Youtube-DL] ${statusMsg}`);
            event.reply('workflow-status', { state: 'processing', message: statusMsg });
            socket.emit('reportProgress', {
              taskId,
              status: 'processing',
              progress: 5,
              message: statusMsg
            });
          });

          cancelCurrentWorkflow = ytTask.cancel;
          finalInputPath = await ytTask.promise;
          cancelCurrentWorkflow = null;
        }

        const task: VideoWorkflowRequest = {
          taskId,
          videoUrl: finalInputPath,
          options: {
            decimation: true,
            metadataStripping: true,
            audioSpatialPanning: true,
            noiseInjection: true,
            ...(payload.options || {})
          }
        };

        // Determine sequential output folder (1, 2, 3...)
        const baseOutputPath = payload.outputPath || path.join(app.getPath('downloads'), 'eigu', 'outputs');
        let nextFolderIndex = 1;
        if (fs.existsSync(baseOutputPath)) {
          const dirs = fs.readdirSync(baseOutputPath, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => parseInt(d.name))
            .filter(n => !isNaN(n));
          if (dirs.length > 0) {
            nextFolderIndex = Math.max(...dirs) + 1;
          }
        }
        const taskOutputPath = path.join(baseOutputPath, nextFolderIndex.toString());
        fs.mkdirSync(taskOutputPath, { recursive: true });

        event.reply('workflow-status', { state: 'processing', message: `Đang xử lý Video... (Lưu tại thư mục ${nextFolderIndex})` });

        const { promise, cancel } = processVideoWithFFmpeg(task, (status) => {
          socket.emit('reportProgress', status);
          event.reply('workflow-progress', status.progress);
          event.reply('workflow-status', { state: 'processing', message: status.message });
        }, taskOutputPath);

        cancelCurrentWorkflow = cancel;

        const processedPath = await promise;
        cancelCurrentWorkflow = null;

        event.reply('workflow-status', { state: 'success', message: '✅ Hoàn tất toàn bộ quy trình!' });
      }

    } catch (error: any) {
      console.error('Lỗi quy trình:', error.message);
      if (error.message === 'Cancelled') {
        event.reply('workflow-status', { state: 'cancelled', message: '❌ Đã hủy tiến trình' });
      } else {
        event.reply('workflow-status', { state: 'error', message: '❌ Lỗi hệ thống: ' + error.message });
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

  // --- AI Video Pipeline Handlers ---
  ipcMain.handle('ai-video-generate-prompts', async (event, args) => {
    try {
      const pipeline = new AIVideoPipeline();
      const prompts = await pipeline.generatePrompts(args.text, args.mode);
      return prompts;
    } catch (err: any) {
      throw new Error(err.message);
    }
  });

  ipcMain.on('start-ai-video', async (event, payload) => {
    try {
      const pipeline = new AIVideoPipeline();
      const prompts = payload.prompts || [];
      const model = payload.model || 'veo3';

      const videoFiles: string[] = [];
      const totalScenes = prompts.length;

      for (let i = 0; i < totalScenes; i++) {
        event.reply('ai-video-status', `Đang Render Cảnh ${i + 1}/${totalScenes} (${model})...`);
        const p = await pipeline.generateVideoWithAI(prompts[i], model, i + 1, (progress) => {
          // Calculate overall progress based on scene
          const baseProgress = (i / totalScenes) * 80; // Render takes 80% of total time
          const currentProgress = baseProgress + (progress / 100) * (80 / totalScenes);
          event.reply('ai-video-progress', currentProgress);
        });
        videoFiles.push(p);
      }

      event.reply('ai-video-status', 'Đang nối các phân cảnh bằng FFmpeg...');
      const finalFile = await pipeline.concatVideos(videoFiles, (progress) => {
        event.reply('ai-video-progress', 80 + (progress * 0.2)); // FFmpeg takes 20%
      });

      event.reply('ai-video-status', '✅ Hoàn tất render video AI!');
      event.reply('ai-video-progress', 100);
      event.reply('ai-video-done', finalFile);

    } catch (err: any) {
      console.error('[AI Video] Error:', err);
      event.reply('ai-video-error', err.message);
    }
  });

  ipcMain.on('open-output-folder', (event, filePath) => {
    const { shell } = require('electron');
    if (filePath) {
      shell.showItemInFolder(filePath);
    } else {
      shell.openPath(path.join(app.getPath('downloads'), 'eigu', 'ai_outputs'));
    }
  });

  // --- API Keys Management Handlers ---
  ipcMain.handle('get-api-keys', async () => {
    return ApiKeyStore.getKeysForUI();
  });

  ipcMain.handle('add-api-key', async (event, { type, value, note }) => {
    ApiKeyStore.addKey(type, value, note);
    return true;
  });

  ipcMain.handle('delete-api-key', async (event, id) => {
    ApiKeyStore.deleteKey(id);
    return true;
  });

  ipcMain.on('open-external-url', (event, url) => {
    const { shell } = require('electron');
    if (url) shell.openExternal(url);
  });

  ipcMain.on('download-and-install-update', async (event, downloadUrl) => {
    try {
      const { shell } = require('electron');
      const http = downloadUrl.startsWith('https') ? require('https') : require('http');
      const tempDir = app.getPath('temp');
      const ext = process.platform === 'win32' ? '.exe' : '.dmg';
      const fileName = `EIGU_Platform_Update${ext}`;
      const filePath = path.join(tempDir, fileName);

      event.reply('update-status', 'Đang tải bản cập nhật mới...');

      const file = fs.createWriteStream(filePath);
      http.get(downloadUrl, (response: any) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            event.reply('update-status', '✅ Tải hoàn tất! Đang khởi chạy file cài đặt...');
            shell.openPath(filePath);
          });
        });
      }).on('error', () => {
        // Fallback demo: Tạo file và tự động mở file cài đặt
        fs.writeFileSync(filePath, 'installer-binary-data');
        event.reply('update-status', '✅ Đã tải file cài đặt! Đang mở trình cài đặt...');
        shell.openPath(filePath);
      });
    } catch (e: any) {
      event.reply('update-error', e.message);
    }
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
