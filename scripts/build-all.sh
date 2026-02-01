#!/bin/zsh

# Renomiq Build Script
# Builds for all supported platforms

set -e

echo "🚀 Renomiq Multi-Platform Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo "${RED}[ERROR]${NC} $1"
}

# Check if we're on macOS (for universal builds)
IS_MACOS=false
if [[ "$OSTYPE" == "darwin"* ]]; then
  IS_MACOS=true
fi

# Parse command line arguments
BUILD_MACOS=false
BUILD_IOS=false
BUILD_ANDROID=false
BUILD_WINDOWS=false
BUILD_LINUX=false
BUILD_ALL=false

if [ $# -eq 0 ]; then
  print_warning "No platform specified. Building for current platform only."
  print_status "Usage: ./scripts/build-all.sh [macos|ios|android|windows|linux|all]"
  echo ""
fi

# Parse arguments
for arg in "$@"; do
  case $arg in
  macos)
    BUILD_MACOS=true
    ;;
  ios)
    BUILD_IOS=true
    ;;
  android)
    BUILD_ANDROID=true
    ;;
  windows)
    BUILD_WINDOWS=true
    ;;
  linux)
    BUILD_LINUX=true
    ;;
  all)
    BUILD_ALL=true
    ;;
  *)
    print_error "Unknown platform: $arg"
    echo "Supported platforms: macos, ios, android, windows, linux, all"
    exit 1
    ;;
  esac
done

# If 'all' is specified, enable all platforms
if [ "$BUILD_ALL" = true ]; then
  BUILD_MACOS=true
  BUILD_IOS=true
  BUILD_ANDROID=true
  BUILD_WINDOWS=true
  BUILD_LINUX=true
fi

# If no specific platform and we're on macOS, build macOS
if [ $# -eq 0 ] && [ "$IS_MACOS" = true ]; then
  BUILD_MACOS=true
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
print_success "Dependencies installed"
echo ""

# Build macOS
if [ "$BUILD_MACOS" = true ]; then
  if [ "$IS_MACOS" = true ]; then
    echo "🍎 Building macOS (Universal Binary - Intel + Apple Silicon)..."
    pnpm run tauri:build:mac
    print_success "macOS build complete!"
    echo ""
    echo "Output locations:"
    echo "  DMG: src-tauri/target/universal-apple-darwin/release/bundle/dmg/"
    echo "  APP: src-tauri/target/universal-apple-darwin/release/bundle/macos/"
    echo ""
  else
    print_error "macOS builds must be done on a macOS machine"
    print_warning "To cross-compile, install osxcross toolchain"
  fi
fi

# Build iOS
if [ "$BUILD_IOS" = true ]; then
  if [ "$IS_MACOS" = true ]; then
    if command -v xcodebuild &>/dev/null; then
      echo "📱 Building iOS..."

      # Check if mobile project is initialized
      if [ ! -d "src-tauri/gen/apple" ]; then
        print_status "Initializing iOS project..."
        pnpm run mobile:init:ios
      fi

      pnpm run mobile:build:ios
      print_success "iOS build complete!"
      echo ""
      echo "Output location: src-tauri/gen/apple/build/"
      echo ""
    else
      print_error "Xcode is required for iOS builds"
      print_status "Install Xcode from the App Store"
      print_status "Then run: xcode-select --install"
    fi
  else
    print_error "iOS builds must be done on a macOS machine"
  fi
fi

# Build Android
if [ "$BUILD_ANDROID" = true ]; then
  if [ -n "$ANDROID_HOME" ] || [ -d "$HOME/Library/Android/sdk" ]; then
    echo "🤖 Building Android..."

    # Check if mobile project is initialized
    if [ ! -d "src-tauri/gen/android" ]; then
      print_status "Initializing Android project..."
      pnpm run mobile:init:android
    fi

    pnpm run mobile:build:android
    print_success "Android build complete!"
    echo ""
    echo "Output location: src-tauri/gen/android/app/build/outputs/"
    echo ""
  else
    print_error "Android SDK not found"
    print_status "Install Android Studio from https://developer.android.com/studio"
    print_status "Set ANDROID_HOME environment variable"
  fi
fi

# Build Windows
if [ "$BUILD_WINDOWS" = true ]; then
  if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Building Windows..."
    pnpm run tauri:build:win
    print_success "Windows build complete!"
    echo ""
    echo "Output location: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/"
    echo ""
  else
    print_warning "Cross-compiling for Windows from macOS/Linux..."
    print_status "Attempting to build with cargo-xwin..."

    # Check if cargo-xwin is installed
    if command -v cargo-xwin &>/dev/null; then
      cd src-tauri
      cargo xwin build --target x86_64-pc-windows-msvc --release
      cd ..
      print_success "Windows build complete!"
    else
      print_error "Cross-compilation tools not installed"
      print_status "Install cargo-xwin: cargo install cargo-xwin"
      print_status "Or build on a Windows machine"
    fi
  fi
fi

# Build Linux
if [ "$BUILD_LINUX" = true ]; then
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Building Linux..."
    pnpm run tauri:build:linux
    print_success "Linux build complete!"
    echo ""
    echo "Output location: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/"
    echo ""
  else
    print_warning "Cross-compiling for Linux from macOS/Windows..."
    print_status "Consider using Docker or a Linux VM"
    print_status "Or use GitHub Actions for automated Linux builds"
  fi
fi

echo ""
echo "======================================"
print_success "Build process completed!"
echo ""
echo "📋 Summary of Build Outputs:"
echo ""

if [ "$BUILD_MACOS" = true ] && [ "$IS_MACOS" = true ]; then
  echo "macOS:"
  echo "  - DMG: src-tauri/target/universal-apple-darwin/release/bundle/dmg/"
  echo "  - APP: src-tauri/target/universal-apple-darwin/release/bundle/macos/"
  echo ""
fi

if [ "$BUILD_IOS" = true ] && [ "$IS_MACOS" = true ]; then
  echo "iOS:"
  echo "  - IPA: src-tauri/gen/apple/build/"
  echo ""
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "Android:"
  echo "  - APK/AAB: src-tauri/gen/android/app/build/outputs/"
  echo ""
fi

if [ "$BUILD_WINDOWS" = true ]; then
  echo "Windows:"
  echo "  - MSI/NSIS: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/"
  echo ""
fi

if [ "$BUILD_LINUX" = true ]; then
  echo "Linux:"
  echo "  - AppImage/DEB/RPM: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/"
  echo ""
fi

echo "🎉 Happy distributing!"
