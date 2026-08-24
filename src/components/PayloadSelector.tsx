import type { PayloadType, PayloadManifest } from '../types';

const releaseDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

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
  const selectedRelease = versions.find((version) => version.version === selectedVersion);

  return (
    <div className="form-control w-full">
      <label className="label px-0 pb-2 pt-0">
        <span className="label-text text-base font-medium">Select Payload</span>
      </label>
      
      <div className="space-y-2.5 sm:space-y-3">
        {payloadOptions.map((option) => (
          <label
            key={option.type}
            className={`grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-1 rounded-lg border-2 p-3 transition-all sm:gap-x-3 sm:gap-y-0 sm:p-4 ${
              selectedType === option.type
                ? 'border-primary bg-primary/10'
                : 'border-base-300 hover:border-base-content/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="payload"
              className="radio radio-primary radio-sm mt-0.5 sm:radio-md sm:mt-1"
              checked={selectedType === option.type}
              onChange={() => onTypeChange(option.type)}
              disabled={disabled}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{option.label}</span>
                {option.type !== 'custom' && manifest && (
                  <span className="badge badge-sm badge-ghost">
                    Latest: v{manifest[option.type].latest}
                  </span>
                )}
              </div>
            </div>

            <p className="col-span-2 text-sm leading-snug text-base-content/60 sm:col-span-1 sm:col-start-2 sm:mt-1">
              {option.description}
            </p>

            {/* Version selector for non-custom payloads */}
            {option.type !== 'custom' && selectedType === option.type && versions.length > 0 && (
              <div className="col-span-2 mt-1.5 sm:col-span-1 sm:col-start-2 sm:mt-3">
                <select
                  className="select select-ghost select-sm card-border w-full max-w-xs rounded-box bg-base-100 shadow-sm transition-shadow focus:shadow-md"
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

                {selectedRelease && (
                  <div className="card card-sm card-border mt-2 bg-base-100 sm:mt-3">
                    <div className="card-body p-3 sm:p-4">
                      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="card-title text-sm">v{selectedRelease.version}</h4>
                            <span
                              className={`badge badge-sm badge-soft ${
                                selectedRelease.prerelease
                                  ? 'badge-warning'
                                  : 'badge-success'
                              }`}
                            >
                              {selectedRelease.prerelease ? 'Prerelease' : 'Stable'}
                            </span>
                          </div>
                          <time
                            dateTime={selectedRelease.date}
                            className="mt-1 block text-xs text-base-content/60"
                          >
                            Released {releaseDateFormatter.format(
                              new Date(`${selectedRelease.date}T00:00:00Z`)
                            )}
                          </time>
                        </div>

                        <a
                          href={selectedRelease.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-soft btn-primary btn-sm w-full sm:btn-ghost sm:btn-xs sm:w-auto hover:border-primary hover:bg-primary hover:text-primary-content focus-visible:border-primary focus-visible:bg-primary focus-visible:text-primary-content"
                        >
                          Release notes
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
