# Renomiq Build Guide

This guide covers building Renomiq for all supported platforms: macOS, Windows, Linux, iOS, and Android.

## 📋 Prerequisites

### All Platforms

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Rust](https://rustup.rs/) 1.70+

### Platform-Specific Requirements

#### macOS Development

- macOS 10.13 or later
- Xcode Command Line Tools: `xcode-select --install`

#### iOS Development (macOS only)

- Full [Xcode](https://apps.apple.com/us/app/xcode/id497799835) from App Store
- iOS 13.0+ deployment target

#### Android Development

- [Android Studio](https://developer.android.com/studio)
- Android SDK (API 24+)
- Set `ANDROID_HOME` environment variable

#### Windows Development

- Windows 10/11
- Microsoft Visual C++ Build Tools

#### Linux Development

- Linux distribution with GTK development libraries
- `libwebkit2gtk-4.0-dev` and related packages

---

## 🚀 Quick Start

### Option 1: Using the Build Script

```bash
# Make the script executable (first time only)
chmod +x scripts/build-all.sh

# Build for current platform (macOS only)
./scripts/build-all.sh

# Build for specific platforms
./scripts/build-all.sh macos
./scripts/build-all.sh ios
./scripts/build-all.sh android
./scripts/build-all.sh windows
./scripts/build-all.sh linux

# Build for all platforms (requires proper setup on each)
./scripts/build-all.sh all
```

### Option 2: Using pnpm Scripts

```bash
# Install dependencies
pnpm install

# Development mode
pnpm tauri:dev

# Build all targets for current platform
pnpm tauri:build
```

---

## 🍎 macOS Build

### Build Commands

```bash
# Build universal binary (Intel + Apple Silicon)
pnpm run tauri:build:mac

# Build only DMG
pnpm run tauri:build:mac-dmg

# Build only .app bundle
pnpm run tauri:build:mac-app
```

### Output Locations

- **DMG**: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/Renomiq Renamer_0.1.0_universal.dmg`
- **APP**: `src-tauri/target/universal-apple-darwin/release/bundle/macos/Renomiq Renamer.app`

### Code Signing (Optional)

To sign your macOS app for distribution:

1. Get an Apple Developer account
2. Create a signing certificate in Xcode
3. Update `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

---

## 📱 iOS Build

### Prerequisites

- Full Xcode installation (not just Command Line Tools)
- Valid Apple Developer account (for device testing)

### Build Commands

```bash
# Initialize iOS project (first time only)
pnpm run mobile:init:ios

# Development build
pnpm run mobile:dev:ios

# Release build
pnpm run mobile:build:ios
```

### Output Location

- **IPA**: `src-tauri/gen/apple/build/`

### Device Testing

1. Connect your iOS device
2. Open `src-tauri/gen/apple/Renomiq.xcodeproj` in Xcode
3. Select your device and click Run

---

## 🤖 Android Build

### Prerequisites

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK through SDK Manager
3. Set environment variables:

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Build Commands

```bash
# Initialize Android project (first time only)
pnpm run mobile:init:android

# Development build
pnpm run mobile:dev:android

# Release build
pnpm run mobile:build:android
```

### Output Location

- **APK/AAB**: `src-tauri/gen/android/app/build/outputs/`

---

## 🪟 Windows Build

### On Windows

```bash
# Build with MSI installer
pnpm run tauri:build:win-msi

# Build with NSIS installer
pnpm run tauri:build:win-nsis

# Build all Windows targets
pnpm run tauri:build:win
```

### Output Location

- **MSI/NSIS**: `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/`

### Cross-Compilation from macOS/Linux

```bash
# Install cargo-xwin
cargo install cargo-xwin

# Build for Windows
cd src-tauri
cargo xwin build --target x86_64-pc-windows-msvc --release
```

---

## 🐧 Linux Build

### On Linux

```bash
# Build AppImage
pnpm run tauri:build:linux-appimage

# Build Debian package
pnpm run tauri:build:linux-deb

# Build all Linux targets
pnpm run tauri:build:linux
```

### Required Packages (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Output Location

- **AppImage/DEB/RPM**: `src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/`

---

## 📦 Available Build Scripts

| Script                            | Description                            |
| --------------------------------- | -------------------------------------- |
| `pnpm tauri:build`                | Build all targets for current platform |
| `pnpm tauri:build:mac`            | Build macOS universal binary           |
| `pnpm tauri:build:mac-dmg`        | Build macOS DMG only                   |
| `pnpm tauri:build:mac-app`        | Build macOS .app only                  |
| `pnpm tauri:build:win`            | Build Windows installer                |
| `pnpm tauri:build:win-msi`        | Build Windows MSI only                 |
| `pnpm tauri:build:win-nsis`       | Build Windows NSIS only                |
| `pnpm tauri:build:linux`          | Build Linux packages                   |
| `pnpm tauri:build:linux-appimage` | Build Linux AppImage only              |
| `pnpm tauri:build:linux-deb`      | Build Linux DEB only                   |
| `pnpm tauri:build:all`            | Build all configured targets           |
| `pnpm mobile:init:ios`            | Initialize iOS project                 |
| `pnpm mobile:init:android`        | Initialize Android project             |
| `pnpm mobile:build:ios`           | Build iOS app                          |
| `pnpm mobile:build:android`       | Build Android app                      |

---

## 🔧 Configuration

### Tauri Configuration

Edit `src-tauri/tauri.conf.json` to customize:

- App metadata (name, version, description)
- Window settings (size, min/max dimensions)
- Bundle formats
- Code signing settings
- Security policies

### Environment Variables

| Variable                             | Description                    |
| ------------------------------------ | ------------------------------ |
| `STATIC_EXPORT=true`                 | Enable static export for Tauri |
| `ANDROID_HOME`                       | Android SDK location           |
| `TAURI_SIGNING_PRIVATE_KEY`          | Private key for updater        |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password for signing key       |

---

## 🌐 Automated Builds (GitHub Actions)

Create `.github/workflows/build.yml`:

```yaml
name: Build
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: dtolnay/rust-action@stable
      - run: pnpm install
      - run: pnpm tauri:build
      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/
```

---

## ❓ Troubleshooting

### macOS: "App is damaged and can't be opened"

Run: `xattr -cr "Renomiq Renamer.app"`

### iOS: "Could not find device"

Make sure your device is connected and trusted.

### Android: "SDK not found"

Set `ANDROID_HOME` environment variable.

### Windows: "MSVC not found"

Install Visual Studio Build Tools with C++ workload.

### Linux: "webkit2gtk not found"

Install development packages: `sudo apt install libwebkit2gtk-4.0-dev`

---

## 📚 Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tauri Mobile](https://tauri.app/blog/2022/12/09/tauri-mobile-alpha/)
- [Apple Developer](https://developer.apple.com/)
- [Android Developer](https://developer.android.com/)
