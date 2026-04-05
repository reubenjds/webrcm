import { useState, useEffect, useCallback } from 'react';
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

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Watch for important log entries and show as toasts
  useEffect(() => {
    if (logs.length === 0) return;

    const lastLog = logs[logs.length - 1];
    
    // Only show toasts for success/error messages
    if (lastLog.type === 'success' || lastLog.type === 'error') {
      const toast: Toast = {
        id: lastLog.id,
        message: lastLog.message,
        type: lastLog.type,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeToast(toast.id);
      }, 5000);
    }
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
          className={`alert ${getAlertClass(toast.type)} shadow-lg max-w-sm`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => removeToast(toast.id)}
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
