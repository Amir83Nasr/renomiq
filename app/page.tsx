'use client';

import { useState, useMemo, useCallback } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropZone } from '@/components/DropZone';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ConfirmRenameDialog } from '@/components/ConfirmRenameDialog';
import { UndoButton } from '@/components/UndoButton';
import { FileService } from '@/lib/services/file-service';
import { UndoService } from '@/lib/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';
import { FolderRenamerSection } from '@/app/sections/FolderRenamerSection';
import { CompactFileList } from '@/components/CompactFileList';
import { CollapsibleRuleEditor } from '@/components/CollapsibleRuleEditor';

import type { FileEntry, RenamePair, RenameRule } from '@/types';
import { applyRenameRules, buildPreview } from '@/lib/rename-rules';

function useRenamePreview(files: FileEntry[], rules: RenameRule[]) {
  return useMemo(() => buildPreview(files, rules), [files, rules]);
}

// File Renamer Section Component with improved UX
function FileRenamerSection() {
  const t = useI18n();
  const [folder, setFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Rule state
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numbering, setNumbering] = useState(false);
  const [numberWidth, setNumberWidth] = useState(2);

  // Only apply rename rules to selected files
  const selectedFileEntries = useMemo(() => {
    return files.filter((f) => selectedFiles.has(f.path));
  }, [files, selectedFiles]);

  const preview = useRenamePreview(
    selectedFileEntries,
    applyRenameRules({
      search,
      replace,
      prefix,
      suffix,
      numbering,
      numberWidth,
    })
  );

  const handleFilesReceived = (receivedFiles: FileEntry[], folderPath: string) => {
    setFiles(receivedFiles);
    setFolder(folderPath);
    setError(null);
    // Select all files by default
    setSelectedFiles(new Set(receivedFiles.map((f) => f.path)));
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
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

  async function handleApplyRename() {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const pairs: RenamePair[] = preview
        .filter((p) => p.newName && p.newName !== p.oldName && !p.conflict)
        .map((p) => ({ from: p.path, to: p.newPath! }));

      if (pairs.length === 0) {
        setError(t('home.no_changes_to_apply'));
        setLoading(false);
        return;
      }

      const { TauriService } = await import('@/lib/services/tauri');
      const result = await TauriService.applyRenames(pairs);

      if (!result.success) {
        setError(result.error ?? t('home.rename_failed'));
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

      // Show success message
      setSuccessMessage(`${pairs.length} ${t('home.rename_success')}`);

      if (folder) {
        const entries = await FileService.listFiles(folder);
        setFiles(entries);
        setSelectedFiles(new Set(entries.map((f) => f.path)));
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('errors.failed_to_apply_rename');
      setError(errorMessage);
    } finally {
      setLoading(false);
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
    <div className="space-y-4 max-w-3xl mx-auto">
      <DropZone
        onFilesReceived={handleFilesReceived}
        onLoadingChange={handleLoadingChange}
        onError={handleError}
      />

      {folder && (
        <p className="text-xs text-muted-foreground truncate">
          {t('home.active_folder')} <span className="font-mono">{folder}</span>
        </p>
      )}

      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 mt-2 rounded-md border border-green-500/20 px-3 py-2 text-sm flex items-center gap-2">
          <span>{successMessage}</span>
          <UndoButton onUndoComplete={() => setSuccessMessage(null)} />
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
        />
      )}

      {files.length > 0 && (
        <CollapsibleRuleEditor
          search={search}
          replace={replace}
          prefix={prefix}
          suffix={suffix}
          numbering={numbering}
          numberWidth={numberWidth}
          loading={loading}
          hasItems={selectedFiles.size > 0}
          onSearchChange={setSearch}
          onReplaceChange={setReplace}
          onPrefixChange={setPrefix}
          onSuffixChange={setSuffix}
          onNumberingChange={setNumbering}
          onNumberWidthChange={setNumberWidth}
          onApplyRename={handleConfirmDialogOpen}
        />
      )}

      <ConfirmRenameDialog
        open={showConfirmDialog}
        onOpenChange={handleConfirmDialogClose}
        onConfirm={handleConfirmDialogConfirm}
        pairs={getConfirmPairs()}
        loading={loading}
      />
    </div>
  );
}

export default function Page() {
  const t = useI18n();

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t('home.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('home.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="file" className="flex-1">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="file">{t('series_renamer.tab_file')}</TabsTrigger>
          <TabsTrigger value="folder">{t('series_renamer.tab_series')}</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <FileRenamerSection />
        </TabsContent>

        <TabsContent value="folder" className="mt-4">
          <FolderRenamerSection />
        </TabsContent>
      </Tabs>
    </main>
  );
}
