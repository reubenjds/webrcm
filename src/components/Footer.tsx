export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-4 text-center text-sm text-base-content/60">
      <div className="divider"></div>
      
      <p className="mb-2">
        Fusee Gelee exploit ported to JavaScript using WebUSB
      </p>
      
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4">
        <a
          href="https://github.com/reubenjds/webrcm"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          Source Code
        </a>
        <a
          href="https://github.com/CTCaer/hekate"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          Hekate
        </a>
        <a
          href="https://github.com/Atmosphere-NX/Atmosphere"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          Atmosphere
        </a>
        <a
          href="https://github.com/reswitched/fusee-launcher"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          Fusee Launcher
        </a>
      </div>
      
      <p className="text-xs">
        Credits:{' '}
        <a
          href="https://github.com/atlas44/web-fusee-launcher"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          atlas44
        </a>
        {' '}&bull;{' '}
        <a
          href="https://github.com/CletusOnTop"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          CletusOnTop
        </a>
        {' '}&bull;{' '}
        ktemkin &bull; ReSwitched
      </p>
      
      <p className="text-xs mt-2">
        MIT License &bull; Use at your own risk
      </p>
    </footer>
  );
}
