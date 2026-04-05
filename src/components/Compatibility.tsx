interface CompatibilityProps {
  isSupported: boolean;
}

export function Compatibility({ isSupported }: CompatibilityProps) {
  return (
    <div className="space-y-3">
      {/* WebUSB Support Alert */}
      {!isSupported && (
        <div className="alert alert-error">
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
          <div>
            <h3 className="font-bold">WebUSB Not Supported</h3>
            <div className="text-sm">
              Your browser doesn't support WebUSB. Please use Chrome, Edge, or Opera.
            </div>
          </div>
        </div>
      )}

      {/* Platform Warning */}
      <div className="collapse collapse-arrow bg-base-200 rounded-lg">
        <input type="checkbox" />
        <div className="collapse-title font-medium">
          Platform Compatibility
        </div>
        <div className="collapse-content text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-success badge-sm">Supported</span>
              <span>Linux, macOS, Android (unrooted), ChromeOS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-error badge-sm">Not Supported</span>
              <span>Windows (WebUSB limitation)</span>
            </div>
            <div className="divider my-2"></div>
            <p className="text-base-content/70">
              <strong>Windows users:</strong> Use{' '}
              <a
                href="https://switchtools.sshnuke.net"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                TegraRcmSmash
              </a>{' '}
              or{' '}
              <a
                href="https://github.com/eliboa/TegraRcmGUI"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                TegraRcmGUI
              </a>{' '}
              instead.
            </p>
            <div className="divider my-2"></div>
            <p className="text-base-content/70">
              <strong>Linux users:</strong> If you get an access denied error, create{' '}
              <code className="bg-base-300 px-1 rounded">/etc/udev/rules.d/50-switch.rules</code>{' '}
              with:
            </p>
            <pre className="bg-base-300 p-2 rounded text-xs overflow-x-auto">
              SUBSYSTEM=="usb", ATTR{'{idVendor}'}=="0955", MODE="0664", GROUP="plugdev"
            </pre>
          </div>
        </div>
      </div>

      {/* Browser Support */}
      <div className="collapse collapse-arrow bg-base-200 rounded-lg">
        <input type="checkbox" />
        <div className="collapse-title font-medium">
          Browser Support
        </div>
        <div className="collapse-content text-sm">
          <p className="text-base-content/70 mb-2">
            WebUSB is supported in the following browsers:
          </p>
          <ul className="list-disc list-inside space-y-1 text-base-content/70">
            <li>Google Chrome (desktop & Android)</li>
            <li>Microsoft Edge (Chromium-based)</li>
            <li>Opera</li>
            <li>Samsung Internet</li>
            <li>Chromium-based browsers</li>
          </ul>
          <p className="mt-2 text-base-content/70">
            <strong>Not supported:</strong> Firefox, Safari, iOS browsers
          </p>
        </div>
      </div>
    </div>
  );
}
