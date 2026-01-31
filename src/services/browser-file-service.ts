'use client';

import type { FileEntry, RenamePair, ApplyResult, UndoResult } from '@/types';
import { isTauriEnvironment } from './tauri';

// Browser-safe file operations for non-Tauri environments

export async function browserChooseFolder(): Promise<{
  path: string;
  handle: globalThis.FileSystemDirectoryHandle;
} | null> {
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await (
        window as unknown as {
          showDirectoryPicker: () => Promise<globalThis.FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      return { path: handle.name, handle };
    }
    throw new Error('File System Access API not supported');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

export async function browserListFiles(
  handle: globalThis.FileSystemDirectoryHandle
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  // @ts-expect-error - values() is not in types yet
  for await (const entry of handle.values()) {
    if (entry.kind === 'file') {
      const file = await (entry as globalThis.FileSystemFileHandle).getFile();
      const name = entry.name;
      const ext = name.includes('.') ? name.split('.').pop() || '' : '';
      entries.push({
        path: `${handle.name}/${name}`,
        name,
        extension: ext,
      });
    }
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export async function browserApplyRenames(
  handle: globalThis.FileSystemDirectoryHandle,
  pairs: RenamePair[]
): Promise<ApplyResult> {
  let successCount = 0;
  let errorCount = 0;

  // Get all file handles first
  const fileHandles = new Map<string, globalThis.FileSystemFileHandle>();
  // @ts-expect-error - values() is not in the types yet
  for await (const entry of handle.values()) {
    if (entry.kind === 'file') {
      fileHandles.set(entry.name, entry as globalThis.FileSystemFileHandle);
    }
  }

  for (const pair of pairs) {
    try {
      const oldName = pair.from.split('/').pop()!;
      const newName = pair.to.split('/').pop()!;
      const fileHandle = fileHandles.get(oldName);

      if (!fileHandle) {
        throw new Error(`File not found: ${oldName}`);
      }

      try {
        // Try to use the move method (Chrome 86+)
        // @ts-expect-error - moveTo is experimental
        await fileHandle.moveTo(handle, newName);
        successCount++;
      } catch (moveError) {
        // Fallback: Create new file with new name, delete old one
        const file = await fileHandle.getFile();
        const newHandle = await handle.getFileHandle(newName, { create: true });
        const writable = await newHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await handle.removeEntry(oldName);
        successCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }

  return {
    success: errorCount === 0,
  };
}

export async function browserUndoRenames(
  handle: globalThis.FileSystemDirectoryHandle,
  pairs: RenamePair[]
): Promise<UndoResult> {
  // Reverse the pairs for undo
  const reversedPairs = pairs.map((pair) => ({ from: pair.to, to: pair.from }));
  const result = await browserApplyRenames(handle, reversedPairs);
  return {
    success: result.success,
    restoredCount: pairs.length,
  };
}

// Re-export for convenience
export { isTauriEnvironment };
