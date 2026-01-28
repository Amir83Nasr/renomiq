/**
 * Shared type definitions for Renomiq Renamer
 * These types are used by both frontend (TypeScript) and backend (Rust)
 */

export interface FileEntry {
  path: string;
  name: string;
  extension: string;
}

export interface RenameRule {
  type: 'search-replace' | 'prefix' | 'suffix' | 'numbering';
  search?: string;
  replace?: string;
  value?: string;
  width?: number;
}

export interface PreviewRow {
  path: string;
  oldName: string;
  newName: string | null;
  newPath: string | null;
  changed: boolean;
  conflict: boolean;
}

export interface RenamePair {
  from: string;
  to: string;
}

export interface ApplyResult {
  success: boolean;
  error?: string;
}

export interface RenameOptions {
  search: string;
  replace: string;
  prefix: string;
  suffix: string;
  numbering: boolean;
  numberWidth: number;
}
