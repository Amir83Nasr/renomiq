/**
 * DropZone Component - Compact Design
 */

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderUp, File, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileService, isTauriEnvironment } from '@/services/file-service';
import { useI18n } from '@/lib/i18n/i18n';
import { cn } from '@/lib/utils';
import type { FileEntry } from '@/types';

interface DropZoneProps {
  onFilesReceived: (files: FileEntry[], folderPath: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: string) => void;
}

export function DropZone({ onFilesReceived, onLoadingChange, onError }: DropZoneProps) {
  const t = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const [isFileSelectionSupported, setIsFileSelectionSupported] = useState(false);

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
    setIsBrowserSupported('showDirectoryPicker' in window || isTauriEnvironment());
    setIsFileSelectionSupported('showOpenFilePicker' in window || isTauriEnvironment());
  }, []);

  // Handle Tauri file drop events
  useEffect(() => {
    if (!isTauri) {
      return;
    }

    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();

        // Listen for drag drop events using Tauri v2 API
        unlisten = await win.onDragDropEvent(async (event) => {
          if (event.payload.type === 'drop') {
            const paths = event.payload.paths;
            if (paths.length > 0) {
              try {
                onLoadingChange?.(true);

                // Check if first item is a directory
                const firstPath = paths[0];

                // Try to get metadata to check if it's a directory
                const { invoke } = await import('@tauri-apps/api/core');
                const isDir = await invoke<boolean>('is_directory', { path: firstPath }).catch(
                  () => false
                );

                if (isDir) {
                  // It's a folder
                  const entries = await FileService.listFiles(firstPath);
                  onFilesReceived(entries, firstPath);
                } else {
                  // It's file(s)
                  const entries: FileEntry[] = paths.map((path) => {
                    const name = path.split('/').pop() || path.split('\\').pop() || path;
                    const ext = name.includes('.') ? name.split('.').pop() || '' : '';
                    return {
                      path,
                      name,
                      extension: ext,
                    };
                  });
                  onFilesReceived(entries, 'selected-files');
                }
              } catch (err: unknown) {
                const errorMessage =
                  err instanceof Error ? err.message : 'Failed to process dropped items';
                onError?.(errorMessage);
              } finally {
                onLoadingChange?.(false);
              }
            }
          }
        });
      } catch (error) {
        console.error('[DropZone] Failed to setup drag drop listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [onFilesReceived, onLoadingChange, onError, isTauri]);

  // Process dropped items for web version
  const processDroppedItems = useCallback(async (items: DataTransferItemList) => {
    const item = items[0];
    if (!item) return null;

    // @ts-expect-error - getAsFileSystemHandle is experimental
    if (item.getAsFileSystemHandle) {
      try {
        // @ts-expect-error - getAsFileSystemHandle is experimental
        const handle = await item.getAsFileSystemHandle();
        if (handle && handle.kind === 'directory') {
          return handle as globalThis.FileSystemDirectoryHandle;
        }
      } catch {
        // Ignore error, fallback to other methods
      }
    }

    const entry =
      item.webkitGetAsEntry?.() ||
      (item as unknown as { getAsEntry?: () => { kind: string } }).getAsEntry?.();
    if (entry && 'isDirectory' in entry && entry.isDirectory) {
      return entry as unknown as globalThis.FileSystemDirectoryHandle;
    }

    return null;
  }, []);

  // Handle web drop events
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: unknown[], event: DragEvent | unknown) => {
      setIsDragging(false);

      if (isTauri) return;

      try {
        onLoadingChange?.(true);

        // Handle dropped files directly
        if (acceptedFiles.length > 0) {
          const entries: FileEntry[] = acceptedFiles.map((file) => {
            const name = file.name;
            const ext = name.includes('.') ? name.split('.').pop() || '' : '';
            return {
              path: name,
              name,
              extension: ext,
            };
          });
          onFilesReceived(entries, 'selected-files');
          return;
        }

        const dataTransfer = (event as DragEvent).dataTransfer;
        let dirHandle: globalThis.FileSystemDirectoryHandle | null = null;

        if (dataTransfer?.items && dataTransfer.items.length > 0) {
          dirHandle = await processDroppedItems(dataTransfer.items);
        }

        if (!dirHandle) {
          onError?.(t('errors.no_folder_selected'));
          return;
        }

        const folderName = dirHandle.name;
        const entries: FileEntry[] = [];

        // @ts-expect-error - values() is not in the types yet
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await (entry as globalThis.FileSystemFileHandle).getFile();
            const name = entry.name;
            const ext = name.includes('.') ? name.split('.').pop() || '' : '';
            entries.push({
              path: `${folderName}/${name}`,
              name,
              extension: ext,
            });
          }
        }

        onFilesReceived(entries, folderName);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to process dropped folder';
        onError?.(errorMessage);
      } finally {
        onLoadingChange?.(false);
      }
    },
    [isTauri, onFilesReceived, onLoadingChange, onError, processDroppedItems, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: true,
  });

  // Handle folder selection
  const handleSelectFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      onLoadingChange?.(true);
      const folderPath = await FileService.chooseFolder();
      if (!folderPath) {
        onLoadingChange?.(false);
        return;
      }

      const entries = await FileService.listFiles(folderPath);
      onFilesReceived(entries, folderPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select folder';
      onError?.(errorMessage);
    } finally {
      onLoadingChange?.(false);
    }
  };

  // Handle file selection
  const handleSelectFiles = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      onLoadingChange?.(true);
      const entries = await FileService.chooseFiles();
      if (entries.length === 0) {
        onLoadingChange?.(false);
        return;
      }

      onFilesReceived(entries, 'selected-files');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select files';
      onError?.(errorMessage);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <div
      data-slot="dropzone"
      {...getRootProps()}
      className={cn(
        'relative rounded-xl cursor-pointer transition-all duration-200 overflow-hidden',
        'border border-dashed',
        isDragging || isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
            isDragging || isDragActive ? 'bg-primary/20' : 'bg-primary/10'
          )}
        >
          {isDragging || isDragActive ? (
            <FolderUp className="w-5 h-5 text-primary" />
          ) : (
            <Upload className="w-5 h-5 text-primary/80" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {isDragActive || isDragging ? t('dropzone.drop_here') : t('dropzone.title')}
          </p>
          <p className="text-xs text-muted-foreground truncate">{t('dropzone.subtitle')}</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* File Selection Button */}
          {isFileSelectionSupported && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleSelectFiles}
              className="h-8 px-2.5 text-xs gap-1.5 rounded-lg"
            >
              <File className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('dropzone.select_files') || 'Files'}</span>
            </Button>
          )}

          {/* Folder Selection Button */}
          {isBrowserSupported ? (
            <Button
              size="sm"
              type="button"
              onClick={handleSelectFolder}
              className="h-8 px-2.5 text-xs gap-1.5 rounded-lg"
            >
              <Folder className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('dropzone.browse_button')}</span>
            </Button>
          ) : (
            <p className="text-[10px] text-muted-foreground">{t('errors.browser_not_supported')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
