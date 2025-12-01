export enum Resolution {
  ORIGINAL = 'original',
  P1080 = '1080p',
  P720 = '720p',
  P480 = '480p'
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm'
}

export enum CompressionLevel {
  LOW = 'Low',     // High Quality, Larger Size
  MEDIUM = 'Medium', // Balanced
  HIGH = 'High'      // Low Quality, Small Size
}

export interface CompressionSettings {
  resolution: Resolution;
  format: VideoFormat;
  compressionLevel: CompressionLevel;
}

export interface LogEntry {
  id: string;
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: number;
}

export interface ProcessedVideo {
  url: string;
  originalSize: number;
  newSize: number;
  filename: string;
  timeTaken: number;
}
