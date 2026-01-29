'use client';

import { invoke } from '@tauri-apps/api/tauri';
import type { FileEntry, RenamePair, ApplyResult } from '@/types';

export function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    // Tauri injects internals into the desktop webview environment.
    // We also fall back to checking the user agent, which includes "Tauri"
    // when running inside a Tauri window.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ('__TAURI_INTERNALS__' in (window as any) ||
      (typeof navigator !== 'undefined' && navigator.userAgent.includes('Tauri')))
  );
}

function ensureTauri() {
  if (!isTauriEnvironment()) {
    throw new Error(
      'Folder selection is only available in the desktop app. Run `pnpm tauri dev` instead of `pnpm dev`.'
    );
  }
}

export class TauriService {
  static async chooseFolder(): Promise<string | null> {
    ensureTauri();
    try {
      const result = await invoke<string | null>('choose_folder');
      return result;
    } catch (error) {
      console.error('Failed to choose folder:', error);
      throw error;
    }
  }

  static async listFiles(folder: string): Promise<FileEntry[]> {
    ensureTauri();
    try {
      const entries = await invoke<FileEntry[]>('list_files', { folder });
      return entries;
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    }
  }

  static async applyRenames(pairs: RenamePair[]): Promise<ApplyResult> {
    ensureTauri();
    try {
      const result = await invoke<ApplyResult>('apply_renames', { pairs });
      return result;
    } catch (error) {
      console.error('Failed to apply renames:', error);
      throw error;
    }
  }
}
