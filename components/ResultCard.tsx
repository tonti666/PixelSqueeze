import React from 'react';
import { Download, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ProcessedVideo } from '../types';
import { formatBytes, formatDuration } from '../utils';

interface ResultCardProps {
  result: ProcessedVideo;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const savings = ((result.originalSize - result.newSize) / result.originalSize) * 100;

  return (
    <div className="bg-surface border border-emerald-500/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center gap-3">
        <CheckCircle2 className="text-emerald-400" size={24} />
        <div>
          <h3 className="text-emerald-400 font-semibold">Compression Complete</h3>
          <p className="text-emerald-500/70 text-xs">Processed in {formatDuration(result.timeTaken)}</p>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Before</p>
            <p className="text-lg font-mono text-slate-300">{formatBytes(result.originalSize)}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-emerald-500/30">
            <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1">After</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-mono text-white">{formatBytes(result.newSize)}</p>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                -{savings.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        <div className="mb-6 bg-black rounded-lg overflow-hidden aspect-video relative group">
          <video 
            src={result.url} 
            controls 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={result.url}
            download={result.filename}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Download size={20} />
            Download
          </a>
          <button
            onClick={onReset}
            className="px-4 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Compress another video"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
