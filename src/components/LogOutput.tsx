import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface LogOutputProps {
  logs: LogEntry[];
  onClear?: () => void;
}

export function LogOutput({ logs, onClear }: LogOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-info';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="form-control w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="label py-0">
          <span className="label-text font-medium">Output</span>
        </label>
        {logs.length > 0 && onClear && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
      
      <div
        ref={containerRef}
        className="log-output bg-base-300 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm"
      >
        {logs.length === 0 ? (
          <span className="text-base-content/40">
            Output will appear here...
          </span>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-base-content/40 shrink-0">
                [{formatTime(log.timestamp)}]
              </span>
              <span className={getLogColor(log.type)}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
