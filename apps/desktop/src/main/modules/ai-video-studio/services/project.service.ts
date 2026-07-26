import { ProjectManager, ProjectSummary } from '../../eigu-file/project-manager';
import { EiguFile } from '../../eigu-file/eigu-types';
import * as fs from 'fs';
import * as path from 'path';

import { MainLogger } from '../../../utils/logger.utils';

export class ProjectService {
  private static instance: ProjectService;
  private manager: ProjectManager;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.manager = new ProjectManager();
    this.startAutoSaveTimer();
  }

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  public getManager(): ProjectManager {
    return this.manager;
  }

  public async createNew(name: string, saveDir: string, aspectRatio?: string, requestId?: string): Promise<string> {
    return await this.manager.createNew(name, saveDir, aspectRatio, requestId);
  }

  public async openFile(filePath: string): Promise<EiguFile> {
    return await this.manager.openFile(filePath);
  }

  public async save(): Promise<string> {
    return await this.manager.save();
  }

  public async saveAs(targetPath: string): Promise<string> {
    return await this.manager.saveAs(targetPath);
  }

  public getCurrent() {
    return this.manager.getCurrent();
  }

  public getRecentProjects(): Promise<ProjectSummary[]> {
    return this.manager.getRecentProjects();
  }

  public close() {
    this.manager.close();
  }

  private startAutoSaveTimer() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this.autoSaveTimer = setInterval(async () => {
      const current = this.manager.getCurrent();
      if (current.filePath && current.eigu) {
        // Guard: Nếu file trên đĩa bị xóa ngoài đĩa, KHÔNG tự động ghi đè re-create file!
        if (!fs.existsSync(current.filePath)) {
          MainLogger.warn(`[AutoSave] Hủy tự động lưu vì file không còn tồn tại trên đĩa: ${current.filePath}`, {
            correlationId: 'AUTOSAVE_CANCELLED_MISSING',
            projectPath: current.filePath
          });
          return;
        }
        try {
          await this.save();
          MainLogger.info(`[AutoSave] Tự động lưu dự án thành công: ${current.filePath}`, {
            correlationId: 'AUTOSAVE_SUCCESS',
            projectPath: current.filePath
          });
        } catch (err) {
          MainLogger.error(`[AutoSave] Tự động lưu thất bại`, err, {
            correlationId: 'AUTOSAVE_ERROR',
            projectPath: current.filePath
          });
        }
      }
    }, 30000);
  }

  public stopAutoSaveTimer() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
