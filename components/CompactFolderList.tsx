'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Folder, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n';

export interface FolderEntry {
  path: string;
  name: string;
}

export interface FolderPreviewRow {
  path: string;
  oldName: string;
  newName: string | null;
  changed: boolean;
  conflict: boolean;
}

interface CompactFolderListProps {
  folders: FolderEntry[];
  preview: FolderPreviewRow[];
  selectedFolders: Set<string>;
  onSelectionChange: (path: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectFiltered: (paths: string[], selected: boolean) => void;
  onSelectRange?: (paths: string[], selected: boolean) => void;
}

export function CompactFolderList({
  folders,
  preview,
  selectedFolders,
  onSelectionChange,
  onSelectAll,
  onSelectFiltered,
  onSelectRange,
}: CompactFolderListProps) {
  const t = useI18n();
  const [filter, setFilter] = useState('');
  const lastClickedIndex = useRef<number | null>(null);

  // Filter folders
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => folder.name.toLowerCase().includes(filter.toLowerCase()));
  }, [folders, filter]);

  // Create preview map for quick lookup
  const previewMap = useMemo(() => {
    const map = new Map<string, FolderPreviewRow>();
    preview.forEach((p) => map.set(p.path, p));
    return map;
  }, [preview]);

  const filteredPaths = filteredFolders.map((f) => f.path);
  const selectedFilteredCount = filteredPaths.filter((p) => selectedFolders.has(p)).length;
  const allFilteredSelected =
    filteredFolders.length > 0 && selectedFilteredCount === filteredFolders.length;

  const handleToggleAll = () => {
    onSelectFiltered(filteredPaths, !allFilteredSelected);
  };

  // Handle click with range selection support (Shift+click)
  const handleItemClick = useCallback(
    (index: number, path: string, isSelected: boolean, event: React.MouseEvent) => {
      if (event.shiftKey && lastClickedIndex.current !== null) {
        // Range selection
        const start = Math.min(lastClickedIndex.current, index);
        const end = Math.max(lastClickedIndex.current, index);
        const rangePaths = filteredFolders.slice(start, end + 1).map((f) => f.path);

        // If using onSelectRange prop, use it; otherwise fall back to individual selections
        if (onSelectRange) {
          onSelectRange(rangePaths, !isSelected);
        } else {
          onSelectFiltered(rangePaths, !isSelected);
        }
      } else {
        // Single selection
        onSelectionChange(path, !isSelected);
      }
      lastClickedIndex.current = index;
    },
    [filteredFolders, onSelectionChange, onSelectFiltered, onSelectRange]
  );

  const getStatusBadge = (row: FolderPreviewRow | undefined) => {
    if (!row) return null;

    if (row.conflict) {
      return (
        <Badge variant="destructive" className="text-[10px] h-5 gap-1">
          <AlertCircle className="h-3 w-3" />
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

  if (folders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`${t('common.search')}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Selection Bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox checked={allFilteredSelected} onCheckedChange={handleToggleAll} />
          <span className="text-sm text-muted-foreground">
            {selectedFilteredCount} / {filteredFolders.length} {t('folder_renamer.folders_loaded')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelectFiltered(filteredPaths, true)}
          >
            {t('series_renamer.select_all')}
          </Button>
          <span className="text-muted-foreground">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelectFiltered(filteredPaths, false)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      {/* Folder List */}
      <div className="border rounded-md overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          {filteredFolders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t('folder_renamer.no_folders_found')}
            </div>
          ) : (
            <div className="divide-y">
              {filteredFolders.map((folder, index) => {
                const previewRow = previewMap.get(folder.path);
                const isSelected = selectedFolders.has(folder.path);

                return (
                  <div
                    key={folder.path}
                    className={`flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors ${
                      !isSelected ? 'opacity-60' : ''
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectionChange(folder.path, !isSelected)}
                    />
                    <div
                      className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                      onClick={(e) => handleItemClick(index, folder.path, isSelected, e)}
                    >
                      <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />

                      {/* Folder Info */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm truncate font-mono text-[11px] text-muted-foreground">
                          {folder.name}
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
        {selectedFolders.size} {t('folder_renamer.folders_loaded')} |{' '}
        {preview.filter((p) => p.changed).length} {t('preview_panel.status_ok')}
      </div>

      {/* Selection Hint */}
      <div className="text-[10px] text-muted-foreground/60 text-center">
        {t('common.hold_shift_for_range_selection')}
      </div>
    </div>
  );
}
