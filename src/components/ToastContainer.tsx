import { useState, useRef, useCallback, useEffect } from 'react';
import type { LogEntry } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ToastContainerProps {
  logs: LogEntry[];
}

export function ToastContainer({ logs }: ToastContainerProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const processedLogsRef = useRef<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Process new logs and create toasts for success/error messages
  // Using a ref to track processed logs to avoid duplicate toasts
  useEffect(() => {
    logs.forEach((log) => {
      if (processedLogsRef.current.has(log.id)) return;
      
      if (log.type === 'success' || log.type === 'error') {
        processedLogsRef.current.add(log.id);
        
        const toast: Toast = {
          id: log.id,
          message: log.message,
          type: log.type,
        };

        // Use a microtask to batch state updates
        queueMicrotask(() => {
          setToasts((prev) => {
            // Prevent duplicates
            if (prev.some((t) => t.id === toast.id)) return prev;
            return [...prev, toast];
          });
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          removeToast(toast.id);
        }, 5000);
      }
    });
  }, [logs, removeToast]);

  if (toasts.length === 0) return null;

  const getAlertClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="toast toast-top toast-end z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${getAlertClass(toast.type)} shadow-lg w-72 py-2 px-3`}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            className="btn btn-ghost btn-xs btn-square ml-2"
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
