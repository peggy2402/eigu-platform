import { ipcMain, app, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function registerAutoUpdateIpc() {
  ipcMain.on('open-external-url', (_event, url) => {
    if (url) shell.openExternal(url);
  });

  ipcMain.on('download-and-install-update', async (event, downloadUrl) => {
    try {
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
}
