# Renomiq Renamer (Next.js + Tauri)

Desktop file/folder batch renamer built with **Next.js (App Router)**, **Tauri v1**, **TypeScript**, **TailwindCSS**, and **shadcn/ui**.

## Features

- **Batch Rename**: Rename multiple files at once with powerful rules
- **Search & Replace**: Find and replace text in filenames
- **Prefix & Suffix**: Add text before or after filenames
- **Numbering**: Add sequential numbers with configurable width
- **Preview**: See changes before applying them
- **Conflict Detection**: Automatically detects and prevents naming conflicts
- **Drag & Drop**: Drag folders directly onto the app window
- **Theme Support**: Light, Dark, and System themes
- **Multi-language**: English and Persian (فارسی) with RTL support
- **Custom Icons**: Beautiful app icons for all platforms

## Requirements

- Node.js + pnpm
- Rust toolchain (for Tauri)

## Install

```bash
pnpm install
```

## Development (Tauri + Next.js)

Runs Next.js dev server on port 3000 and attaches it to a Tauri window.

```bash
pnpm tauri dev
```

For web-only development (without Tauri):

```bash
pnpm dev
```

## Build

Build static Next.js assets and a Tauri desktop bundle.

```bash
pnpm tauri build
```

## Project Structure

- `app/` - Next.js App Router UI
- `components/` - Reusable UI components
- `lib/` - Utility functions and business logic
- `context/` - React context providers (theme, language)
- `src-tauri/` - Tauri (Rust) backend and configuration
- `plans/` - Implementation plans and documentation

The Next.js app is exported to `out/` (see `next.config.ts`) and loaded by Tauri via `src-tauri/tauri.conf.json`.

## Usage

1. **Select a Folder**: Click "Browse Folder" or drag a folder onto the app
2. **Configure Rules**: Set search/replace, prefix, suffix, and numbering options
3. **Preview**: Review the changes in the preview panel
4. **Apply**: Click "Apply Changes" to rename the files

## Customization

### Themes

Switch between Light, Dark, and System themes using the theme toggle in the top-right corner.

### Languages

Switch between English and Persian (فارسی) using the language toggle. The app automatically adjusts:

- Text direction (LTR/RTL)
- Font family (Inter for English, IRAN YEKAN X for Persian)

### Icons

Custom app icons are included for all platforms:

- macOS: `.icns` format with all required sizes
- Windows: `.ico` format with multiple sizes
- Linux: PNG icons in various sizes

## Documentation

- [`plans/implementation-plan.md`](plans/implementation-plan.md) - Detailed implementation plan
- [`plans/feature-review.md`](plans/feature-review.md) - Feature analysis and future enhancements
- [`plans/implementation-summary.md`](plans/implementation-summary.md) - Implementation summary

## License

Private project - All rights reserved.
