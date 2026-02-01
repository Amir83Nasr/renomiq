'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

import { DropZone } from '@/features/renamer/components/DropZone';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ConfirmRenameDialog } from '@/features/renamer/components/ConfirmRenameDialog';
import { FloatingActionButtons } from '@/components/layout/FloatingActionButtons';
import { UndoButton } from '@/features/renamer/components/UndoButton';

import { FileService } from '@/services/file-service';
import { UndoService } from '@/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';
import { CompactFileList } from '@/features/renamer/components/CompactFileList';
import { CollapsibleRuleEditor } from '@/features/renamer/components/CollapsibleRuleEditor';

import type { FileEntry, RenamePair } from '@/types';
import { applyRenameRules, buildPreview, extractEpisodeNumber } from '@/lib/utils/rename-rules';
import type { RenameRule } from '@/lib/utils/rename-rules';

function useRenamePreview(files: FileEntry[], rules: RenameRule[]) {
  return useMemo(() => buildPreview(files, rules), [files, rules]);
}

// Sort files naturally by episode number or name
function sortFilesNaturally(filesToSort: FileEntry[]): FileEntry[] {
  return [...filesToSort].sort((a, b) => {
    const epA = extractEpisodeNumber(a.name);
    const epB = extractEpisodeNumber(b.name);

    // If both have episode numbers, sort by episode number
    if (epA !== null && epB !== null) {
      return epA - epB;
    }

    // If only one has episode number, put it first
    if (epA !== null) return -1;
    if (epB !== null) return 1;

    // Otherwise, sort alphabetically (natural sort)
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}

// File Renamer Section Component with improved UX
function FileRenamerSection() {
  const t = useI18n();
  const [folder, setFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // File selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Rule state
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numbering, setNumbering] = useState(false);
  const [numberWidth, setNumberWidth] = useState(2);
  const [newName, setNewName] = useState('');
  const [keepExtension, setKeepExtension] = useState(true);

  // Series state
  const [seriesEnabled, setSeriesEnabled] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [includeSeason, setIncludeSeason] = useState(true);
  const [useExistingEpisodeNumbers, setUseExistingEpisodeNumbers] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [startEpisode, setStartEpisode] = useState(1);
  const [seasonPrefix, setSeasonPrefix] = useState<'S' | 'Season'>('S');
  const [episodePrefix, setEpisodePrefix] = useState<'E' | 'Episode'>('E');
  const [seasonNumberWidth, setSeasonNumberWidth] = useState<1 | 2 | 3>(2);
  const [episodeNumberWidth, setEpisodeNumberWidth] = useState<1 | 2 | 3>(2);

  // Generate preview for ALL files (not just selected) to maintain order consistency
  // The rename will only be applied to selected files
  const preview = useRenamePreview(
    files,
    applyRenameRules({
      search,
      replace,
      prefix,
      suffix,
      numbering,
      numberWidth,
      newName,
      keepExtension,
      series: {
        enabled: seriesEnabled,
        seriesName,
        includeSeason,
        useExistingEpisodeNumbers,
        seasonNumber,
        startEpisode,
        seasonPrefix,
        episodePrefix,
        seasonNumberWidth,
        episodeNumberWidth,
      },
    })
  );

  const handleFilesReceived = (receivedFiles: FileEntry[], sourcePath: string) => {
    const sortedFiles = sortFilesNaturally(receivedFiles);
    setFiles(sortedFiles);
    setFolder(sourcePath);
    // Select all files by default
    setSelectedFiles(new Set(sortedFiles.map((f) => f.path)));
  };

  // Handle file selection
  const handleSelectionChange = useCallback((path: string, selected: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedFiles(new Set(files.map((f) => f.path)));
      } else {
        setSelectedFiles(new Set());
      }
    },
    [files]
  );

  const handleSelectFiltered = useCallback((paths: string[], selected: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      paths.forEach((path) => {
        if (selected) {
          next.add(path);
        } else {
          next.delete(path);
        }
      });
      return next;
    });
  }, []);

  const handleInvertSelection = useCallback(() => {
    setSelectedFiles((prev) => {
      const next = new Set<string>();
      files.forEach((f) => {
        if (!prev.has(f.path)) {
          next.add(f.path);
        }
      });
      return next;
    });
  }, [files]);

  // Handle delete files from list
  const handleDeleteFiles = useCallback((pathsToDelete: string[]) => {
    setFiles((prevFiles) => {
      const newFiles = prevFiles.filter((f) => !pathsToDelete.includes(f.path));
      // If no files left, clear folder state
      if (newFiles.length === 0) {
        setFolder(null);
      }
      return newFiles;
    });
    setSelectedFiles((prev) => {
      const newSelected = new Set(prev);
      pathsToDelete.forEach((path) => newSelected.delete(path));
      return newSelected;
    });
  }, []);

  // Handle undo complete - refresh file list
  const handleUndoComplete = useCallback(async () => {
    // Refresh folder contents if a folder was selected
    if (folder && folder !== 'selected-files') {
      try {
        const entries = await FileService.listFiles(folder);
        const sortedEntries = sortFilesNaturally(entries);
        setFiles(sortedEntries);
        setSelectedFiles(new Set(sortedEntries.map((f) => f.path)));
      } catch {
        // Silent error handling
      }
    }
  }, [folder]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setFolder(null);
    setSelectedFiles(new Set());
    setSearch('');
    setReplace('');
    setPrefix('');
    setSuffix('');
    setNumbering(false);
    setNumberWidth(2);
    setNewName('');
    setKeepExtension(true);
  }, []);

  // Abort controller for canceling operations
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Check if running in Tauri environment
  const [isTauri, setIsTauri] = useState(false);

  // Store directory handle for browser mode
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  useEffect(() => {
    // Dynamic import to check Tauri environment
    import('@/services/tauri').then(({ isTauriEnvironment }) => {
      setIsTauri(isTauriEnvironment());
    });
  }, []);

  // Update dirHandle when folder changes in browser mode
  useEffect(() => {
    if (!isTauri && folder) {
      const handle = FileService.getLastDirHandle();
      setDirHandle(handle);
    }
  }, [folder, isTauri]);

  // Handle delete files from device
  const handleDeleteFromDevice = useCallback(
    async (pathsToDelete: string[]) => {
      if (pathsToDelete.length === 0) return;

      try {
        let result;
        if (isTauri) {
          const { TauriService } = await import('@/services/tauri');
          result = await TauriService.deleteFiles(pathsToDelete);
        } else if (dirHandle) {
          const { browserDeleteFiles } = await import('@/services/browser-file-service');
          const fileNames = pathsToDelete.map((path) => path.split('/').pop()!).filter(Boolean);
          result = await browserDeleteFiles(dirHandle, fileNames);
        } else {
          throw new Error('No directory access available');
        }

        if (result.success) {
          // Remove deleted files from the list
          setFiles((prevFiles) => {
            const newFiles = prevFiles.filter((f) => !pathsToDelete.includes(f.path));
            if (newFiles.length === 0) {
              setFolder(null);
            }
            return newFiles;
          });
          setSelectedFiles((prev) => {
            const newSelected = new Set(prev);
            pathsToDelete.forEach((path) => newSelected.delete(path));
            return newSelected;
          });
        }
      } catch (error) {
        console.error('Failed to delete files:', error);
        throw error;
      }
    },
    [isTauri, dirHandle]
  );

  const handleAbortOperation = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
    setShowConfirmDialog(false);
  }, [abortController]);

  async function handleApplyRename() {
    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    try {
      const pairs: RenamePair[] = preview
        .filter((p) => p.newName && p.newName !== p.oldName && !p.conflict)
        .map((p) => ({ from: p.path, to: p.newPath! }));

      if (pairs.length === 0) {
        setLoading(false);
        return;
      }

      let result;
      if (isTauri) {
        const { TauriService } = await import('@/services/tauri');
        result = await TauriService.applyRenames(pairs);
      } else if (dirHandle) {
        const { browserApplyRenames } = await import('@/services/browser-file-service');
        result = await browserApplyRenames(dirHandle, pairs);
      } else {
        setLoading(false);
        setShowConfirmDialog(false);
        return;
      }

      if (!result.success) {
        setLoading(false);
        return;
      }

      // Add to undo history
      const historyEntry = UndoService.createHistoryEntry(
        pairs,
        folder || '',
        `${t('folder_renamer.undo_description')} ${pairs.length} ${t('rule_editor.files_loaded')}`
      );
      UndoService.addToHistory(historyEntry);

      // Only refresh folder contents if a folder was selected (not individual files)
      if (folder && folder !== 'selected-files') {
        const entries = await FileService.listFiles(folder);
        const sortedEntries = sortFilesNaturally(entries);
        setFiles(sortedEntries);
        setSelectedFiles(new Set(sortedEntries.map((f) => f.path)));
      }
    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }

  // Handle confirm dialog
  const handleConfirmDialogOpen = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDialogClose = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmDialogConfirm = () => {
    setShowConfirmDialog(false);
    handleApplyRename();
  };

  // Get pairs for confirm dialog
  const getConfirmPairs = (): RenamePair[] => {
    return preview
      .filter((p) => p.newName && p.newName !== p.oldName && !p.conflict)
      .map((p) => ({ from: p.path, to: p.newPath! }));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-24 md:pb-0">
      <DropZone onFilesReceived={handleFilesReceived} />

      {folder && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1">
            {folder === 'selected-files' ? (
              `${t('dropzone.selected_files_count') || 'Selected files'}: ${files.length}`
            ) : (
              <>
                {t('home.active_folder')} <span className="font-mono">{folder}</span>
              </>
            )}
          </p>
          <button
            onClick={handleClearAll}
            className="text-xs text-destructive hover:text-destructive/80 hover:underline transition-colors"
          >
            {t('common.clear') || 'Clear'}
          </button>
        </div>
      )}

      {files.length > 0 && (
        <CompactFileList
          files={files}
          preview={preview}
          selectedFiles={selectedFiles}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onSelectFiltered={handleSelectFiltered}
          onDeleteFiles={handleDeleteFiles}
          onDeleteFromDevice={handleDeleteFromDevice}
        />
      )}

      {/* Undo Button - Shows when there's history */}
      <div className="flex justify-center">
        <UndoButton onUndoComplete={handleUndoComplete} />
      </div>

      {files.length > 0 && (
        <CollapsibleRuleEditor
          search={search}
          replace={replace}
          prefix={prefix}
          suffix={suffix}
          numbering={numbering}
          numberWidth={numberWidth}
          newName={newName}
          keepExtension={keepExtension}
          // Series props
          seriesEnabled={seriesEnabled}
          seriesName={seriesName}
          includeSeason={includeSeason}
          useExistingEpisodeNumbers={useExistingEpisodeNumbers}
          seasonNumber={seasonNumber}
          startEpisode={startEpisode}
          seasonPrefix={seasonPrefix}
          episodePrefix={episodePrefix}
          seasonNumberWidth={seasonNumberWidth}
          episodeNumberWidth={episodeNumberWidth}
          loading={loading}
          hasItems={selectedFiles.size > 0}
          onSearchChange={setSearch}
          onReplaceChange={setReplace}
          onPrefixChange={setPrefix}
          onSuffixChange={setSuffix}
          onNumberingChange={setNumbering}
          onNumberWidthChange={setNumberWidth}
          onNewNameChange={setNewName}
          onKeepExtensionChange={setKeepExtension}
          // Series handlers
          onSeriesEnabledChange={setSeriesEnabled}
          onSeriesNameChange={setSeriesName}
          onIncludeSeasonChange={setIncludeSeason}
          onUseExistingEpisodeNumbersChange={setUseExistingEpisodeNumbers}
          onSeasonNumberChange={setSeasonNumber}
          onStartEpisodeChange={setStartEpisode}
          onSeasonPrefixChange={setSeasonPrefix}
          onEpisodePrefixChange={setEpisodePrefix}
          onSeasonNumberWidthChange={setSeasonNumberWidth}
          onEpisodeNumberWidthChange={setEpisodeNumberWidth}
          onApplyRename={handleConfirmDialogOpen}
        />
      )}

      {/* Floating Action Buttons for Mobile */}
      <FloatingActionButtons
        onSelectAll={() => handleSelectAll(true)}
        onUndo={() => UndoService.undo()}
        onApply={handleConfirmDialogOpen}
        showApply={selectedFiles.size > 0}
        disabled={loading}
        selectedCount={selectedFiles.size}
      />

      <ConfirmRenameDialog
        open={showConfirmDialog}
        onOpenChange={handleConfirmDialogClose}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleAbortOperation}
        pairs={getConfirmPairs()}
        loading={loading}
        isTauri={isTauri}
      />
    </div>
  );
}

export default function Page() {
  const t = useI18n();

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{t('home.title')}</h1>
            <p className="text-muted-foreground text-sm hidden sm:block">{t('home.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content - File Renamer Only */}
      <div className="flex-1">
        <FileRenamerSection />
      </div>
    </main>
  );
}
