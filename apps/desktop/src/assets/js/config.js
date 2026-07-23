/**
 * EIGU Platform - Centralized Client Configuration
 * Đặt tập trung baseUrl và websocketUrl cho toàn bộ ứng dụng Desktop.
 * Không cần lặp lại URL ở các file lẻ.
 */
(function() {
  const DEFAULT_API_BASE_URL = localStorage.getItem('eigu_api_url') || 'http://localhost:3001/api';
  const DEFAULT_WEBSOCKET_URL = localStorage.getItem('eigu_ws_url') || 'http://localhost:3001';

  window.EIGU_CONFIG = {
    API_BASE_URL: DEFAULT_API_BASE_URL,
    WEBSOCKET_URL: DEFAULT_WEBSOCKET_URL,
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

  window.API_BASE = window.EIGU_CONFIG.API_BASE_URL;
})();
