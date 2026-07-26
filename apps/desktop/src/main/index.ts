import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { io, Socket } from 'socket.io-client';
import { createMainWindow, redirectLogsToUI } from './config/window.config';
import { registerAllIpcHandlers } from './ipc/ipc-registry';

let mainWindow: BrowserWindow | null = null;
let socket: Socket;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function sanitizeAppCacheDirs() {
  try {
    const userData = app.getPath('userData');
    const cachePaths = [
      path.join(userData, 'Cache'),
      path.join(userData, 'Shared Dictionary'),
      path.join(userData, 'GPUCache'),
      path.join(userData, 'Code Cache'),
    ];
    for (const p of cachePaths) {
      if (fs.existsSync(p)) {
        try {
          const indexFile = path.join(p, 'index');
          const cacheDataDir = path.join(p, 'Cache_Data');
          const cacheIndexFile = path.join(cacheDataDir, 'index');
          
          if ((fs.existsSync(cacheDataDir) && !fs.existsSync(cacheIndexFile)) ||
              (fs.existsSync(cacheIndexFile) && fs.statSync(cacheIndexFile).size === 0)) {
            console.warn(`[Cache Sanitize] Tự động xóa thư mục cache bị hỏng: ${p}`);
            fs.rmSync(p, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

function initApp() {
  mainWindow = createMainWindow();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (mainWindow) {
    redirectLogsToUI(mainWindow);
  }
}

try {
  app.setName('EIGU Platform');
  app.setPath('userData', path.join(app.getPath('appData'), 'EIGU Platform'));
} catch (e) {}

app.whenReady().then(() => {
  sanitizeAppCacheDirs();
  Menu.setApplicationMenu(null);
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.resolve(process.cwd(), 'apps/desktop/src/assets/img/logo.png'));
  }

  initApp();

  console.log('🚀 Khởi động EIGU Desktop Engine (Modular Architecture)...');

  // Kết nối đến NestJS API Gateway
  socket = io('http://localhost:3001/workflow');

  socket.on('connect', () => {
    console.log('✅ Đã kết nối tới API Gateway');
  });

  // Đăng ký toàn bộ các IPC Handlers qua Registry
  registerAllIpcHandlers(getMainWindow, socket);
});
