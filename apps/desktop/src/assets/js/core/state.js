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
    audioSpatialPanning: false,
    flip: 'none',
    brightness: 1.00,
    contrast: 1.00,
    saturation: 1.00,
    frameBend: 'none',
    voiceMode: 'none',
    voiceSpeaker: '',
    voicePitch: 1.0,
    voiceSpeed: 1.0,
    logoPath: '',
    logoPosition: 'bottom-right',
    logoSize: 15,
    logoOpacity: 100
  },
  progress: 0,
  status: 'Đang chờ...',
  startTime: null
};
