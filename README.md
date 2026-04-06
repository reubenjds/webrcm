# WebRCM

A modern web-based Fusee Gelée exploit tool for Nintendo Switch using WebUSB.

**Live Site:** https://reubenjds.github.io/webrcm/

If you like this project, please consider giving it a ⭐ on GitHub!

## About

WebRCM allows you to send payloads (like Hekate or Fusee/Atmosphere) to a Nintendo Switch in RCM mode directly from your browser - no software installation required.

This project is a modernized rewrite of previous web-based RCM tools. I created it because I wanted:

- **Up-to-date payload releases** - Automated daily checks for new Hekate and Fusee releases via GitHub Actions
- **A payload version library** - Keep the latest several versions available, so you can choose exactly which version to inject

## Compatibility

### Supported Platforms

- Linux
- macOS
- Android (unrooted)
- ChromeOS

### Supported Browsers

- Chrome
- Edge
- Opera
- Samsung Internet

### Not Supported

- **Windows** - WebUSB cannot access the Switch due to driver limitations
- Safari, Firefox - No WebUSB support

> **Windows users:** Use [TegraRcmGUI](https://github.com/eliboa/TegraRcmGUI) instead.

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build
```

## Credits

This project builds upon the work of others who came before:

- [webrcm](https://github.com/webrcm/webrcm.github.io) - Original WebRCM project
- [web-fusee-launcher](https://github.com/atlas44/web-fusee-launcher) - Web-based Fusee launcher by atlas44

## License

MIT License - Use at your own risk.
