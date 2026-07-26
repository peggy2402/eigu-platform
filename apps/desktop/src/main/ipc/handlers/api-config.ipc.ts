import { ipcMain } from 'electron';
import { getApiConfig } from '../../config/env.config';

export function registerApiConfigIpc() {
  ipcMain.on('get-api-config-sync', (event) => {
    event.returnValue = getApiConfig();
  });

  ipcMain.handle('get-api-config', async () => {
    return getApiConfig();
  });

  ipcMain.handle('save-api-config', async (_event, newConfig) => {
    if (newConfig && newConfig.apiPrefix) {
      process.env.API_PREFIX = newConfig.apiPrefix;
    }
    if (newConfig && newConfig.apiUrl) {
      process.env.NEXT_PUBLIC_API_URL = newConfig.apiUrl;
    }
    return true;
  });
}
