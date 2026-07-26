import { BrowserWindow, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntryOptions {
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  correlationId?: string;
  projectPath?: string;
  sceneId?: string;
  jobId?: string;
}

/**
 * Enterprise Structured Logger for EIGU Platform (19-Observability.md)
 * Log file: userData/logs/eigu.log (Rotating, Max 10MB)
 * Fields: timestamp, level, correlationId, projectPath, sceneId, jobId, message
 * Audit: Automatically masks sensitive payloads and API keys.
 */
export class MainLogger {
  private static mainWindow: BrowserWindow | null = null;
  private static logFilePath: string | null = null;
  private static maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

  public static setWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  private static getLogPath(): string {
    if (!this.logFilePath) {
      const userData = (app && typeof app.getPath === 'function')
        ? app.getPath('userData')
        : process.cwd();
      const logDir = path.join(userData, 'logs');
      if (!fs.existsSync(logDir)) {
        try {
          fs.mkdirSync(logDir, { recursive: true });
        } catch (e) {}
      }
      this.logFilePath = path.join(logDir, 'eigu.log');
    }
    return this.logFilePath;
  }

  private static rotateIfNeeded(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size >= this.maxSizeBytes) {
          const backupPath = `${filePath}.1`;
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
          }
          fs.renameSync(filePath, backupPath);
        }
      }
    } catch (e) {
      console.warn('[Logger] Log rotation warning:', e);
    }
  }

  private static sanitizeMessage(message: string): string {
    if (!message) return '';
    // Mask API keys (e.g. fal_key, openai_key, sk-..., etc.)
    return message
      .replace(/(fal_[a-zA-Z0-9_-]+)/g, 'fal_***HIDDEN***')
      .replace(/(sk-[a-zA-Z0-9_-]+)/g, 'sk-***HIDDEN***')
      .replace(/("apiKey"\s*:\s*")[^"]+(")/gi, '$1***HIDDEN***$2')
      .replace(/("key"\s*:\s*")[^"]+(")/gi, '$1***HIDDEN***$2');
  }

  public static log(message: string, options: LogEntryOptions = {}) {
    const timestamp = new Date().toISOString();
    const level = options.level || 'INFO';
    const correlationId = options.correlationId || 'N/A';
    const projectPath = options.projectPath || 'N/A';
    const sceneId = options.sceneId || 'N/A';
    const jobId = options.jobId || 'N/A';
    const cleanMsg = this.sanitizeMessage(message);

    const formattedLog = JSON.stringify({
      timestamp,
      level,
      correlationId,
      projectPath,
      sceneId,
      jobId,
      message: cleanMsg
    });

    const consoleStr = `[${timestamp}][${level}][${correlationId}] ${cleanMsg}`;
    if (level === 'ERROR') {
      console.error(consoleStr);
    } else {
      console.log(consoleStr);
    }

    try {
      const filePath = this.getLogPath();
      this.rotateIfNeeded(filePath);
      fs.appendFileSync(filePath, formattedLog + '\n', 'utf-8');
    } catch (e) {
      console.error('[Logger] Failed to write eigu.log:', e);
    }

    this.forwardToUI(`[${level}] ${cleanMsg}`);
  }

  public static info(message: string, options: LogEntryOptions = {}) {
    this.log(message, { ...options, level: 'INFO' });
  }

  public static warn(message: string, options: LogEntryOptions = {}) {
    this.log(message, { ...options, level: 'WARN' });
  }

  public static error(message: string, error?: any, options: LogEntryOptions = {}) {
    const errText = error ? ` - ${error.message || JSON.stringify(error)}` : '';
    this.log(`${message}${errText}`, { ...options, level: 'ERROR' });
  }

  public static forwardToUI(message: string) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      try {
        this.mainWindow.webContents.send('log', message);
      } catch (e) {}
    }
  }
}
