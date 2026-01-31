'use client';

import { useState, useMemo, useCallback } from 'react';
import { FolderService } from '@/services/folder-service';
import { DropZone } from '@/features/renamer/components/DropZone';
import {
  CompactFolderList,
  FolderEntry,
  FolderPreviewRow,
} from '@/features/renamer/components/CompactFolderList';
import { CollapsibleRuleEditor } from '@/features/renamer/components/CollapsibleRuleEditor';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmRenameDialog } from '@/features/renamer/components/ConfirmRenameDialog';
import { UndoService } from '@/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';
import { applyRenameRules, buildPreview } from '@/lib/utils/rename-rules';
import type { RenameRule } from '@/lib/utils/rename-rules';
import { toast } from 'sonner';
import type { RenamePair } from '@/types';

export function FolderRenamerSection() {
  const t = useI18n();

  // State
  const [parentFolder, setParentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Rule state
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numbering, setNumbering] = useState(false);
  const [numberWidth, setNumberWidth] = useState(2);

  // Handle files received from DropZone (adapted for folders)
  const handleFilesReceived = useCallback(async (_receivedFiles: unknown[], folderPath: string) => {
    setParentFolder(folderPath);

    try {
      setLoading(true);
      const subfolders = await FolderService.listSubfolders(folderPath);
      setFolders(subfolders);
      // Select all by default
      setSelectedFolders(new Set(subfolders.map((f) => f.path)));
      toast.success(t('rule_editor.files_loaded'), {
        description: `${subfolders.length} ${t('folder_renamer.folders_loaded')}`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list subfolders';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert folders to file-like entries for rename rules
  const folderEntries = useMemo(() => {
    return folders.map((f) => ({
      path: f.path,
      name: f.name,
      extension: '',
    }));
  }, [folders]);

  // Get selected folder entries
  const selectedFolderEntries = useMemo(() => {
    return folderEntries.filter((f) => selectedFolders.has(f.path));
  }, [folderEntries, selectedFolders]);

  // Calculate preview
  const rules: RenameRule[] = useMemo(
    () =>
      applyRenameRules({
        search,
        replace,
        prefix,
        suffix,
        numbering,
        numberWidth,
      }),
    [search, replace, prefix, suffix, numbering, numberWidth]
  );

  const preview = useMemo(() => {
    return buildPreview(selectedFolderEntries, rules);
  }, [selectedFolderEntries, rules]);

  // Convert preview to folder preview format
  const folderPreview: FolderPreviewRow[] = useMemo(() => {
    return preview.map((p) => ({
      path: p.path,
      oldName: p.oldName,
      newName: p.newName,
      changed: p.changed,
      conflict: p.conflict,
    }));
  }, [preview]);

  // Handle selection changes
  const handleSelectionChange = useCallback((path: string, selected: boolean) => {
    setSelectedFolders((prev) => {
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
        setSelectedFolders(new Set(folders.map((f) => f.path)));
      } else {
        setSelectedFolders(new Set());
      }
    },
    [folders]
  );

  const handleSelectFiltered = useCallback((paths: string[], selected: boolean) => {
    setSelectedFolders((prev) => {
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

  // Apply rename
  const handleApplyRename = async () => {
    setLoading(true);

    try {
      const pairs: RenamePair[] = folderPreview
        .filter(
          (p) => p.newName && p.newName !== p.oldName && !p.conflict && selectedFolders.has(p.path)
        )
        .map((p) => ({
          from: p.path,
          to: p.path.replace(p.oldName, p.newName!),
        }));

      if (pairs.length === 0) {
        toast.warning(t('home.no_changes_to_apply'));
        setLoading(false);
        return;
      }

      const { TauriService } = await import('@/services/tauri');
      const result = await TauriService.applyRenames(pairs);

      if (!result.success) {
        toast.error(result.error ?? t('home.rename_failed'));
        setLoading(false);
        return;
      }

      // Add to undo history
      const historyEntry = UndoService.createHistoryEntry(
        pairs,
        parentFolder || '',
        `${t('folder_renamer.undo_description')} ${pairs.length}`
      );
      UndoService.addToHistory(historyEntry);

      // Show success toast
      toast.success(`${pairs.length} ${t('folder_renamer.success_message')}`, {
        action: {
          label: t('common.undo'),
          onClick: () => UndoService.undo(),
        },
      });

      // Refresh
      if (parentFolder) {
        const subfolders = await FolderService.listSubfolders(parentFolder);
        setFolders(subfolders);
        setSelectedFolders(new Set(subfolders.map((f) => f.path)));
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('errors.failed_to_apply_rename');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    return folderPreview
      .filter(
        (p) => p.newName && p.newName !== p.oldName && !p.conflict && selectedFolders.has(p.path)
      )
      .map((p) => ({
        from: p.path,
        to: p.path.replace(p.oldName, p.newName!),
      }));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <DropZone
        onFilesReceived={handleFilesReceived}
        onLoadingChange={setLoading}
        onError={(msg) => toast.error(msg)}
      />

      {parentFolder && (
        <p className="text-xs sm:text-sm text-muted-foreground truncate px-1">
          {t('folder_renamer.parent_folder')} <span className="font-mono">{parentFolder}</span>
        </p>
      )}

      {folders.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <CompactFolderList
              folders={folders}
              preview={folderPreview}
              selectedFolders={selectedFolders}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
              onSelectFiltered={handleSelectFiltered}
            />
          </CardContent>
        </Card>
      )}

      {folders.length > 0 && (
        <CollapsibleRuleEditor
          search={search}
          replace={replace}
          prefix={prefix}
          suffix={suffix}
          numbering={numbering}
          numberWidth={numberWidth}
          loading={loading}
          hasItems={selectedFolders.size > 0}
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
