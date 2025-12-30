
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LiveTerminalProps {
  logs: LogEntry[];
}

const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col h-[400px]">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <span className="text-xs font-medium text-zinc-500 ml-2 uppercase tracking-widest">Live Execution Logs</span>
        </div>
        <div className="text-[10px] text-zinc-600 terminal-font">WS_CONNECTED :: 127.0.0.1:8000</div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 terminal-font text-sm space-y-1"
      >
        {logs.map((log) => (
          <div key={log.id} className="group flex gap-3">
            <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`shrink-0 font-bold ${
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warning' ? 'text-yellow-400' :
              log.level === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {log.plugin.toUpperCase()}
            </span>
            <span className="text-zinc-300 group-hover:text-white transition-colors">
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-zinc-600 animate-pulse">Waiting for scan initialization...</div>
        )}
      </div>
    </div>
  );
};

export default LiveTerminal;
