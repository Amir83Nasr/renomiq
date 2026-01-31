'use client';

import type { FileEntry } from '@/types';
import { TauriService, isTauriEnvironment } from './tauri';

export interface FileServiceInterface {
  chooseFolder(): Promise<string | null>;
  chooseFiles(): Promise<FileEntry[]>;
  listFiles(folder: string): Promise<FileEntry[]>;
}

// Type for File System Access API - use native types
type FileSystemDirectoryHandle = globalThis.FileSystemDirectoryHandle;
type FileSystemFileHandle = globalThis.FileSystemFileHandle;
type FileSystemHandle = globalThis.FileSystemHandle;

// Browser implementation using File System Access API
class BrowserFileService implements FileServiceInterface {
  private dirHandle: FileSystemDirectoryHandle | null = null;
  private currentPath: string = '';

  async chooseFolder(): Promise<string | null> {
    try {
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
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Error choosing folder:', error);
      return null;
    }
  }

  async chooseFiles(): Promise<FileEntry[]> {
    try {
      if ('showOpenFilePicker' in window) {
        const handles = await (
          window as unknown as {
            showOpenFilePicker: (options?: {
              multiple?: boolean;
            }) => Promise<FileSystemFileHandle[]>;
          }
        ).showOpenFilePicker({ multiple: true });

        const entries: FileEntry[] = [];
        for (const handle of handles) {
          const file = await handle.getFile();
          const name = file.name;
          const ext = name.includes('.') ? name.split('.').pop() || '' : '';
          entries.push({
            path: name,
            name,
            extension: ext,
          });
        }
        return entries;
      }
      return [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return [];
      }
      console.error('Error choosing files:', error);
      return [];
    }
  }

  getDirHandle(): FileSystemDirectoryHandle | null {
    return this.dirHandle;
  }

  async listFiles(folder?: string): Promise<FileEntry[]> {
    if (!this.dirHandle) {
      console.error('No directory handle available. Did you call chooseFolder first?');
      return [];
    }

    try {
      const entries: FileEntry[] = [];

      // @ts-expect-error - values() is not in the types yet
      for await (const entry of this.dirHandle.values()) {
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
  private static lastDirHandle: FileSystemDirectoryHandle | null = null;

  private static getBrowserService(): BrowserFileService {
    if (!this.browserService) {
      this.browserService = new BrowserFileService();
    }
    return this.browserService;
  }

  static async chooseFolder(): Promise<string | null> {
    try {
      const isTauri = isTauriEnvironment();

      if (isTauri) {
        const result = await TauriService.chooseFolder();
        this.lastFolderPath = result;
        this.lastDirHandle = null;
        return result;
      }
      const result = await this.getBrowserService().chooseFolder();
      this.lastFolderPath = result;
      this.lastDirHandle = this.getBrowserService().getDirHandle();
      return result;
    } catch (error) {
      console.error('[FileService] Error in chooseFolder:', error);
      throw error;
    }
  }

  static async chooseFiles(): Promise<FileEntry[]> {
    try {
      const isTauri = isTauriEnvironment();

      if (isTauri) {
        return await TauriService.chooseFiles();
      }
      return await this.getBrowserService().chooseFiles();
    } catch (error) {
      console.error('[FileService] Error in chooseFiles:', error);
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

  static isFileSelectionSupported(): boolean {
    return 'showOpenFilePicker' in window || isTauriEnvironment();
  }

  static getLastFolderPath(): string | null {
    return this.lastFolderPath;
  }

  static getLastDirHandle(): FileSystemDirectoryHandle | null {
    return this.lastDirHandle;
  }
}

// Re-export for convenience
export { isTauriEnvironment };
