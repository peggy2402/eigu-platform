/**
 * EIGU Platform - Centralized Client Configuration
 * Đặt tập trung baseUrl và websocketUrl cho toàn bộ ứng dụng Desktop.
 * Đọc cấu hình từ Backend Server IPC / Environment, KHÔNG dùng localStorage đè URL cũ.
 */
(function() {
  try {
    localStorage.removeItem('eigu_api_url');
    localStorage.removeItem('eigu_ws_url');
  } catch(e) {}

  let activeApiUrl = 'http://localhost:3001/api';
  let activeWsUrl = 'http://localhost:3001';

  // Yêu cầu Electron Main Process trả về URL chính thức từ process.env / API_PREFIX đồng bộ ngay khi load
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      window.ipcRenderer = ipcRenderer;
      const cfg = ipcRenderer.sendSync('get-api-config-sync');
      if (cfg && cfg.apiUrl) activeApiUrl = cfg.apiUrl;
      if (cfg && cfg.wsUrl) activeWsUrl = cfg.wsUrl;
      
      ipcRenderer.invoke('get-api-config').then(cfgAsync => {
        if (cfgAsync && cfgAsync.apiUrl) activeApiUrl = cfgAsync.apiUrl;
        if (cfgAsync && cfgAsync.wsUrl) activeWsUrl = cfgAsync.wsUrl;
      }).catch(() => {});
    } catch(e) {}
  }

  window.EIGU_CONFIG = {
    get API_BASE_URL() {
      return activeApiUrl;
    },
    get WEBSOCKET_URL() {
      return activeWsUrl;
    },
    setApiUrl: function(url) {
      if (url) activeApiUrl = url;
    },
    getApiUrl: function(endpoint) {
      const base = this.API_BASE_URL.replace(/\/$/, '');
      const path = (endpoint || '').replace(/^\//, '');
      return `${base}/${path}`;
    },
    getWsUrl: function(namespace) {
      const base = this.WEBSOCKET_URL.replace(/\/$/, '');
      const ns = (namespace || '').replace(/^\//, '');
      return ns ? `${base}/${ns}` : base;
    }
  };

  window.getApiBaseUrl = function() {
    return window.EIGU_CONFIG.API_BASE_URL;
  };

  window.getWebSocketUrl = function() {
    return window.EIGU_CONFIG.WEBSOCKET_URL;
  };
})();
