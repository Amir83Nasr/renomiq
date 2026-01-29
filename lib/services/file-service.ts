'use client';

import type { FileEntry } from '@/types';
import { TauriService, isTauriEnvironment } from './tauri';

export interface FileServiceInterface {
  chooseFolder(): Promise<string | null>;
  listFiles(folder: string): Promise<FileEntry[]>;
}

// Type for File System Access API
type FileSystemDirectoryHandle = {
  name: string;
  values(): AsyncIterable<FileSystemHandle>;
};

type FileSystemFileHandle = {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
};

type FileSystemHandle = FileSystemFileHandle | { kind: 'directory'; name: string };

// Browser implementation using File System Access API
class BrowserFileService implements FileServiceInterface {
  private dirHandle: FileSystemDirectoryHandle | null = null;

  async chooseFolder(): Promise<string | null> {
    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        this.dirHandle = await (
          window as unknown as {
            showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
          }
        ).showDirectoryPicker();
        return this.dirHandle.name;
      }
      return null;
    } catch {
      // User cancelled or API not supported
      return null;
    }
  }

  async listFiles(): Promise<FileEntry[]> {
    if (!this.dirHandle) {
      return [];
    }

    try {
      const entries: FileEntry[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const entry of this.dirHandle.values() as any) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const name = file.name;
          const ext = name.includes('.') ? name.split('.').pop() || '' : '';

          entries.push({
            path: `${this.dirHandle.name}/${name}`,
            name,
            extension: ext,
          });
        }
      }
      return entries;
    } catch {
      return [];
    }
  }
}

// Unified file service that works in both environments
export class FileService {
  private static browserService: BrowserFileService | null = null;

  private static getBrowserService(): BrowserFileService {
    if (!this.browserService) {
      this.browserService = new BrowserFileService();
    }
    return this.browserService;
  }

  static async chooseFolder(): Promise<string | null> {
    if (isTauriEnvironment()) {
      return TauriService.chooseFolder();
    }
    return this.getBrowserService().chooseFolder();
  }

  static async listFiles(folder: string): Promise<FileEntry[]> {
    if (isTauriEnvironment()) {
      return TauriService.listFiles(folder);
    }
    return this.getBrowserService().listFiles();
  }

  static isBrowserSupported(): boolean {
    return 'showDirectoryPicker' in window || isTauriEnvironment();
  }
}

// Re-export for convenience
export { isTauriEnvironment };
