# ZYNREST - Premium Image Gallery PWA + Native Apps

ZYNREST is a Pinterest-style image gallery built with HTML, CSS, JavaScript, PWA, and Capacitor for cross-platform deployment.

## 🚀 Quick Start

### Web (PWA)
```bash
npm start
# Open http://localhost:8000
```

### Android
```bash
npm run cap:build:android
# Opens Android Studio
# Click Build → Build Bundle/APK
```

### iOS (macOS only)
```bash
npm run cap:build:ios
# Opens Xcode
# Select target device and click Play/Run
```

### Electron (Desktop - Windows/Mac/Linux)
```bash
npm run cap:build:electron
# Opens Electron dev environment
```

## 📁 Project Structure

```
ZYNREST/
├── www/                    # Web assets (served to all platforms)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── manifest.json
│   ├── service-worker.js
│   └── icon.svg
├── android/               # Android Studio project
├── ios/                   # Xcode project
├── electron/             # Electron app
├── capacitor.config.json  # Capacitor config
└── package.json
```

## 🔄 Workflow

1. **Develop locally** → `npm start` → Test at `http://localhost:8000`
2. **Update code** → Edit files in `www/`
3. **Sync to apps** → `npm run cap:sync`
4. **Build apps** → `npm run cap:build:android` or `npm run cap:build:ios`
5. **Deploy** → Follow each platform's app store guidelines

## 📱 Features

- ✅ Real-time image search via Unsplash API
- ✅ Browse & preview gallery in masonry layout
- ✅ Download images locally
- ✅ PWA install support
- ✅ Offline fallback
- ✅ Premium gradient UI

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Run web server locally |
| `npm run cap:sync` | Sync web assets to all platforms |
| `npm run cap:open:android` | Open Android project |
| `npm run cap:open:ios` | Open iOS project |
| `npm run cap:open:electron` | Open Electron project |
| `npm run cap:build:android` | Full Android build workflow |
| `npm run cap:build:ios` | Full iOS build workflow |
| `npm run cap:build:electron` | Full Electron build workflow |

## 🔑 Important Notes

- All platforms use the same `www/` folder source
- Changes to `www/` require `npm run cap:sync` before rebuilding
- Android requires Android Studio and SDK
- iOS requires macOS with Xcode
- Electron works on all systems

## 📦 Building for Distribution

### Android APK
1. `npm run cap:build:android`
2. In Android Studio: Build → Build Bundle/APK
3. Sign and upload to Google Play Store

### iOS App
1. `npm run cap:build:ios`
2. In Xcode: Product → Archive
3. Create App Store Connect entry and submit

### Electron Executable
1. `npm run cap:build:electron`
2. Package with: `npm run build` in electron folder
3. Creates .exe (Windows), .dmg (Mac), .AppImage (Linux)

## 🎨 Customization

- **Icons**: Replace `www/icon.svg`
- **Colors**: Edit `:root` variables in `www/styles.css`
- **Data**: Modify `images[]` array in `www/app.js`
- **Title**: Update `manifest.json` and `www/index.html`

## 📞 Support

Capacitor Docs: https://capacitorjs.com/docs/
