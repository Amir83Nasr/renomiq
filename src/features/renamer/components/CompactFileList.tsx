'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, FileText, File, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { FileEntry, PreviewRow } from '@/types';

interface CompactFileListProps {
  files: FileEntry[];
  preview: PreviewRow[];
  selectedFiles: Set<string>;
  onSelectionChange: (path: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectFiltered: (paths: string[], selected: boolean) => void;
  onSelectRange?: (paths: string[], selected: boolean) => void;
  onDeleteFiles?: (paths: string[]) => void;
  onDeleteFromDevice?: (paths: string[]) => Promise<void>;
}

export function CompactFileList({
  files,
  preview,
  selectedFiles,
  onSelectionChange,
  onSelectAll,
  onSelectFiltered,
  onSelectRange,
  onDeleteFiles,
  onDeleteFromDevice,
}: CompactFileListProps) {
  const t = useI18n();
  const [filter, setFilter] = useState('');
  const [extFilter, setExtFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeviceDeleteConfirm, setShowDeviceDeleteConfirm] = useState(false);
  const [isDeletingFromDevice, setIsDeletingFromDevice] = useState(false);
  const lastClickedIndex = useRef<number | null>(null);

  // Get unique extensions - ensure files are sorted alphabetically as safety net
  const { sortedFiles, extensions } = useMemo(() => {
    // Sort alphabetically to ensure consistent display order
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
    const extSet = new Set<string>();
    sorted.forEach((f) => extSet.add(f.extension.toLowerCase()));
    return { sortedFiles: sorted, extensions: Array.from(extSet).sort() };
  }, [files]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return sortedFiles.filter((file) => {
      const matchesName = file.name.toLowerCase().includes(filter.toLowerCase());
      const matchesExt = extFilter === 'all' || file.extension.toLowerCase() === extFilter;
      return matchesName && matchesExt;
    });
  }, [sortedFiles, filter, extFilter]);

  // Create preview map for quick lookup
  const previewMap = useMemo(() => {
    const map = new Map<string, PreviewRow>();
    preview.forEach((p) => map.set(p.path, p));
    return map;
  }, [preview]);

  const filteredPaths = filteredFiles.map((f) => f.path);
  const selectedFilteredCount = filteredPaths.filter((p) => selectedFiles.has(p)).length;
  const allFilteredSelected =
    filteredFiles.length > 0 && selectedFilteredCount === filteredFiles.length;

  // Get selected file paths
  const selectedFilePaths = useMemo(() => {
    return Array.from(selectedFiles);
  }, [selectedFiles]);

  const handleToggleAll = () => {
    onSelectFiltered(filteredPaths, !allFilteredSelected);
  };

  // Handle delete click (remove from list only)
  const handleDeleteClick = () => {
    if (selectedFiles.size === 0) return;
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete (remove from list)
  const handleConfirmDelete = () => {
    const pathsToDelete = Array.from(selectedFiles);
    onDeleteFiles?.(pathsToDelete);
    setShowDeleteConfirm(false);
  };

  // Handle delete from device click
  const handleDeleteFromDeviceClick = () => {
    if (selectedFiles.size === 0 || !onDeleteFromDevice) return;
    setShowDeviceDeleteConfirm(true);
  };

  // Handle confirm delete from device
  const handleConfirmDeleteFromDevice = async () => {
    if (!onDeleteFromDevice) return;

    setIsDeletingFromDevice(true);
    try {
      const pathsToDelete = Array.from(selectedFiles);
      await onDeleteFromDevice(pathsToDelete);
    } catch {
      // Error handling is done in the parent
    } finally {
      setIsDeletingFromDevice(false);
      setShowDeviceDeleteConfirm(false);
    }
  };

  // Handle click with range selection support (Shift+click)
  const handleItemClick = useCallback(
    (index: number, path: string, isSelected: boolean, event: React.MouseEvent) => {
      if (event.shiftKey && lastClickedIndex.current !== null) {
        const start = Math.min(lastClickedIndex.current, index);
        const end = Math.max(lastClickedIndex.current, index);
        const rangePaths = filteredFiles.slice(start, end + 1).map((f) => f.path);

        if (onSelectRange) {
          onSelectRange(rangePaths, !isSelected);
        } else {
          onSelectFiltered(rangePaths, !isSelected);
        }
      } else {
        onSelectionChange(path, !isSelected);
      }
      lastClickedIndex.current = index;
    },
    [filteredFiles, onSelectionChange, onSelectFiltered, onSelectRange]
  );

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (['mp4', 'mkv', 'avi', 'mov', 'wmv'].includes(ext)) {
      return <File className="h-4 w-4 text-blue-500" />;
    }
    if (['srt', 'ass', 'ssa', 'vtt', 'sub'].includes(ext)) {
      return <FileText className="h-4 w-4 text-green-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <File className="h-4 w-4 text-purple-500" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (row: PreviewRow | undefined) => {
    if (!row) return null;

    if (row.conflict) {
      return (
        <Badge variant="destructive" className="text-[10px] h-5">
          {t('preview_panel.status_conflict')}
        </Badge>
      );
    }

    if (!row.changed) {
      return (
        <Badge variant="secondary" className="text-[10px] h-5">
          {t('preview_panel.status_unchanged')}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-[10px] h-5 bg-green-600 hover:bg-green-700">
        {t('preview_panel.status_ok')}
      </Badge>
    );
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`${t('common.search')}...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs gap-1.5 min-w-[100px] justify-between"
              >
                <span>
                  {extFilter === 'all' ? `${t('common.all')} (${files.length})` : `.${extFilter}`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-[120px]">
            <DropdownMenuItem
              onClick={() => setExtFilter('all')}
              className={cn('text-xs', extFilter === 'all' && 'bg-accent')}
            >
              {t('common.all')} ({files.length})
            </DropdownMenuItem>
            {extensions.map((ext) => (
              <DropdownMenuItem
                key={ext}
                onClick={() => setExtFilter(ext)}
                className={cn('text-xs', extFilter === ext && 'bg-accent')}
              >
                .{ext}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selection Bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allFilteredSelected}
            onCheckedChange={handleToggleAll}
            className="data-[state=indeterminate]:bg-primary"
          />
          <span className="text-sm text-muted-foreground">
            {selectedFilteredCount} / {filteredFiles.length} {t('rule_editor.files_loaded')}
          </span>
        </div>

        {/* Delete Buttons - Only show when files are selected */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-2">
            {/* Remove from list button */}
            {onDeleteFiles && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
                title={t('delete.remove_selected')}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{t('common.clear')}</span>
              </Button>
            )}

            {/* Delete from device button - Only in Tauri mode */}
            {onDeleteFromDevice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteFromDeviceClick}
                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                title={t('delete.delete_from_device')}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{t('delete.delete_from_device')}</span>
                <span className="text-xs">({selectedFiles.size})</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* File List */}
      <div className="border rounded-md overflow-hidden bg-card">
        <div className="max-h-64 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t('series_renamer.no_files_found')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredFiles.map((file, index) => {
                const previewRow = previewMap.get(file.path);
                const isSelected = selectedFiles.has(file.path);

                return (
                  <div
                    key={file.path}
                    className={cn(
                      'flex items-center gap-3 p-2.5 transition-colors',
                      isSelected ? 'hover:bg-muted/50' : 'opacity-60 hover:opacity-80'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectionChange(file.path, !isSelected)}
                    />
                    <div
                      className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                      onClick={(e) => handleItemClick(index, file.path, isSelected, e)}
                    >
                      <div className="flex-shrink-0">{getFileIcon(file.extension)}</div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm truncate font-mono text-[11px] text-muted-foreground">
                          {file.name}
                        </span>

                        {/* Arrow and New Name */}
                        {previewRow?.newName && previewRow.changed && isSelected && (
                          <>
                            <span className="hidden sm:inline text-muted-foreground">→</span>
                            <span className="text-sm truncate font-mono text-[11px] text-primary">
                              {previewRow.newName}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">{getStatusBadge(previewRow)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="text-xs text-muted-foreground text-center">
        {selectedFiles.size} {t('rule_editor.files_loaded')} |{' '}
        {preview.filter((p) => p.changed).length} {t('preview_panel.status_ok')}
      </div>

      {/* Selection Hint */}
      <div className="text-[10px] text-muted-foreground/60 text-center">
        {t('common.hold_shift_for_range_selection')}
      </div>

      {/* Remove from List Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title={t('common.confirm_delete') || 'Confirm Delete'}
        description={(
          t('delete.confirm_description') ||
          'Are you sure you want to delete {count} selected files from the list?'
        ).replace('{count}', String(selectedFiles.size))}
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        variant="default"
      />

      {/* Delete from Device Confirmation Dialog - Strong Warning */}
      <ConfirmDialog
        open={showDeviceDeleteConfirm}
        onOpenChange={setShowDeviceDeleteConfirm}
        onConfirm={handleConfirmDeleteFromDevice}
        title={t('delete.delete_from_device_title') || '⚠️ Permanent Delete from Device'}
        description={
          <div className="space-y-2">
            <p className="text-destructive font-medium">
              {t('delete.delete_permanent_warning') || '⚠️ This operation cannot be undone!'}
            </p>
            <p>
              {(
                t('delete.delete_from_device_description') ||
                'This action will permanently delete {count} files from your device and cannot be undone. Are you sure?'
              ).replace('{count}', String(selectedFiles.size))}
            </p>
          </div>
        }
        confirmText={t('common.yes') || 'Yes, Delete'}
        cancelText={t('common.no') || 'Cancel'}
        loading={isDeletingFromDevice}
        loadingText={t('common.processing') || 'Deleting...'}
        variant="danger"
      />
    </div>
  );
}
