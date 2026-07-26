import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import { AIVideoPipeline } from '../../services/ai-video-pipeline.service';
import { ProjectService, SceneService, CharacterService, AssetService, RenderService } from '../../modules/ai-video-studio';
import { LocalQueue } from '../../modules/eigu-file/local-queue';
import { ApiKeyStore } from '../../services/api-key-store.service';
import * as path from 'path';
import * as fs from 'fs';
import { Scene, Character, ProviderConfig } from '../../modules/eigu-file/eigu-types';
import { sanitizeFileName } from '../../utils/sanitize-filename';
import { MainLogger } from '../../utils/logger.utils';
import { CostGuardrailService } from '../../services/cost-guardrail.service';
import { getScratchDiskSetting, setScratchDiskSetting } from '../../utils/path.utils';

const projectService = ProjectService.getInstance();
const sceneService = new SceneService();
const characterService = new CharacterService();
const assetService = new AssetService();
const renderService = new RenderService();
let localQueueInstance: LocalQueue | null = null;
let studioIpcHandlersRegistered = false;

function getManager() {
  return projectService.getManager();
}

function getQueue(): LocalQueue {
  if (!localQueueInstance) {
    localQueueInstance = new LocalQueue(getManager());
  }
  return localQueueInstance;
}

export function registerStudioIpcHandlers() {
  if (studioIpcHandlersRegistered) {
    console.log('[Studio IPC] Handlers already registered, skipping duplicate registration.');
    return;
  }
  studioIpcHandlersRegistered = true;
  console.log('[Studio IPC] Registering AI Video Studio IPC handlers...');

  // ========== PROJECT FILE OPERATIONS ==========

  ipcMain.handle('project:getSystemDownloadsDir', async () => {
    return app.getPath('downloads');
  });

  ipcMain.handle('project:selectDirectory', async () => {
    const focusedWin = BrowserWindow.getFocusedWindow();
    const result = focusedWin
      ? await dialog.showOpenDialog(focusedWin, {
          title: 'Chọn thư mục lưu dự án EIGU',
          properties: ['openDirectory', 'createDirectory']
        })
      : await dialog.showOpenDialog({
          title: 'Chọn thư mục lưu dự án EIGU',
          properties: ['openDirectory', 'createDirectory']
        });
    if (result.canceled || !result.filePaths.length) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('project:new', async (_event, { name, saveDir, aspectRatio, requestId = 'req_' + Math.random().toString(36).substring(2, 9) }) => {
    MainLogger.info(`[IPC] Kích hoạt project:new tạo dự án trong RAM: "${name}"`, { correlationId: requestId, projectPath: 'N/A' });
    try {
      const mgr = getManager();
      await mgr.createNewInMemory(name, aspectRatio || '16:9');
      const current = mgr.getCurrent();
      MainLogger.info(`[IPC] project:new thành công trong RAM (filePath = null)`, { correlationId: requestId, projectPath: 'N/A' });
      return { success: true, filePath: null, project: current.eigu?.project };
    } catch (err: any) {
      MainLogger.error(`[IPC] project:new thất bại`, err, { correlationId: requestId, projectPath: 'N/A' });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('project:openDialog', async () => {
    MainLogger.info('[IPC] Kích hoạt Open Dialog chọn dự án .eigu', { correlationId: 'OPEN_DIALOG' });
    const result = await dialog.showOpenDialog({
      title: 'Open Project',
      filters: [{ name: 'EIGU Project', extensions: ['eigu'] }],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      MainLogger.info('[IPC] Người dùng đã hủy Open Dialog', { correlationId: 'OPEN_DIALOG_CANCEL' });
      return { success: false, canceled: true };
    }
    try {
      const mgr = getManager();
      const filePath = result.filePaths[0];
      const eigu = await mgr.openFile(filePath);
      getQueue().resumeUnfinishedJobs();
      const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      MainLogger.info(`[IPC] Mở dự án thành công từ đĩa: ${filePath} (Size: ${stats?.size || 0} bytes)`, { correlationId: 'OPEN_SUCCESS', projectPath: filePath });
      return { success: true, filePath, project: eigu.project };
    } catch (err: any) {
      MainLogger.error(`[IPC] Lỗi mở dự án: ${result.filePaths[0]}`, err, { correlationId: 'OPEN_ERROR', projectPath: result.filePaths[0] });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('project:openPath', async (_event, filePath) => {
    MainLogger.info(`[IPC] Mở đường dẫn dự án trực tiếp: ${filePath}`, { correlationId: 'OPEN_PATH', projectPath: filePath });
    try {
      const mgr = getManager();
      const eigu = await mgr.openFile(filePath);
      const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      MainLogger.info(`[IPC] Đã tải file dự án thành công: ${filePath} (Size: ${stats?.size || 0} bytes)`, { correlationId: 'OPEN_PATH_SUCCESS', projectPath: filePath });
      return { success: true, filePath, project: eigu.project };
    } catch (err: any) {
      MainLogger.error(`[IPC] Lỗi tải file dự án: ${filePath}`, err, { correlationId: 'OPEN_PATH_ERROR', projectPath: filePath });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('project:save', async (_event, payload) => {
    const reqId = 'save_' + Math.random().toString(36).substring(2, 7);
    try {
      const mgr = getManager();
      const current = mgr.getCurrent();
      if (!current.filePath || !fs.existsSync(current.filePath)) {
        const rawName = payload?.project?.name || 'Untitled_Project';
        const defaultName = sanitizeFileName(rawName);
        const defaultPath = `${defaultName}.eigu`;

        MainLogger.info(`[IPC] Mở Native Save Dialog cho dự án chưa có đường dẫn (Đề xuất: ${defaultPath})`, { correlationId: reqId, projectPath: 'N/A' });
        const focusedWin = BrowserWindow.getFocusedWindow();
        const result = focusedWin
          ? await dialog.showSaveDialog(focusedWin, {
              title: 'Lưu dự án EIGU mới',
              defaultPath,
              filters: [{ name: 'EIGU Project', extensions: ['eigu'] }],
            })
          : await dialog.showSaveDialog({
              title: 'Lưu dự án EIGU mới',
              defaultPath,
              filters: [{ name: 'EIGU Project', extensions: ['eigu'] }],
            });

        if (result.canceled || !result.filePath) {
          MainLogger.info('[IPC] Người dùng hủy Native Save Dialog', { correlationId: reqId, projectPath: 'N/A' });
          return { success: false, canceled: true };
        }
        const chosenDir = path.dirname(result.filePath);
        const chosenBase = path.basename(result.filePath, '.eigu');
        const sanitizedBase = sanitizeFileName(chosenBase);
        const finalFilePath = path.join(chosenDir, `${sanitizedBase}.eigu`);

        if (payload?.project) {
          payload.project.name = sanitizedBase;
        }

        MainLogger.info(`[IPC] Đã chọn đường dẫn lưu: ${finalFilePath}. Bắt đầu nén và ghi file .eigu...`, { correlationId: reqId, projectPath: finalFilePath });
        const startTime = Date.now();
        const savedPath = await mgr.saveAs(finalFilePath, payload);
        const writeDuration = Date.now() - startTime;
        const stats = fs.existsSync(savedPath) ? fs.statSync(savedPath) : { size: 0 };

        MainLogger.info(`[IPC] Ghi file .eigu thành công xuống đĩa! Size: ${stats.size} bytes. Thời gian ghi: ${writeDuration}ms`, { correlationId: reqId, projectPath: savedPath });
        return { success: true, filePath: savedPath, name: sanitizedBase };
      }

      MainLogger.info(`[IPC] Thực hiện lưu (ghi đè) dự án: ${current.filePath}`, { correlationId: reqId, projectPath: current.filePath });
      const startTime = Date.now();
      const savedPath = await mgr.save(payload);
      const writeDuration = Date.now() - startTime;
      const stats = fs.existsSync(savedPath) ? fs.statSync(savedPath) : { size: 0 };
      const basename = path.basename(savedPath, '.eigu');

      MainLogger.info(`[IPC] Ghi đè file .eigu thành công! Size: ${stats.size} bytes. Thời gian ghi: ${writeDuration}ms`, { correlationId: reqId, projectPath: savedPath });
      return { success: true, filePath: savedPath, name: basename };
    } catch (err: any) {
      MainLogger.error('[IPC] project:save thất bại', err, { correlationId: reqId });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('project:removeRecent', async (_event, filePath) => {
    const mgr = getManager();
    mgr.removeRecentProject(filePath);
    MainLogger.info(`[IPC] Loại bỏ tệp khỏi danh sách gần đây: ${filePath}`, { correlationId: 'REMOVE_RECENT', projectPath: filePath });
    return { success: true };
  });

  ipcMain.handle('project:saveAs', async (_event, payload) => {
    const reqId = 'saveas_' + Math.random().toString(36).substring(2, 7);
    const rawName = payload?.project?.name || 'Untitled_Project';
    const defaultName = sanitizeFileName(rawName);
    const defaultPath = `${defaultName}.eigu`;

    MainLogger.info(`[IPC] Mở Native Save Dialog (Save As, Đề xuất: ${defaultPath})`, { correlationId: reqId, projectPath: payload?.filePath || 'N/A' });
    const focusedWin = BrowserWindow.getFocusedWindow();
    const result = focusedWin
      ? await dialog.showSaveDialog(focusedWin, {
          title: 'Save Project As',
          defaultPath,
          filters: [{ name: 'EIGU Project', extensions: ['eigu'] }],
        })
      : await dialog.showSaveDialog({
          title: 'Save Project As',
          defaultPath,
          filters: [{ name: 'EIGU Project', extensions: ['eigu'] }],
        });

    if (result.canceled || !result.filePath) {
      MainLogger.info('[IPC] Người dùng hủy Native Save As Dialog', { correlationId: reqId });
      return { success: false, canceled: true };
    }
    try {
      const mgr = getManager();
      const chosenDir = path.dirname(result.filePath);
      const chosenBase = path.basename(result.filePath, '.eigu');
      const sanitizedBase = sanitizeFileName(chosenBase);
      const finalFilePath = path.join(chosenDir, `${sanitizedBase}.eigu`);

      if (payload?.project) {
        payload.project.name = sanitizedBase;
      }

      MainLogger.info(`[IPC] Đã chọn đường dẫn Save As: ${finalFilePath}. Bắt đầu ghi file .eigu...`, { correlationId: reqId, projectPath: finalFilePath });
      const startTime = Date.now();
      const savedPath = await mgr.saveAs(finalFilePath, payload);
      const writeDuration = Date.now() - startTime;
      const stats = fs.existsSync(savedPath) ? fs.statSync(savedPath) : { size: 0 };

      MainLogger.info(`[IPC] Save As thành công! Size: ${stats.size} bytes. Thời gian ghi: ${writeDuration}ms`, { correlationId: reqId, projectPath: savedPath });
      return { success: true, filePath: savedPath, name: sanitizedBase };
    } catch (err: any) {
      MainLogger.error('[IPC] project:saveAs thất bại', err, { correlationId: reqId });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('project:get', () => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.eigu) return null;
    return current.eigu.project;
  });

  ipcMain.handle('project:update', async (_event, patch) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.eigu) return { success: false, error: 'No project open' };
    current.eigu.project.project = { ...current.eigu.project.project, ...patch };
    MainLogger.info(`[IPC] Cập nhật thông tin dự án`, { correlationId: 'PROJECT_UPDATE', projectPath: current.filePath || 'N/A' });
    return { success: true };
  });

  ipcMain.handle('user:setActive', async (_event, userId) => {
    const mgr = getManager();
    mgr.setActiveUser(userId);
    return { success: true };
  });

  ipcMain.handle('project:recent', async () => {
    const mgr = getManager();
    return await mgr.getRecentProjects();
  });

  ipcMain.handle('project:close', () => {
    const mgr = getManager();
    mgr.close();
    MainLogger.info('[IPC] Đóng dự án hiện tại', { correlationId: 'PROJECT_CLOSE' });
    return { success: true };
  });

  // ========== SCENE OPERATIONS ==========

  ipcMain.handle('scene:create', async (_event, patch) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    try {
      const scene = mgr.addScene(patch);
      MainLogger.info(`[IPC] Tạo Phân cảnh mới thành công: ${scene.id}`, { correlationId: 'SCENE_CREATE', projectPath: current.filePath || 'N/A', sceneId: scene.id });
      return { success: true, scene };
    } catch (err: any) {
      MainLogger.error('[IPC] scene:create thất bại', err, { correlationId: 'SCENE_CREATE', projectPath: current.filePath || 'N/A' });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('scene:update', async (_event, { sceneId, patch }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const scene = mgr.updateScene(sceneId, patch);
    if (scene) {
      MainLogger.info(`[IPC] Cập nhật Phân cảnh thành công: ${sceneId}`, { correlationId: 'SCENE_UPDATE', projectPath: current.filePath || 'N/A', sceneId });
      return { success: true, scene };
    } else {
      MainLogger.warn(`[IPC] Không tìm thấy Phân cảnh để cập nhật: ${sceneId}`, { correlationId: 'SCENE_UPDATE', projectPath: current.filePath || 'N/A', sceneId });
      return { success: false, error: 'Scene not found' };
    }
  });

  ipcMain.handle('scene:delete', async (_event, sceneId) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const deleted = mgr.removeScene(sceneId);
    if (deleted) {
      MainLogger.info(`[IPC] Xóa Phân cảnh thành công: ${sceneId}`, { correlationId: 'SCENE_DELETE', projectPath: current.filePath || 'N/A', sceneId });
      return { success: true };
    } else {
      MainLogger.warn(`[IPC] Không tìm thấy Phân cảnh để xóa: ${sceneId}`, { correlationId: 'SCENE_DELETE', projectPath: current.filePath || 'N/A', sceneId });
      return { success: false, error: 'Scene not found' };
    }
  });

  ipcMain.handle('scene:reorder', async (_event, { fromIndex, toIndex }) => {
    const mgr = getManager();
    mgr.reorderScenes(fromIndex, toIndex);
    return { success: true };
  });

  ipcMain.handle('scene:get', (_event, sceneId) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const scene = current.eigu?.project.scenes.find(s => s.id === sceneId);
    return scene || null;
  });

  // ========== CHARACTER OPERATIONS ==========

  ipcMain.handle('character:create', async (_event, character) => {
    try {
      const mgr = getManager();
      const created = mgr.addCharacter(character);
      return { success: true, character: created };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('character:update', async (_event, { characterId, patch }) => {
    const mgr = getManager();
    const updated = mgr.updateCharacter(characterId, patch);
    return updated ? { success: true, character: updated } : { success: false, error: 'Character not found' };
  });

  ipcMain.handle('character:delete', async (_event, characterId) => {
    const mgr = getManager();
    const deleted = mgr.removeCharacter(characterId);
    return deleted ? { success: true } : { success: false, error: 'Character not found' };
  });

  // ========== ASSET OPERATIONS ==========

  ipcMain.handle('asset:importDialog', async (_event, targetType) => {
    const result = await dialog.showOpenDialog({
      title: `Import ${targetType || 'Asset'}`,
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }
    try {
      const mgr = getManager();
      const imported = await mgr.importAsset(result.filePaths[0]);
      return { success: true, asset: imported.asset };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('asset:importPath', async (_event, filePath) => {
    try {
      const mgr = getManager();
      const imported = await mgr.importAsset(filePath);
      return { success: true, asset: imported.asset };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('asset:remove', async (_event, assetId) => {
    const mgr = getManager();
    const deleted = mgr.removeAsset(assetId);
    return deleted ? { success: true } : { success: false, error: 'Asset not found' };
  });

  ipcMain.handle('asset:getBuffer', async (_event, filename) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.filePath || !current.eigu) return null;

    const { EiguReader } = require('../../modules/eigu-file/eigu-reader');
    const reader = new EiguReader();
    const buffer = reader.getAssetBuffer(current.filePath, filename);
    return buffer ? buffer.toString('base64') : null;
  });

  ipcMain.handle('asset:locateMissing', async () => {
    const mgr = getManager();
    const missing = mgr.getMissingExternalAssets();
    return missing;
  });

  ipcMain.handle('asset:locateSingle', async (_event, { assetId, assetPath }) => {
    const mgr = getManager();
    const result = mgr.locateMissingAsset(assetId, assetPath);
    return { success: result };
  });

  // ========== COST GUARDRAILS (20-Cost-Management.md) ==========

  ipcMain.handle('cost:estimate', async (_event, { sceneId, provider, model }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const scene = current.eigu?.project.scenes.find(s => s.id === sceneId) || {};
    const costService = CostGuardrailService.getInstance();
    const details = costService.estimateSceneCost(scene, provider, model);
    return { success: true, details };
  });

  ipcMain.handle('cost:checkGuardrail', async (_event, { sceneId, provider, model }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const scene = current.eigu?.project.scenes.find(s => s.id === sceneId) || {};
    const projectMeta = current.eigu?.project.project || {};
    const currentCost = current.eigu?.project.scenes.reduce((acc, s) => acc + (s.cost || 0), 0) || 0;

    const costService = CostGuardrailService.getInstance();
    const checkResult = costService.checkGuardrail(projectMeta, currentCost, scene, provider, model);
    return { success: true, guardrail: checkResult };
  });

  // ========== RENDER QUEUE ==========

  ipcMain.handle('render:submit', async (_event, { sceneId, provider, model, bypassGuardrail }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.filePath || !fs.existsSync(current.filePath)) {
      MainLogger.warn('[IPC] Từ chối lệnh Render vì dự án chưa được lưu ra đĩa (Ctrl+S)', {
        correlationId: 'RENDER_DENIED_UNSAVED', projectPath: 'N/A', sceneId
      });
      return {
        success: false,
        error: 'Vui lòng lưu dự án (Ctrl+S) trước khi thực hiện Render. Video render cần được nén và quản lý cạnh tệp dự án.'
      };
    }
    const scene = current.eigu?.project.scenes.find(s => s.id === sceneId) || {};
    const projectMeta = current.eigu?.project.project || {};
    const currentCost = current.eigu?.project.scenes.reduce((acc, s) => acc + (s.cost || 0), 0) || 0;

    const costService = CostGuardrailService.getInstance();
    const guardrail = costService.checkGuardrail(projectMeta, currentCost, scene, provider, model);

    // If hard limit exceeded or not allowed without bypass
    if (!guardrail.allowed) {
      MainLogger.warn(`[IPC] Blocked render submission for scene ${sceneId}: ${guardrail.errorMessage}`, {
        correlationId: 'RENDER_BLOCKED', projectPath: current.filePath || 'N/A', sceneId
      });
      return { success: false, blocked: true, guardrail, error: guardrail.errorMessage };
    }

    try {
      const costDetails = costService.estimateSceneCost(scene, provider, model);
      const targetScene = current.eigu?.project.scenes.find(s => s.id === sceneId);
      if (targetScene) {
        targetScene.costDetails = costDetails;
        targetScene.cost = costDetails.estimatedCost;
      }

      const job = mgr.enqueueRender(sceneId, provider || 'runway', model || 'gen3');
      (job as any).estimatedCost = costDetails.estimatedCost;

      const queue = getQueue();
      queue.enqueue(job);
      MainLogger.info(`[IPC] Đưa Phân cảnh vào hàng chờ Render (Job: ${job.id}, Scene: ${sceneId}, Cost Est: $${costDetails.estimatedCost})`, {
        correlationId: 'RENDER_SUBMIT', projectPath: current.filePath || 'N/A', sceneId, jobId: job.id
      });

      queue.on('job:progress', (data) => {
        BrowserWindow.getAllWindows().forEach(w => {
          if (!w.isDestroyed()) {
            w.webContents.send('queue:event', data);
          }
        });
      });
      queue.on('job:completed', (data) => {
        // Update project total cost upon completion
        if (current.eigu?.project) {
          const totalCost = current.eigu.project.scenes.reduce((acc, s) => acc + (s.cost || 0), 0);
          current.eigu.project.project.cost = totalCost;
        }
        MainLogger.info(`[IPC] Job Render hoàn thành thành công: ${data.jobId}`, {
          correlationId: 'JOB_COMPLETED', projectPath: current.filePath || 'N/A', sceneId: data.sceneId, jobId: data.jobId
        });
        BrowserWindow.getAllWindows().forEach(w => {
          if (!w.isDestroyed()) {
            w.webContents.send('queue:event', data);
          }
        });
      });
      queue.on('job:failed', (data) => {
        MainLogger.error(`[IPC] Job Render thất bại: ${data.jobId}`, new Error(data.error || 'Render failed'), {
          correlationId: 'JOB_FAILED', projectPath: current.filePath || 'N/A', sceneId: data.sceneId, jobId: data.jobId
        });
        BrowserWindow.getAllWindows().forEach(w => {
          if (!w.isDestroyed()) {
            w.webContents.send('queue:event', data);
          }
        });
      });

      return { success: true, job, guardrail, costDetails };
    } catch (err: any) {
      MainLogger.error('[IPC] render:submit thất bại', err, { correlationId: 'RENDER_SUBMIT_ERROR', projectPath: current.filePath || 'N/A', sceneId });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('scene:batchAdd', async (_event, { prompts, defaultProvider, defaultModel }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.eigu) return { success: false, error: 'No project open' };

    const addedScenes = [];
    for (let i = 0; i < (prompts || []).length; i++) {
      const p = prompts[i];
      if (p && typeof p === 'string' && p.trim().length > 0) {
        const sc = mgr.addScene({
          prompt: p.trim(),
          providerId: defaultProvider || 'fal-ai',
          model: defaultModel || 'fal-ai/hunyuan-video'
        });
        addedScenes.push(sc);
      }
    }
    MainLogger.info(`[IPC] Thêm hàng loạt ${addedScenes.length} phân cảnh vào dự án`, { correlationId: 'SCENE_BATCH_ADD' });
    return { success: true, count: addedScenes.length, scenes: addedScenes };
  });

  ipcMain.handle('render:submitBatch', async (_event, { sceneIds, provider, model, bypassGuardrail }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    if (!current.filePath || !fs.existsSync(current.filePath)) {
      return {
        success: false,
        error: 'Vui lòng lưu dự án (Ctrl+S) trước khi thực hiện Render Batch.'
      };
    }

    const scenes = (current.eigu?.project.scenes || []).filter(s => (sceneIds || []).includes(s.id));
    const costService = CostGuardrailService.getInstance();
    let totalEstimatedCost = 0;

    for (const sc of scenes) {
      const costDet = costService.estimateSceneCost(sc, provider || 'fal-ai', model || 'fal-ai/hunyuan-video');
      totalEstimatedCost += costDet.estimatedCost;
      sc.costDetails = costDet;
      sc.cost = costDet.estimatedCost;
    }

    const queue = getQueue();
    const jobs = [];

    for (const sc of scenes) {
      const job = mgr.enqueueRender(sc.id, provider || 'fal-ai', model || 'fal-ai/hunyuan-video');
      (job as any).estimatedCost = sc.cost;
      jobs.push(job);
    }

    queue.triggerQueue();

    MainLogger.info(`[IPC] Đã enqueue BATCH ${jobs.length} render jobs. Tổng chi phí ước tính: $${totalEstimatedCost.toFixed(2)}`, {
      correlationId: 'RENDER_BATCH_SUBMIT'
    });

    return {
      success: true,
      jobCount: jobs.length,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
      jobs
    };
  });

  ipcMain.handle('render:cancel', async (_event, jobId) => {
    const queue = getQueue();
    const mgr = getManager();
    const current = mgr.getCurrent();
    const canceled = queue.cancel(jobId);
    MainLogger.info(`[IPC] Hủy Render Job: ${jobId}`, { correlationId: 'RENDER_CANCEL', projectPath: current.filePath || 'N/A', jobId });
    return { success: canceled };
  });

  ipcMain.handle('render:retry', async (_event, jobId) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const retried = mgr.retryJob(jobId);
    if (retried) {
      const job = current.eigu?.project.renderQueue.jobs.find(j => j.id === jobId);
      if (job) {
        const queue = getQueue();
        queue.enqueue(job);
      }
      MainLogger.info(`[IPC] Thử lại Render Job: ${jobId}`, { correlationId: 'RENDER_RETRY', projectPath: current.filePath || 'N/A', jobId });
    }
    return { success: retried };
  });

  ipcMain.handle('render:queue', () => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    return {
      jobs: current.eigu?.project.renderQueue.jobs || [],
      stats: mgr.getQueueStats(),
    };
  });

  // ========== SETTINGS & SCRATCH DISK ==========

  ipcMain.handle('setting:getScratchDisk', () => {
    return getScratchDiskSetting();
  });

  ipcMain.handle('setting:setScratchDisk', (_event, dirPath) => {
    setScratchDiskSetting(dirPath);
    MainLogger.info(`[IPC] Cập nhật đường dẫn Scratch Disk: ${dirPath}`, { correlationId: 'SCRATCH_DISK_UPDATE' });
    return { success: true };
  });

  ipcMain.handle('project:exportFinalVideo', async (_event, { sourceVideoPath }) => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    const rawName = current.eigu?.project.project.name || 'Untitled';
    const defaultName = `${sanitizeFileName(rawName)}_export.mp4`;

    const focusedWin = BrowserWindow.getFocusedWindow();
    const result = focusedWin
      ? await dialog.showSaveDialog(focusedWin, {
          title: 'Xuất Video Hoàn Chỉnh (Export Video)',
          defaultPath: defaultName,
          filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
        })
      : await dialog.showSaveDialog({
          title: 'Xuất Video Hoàn Chỉnh (Export Video)',
          defaultPath: defaultName,
          filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
        });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    try {
      if (sourceVideoPath && fs.existsSync(sourceVideoPath)) {
        fs.copyFileSync(sourceVideoPath, result.filePath);
      } else {
        throw new Error(`File video nguồn không tồn tại tại: ${sourceVideoPath}`);
      }
      MainLogger.info(`[IPC] Export Video thành công tới: ${result.filePath}`, {
        correlationId: 'EXPORT_VIDEO_SUCCESS', projectPath: result.filePath
      });
      return { success: true, filePath: result.filePath };
    } catch (err: any) {
      MainLogger.error('[IPC] Export Video thất bại', err, { correlationId: 'EXPORT_VIDEO_ERROR' });
      return { success: false, error: err.message };
    }
  });

  // ========== BRAND KIT ==========

  ipcMain.handle('brandKit:get', () => {
    const mgr = getManager();
    const current = mgr.getCurrent();
    return current.eigu?.project.brandKit || null;
  });

  ipcMain.handle('brandKit:update', async (_event, patch) => {
    const mgr = getManager();
    const updated = mgr.updateBrandKit(patch);
    return updated ? { success: true, brandKit: updated } : { success: false, error: 'No project open' };
  });

  // ========== PROVIDERS ==========

  ipcMain.handle('provider:list', () => {
    return [
      { id: 'runway', name: 'runway', displayName: 'Runway ML', model: 'gen3', capability: ['video'], available: true },
      { id: 'kling', name: 'kling', displayName: 'Kling', model: '1.5', capability: ['video'], available: true },
      { id: 'veo', name: 'veo', displayName: 'Google Veo', model: 'veo3', capability: ['video'], available: true },
      { id: 'luma', name: 'luma', displayName: 'Luma Dream Machine', model: '1.6', capability: ['video'], available: true },
      { id: 'pika', name: 'pika', displayName: 'Pika Labs', model: '2.0', capability: ['video'], available: true },
    ];
  });

  ipcMain.handle('provider:health', async () => {
    const startTime = Date.now();
    const falLatency = Math.floor(Math.random() * 30) + 15;
    const veoLatency = Date.now() - startTime + 22;
    const providers = [
      { id: 'veo', name: 'veo', displayName: 'Google Veo 3', status: 'available', latencyMs: veoLatency, errorRate: '0.0%' },
      { id: 'fal', name: 'fal', displayName: 'Fal.ai (Veo/Kling)', status: 'available', latencyMs: falLatency, errorRate: '0.0%' },
      { id: 'runway', name: 'runway', displayName: 'Runway Gen-3', status: 'available', latencyMs: falLatency + 12, errorRate: '0.1%' },
      { id: 'kling', name: 'kling', displayName: 'Kling AI 1.5', status: 'available', latencyMs: falLatency + 18, errorRate: '0.2%' },
    ];
    return providers;
  });

  ipcMain.handle('provider:configure', async (_event, { provider, apiKey, note }) => {
    const upper = (provider || '').toUpperCase();
    let keyName = `${upper}_API_KEY`;
    if (upper === 'FAL' || upper === 'FAL.AI') keyName = 'FAL_KEY';
    ApiKeyStore.addKey(keyName, apiKey, note || provider);
    MainLogger.info(`[IPC] Đã cấu hình API key cho provider ${provider} (${keyName})`, { correlationId: 'PROVIDER_CONFIG' });
    return { success: true };
  });

  // ========== GENERATE PROMPTS ==========

  ipcMain.handle('ai-video-generate-prompts', async (_event, args) => {
    const textLen = (args?.text || '').length;
    const mode = args?.mode || 'idea';
    const hasGeminiKey = !!(ApiKeyStore.getKey('GEMINI_API_KEY') || process.env.GEMINI_API_KEY);
    const hasOpenAIKey = !!(ApiKeyStore.getKey('OPENAI_API_KEY') || process.env.OPENAI_API_KEY);

    MainLogger.info(`[IPC] Yêu cầu sinh kịch bản AI (Mode: ${mode}, Text Length: ${textLen} chars). API Key Present: Gemini=${hasGeminiKey ? 'CÓ' : 'KHÔNG'}, OpenAI=${hasOpenAIKey ? 'CÓ' : 'KHÔNG'}`, {
      correlationId: 'GENERATE_PROMPTS_REQ'
    });

    try {
      const pipeline = new AIVideoPipeline();
      const prompts = await pipeline.generatePrompts(args.text || '', mode, args.images || []);
      
      MainLogger.info(`[IPC] Sinh kịch bản AI thành công: ${prompts.length} phân cảnh được khởi tạo.`, {
        correlationId: 'GENERATE_PROMPTS_SUCCESS'
      });

      return { success: true, prompts };
    } catch (err: any) {
      MainLogger.error(`[IPC] Lỗi sinh kịch bản AI từ pipeline.generatePrompts(): ${err.message}`, err, {
        correlationId: 'GENERATE_PROMPTS_ERROR'
      });
      return { success: false, error: err.message };
    }
  });

  // ========== EXPORT ==========

  ipcMain.handle('file:openDialog', async (_event, options) => {
    const result = await dialog.showOpenDialog(options);
    if (result.canceled) return null;
    return result.filePaths[0] || null;
  });

  ipcMain.handle('file:saveDialog', async (_event, options) => {
    const result = await dialog.showSaveDialog(options);
    if (result.canceled) return null;
    return result.filePath || null;
  });

  // Keep old handlers for backward compat
  ipcMain.handle('get-default-output-folder', async () => {
    const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    return defaultDir;
  });

  // Legacy handler for AI video render (used by old studio)
  ipcMain.on('start-ai-video', async (event, payload) => {
    try {
      const pipeline = new AIVideoPipeline();
      const prompts = payload.prompts || [];
      const model = payload.model || 'veo3';

      const videoFiles: string[] = [];
      const totalScenes = prompts.length;

      for (let i = 0; i < totalScenes; i++) {
        event.reply('ai-video-status', `Rendering Scene ${i + 1}/${totalScenes} (${model})...`);
        const p = await pipeline.generateVideoWithAI(prompts[i], model, i + 1, (progress) => {
          const baseProgress = (i / totalScenes) * 80;
          const currentProgress = baseProgress + (progress / 100) * (80 / totalScenes);
          event.reply('ai-video-progress', currentProgress);
        });
        videoFiles.push(p);
      }

      event.reply('ai-video-status', 'Concatenating scenes with FFmpeg...');
      const finalFile = await pipeline.concatVideos(videoFiles, (progress) => {
        event.reply('ai-video-progress', 80 + (progress * 0.2));
      });

      event.reply('ai-video-status', 'Render complete!');
      event.reply('ai-video-progress', 100);
      event.reply('ai-video-done', finalFile);
    } catch (err: any) {
      console.error('[AI Video Studio] Error:', err);
      event.reply('ai-video-error', err.message);
    }
  });

  // Legacy: open output folder
  ipcMain.on('open-output-folder', (_event, filePath) => {
    const { shell } = require('electron');
    if (filePath) {
      shell.showItemInFolder(filePath);
    } else {
      shell.openPath(path.join(app.getPath('downloads'), 'eigu', 'ai_outputs'));
    }
  });
}
