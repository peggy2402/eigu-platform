import { BrowserWindow } from 'electron';
import * as path from 'path';
import { MainLogger } from '../utils/logger.utils';

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
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

  // Ẩn Menu bar mặc định trên Windows/Linux
  mainWindow.setMenu(null);

  // Tải file HTML giao diện chính
  const htmlPath = path.resolve(process.cwd(), 'apps/desktop/src/assets/index.html');
  mainWindow.loadFile(htmlPath);

  return mainWindow;
}

export function redirectLogsToUI(window: BrowserWindow) {
  MainLogger.setWindow(window);
  MainLogger.info('EIGU Platform Engine initialized (19-Observability logging active).', { correlationId: 'SYSTEM_START' });

  const originalLog = console.log;
  console.log = (...args) => {
    try {
      originalLog(...args);
    } catch (e) {}
    if (window && !window.isDestroyed() && window.webContents && !window.webContents.isDestroyed()) {
      try {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
        window.webContents.send('log', msg);
      } catch (e) {}
    }
  };

  const originalError = console.error;
  console.error = (...args) => {
    try {
      originalError(...args);
    } catch (e) {}
    if (window && !window.isDestroyed() && window.webContents && !window.webContents.isDestroyed()) {
      try {
        const msg = args.map(a => typeof a === 'object' ? (a.message || JSON.stringify(a)) : a).join(' ');
        window.webContents.send('log', `[ERROR] ${msg}`);
      } catch (e) {}
    }
  };
}
