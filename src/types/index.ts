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
  type: 'search-replace' | 'prefix' | 'suffix' | 'numbering' | 'rename' | 'series';
  search?: string;
  replace?: string;
  value?: string;
  width?: number;
  newName?: string;
  keepExtension?: boolean;
  // Series specific
  seriesName?: string;
  includeSeason?: boolean;
  seasonNumber?: number;
  startEpisode?: number;
  seasonPrefix?: 'S' | 'Season';
  episodePrefix?: 'E' | 'Episode';
  seasonNumberWidth?: 1 | 2 | 3;
  episodeNumberWidth?: 1 | 2 | 3;
  useExistingEpisodeNumbers?: boolean;
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
  newName?: string;
  keepExtension?: boolean;
}

// Undo System Types
export interface RenameHistoryEntry {
  id: string;
  timestamp: number;
  pairs: RenamePair[]; // from: newPath, to: oldPath (for undo)
  originalPairs: RenamePair[]; // from: oldPath, to: newPath (for reference)
  folder: string;
  description: string;
}

export interface UndoResult {
  success: boolean;
  restoredCount: number;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

export interface SeriesOptions {
  enabled: boolean;
  seriesName: string;
  includeSeason: boolean;
  seasonNumber: number;
  startEpisode: number;
  seasonPrefix: 'S' | 'Season';
  episodePrefix: 'E' | 'Episode';
  seasonNumberWidth: 1 | 2 | 3;
  episodeNumberWidth: 1 | 2 | 3;
  useExistingEpisodeNumbers: boolean;
}
