'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FolderOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileService, isTauriEnvironment } from '@/lib/services/file-service';
import { useI18n } from '@/lib/i18n/i18n';
import type { FileEntry } from '@/types';

interface DropZoneProps {
  onFilesReceived: (files: FileEntry[], folderPath: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
}

export function DropZone({ onFilesReceived, onLoadingChange, onError }: DropZoneProps) {
  const t = useI18n();
  const [isDragging, setIsDragging] = useState(false);

  // Handle Tauri file drop events
  useEffect(() => {
    if (!isTauriEnvironment()) {
      return;
    }

    // Dynamically import Tauri event API for v1
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await listen('tauri://file-drop', async (event) => {
          const paths = event.payload as string[];
          if (paths.length > 0) {
            const folderPath = paths[0];
            try {
              onLoadingChange(true);
              const entries = await FileService.listFiles(folderPath);
              onFilesReceived(entries, folderPath);
            } catch (err: unknown) {
              const errorMessage =
                err instanceof Error ? err.message : 'Failed to process dropped folder';
              onError(errorMessage);
            } finally {
              onLoadingChange(false);
            }
          }
        });
      } catch {
        // Event API not available in browser
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [onFilesReceived, onLoadingChange, onError]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDragging(false);

      if (acceptedFiles.length === 0) return;

      try {
        onLoadingChange(true);

        const folderPath = await FileService.chooseFolder();
        if (!folderPath) {
          onError('No folder selected');
          return;
        }

        const entries = await FileService.listFiles(folderPath);
        onFilesReceived(entries, folderPath);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to process dropped folder';
        onError(errorMessage);
      } finally {
        onLoadingChange(false);
      }
    },
    [onFilesReceived, onLoadingChange, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: { 'application/x-directory': [] },
    multiple: false,
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed cursor-pointer transition-colors hover:border-primary/50 ${
        isDragging || isDragActive ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <input {...getInputProps()} />
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4">
        <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-medium">
            {isDragActive ? t('dropzone.title') : t('dropzone.title')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('dropzone.subtitle')}</p>
        </div>
        <Button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              onLoadingChange(true);
              const folderPath = await FileService.chooseFolder();
              if (!folderPath) return;

              const entries = await FileService.listFiles(folderPath);
              onFilesReceived(entries, folderPath);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to select folder';
              onError(errorMessage);
            } finally {
              onLoadingChange(false);
            }
          }}
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          {t('dropzone.browse_button')}
        </Button>
      </CardContent>
    </Card>
  );
}
