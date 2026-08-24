import { useState, useEffect, useCallback } from 'react';
import {
  Header,
  PayloadSelector,
  FileUpload,
  ExecuteButton,
  LogOutput,
  Instructions,
  Compatibility,
  Footer,
  ToastContainer,
} from './components';
import { useWebUSB } from './hooks/useWebUSB';
import type { PayloadType, PayloadManifest, PayloadSelection } from './types';

const PAYLOAD_PREFERENCE_KEY = 'webrcm-payload-preference';

interface PayloadPreference {
  type: Exclude<PayloadType, 'custom'>;
  version: string;
}

function loadPayloadPreference(): PayloadPreference | null {
  try {
    const stored = localStorage.getItem(PAYLOAD_PREFERENCE_KEY);
    if (!stored) return null;

    const preference = JSON.parse(stored) as Partial<PayloadPreference>;
    if (
      (preference.type === 'hekate' || preference.type === 'fusee') &&
      typeof preference.version === 'string'
    ) {
      return preference as PayloadPreference;
    }
  } catch {
    // Local storage can be unavailable in privacy-focused browser modes.
  }

  return null;
}

function App() {
  // Manifest state
  const [manifest, setManifest] = useState<PayloadManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);

  // Selection state
  const [selectedType, setSelectedType] = useState<PayloadType>('hekate');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [customFile, setCustomFile] = useState<File | null>(null);

  // WebUSB hook
  const { logs, state, isSupported, execute, clearLogs } = useWebUSB();

  // Load manifest on mount
  useEffect(() => {
    fetch('./payloads/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load manifest');
        return res.json();
      })
      .then((data: PayloadManifest) => {
        setManifest(data);

        const preference = loadPayloadPreference();
        if (preference) {
          const payload = data[preference.type];
          const versionExists = payload.versions.some(
            (version) => version.version === preference.version
          );

          setSelectedType(preference.type);
          setSelectedVersion(versionExists ? preference.version : payload.latest);
        } else {
          setSelectedVersion(data.hekate.latest);
        }
      })
      .catch((err) => {
        setManifestError(err.message);
      });
  }, []);

  // Remember the last built-in payload and version. Browsers cannot restore custom files.
  useEffect(() => {
    if (!manifest || selectedType === 'custom' || !selectedVersion) return;

    try {
      localStorage.setItem(
        PAYLOAD_PREFERENCE_KEY,
        JSON.stringify({ type: selectedType, version: selectedVersion })
      );
    } catch {
      // Launching still works when local storage is unavailable.
    }
  }, [manifest, selectedType, selectedVersion]);

  // Update version when type changes
  const handleTypeChange = useCallback(
    (type: PayloadType) => {
      setSelectedType(type);
      if (manifest && type !== 'custom') {
        setSelectedVersion(manifest[type].latest);
      }
    },
    [manifest]
  );

  // Handle custom file selection
  const handleFileChange = useCallback((file: File | null) => {
    setCustomFile(file);
    if (file) {
      setSelectedType('custom');
    }
  }, []);

  // Execute payload
  const handleExecute = useCallback(() => {
    if (!manifest && selectedType !== 'custom') {
      return;
    }

    const selection: PayloadSelection = {
      type: selectedType,
      version: selectedVersion,
      file: customFile || undefined,
    };

    execute(selection, manifest!);
  }, [manifest, selectedType, selectedVersion, customFile, execute]);

  // Check if execute should be disabled
  const isExecuteDisabled =
    !isSupported ||
    (selectedType === 'custom' && !customFile) ||
    (selectedType !== 'custom' && !manifest);

  const isLoading = state === 'connecting' || state === 'sending' || state === 'triggering';

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <ToastContainer logs={logs} />
      
      <main className="flex-1 container mx-auto max-w-2xl px-3 py-5 sm:px-4 sm:py-8">
        <Header />

        {/* Error loading manifest */}
        {manifestError && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Failed to load payload manifest: {manifestError}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="card mb-4 bg-base-200 shadow-xl sm:mb-6">
          <div className="card-body p-3 sm:p-6">
            <PayloadSelector
              manifest={manifest}
              selectedType={selectedType}
              selectedVersion={selectedVersion}
              onTypeChange={handleTypeChange}
              onVersionChange={setSelectedVersion}
              disabled={isLoading}
            />

            <FileUpload
              file={customFile}
              onFileChange={handleFileChange}
              disabled={isLoading}
              visible={selectedType === 'custom'}
            />

            <div className="divider my-2 sm:my-4"></div>

            <ExecuteButton
              state={state}
              onClick={handleExecute}
              disabled={isExecuteDisabled}
            />

            <LogOutput logs={logs} onClear={clearLogs} />
          </div>
        </div>

        {/* Info Sections */}
        <div className="space-y-3 sm:space-y-4">
          <Instructions />
          <Compatibility isSupported={isSupported} />
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default App;
