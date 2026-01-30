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
  private currentPath: string = '';

  async chooseFolder(): Promise<string | null> {
    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        this.dirHandle = await (
          window as unknown as {
            showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
          }
        ).showDirectoryPicker();
        this.currentPath = this.dirHandle.name;
        return this.currentPath;
      }
      return null;
    } catch (error) {
      // User cancelled the picker - this is expected behavior
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Error choosing folder:', error);
      return null;
    }
  }

  async listFiles(folder?: string): Promise<FileEntry[]> {
    // If dirHandle is null but we have a folder name, try to work with what we have
    if (!this.dirHandle) {
      console.error('No directory handle available. Did you call chooseFolder first?');
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
            path: `${this.dirHandle!.name}/${name}`,
            name,
            extension: ext,
          });
        }
      }
      return entries;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}

// Unified file service that works in both environments
export class FileService {
  private static browserService: BrowserFileService | null = null;
  private static lastFolderPath: string | null = null;

  private static getBrowserService(): BrowserFileService {
    if (!this.browserService) {
      this.browserService = new BrowserFileService();
    }
    return this.browserService;
  }

  static async chooseFolder(): Promise<string | null> {
    try {
      const isTauri = isTauriEnvironment();
      console.log('[FileService] chooseFolder called');
      console.log('[FileService] Environment detection:');
      console.log('  - isTauri:', isTauri);
      console.log('  - __TAURI_INTERNALS__:', '__TAURI_INTERNALS__' in window);
      console.log('  - userAgent includes Tauri:', navigator.userAgent.includes('Tauri'));
      console.log('  - showDirectoryPicker:', 'showDirectoryPicker' in window);

      if (isTauri) {
        console.log('[FileService] Using TauriService');
        const result = await TauriService.chooseFolder();
        console.log('[FileService] TauriService result:', result);
        this.lastFolderPath = result;
        return result;
      }
      console.log('[FileService] Using BrowserFileService');
      const result = await this.getBrowserService().chooseFolder();
      console.log('[FileService] BrowserFileService result:', result);
      this.lastFolderPath = result;
      return result;
    } catch (error) {
      console.error('[FileService] Error in chooseFolder:', error);
      throw error;
    }
  }

  static async listFiles(folder: string): Promise<FileEntry[]> {
    try {
      if (isTauriEnvironment()) {
        return await TauriService.listFiles(folder);
      }
      return await this.getBrowserService().listFiles(folder);
    } catch (error) {
      console.error('Error in listFiles:', error);
      throw error;
    }
  }

  static isBrowserSupported(): boolean {
    return 'showDirectoryPicker' in window || isTauriEnvironment();
  }

  static getLastFolderPath(): string | null {
    return this.lastFolderPath;
  }
}

// Re-export for convenience
export { isTauriEnvironment };
