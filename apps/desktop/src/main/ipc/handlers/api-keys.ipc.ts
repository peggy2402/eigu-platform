import { ipcMain } from 'electron';
import { ApiKeyStore } from '../../services/api-key-store.service';

export function registerApiKeysIpc() {
  ipcMain.handle('get-api-keys', async () => {
    return ApiKeyStore.getKeysForUI();
  });

  ipcMain.handle('add-api-key', async (_event, { type, value, note }) => {
    ApiKeyStore.addKey(type, value, note);
    return true;
  });

  ipcMain.handle('delete-api-key', async (_event, id) => {
    ApiKeyStore.deleteKey(id);
    return true;
  });
}
