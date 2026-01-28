# Renomiq Renamer (Next.js + Tauri)

Desktop file/folder batch renamer built with **Next.js (App Router)**, **Tauri v1**, **TypeScript**, **TailwindCSS**, and **shadcn/ui**.

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

## Build

Build static Next.js assets and a Tauri desktop bundle.

```bash
pnpm tauri build
```

## Project Structure

- `app/` - Next.js App Router UI
- `components/`, `lib/` - UI and feature modules
- `src-tauri/` - Tauri (Rust) backend and configuration

The Next.js app is exported to `out/` (see `next.config.ts`) and loaded by Tauri via `src-tauri/tauri.conf.json`.
