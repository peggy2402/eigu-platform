const { ipcRenderer, webUtils } = require('electron');

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentView = 'ho-so';
let userProfile = null;
let currentTheme = localStorage.getItem('eigu_theme') || 'system';

const appState = {
  mode: 'idle',
  file: null,
  youtubeLink: '',
  outputPath: null,
  options: {
    splitMode: 'split_5',
    aspectRatio: 'original',
    autoPartText: true,
    metadataStripping: true,
    noiseInjection: false,
    decimation: false,
    audioSpatialPanning: false
  },
  progress: 0,
  status: 'Đang chờ...',
  startTime: null
};
