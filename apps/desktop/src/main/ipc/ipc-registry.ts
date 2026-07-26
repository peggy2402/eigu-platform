import { BrowserWindow } from 'electron';
import { Socket } from 'socket.io-client';
import { registerApiConfigIpc } from './handlers/api-config.ipc';
import { registerApiKeysIpc } from './handlers/api-keys.ipc';
import { registerAutoUpdateIpc } from './handlers/auto-update.ipc';
import { registerWorkflowIpc } from './handlers/workflow.ipc';
import { registerStudioIpcHandlers } from './handlers/studio.ipc';

export function registerAllIpcHandlers(mainWindowGetter: () => BrowserWindow | null, socket: Socket) {
  console.log('[IPC Registry] Đăng ký toàn bộ các IPC Handlers...');
  registerApiConfigIpc();
  registerApiKeysIpc();
  registerAutoUpdateIpc();
  registerWorkflowIpc(mainWindowGetter, socket);
  registerStudioIpcHandlers();
  console.log('[IPC Registry] ✅ Đã đăng ký thành công tất cả IPC Handlers!');
}
