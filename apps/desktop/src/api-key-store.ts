import { app, safeStorage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

interface ApiKeyItem {
  id: string;
  type: string; // GEMINI_API_KEY, FAL_KEY, etc.
  encryptedValue: string; // hex-encoded encrypted string
  note: string;
}

export class ApiKeyStore {
  private static getFilePath(): string {
    return path.join(app.getPath('userData'), 'api_keys_secure.json');
  }

  private static readStore(): ApiKeyItem[] {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[ApiKeyStore] Lỗi đọc file lưu trữ key:', e);
      return [];
    }
  }

  private static writeStore(items: ApiKeyItem[]): void {
    const filePath = this.getFilePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ApiKeyStore] Lỗi ghi file lưu trữ key:', e);
    }
  }

  /**
   * Thêm một API key mới, mã hóa bằng safeStorage
   */
  public static addKey(type: string, value: string, note: string): void {
    const items = this.readStore();
    
    let encrypted = '';
    // Nếu Electron safeStorage khả dụng, dùng chip bảo mật để mã hóa
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(value);
      encrypted = buffer.toString('base64');
    } else {
      // Fallback base64 đơn giản nếu không có chip bảo mật (ví dụ môi trường kiểm thử CI)
      encrypted = Buffer.from(value).toString('base64');
    }

    const newItem: ApiKeyItem = {
      id: crypto.randomUUID(),
      type,
      encryptedValue: encrypted,
      note
    };

    items.push(newItem);
    this.writeStore(items);
  }

  /**
   * Xóa một API Key theo ID
   */
  public static deleteKey(id: string): void {
    let items = this.readStore();
    items = items.filter(item => item.id !== id);
    this.writeStore(items);
  }

  /**
   * Trả về danh sách key đã được ẩn (masked) để hiển thị lên UI, đồng bộ cả keys từ file .env
   */
  public static getKeysForUI(): any[] {
    const items = this.readStore();
    const result: any[] = [];

    // 1. Thêm các keys lưu trong database cục bộ (mã hoá)
    items.forEach(item => {
      let decrypted = '';
      try {
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(item.encryptedValue, 'base64');
          decrypted = safeStorage.decryptString(buffer);
        } else {
          decrypted = Buffer.from(item.encryptedValue, 'base64').toString('utf-8');
        }
      } catch (e) {
        decrypted = 'ERROR_DECRYPT';
      }

      const masked = decrypted.length > 8 
        ? `${decrypted.slice(0, 4)}...${decrypted.slice(-4)}`
        : '***';

      result.push({
        id: item.id,
        type: item.type,
        maskedValue: masked,
        note: item.note,
        isReadOnly: false
      });
    });

    // 2. Đồng bộ các keys từ file .env (Chỉ đọc) để hiển thị đồng bộ lên UI
    const envTypes = ['GEMINI_API_KEY', 'FAL_KEY', 'OPENAI_API_KEY'];
    envTypes.forEach(type => {
      const rawEnvKeys = process.env[type] || '';
      const envKeys = rawEnvKeys.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0);
      
      envKeys.forEach((key, index) => {
        const masked = key.length > 8
          ? `${key.slice(0, 4)}...${key.slice(-4)}`
          : '***';
        
        result.push({
          id: `env_${type}_${index}`,
          type: type,
          maskedValue: masked,
          note: 'Hệ thống (.env)',
          isReadOnly: true
        });
      });
    });

    return result;
  }

  /**
   * Giải mã và lấy toàn bộ key thật theo loại (cho Pipeline gọi API)
   */
  public static getRawKeys(type: string): string[] {
    const items = this.readStore();
    const filtered = items.filter(item => item.type === type);
    const rawKeys: string[] = [];

    for (const item of filtered) {
      try {
        let decrypted = '';
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(item.encryptedValue, 'base64');
          decrypted = safeStorage.decryptString(buffer);
        } else {
          decrypted = Buffer.from(item.encryptedValue, 'base64').toString('utf-8');
        }
        if (decrypted && decrypted !== 'ERROR_DECRYPT') {
          rawKeys.push(decrypted);
        }
      } catch (e) {
        console.error(`[ApiKeyStore] Không thể giải mã key ${item.id}:`, e);
      }
    }

    return rawKeys;
  }
}
