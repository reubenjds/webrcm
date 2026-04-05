import type { PayloadType, PayloadManifest } from '../types';

interface PayloadSelectorProps {
  manifest: PayloadManifest | null;
  selectedType: PayloadType;
  selectedVersion: string;
  onTypeChange: (type: PayloadType) => void;
  onVersionChange: (version: string) => void;
  disabled?: boolean;
}

export function PayloadSelector({
  manifest,
  selectedType,
  selectedVersion,
  onTypeChange,
  onVersionChange,
  disabled = false,
}: PayloadSelectorProps) {
  const payloadOptions: { type: PayloadType; label: string; description: string }[] = [
    {
      type: 'hekate',
      label: 'Hekate',
      description: 'CTCaer bootloader - recommended for most users',
    },
    {
      type: 'fusee',
      label: 'Atmosphere',
      description: 'Fusee payload for Atmosphere CFW',
    },
    {
      type: 'custom',
      label: 'Custom',
      description: 'Upload your own .bin payload file',
    },
  ];

  const getVersions = (type: PayloadType) => {
    if (!manifest || type === 'custom') return [];
    return manifest[type].versions;
  };

  const versions = getVersions(selectedType);

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-base font-medium">Select Payload</span>
      </label>
      
      <div className="space-y-3">
        {payloadOptions.map((option) => (
          <label
            key={option.type}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedType === option.type
                ? 'border-primary bg-primary/10'
                : 'border-base-300 hover:border-base-content/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="payload"
              className="radio radio-primary mt-1"
              checked={selectedType === option.type}
              onChange={() => onTypeChange(option.type)}
              disabled={disabled}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{option.label}</span>
                {option.type !== 'custom' && manifest && (
                  <span className="badge badge-sm badge-ghost">
                    Latest: v{manifest[option.type].latest}
                  </span>
                )}
              </div>
              <p className="text-sm text-base-content/60 mt-1">
                {option.description}
              </p>
              
              {/* Version selector for non-custom payloads */}
              {option.type !== 'custom' && selectedType === option.type && versions.length > 0 && (
                <div className="mt-3">
                  <select
                    className="select select-bordered select-sm w-full max-w-xs"
                    value={selectedVersion}
                    onChange={(e) => onVersionChange(e.target.value)}
                    disabled={disabled}
                  >
                    {versions.map((v) => (
                      <option key={v.version} value={v.version}>
                        v{v.version} {option.type !== 'custom' && v.version === manifest?.[option.type as 'hekate' | 'fusee'].latest ? '(latest)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
