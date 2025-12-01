import React from 'react';
import { Settings, Video, FileOutput, Gauge } from 'lucide-react';
import { CompressionSettings, Resolution, VideoFormat, CompressionLevel } from '../types';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled }) => {
  const handleChange = (key: keyof CompressionSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-800">
      <div className="flex items-center gap-2 mb-6 text-slate-200 font-medium pb-4 border-b border-slate-800">
        <Settings size={20} className="text-primary" />
        Compression Settings
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resolution */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 flex items-center gap-2">
            <Video size={16} />
            Resolution
          </label>
          <div className="relative">
            <select
              value={settings.resolution}
              onChange={(e) => handleChange('resolution', e.target.value)}
              disabled={disabled}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none disabled:opacity-50"
            >
              <option value={Resolution.ORIGINAL}>Original (Keep Same)</option>
              <option value={Resolution.P1080}>1080p (FHD)</option>
              <option value={Resolution.P720}>720p (HD)</option>
              <option value={Resolution.P480}>480p (SD)</option>
            </select>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 flex items-center gap-2">
            <FileOutput size={16} />
            Output Format
          </label>
          <select
            value={settings.format}
            onChange={(e) => handleChange('format', e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
          >
            <option value={VideoFormat.MP4}>MP4 (H.264)</option>
            <option value={VideoFormat.WEBM}>WebM (VP9)</option>
          </select>
        </div>

        {/* Compression Level */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 flex items-center gap-2">
            <Gauge size={16} />
            Quality Mode
          </label>
          <select
            value={settings.compressionLevel}
            onChange={(e) => handleChange('compressionLevel', e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
          >
            <option value={CompressionLevel.LOW}>High Quality (Larger Size)</option>
            <option value={CompressionLevel.MEDIUM}>Balanced (Recommended)</option>
            <option value={CompressionLevel.HIGH}>High Compression (Smallest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
