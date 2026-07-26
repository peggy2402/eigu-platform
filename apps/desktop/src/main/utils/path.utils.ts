import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Đọc cài đặt Scratch Disk từ config.json
 */
export function getScratchDiskSetting(): string | null {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (data.scratchDiskDir && typeof data.scratchDiskDir === 'string') {
        return data.scratchDiskDir;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Ghi cài đặt Scratch Disk vào config.json
 */
export function setScratchDiskSetting(dirPath: string): void {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  let data: any = {};
  if (fs.existsSync(configPath)) {
    try { data = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch (e) {}
  }
  data.scratchDiskDir = dirPath;
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Lấy thư mục cache media của project theo chuẩn Adobe Premiere ([ProjectDir]/[ProjectName]_media)
 * CHỈ TÍNH TOÁN ĐƯỜNG DẪN STRING, KHÔNG CÓ SIDE-EFFECT TẠO FOLDER TRÊN ĐĨA!
 */
export function getProjectMediaDir(projectFilePath: string): string {
  if (!projectFilePath) {
    throw new Error('Dự án chưa được lưu (Ctrl+S). Vui lòng lưu dự án trước khi Render.');
  }

  const customScratch = getScratchDiskSetting();
  const dirName = path.dirname(projectFilePath);
  const baseName = path.basename(projectFilePath, '.eigu');
  
  const baseMediaDir = customScratch && fs.existsSync(customScratch)
    ? customScratch
    : dirName;

  return path.join(baseMediaDir, `${baseName}_media`);
}

/**
 * Chuẩn hóa đường dẫn tương thích cả Windows và macOS
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/');
}
