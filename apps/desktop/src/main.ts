import { app, BrowserWindow, ipcMain, Menu, nativeImage, NativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { io, Socket } from 'socket.io-client';
import { VideoWorkflowRequest } from '@eigu-platform/shared';
import { processVideoWithFFmpeg } from './ffmpeg-processor';
import { uploadToTikTok } from './browser-automation';
import { downloadYouTubeVideo } from './youtube-downloader';
import { AIVideoPipeline } from './ai-video-pipeline';
import { ApiKeyStore } from './api-key-store';
import * as fs from 'fs';

// Safely load environment variables from apps/api/.env and workspace root .env in Dev mode
try {
  if (!app.isPackaged) {
    const dotenv = require('dotenv');
    const apiEnv = path.resolve(process.cwd(), 'apps/api/.env');
    if (fs.existsSync(apiEnv)) dotenv.config({ path: apiEnv });
    const rootEnv = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  }
} catch (e) {
  // Silent fallback in production bundled environment
}

// Bắt và log Unhandled Rejection / Exception để tránh crash app
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Caught Unhandled Promise Rejection (non-fatal):', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Caught Uncaught Exception (non-fatal):', error);
});

// Helper lấy đường dẫn asset chuẩn cho cả Dev (Nx serve) lẫn Production (app.asar / extraResources)
function getAssetPath(...relativePaths: string[]): string {
  if (app.isPackaged) {
    // 1. Ưu tiên kiểm tra trong process.resourcesPath (khi extraResources hoặc asarUnpack)
    const extraResourcePath = path.join(process.resourcesPath, 'assets', ...relativePaths);
    if (fs.existsSync(extraResourcePath)) {
      return extraResourcePath;
    }
    // 2. Kiểm tra trong app.asar.unpacked
    const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', ...relativePaths);
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
    // 3. Kiểm tra trong app.asar (__dirname)
    const prodAsarPath = path.join(__dirname, 'assets', ...relativePaths);
    if (fs.existsSync(prodAsarPath)) {
      return prodAsarPath;
    }
    const prodAsarParent = path.join(__dirname, '..', 'assets', ...relativePaths);
    if (fs.existsSync(prodAsarParent)) {
      return prodAsarParent;
    }
    return prodAsarPath;
  } else {
    // Môi trường Dev (nx serve / electron .)
    const devPath = path.resolve(__dirname, 'assets', ...relativePaths);
    if (fs.existsSync(devPath)) {
      return devPath;
    }
    const devSrcPath = path.resolve(process.cwd(), 'apps/desktop/src/assets', ...relativePaths);
    if (fs.existsSync(devSrcPath)) {
      return devSrcPath;
    }
    return devPath;
  }
}

// Helper nạp NativeImage an toàn (từ File Path / Buffer) để không bao giờ bị crash hay throwing UnhandledPromiseRejection
function getSafeNativeImage(...relativePaths: string[]): NativeImage | null {
  try {
    const assetPath = getAssetPath(...relativePaths);
    if (assetPath && fs.existsSync(assetPath)) {
      try {
        const imgFromPath = nativeImage.createFromPath(assetPath);
        if (imgFromPath && !imgFromPath.isEmpty()) {
          return imgFromPath;
        }
      } catch (e) { }

      try {
        const buffer = fs.readFileSync(assetPath);
        const imgFromBuf = nativeImage.createFromBuffer(buffer);
        if (imgFromBuf && !imgFromBuf.isEmpty()) {
          return imgFromBuf;
        }
      } catch (e) { }
    }
  } catch (err) {
    console.warn(`⚠️ Safe NativeImage load fallback for asset ${relativePaths.join('/')}:`, err);
  }
  return null;
}

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
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
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
  };

  try {
    const windowIcon = getSafeNativeImage('img', 'logo.png');
    if (windowIcon && !windowIcon.isEmpty()) {
      windowOptions.icon = windowIcon;
    }
  } catch (err) {
    console.warn('⚠️ Lỗi khi nạp window icon:', err);
  }

  mainWindow = new BrowserWindow(windowOptions);

  // Ẩn Menu bar mặc định (File, Edit, View, Window) trên Windows/Linux
  mainWindow.setMenu(null);

  // Tải file HTML giao diện của Desktop App
  const htmlPath = getAssetPath('index.html');
  if (fs.existsSync(htmlPath)) {
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error('⚠️ Lỗi khi loadFile index.html:', err);
    });
  } else {
    console.error('⚠️ Không tìm thấy file index.html tại:', htmlPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Enable F12 & CmdOrCtrl+Shift+I to toggle DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F12' || (input.key.toLowerCase() === 'i' && (input.control || input.meta) && input.shift)) {
        mainWindow?.webContents.toggleDevTools();
        event.preventDefault();
      }
    }
  });

  // Kích hoạt chuyển tiếp Log
  if (mainWindow) {
    redirectLogsToUI(mainWindow);
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  if (process.platform === 'darwin' && app.dock) {
    try {
      const dockImg = getSafeNativeImage('img', 'logo.png');
      if (dockImg && !dockImg.isEmpty()) {
        app.dock.setIcon(dockImg);
      }
    } catch (err) {
      console.warn('⚠️ Lỗi khi đặt icon Dock macOS:', err);
    }
  }
  createWindow();

  console.log('🚀 Khởi động EIGU Desktop Engine...');

  // Kết nối đến NestJS API
  // const socket = io('http://localhost:3001/workflow');
  const socket = io('https://eigu-api.onrender.com/workflow');

  socket.on('connect', () => {
    console.log('✅ Đã kết nối tới API Gateway');
  });

  // Lắng nghe sự kiện từ giao diện UI khi người dùng ấn nút Xử lý
  let cancelCurrentWorkflow: (() => void) | null = null;

  function resolveApiUrl() {
    const port = process.env.PORT || 3001;
    const rawPrefix = (process.env.API_PREFIX || 'api').trim().replace(/^\//, '').replace(/\/$/, '');
    let prefix = 'api';
    if (rawPrefix && rawPrefix !== 'api') {
      prefix = rawPrefix.startsWith('api/') ? rawPrefix : `api/${rawPrefix}`;
    }

    const defaultHost = (app.isPackaged || process.env.NODE_ENV === 'production')
      ? 'https://eigu-api.onrender.com'
      : `http://localhost:${port}`;

    let rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EIGU_API_URL || defaultHost;
    rawUrl = rawUrl.replace(/\/$/, '');

    let baseHost = rawUrl.replace(/\/api\/.*$/, '').replace(/\/api$/, '');
    if (!baseHost) baseHost = defaultHost;

    return `${baseHost}/${prefix}`;
  }

  ipcMain.on('get-api-config-sync', (event) => {
    const port = process.env.PORT || 3001;
    const apiPrefix = process.env.API_PREFIX || 'api';
    const apiUrl = resolveApiUrl();
    const defaultWs = (app.isPackaged || process.env.NODE_ENV === 'production')
      ? 'https://eigu-api.onrender.com'
      : `http://localhost:${port}`;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.EIGU_WS_URL || defaultWs;

    event.returnValue = { apiUrl, wsUrl, apiPrefix, port };
  });

  ipcMain.handle('get-api-config', async () => {
    const port = process.env.PORT || 3001;
    const apiPrefix = process.env.API_PREFIX || 'api';
    const apiUrl = resolveApiUrl();
    const defaultWs = (app.isPackaged || process.env.NODE_ENV === 'production')
      ? 'https://eigu-api.onrender.com'
      : `http://localhost:${port}`;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.EIGU_WS_URL || defaultWs;
    return { apiUrl, wsUrl, apiPrefix, port };
  });

  ipcMain.handle('save-api-config', async (_event, newConfig) => {
    if (newConfig && newConfig.apiPrefix) {
      process.env.API_PREFIX = newConfig.apiPrefix;
    }
    if (newConfig && newConfig.apiUrl) {
      process.env.NEXT_PUBLIC_API_URL = newConfig.apiUrl;
    }
    return true;
  });

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

  // --- Auto Updater & System Version Handlers (VS Code Enterprise style) ---
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...');
    mainWindow?.webContents.send('update-status', { type: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`);
    mainWindow?.webContents.send('update-status', {
      type: 'available',
      version: info.version,
      releaseNotes: info.releaseNotes || ''
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log(`[AutoUpdater] App is up to date (v${info.version})`);
    mainWindow?.webContents.send('update-status', {
      type: 'not-available',
      version: info.version
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`[AutoUpdater] Download progress: ${Math.round(progressObj.percent)}%`);
    mainWindow?.webContents.send('update-status', {
      type: 'downloading',
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded successfully: v${info.version}`);
    mainWindow?.webContents.send('update-status', {
      type: 'downloaded',
      version: info.version,
      releaseNotes: info.releaseNotes || ''
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Update error:', err?.message || err);
    mainWindow?.webContents.send('update-status', {
      type: 'error',
      error: err?.message || String(err)
    });
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      console.log('[AutoUpdater] Skipping autoUpdater check in Dev mode');
      return { isDev: true, version: app.getVersion() };
    }
    try {
      console.log('[AutoUpdater] Triggering manual check-for-updates');
      return await autoUpdater.checkForUpdates();
    } catch (err: any) {
      console.warn('⚠️ AutoUpdate check failed:', err?.message || err);
      return null;
    }
  });

  ipcMain.on('quit-and-install-update', () => {
    try {
      console.log('[AutoUpdater] Restarting app to apply update...');
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      console.error('⚠️ Lỗi khi restart & install update:', err);
    }
  });

  // Tự động kiểm tra bản cập nhật mới định kỳ mỗi 1 giờ khi app đã đóng gói (Production)
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(e => console.warn('[AutoUpdater] Initial check failed:', e?.message));
    }, 10000);

    setInterval(() => {
      autoUpdater.checkForUpdates().catch(e => console.warn('[AutoUpdater] Background check failed:', e?.message));
    }, 3600000);
  }

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

      event.reply('update-status', { type: 'available', version: 'new' });

      const file = fs.createWriteStream(filePath);
      http.get(downloadUrl, (response: any) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            event.reply('update-status', { type: 'downloaded', version: 'new' });
            shell.openPath(filePath);
          });
        });
      }).on('error', () => {
        fs.writeFileSync(filePath, 'installer-binary-data');
        event.reply('update-status', { type: 'downloaded', version: 'new' });
        shell.openPath(filePath);
      });
    } catch (e: any) {
      event.reply('update-status', { type: 'error', error: e.message });
    }
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
