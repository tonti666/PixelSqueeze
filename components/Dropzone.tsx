import React, { useCallback, useState } from 'react';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  }, [disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }
    
    // Limit 2GB for browser safety (FFmpeg wasm memory limits are tricky)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setError("File size exceeds browser processing limit (2GB).");
      return;
    }

    onFileSelected(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
        flex flex-col items-center justify-center text-center cursor-pointer group
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-slate-700 hover:border-slate-500 bg-surface'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
        <Upload size={32} />
      </div>

      <h3 className="text-lg font-medium text-slate-200 mb-2">
        {isDragging ? 'Drop video here' : 'Drag & Drop video file'}
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Supports MP4, MOV, MKV, AVI, WebM
      </p>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm mt-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};