import { ipcMain, app, shell, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Socket } from 'socket.io-client';
import { VideoWorkflowRequest } from '@eigu-platform/shared';
import { processVideoWithFFmpeg } from '../../services/ffmpeg-processor.service';
import { downloadYouTubeVideo } from '../../services/youtube-downloader.service';

let cancelCurrentWorkflow: (() => void) | null = null;

export function registerWorkflowIpc(mainWindowGetter: () => BrowserWindow | null, socket: Socket) {
  ipcMain.handle('open-output-folder', async (_event, folderPath) => {
    const targetDir = folderPath || path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    await shell.openPath(targetDir);
    return true;
  });

  ipcMain.handle('select-output-folder', async () => {
    const defaultDir = path.join(app.getPath('downloads'), 'eigu', 'outputs');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    const win = mainWindowGetter();
    const result = win 
      ? await dialog.showOpenDialog(win, {
          defaultPath: defaultDir,
          properties: ['openDirectory'],
          buttonLabel: 'Chọn thư mục'
        })
      : await dialog.showOpenDialog({
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

  ipcMain.on('cancel-workflow', (_event) => {
    console.log('[Main Process] Yêu cầu hủy tiến trình từ UI');
    if (cancelCurrentWorkflow) {
      cancelCurrentWorkflow();
      cancelCurrentWorkflow = null;
    }
  });
}
