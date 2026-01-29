/**
 * Type definitions for Series Renamer functionality
 * Handles file groups, episode info, and media types
 */

import type { FileEntry } from './index';

/**
 * Media file types for classification
 */
export type MediaType = 'video' | 'subtitle' | 'dubbing' | 'other';

/**
 * Episode information extracted from filename
 */
export interface EpisodeInfo {
  /** Season number (if found) */
  season?: number;
  /** Episode number */
  episode: number;
  /** Raw matched string */
  rawMatch: string;
  /** Pattern type that matched */
  patternType: 'sxe' | 'xsep' | 'episode' | 'number' | 'none';
}

/**
 * Metadata for a TV series
 */
export interface SeriesMetadata {
  /** Series name */
  name: string;
  /** Season number */
  season: number;
  /** Starting episode number (for renumbering) */
  startEpisode: number;
  /** Selected naming pattern */
  pattern: string;
}

/**
 * Available naming patterns
 */
export interface NamingPattern {
  /** Pattern ID */
  id: string;
  /** Display name */
  label: string;
  /** Pattern template with placeholders */
  template: string;
  /** Whether this is a custom pattern */
  isCustom?: boolean;
}

/**
 * A group of related files (video + subtitles + dubs)
 */
export interface FileGroup {
  /** Unique identifier */
  id: string;
  /** Episode information */
  episodeInfo: EpisodeInfo;
  /** Main video file */
  videoFile: ClassifiedFile;
  /** Associated subtitle files */
  subtitleFiles: ClassifiedFile[];
  /** Associated dubbing files */
  dubbingFiles: ClassifiedFile[];
  /** Other related files */
  otherFiles: ClassifiedFile[];
  /** Calculated new names for all files */
  previewNames: Map<string, string>;
  /** Whether this group has conflicts */
  hasConflict: boolean;
  /** Whether this group is selected for rename */
  selected: boolean;
}

/**
 * File with its media type classification
 */
export interface ClassifiedFile extends FileEntry {
  mediaType: MediaType;
  /** Detected language for subtitles (e.g., 'Fa', 'En') */
  language?: string;
}

/**
 * Preview for a file rename operation
 */
export interface FileRenamePreview {
  /** Original file entry */
  original: FileEntry;
  /** New file name (null if no change) */
  newName: string | null;
  /** Full new path */
  newPath: string | null;
  /** Whether the name changed */
  changed: boolean;
  /** Whether there's a conflict */
  conflict: boolean;
  /** File type */
  mediaType: MediaType;
}

/**
 * Group preview with all files
 */
export interface GroupPreview {
  /** The file group */
  group: FileGroup;
  /** Previews for all files in the group */
  filePreviews: FileRenamePreview[];
  /** Whether the group has any conflicts */
  hasConflict: boolean;
  /** Whether the group has any changes */
  hasChanges: boolean;
}

/**
 * Result of file classification
 */
export interface ClassificationResult {
  /** Classified video files */
  videos: ClassifiedFile[];
  /** Classified subtitle files */
  subtitles: ClassifiedFile[];
  /** Classified dubbing files */
  dubs: ClassifiedFile[];
  /** Other files */
  others: ClassifiedFile[];
}

/**
 * Match result for finding related files
 */
export interface RelatedFilesMatch {
  /** The main video file */
  video: ClassifiedFile;
  /** Matched subtitle files */
  subtitles: ClassifiedFile[];
  /** Matched dubbing files */
  dubs: ClassifiedFile[];
  /** Match confidence score (0-1) */
  confidence: number;
}

/**
 * Supported video file extensions
 */
export const VIDEO_EXTENSIONS = [
  'mp4',
  'mkv',
  'avi',
  'mov',
  'wmv',
  'flv',
  'webm',
  'm4v',
  'mpg',
  'mpeg',
  'm2v',
  'ts',
  'mts',
] as const;

/**
 * Supported subtitle file extensions
 */
export const SUBTITLE_EXTENSIONS = ['srt', 'ass', 'ssa', 'vtt', 'sub', 'idx', 'pgs'] as const;

/**
 * Supported dubbing/audio file extensions
 */
export const DUBBING_EXTENSIONS = ['mka', 'ac3', 'dts', 'aac', 'eac3', 'dts-hd'] as const;
