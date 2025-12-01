import { CompressionLevel, Resolution } from "./types";

export const RESOLUTION_MAP: Record<Resolution, string> = {
  [Resolution.ORIGINAL]: 'scale=-1:-1', // Pass through
  [Resolution.P1080]: 'scale=-1:1080',
  [Resolution.P720]: 'scale=-1:720',
  [Resolution.P480]: 'scale=-1:480',
};

// CRF (Constant Rate Factor) values
// Lower = Higher Quality. Higher = Lower Quality.
export const CRF_MAP: Record<CompressionLevel, number> = {
  [CompressionLevel.LOW]: 18,   // High quality
  [CompressionLevel.MEDIUM]: 23, // Default/Balanced
  [CompressionLevel.HIGH]: 28,   // Compressed
};

export const DEFAULT_SETTINGS = {
  resolution: Resolution.P720,
  format: "mp4",
  compressionLevel: CompressionLevel.MEDIUM
};
