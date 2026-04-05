/**
 * useWebUSB Hook
 * React hook for managing WebUSB payload injection
 */

import { useState, useCallback, useRef } from 'react';
import type { LogEntry, ExecutionState, PayloadManifest, PayloadSelection } from '../types';
import { executePayload, isWebUSBSupported } from '../lib/rcmDevice';
import { fetchPayload, readFileAsArrayBuffer } from '../lib/payloadBuilder';

interface UseWebUSBReturn {
  logs: LogEntry[];
  state: ExecutionState;
  isSupported: boolean;
  execute: (selection: PayloadSelection, manifest: PayloadManifest) => Promise<void>;
  clearLogs: () => void;
}

/**
 * Generates a unique ID for log entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useWebUSB(): UseWebUSBReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [state, setState] = useState<ExecutionState>('idle');
  const isSupported = isWebUSBSupported();
  const abortRef = useRef(false);

  const addLog = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      const entry: LogEntry = {
        id: generateId(),
        message,
        type,
        timestamp: new Date(),
      };
      setLogs((prev) => [...prev, entry]);
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const execute = useCallback(
    async (selection: PayloadSelection, manifest: PayloadManifest) => {
      if (state !== 'idle') {
        return;
      }

      abortRef.current = false;
      clearLogs();
      setState('connecting');

      try {
        let payload: Uint8Array;

        // Load the payload based on selection type
        if (selection.type === 'custom') {
          if (!selection.file) {
            throw new Error('No file selected');
          }
          addLog(`Loading custom payload: ${selection.file.name}`, 'info');
          const buffer = await readFileAsArrayBuffer(selection.file);
          payload = new Uint8Array(buffer);
        } else {
          // Find the version info from manifest
          const payloadEntry = manifest[selection.type];
          const version = selection.version || payloadEntry.latest;
          const versionInfo = payloadEntry.versions.find((v) => v.version === version);

          if (!versionInfo) {
            throw new Error(`Version ${version} not found for ${selection.type}`);
          }

          const payloadPath = `./payloads/${selection.type}/${versionInfo.file}`;
          addLog(`Loading ${payloadEntry.name} v${version}...`, 'info');
          payload = await fetchPayload(payloadPath);
        }

        addLog(`Payload loaded (${payload.byteLength} bytes)`, 'success');

        // Execute the payload
        setState('sending');
        await executePayload(payload, (message, type) => {
          addLog(message, type);
          
          // Update state based on message content
          if (message.includes('Triggering')) {
            setState('triggering');
          }
        });

        setState('success');
        addLog('Done! Your Switch should now be running the payload.', 'success');
      } catch (error) {
        setState('error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        addLog(`Error: ${errorMessage}`, 'error');
      } finally {
        // Reset to idle after a short delay
        setTimeout(() => {
          setState('idle');
        }, 2000);
      }
    },
    [state, addLog, clearLogs]
  );

  return {
    logs,
    state,
    isSupported,
    execute,
    clearLogs,
  };
}
