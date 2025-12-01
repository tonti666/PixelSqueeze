import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { LogViewer } from './components/LogViewer';
import { ResultCard } from './components/ResultCard';
import { ffmpegService } from './services/ffmpegService';
import { CompressionSettings, CompressionLevel, Resolution, VideoFormat, LogEntry, ProcessedVideo } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { formatBytes } from './utils';
import { Zap, Loader2, Video as VideoIcon } from 'lucide-react';

export default function App() {
  // State
  const [isReady, setIsReady] = useState(false);
  const [isLoadingCore, setIsLoadingCore] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [processedResult, setProcessedResult] = useState<ProcessedVideo | null>(null);

  // Initialize FFmpeg
  useEffect(() => {
    const init = async () => {
      try {
        await ffmpegService.load();
        
        ffmpegService.setCallbacks(
          (msg) => addLog(msg, 'info'),
          (prog) => setProgress(prog)
        );
        
        setIsReady(true);
        addLog('FFmpeg core loaded successfully', 'success');
      } catch (e: any) {
        console.error(e);
        addLog(`Failed to load FFmpeg: ${e.message}`, 'error');
      } finally {
        setIsLoadingCore(false);
      }
    };
    init();
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      message
    }]);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessedResult(null);
    setProgress(0);
    setLogs([]); // Clear previous logs
    addLog(`File loaded: ${selectedFile.name} (${formatBytes(selectedFile.size)})`, 'info');
  };

  const handleCompress = async () => {
    if (!file || !isReady) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    addLog('Starting compression...', 'info');

    const startTime = Date.now();

    try {
      const outputData = await ffmpegService.compressVideo(file, settings);
      
      const endTime = Date.now();
      const blob = new Blob([outputData.buffer], { type: `video/${settings.format}` });
      const url = URL.createObjectURL(blob);

      setProcessedResult({
        url,
        originalSize: file.size,
        newSize: blob.size,
        filename: `compressed_${file.name.split('.')[0]}.${settings.format}`,
        timeTaken: endTime - startTime
      });

      addLog('Compression finished successfully!', 'success');
    } catch (e: any) {
      console.error(e);
      addLog(`Compression Error: ${e.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProcessedResult(null);
    setLogs([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans selection:bg-primary/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2.5 rounded-lg text-primary border border-primary/20">
              <Zap size={28} fill="currentColor" className="fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">PixelSqueeze</h1>
              <p className="text-slate-400 text-sm">Client-side Video Compressor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isReady ? (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800 text-xs text-slate-400">
                 <Loader2 size={12} className="animate-spin" />
                 Loading Engine...
               </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 text-xs text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Engine Ready
              </div>
            )}
          </div>
        </header>

        <main className="space-y-6">
          
          {/* 1. Upload Section */}
          {!processedResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!file ? (
                <Dropzone onFileSelected={handleFileSelect} disabled={!isReady || isLoadingCore} />
              ) : (
                <div className="bg-surface border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                      <VideoIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">{file.name}</h3>
                      <p className="text-slate-500 text-sm">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    disabled={isProcessing}
                    className="text-slate-400 hover:text-red-400 text-sm font-medium px-3 py-1.5 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              {file && (
                <>
                  <SettingsPanel 
                    settings={settings} 
                    onSettingsChange={setSettings} 
                    disabled={isProcessing} 
                  />

                  {/* Action Button */}
                  <div className="flex flex-col gap-4">
                    {isProcessing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-300">
                          <span>Processing...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-primary transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center pt-2">
                          This may take a while depending on your device speed. Do not close the tab.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleCompress}
                        className="w-full bg-primary hover:bg-primaryHover text-white text-lg font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <Zap size={20} className="fill-white/20" />
                        Compress Video
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. Results Section */}
          {processedResult && (
            <ResultCard result={processedResult} onReset={handleReset} />
          )}

          {/* 3. Logs Section (Always available if events exist) */}
          {(isProcessing || logs.length > 0) && (
            <LogViewer logs={logs} />
          )}

        </main>
      </div>
    </div>
  );
}
