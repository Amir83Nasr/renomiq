# Plan: File Rename Improvements

## Overview

This plan addresses three main improvements to the Renomiq application:

1. Remove extra text from file selection section
2. Rename "Simple Rename" tab to "File Rename" with file selection capabilities
3. Update Series Rename to handle folder-based renaming

## Current State Analysis

### Files to Modify

- `app/page.tsx` - Main page with tabs
- `lib/i18n/locales/fa.ts` - Persian translations
- `lib/i18n/locales/en.ts` - English translations
- `components/DropZone.tsx` - File/folder selection component
- `components/FileSelector.tsx` - Unused component to clean up
- `app/sections/SimpleRenamerSection.tsx` - File rename section (inline in page.tsx)

---

## Task 1: Remove Extra Text from File Selection

### Changes

1. Remove `components/FileSelector.tsx` (unused component)
2. Clean up any reference to FileSelector in other files

---

## Task 2: Rename Tab and Update File Rename Section

### Changes in `lib/i18n/locales/fa.ts`

```diff
- tab_simple: 'تغییر نام ساده'
+ tab_file: 'تغییر نام فایل'
- tab_series: 'تغییر نام سریال'
```

### Changes in `lib/i18n/locales/en.ts`

```diff
- tab_simple: 'Simple Rename'
+ tab_file: 'File Rename'
```

### Changes in `app/page.tsx`

- Update tab names from "simple" to "file"
- Update SimpleRenamerSection to support file selection with search/filter

### New Component: FileList with Search/Filter

Create `components/FileList.tsx` with:

- Search input to filter files by name
- File type filter (video, subtitle, audio, all)
- Checkbox for each file to select/deselect
- Select all / Deselect all buttons
- File count display

### Updated SimpleRenamerSection (to be renamed FileRenamerSection)

- Add search input field
- Add file type filter dropdown
- Add file list with checkboxes
- Filter files based on search query and type filter
- Only apply rename rules to selected files

---

## Task 3: Update Series Rename for Folder Support

### Current Behavior

- Currently works with folders but processes only video files and related subtitles/dubs

### Desired Behavior

- Accept a folder as input
- Process ALL files in the folder (not just video files)
- Apply rename rules to all files matching criteria

### Changes in `app/sections/SeriesRenamerSection.tsx`

1. Update DropZone to accept folder selection
2. Modify file processing to include all file types
3. Add option to filter by file extension in preview
4. Keep existing series renaming logic for video files
5. Add general rename rules for other files

---

## Implementation Steps

### Phase 1: Cleanup (Step 1)

- [ ] Delete `components/FileSelector.tsx`
- [ ] Verify no references to FileSelector exist

### Phase 2: Translations (Step 2)

- [ ] Update Persian translations
- [ ] Update English translations

### Phase 3: File Rename Tab Improvements (Step 3-5)

- [ ] Create `components/FileList.tsx` component
- [ ] Add search functionality
- [ ] Add file type filter
- [ ] Add checkbox selection
- [ ] Update `SimpleRenamerSection` to use FileList
- [ ] Update page.tsx tabs

### Phase 4: Series Rename Improvements (Step 6-7)

- [ ] Update SeriesRenamerSection to handle all file types
- [ ] Add file type filter options
- [ ] Update preview to show all files

### Phase 5: Testing (Step 8)

- [ ] Test file selection with search/filter
- [ ] Test folder selection for series rename
- [ ] Verify translations work correctly
- [ ] Test on both Tauri and browser environments

---

## UI Mockup: File Rename Section

```
┌─────────────────────────────────────────────────────┐
│  📁 پوشه فعال: /Users/amir/Documents/Series        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ 🔍 جستجو...                         [📁 همه]  ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ☐ [✓] episode01.mkv        (ویدیو)              │
│  ☐ [✓] episode01_fa.srt     (زیرنویس)             │
│  ☐ [ ] episode02.mkv        (ویدیو)              │
│  ☐ [ ] episode02_fa.srt     (زیرنویس)             │
│                                                     │
│  ۲ از ۴ فایل انتخاب شده                            │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ قوانین تغییر نام                                 ││
│  │ جستجو: [________________]                        ││
│  │ جایگزینی: [________________]                     ││
│  │ پیشوند: [________________]                       ││
│  │ پسوند: [________________]                        ││
│  │ [✓] شماره‌گذاری: [۲ رقم ▼]                      ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  [پیش‌نمایش]                    [اعمال تغییرات]    │
└─────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

### New Files

- `components/FileList.tsx` - File list with search/filter/selection

### Modified Files

- `app/page.tsx` - Update tabs
- `lib/i18n/locales/fa.ts` - Update translations
- `lib/i18n/locales/en.ts` - Update translations
- `components/FileSelector.tsx` - Delete

### Files Needing Major Updates

- `app/page.tsx` (SimpleRenamerSection inline component)
- `app/sections/SeriesRenamerSection.tsx`
