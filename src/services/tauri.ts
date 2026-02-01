'use client';

import type { FileEntry, RenamePair, ApplyResult, UndoResult, DeleteResult } from '@/types';

// Dynamically import invoke to avoid issues with SSR
async function getInvoke() {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke;
}

export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  // Debug: Log all window properties that might indicate Tauri
  if (process.env.NODE_ENV === 'development') {
    console.log('[TauriEnv] Checking environment:');
    console.log('[TauriEnv] __TAURI_INTERNALS__:', !!win.__TAURI_INTERNALS__);
    console.log('[TauriEnv] __TAURI__:', !!win.__TAURI__);
    console.log('[TauriEnv] __TAURI_IPC__:', !!win.__TAURI_IPC__);
    console.log('[TauriEnv] tauri:', !!win.tauri);
    console.log('[TauriEnv] userAgent:', navigator.userAgent);
  }

  // Check for Tauri v1/v2 internals
  if (win.__TAURI_INTERNALS__ || win.__TAURI__) {
    return true;
  }

  // Check for Tauri-specific APIs
  if (win.tauri?.invoke || win.__TAURI_IPC__) {
    return true;
  }

  // Check user agent
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Tauri')) {
    return true;
  }

  // Check if running in a Tauri webview by looking for specific properties
  // Tauri webviews often have specific characteristics
  if (win.chrome?.webview) {
    return true;
  }

  return false;
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
    console.log('[TauriService] chooseFolder called');
    ensureTauri();
    try {
      console.log('[TauriService] Invoking choose_folder command...');
      const invoke = await getInvoke();
      console.log('[TauriService] invoke function available:', typeof invoke);
      const result = await invoke<string | null>('choose_folder');
      console.log('[TauriService] choose_folder result:', result);
      return result;
    } catch (error) {
      console.error('[TauriService] Failed to choose folder:', error);
      console.error('[TauriService] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  static async chooseFiles(): Promise<FileEntry[]> {
    console.log('[TauriService] chooseFiles called');
    ensureTauri();
    try {
      const invoke = await getInvoke();
      const entries = await invoke<FileEntry[]>('choose_files');
      return entries;
    } catch (error) {
      console.error('[TauriService] Failed to choose files:', error);
      throw error;
    }
  }

  static async listFiles(folder: string): Promise<FileEntry[]> {
    ensureTauri();
    try {
      const invoke = await getInvoke();
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
      const invoke = await getInvoke();
      const result = await invoke<ApplyResult>('apply_renames', { pairs });
      return result;
    } catch (error) {
      console.error('Failed to apply renames:', error);
      throw error;
    }
  }

  static async undoRenames(pairs: RenamePair[]): Promise<UndoResult> {
    ensureTauri();
    try {
      const invoke = await getInvoke();
      const result = await invoke<UndoResult>('undo_renames', { pairs });
      return result;
    } catch (error) {
      console.error('Failed to undo renames:', error);
      throw error;
    }
  }

  static async listSubfolders(folder: string): Promise<{ path: string; name: string }[]> {
    ensureTauri();
    try {
      const invoke = await getInvoke();
      const entries = await invoke<{ path: string; name: string }[]>('list_subfolders', { folder });
      return entries;
    } catch (error) {
      console.error('Failed to list subfolders:', error);
      throw error;
    }
  }

  static async deleteFiles(paths: string[]): Promise<DeleteResult> {
    ensureTauri();
    try {
      const invoke = await getInvoke();
      const result = await invoke<DeleteResult>('delete_files', { paths });
      return result;
    } catch (error) {
      console.error('Failed to delete files:', error);
      throw error;
    }
  }
}
