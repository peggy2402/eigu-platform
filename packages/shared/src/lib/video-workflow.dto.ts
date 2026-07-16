export interface VideoProcessingOptions {
  decimation: boolean;
  noiseInjection: boolean;
  metadataStripping: boolean;
  audioSpatialPanning: boolean;
  splitMode?: string;
  customStart?: string;
  customEnd?: string;
  aspectRatio?: string;
  autoPartText?: boolean;
  ttsMode?: string;
}

export interface VideoWorkflowRequest {
  taskId: string;
  videoUrl: string; // URL YouTube hoặc nguồn video đầu vào
  proxyUrl?: string; // SOCKS5 Residential Proxy (để Anti-detect)
  options: VideoProcessingOptions;
}

export interface VideoWorkflowStatus {
  taskId: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 - 100%
  message?: string;
  resultFilePath?: string;
}
