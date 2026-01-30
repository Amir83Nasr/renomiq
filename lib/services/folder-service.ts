'use client';

import type { FolderEntry } from '@/components/CompactFolderList';
import { TauriService, isTauriEnvironment } from './tauri';

export interface FolderServiceInterface {
  chooseFolder(): Promise<string | null>;
  listSubfolders(folder: string): Promise<FolderEntry[]>;
}

// Browser implementation using File System Access API
class BrowserFolderService implements FolderServiceInterface {
  private dirHandle: FileSystemDirectoryHandle | null = null;

  async chooseFolder(): Promise<string | null> {
    try {
      if ('showDirectoryPicker' in window) {
        this.dirHandle = await (
          window as unknown as {
            showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
          }
        ).showDirectoryPicker();
        return this.dirHandle.name;
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

  async listSubfolders(folder?: string): Promise<FolderEntry[]> {
    if (!this.dirHandle) {
      console.error('No directory handle available');
      return [];
    }

    try {
      const entries: FolderEntry[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const entry of this.dirHandle.values() as any) {
        if (entry.kind === 'directory') {
          const name = entry.name;
          entries.push({
            path: `${this.dirHandle!.name}/${name}`,
            name,
          });
        }
      }

      return entries.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error listing subfolders:', error);
      return [];
    }
  }
}

// Type for File System Access API
type FileSystemDirectoryHandle = {
  name: string;
  values(): AsyncIterable<FileSystemHandle>;
};

type FileSystemHandle = {
  kind: 'file' | 'directory';
  name: string;
};

// Unified folder service
export class FolderService {
  private static browserService: BrowserFolderService | null = null;
  private static lastFolderPath: string | null = null;

  private static getBrowserService(): BrowserFolderService {
    if (!this.browserService) {
      this.browserService = new BrowserFolderService();
    }
    return this.browserService;
  }

  static async chooseFolder(): Promise<string | null> {
    try {
      if (isTauriEnvironment()) {
        const result = await TauriService.chooseFolder();
        this.lastFolderPath = result;
        return result;
      }
      const result = await this.getBrowserService().chooseFolder();
      this.lastFolderPath = result;
      return result;
    } catch (error) {
      console.error('[FolderService] Error choosing folder:', error);
      throw error;
    }
  }

  static async listSubfolders(folder: string): Promise<FolderEntry[]> {
    try {
      if (isTauriEnvironment()) {
        return await TauriService.listSubfolders(folder);
      }
      return await this.getBrowserService().listSubfolders(folder);
    } catch (error) {
      console.error('Error listing subfolders:', error);
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

export { isTauriEnvironment };
