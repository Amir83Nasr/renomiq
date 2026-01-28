# Renomiq App Cleanup & Bug Fix Plan

## Overview

This plan addresses the build error, sets up Prettier, removes unnecessary files, and cleans up the code structure for the Renomiq file renaming application.

## Issues Identified

### 1. Build Error (Critical)

**File:** [`src/services/tauri.ts:13`](src/services/tauri.ts:13)
**Problem:** Escaped quotes (`\"`) instead of regular quotes causing parsing failure
**Fix:** Replace `\"__TAURI_INTERNALS__\"` with `"__TAURI_INTERNALS__"` and `\"Tauri\"` with `"Tauri"`

### 2. Missing Prettier Configuration

**Problem:** No Prettier setup for consistent code formatting
**Solution:** Install and configure Prettier with appropriate settings

### 3. Unnecessary Files

**Files to delete:**

- [`components/component-example.tsx`](components/component-example.tsx) - Demo component not used in production
- [`components/example.tsx`](components/example.tsx) - Demo wrapper not used in production
- [`public/next.svg`](public/next.svg) - Default Next.js branding
- [`public/vercel.svg`](public/vercel.svg) - Default Vercel branding
- [`public/globe.svg`](public/globe.svg) - Default Next.js branding
- [`public/window.svg`](public/window.svg) - Default Next.js branding

**Files to keep:**

- [`public/file.svg`](public/file.svg) - Used by the app
- [`app/favicon.ico`](app/favicon.ico) - App icon

### 4. Code Structure Improvements

**Current state:** Generally well-organized, but can benefit from:

- Consistent formatting with Prettier
- Removing unused imports
- Ensuring all files follow the same style

## Detailed Action Plan

### Phase 1: Fix Build Error

1. Edit [`src/services/tauri.ts`](src/services/tauri.ts:13)
2. Replace escaped quotes with regular quotes on lines 13 and 15
3. Verify the file compiles correctly

### Phase 2: Set Up Prettier

1. Install Prettier as a dev dependency
2. Create `.prettierrc` configuration file with:
   - Single quotes
   - 2 space indentation
   - Trailing commas where valid
   - Semi-colons
   - Print width 100
3. Create `.prettierignore` file to exclude:
   - `node_modules/`
   - `.next/`
   - `dist/`
   - `build/`
   - `*.min.js`
   - `pnpm-lock.yaml`
4. Add format script to [`package.json`](package.json)

### Phase 3: Format All Files

Run Prettier on all TypeScript/TSX files:

- `app/` directory
- `components/` directory
- `lib/` directory
- `src/` directory
- `types/` directory
- Root config files

### Phase 4: Remove Unnecessary Files

Delete the following files:

1. [`components/component-example.tsx`](components/component-example.tsx)
2. [`components/example.tsx`](components/example.tsx)
3. [`public/next.svg`](public/next.svg)
4. [`public/vercel.svg`](public/vercel.svg)
5. [`public/globe.svg`](public/globe.svg)
6. [`public/window.svg`](public/window.svg)

### Phase 5: Code Structure Cleanup

1. Review all remaining files for:
   - Unused imports
   - Inconsistent naming
   - Dead code
2. Ensure all components follow the same patterns
3. Verify type definitions are properly organized

### Phase 6: Verification

1. Run `pnpm build` to ensure no build errors
2. Run `pnpm lint` to check for linting issues
3. Run `pnpm test` to ensure tests pass
4. Verify the app runs correctly with `pnpm dev`

## Project Structure After Cleanup

```
code/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ErrorBoundary.tsx
│   ├── FileSelector.tsx
│   ├── PreviewPanel.tsx
│   ├── RuleEditor.tsx
│   └── ui/ (shadcn components)
├── lib/
│   ├── rename-rules.test.ts
│   ├── rename-rules.ts
│   └── utils.ts
├── public/
│   └── file.svg
├── src/
│   └── services/
│       └── tauri.ts
├── src-tauri/ (Tauri backend)
├── types/
│   └── index.ts
├── .prettierrc (new)
├── .prettierignore (new)
└── package.json (updated)
```

## Expected Outcomes

✅ Build error resolved
✅ Consistent code formatting across all files
✅ Reduced bundle size by removing unused assets
✅ Cleaner, more maintainable codebase
✅ All tests passing
✅ Application builds and runs successfully

## Notes

- The ErrorBoundary component is actively used in [`app/layout.tsx`](app/layout.tsx:33) and should be kept
- The Tauri integration is essential for the desktop app functionality
- All shadcn UI components are used and should remain
- The test file [`lib/rename-rules.test.ts`](lib/rename-rules.test.ts) should be preserved
