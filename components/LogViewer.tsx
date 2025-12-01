import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  isOpen?: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, expanded]);

  return (
    <div className="w-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal size={18} className="text-emerald-500" />
          <span className="font-mono text-sm">Processing Logs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {logs.length} events
          </span>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 h-64 overflow-y-auto font-mono text-xs scrollbar-thin">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center mt-8">Waiting for FFmpeg processes...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="mb-1 break-words">
                <span className="text-slate-600 select-none mr-2">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}]
                </span>
                <span className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
