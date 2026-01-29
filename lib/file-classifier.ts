/**
 * File classification utilities
 * Detects media type (video/subtitle/dubbing) from file extensions
 */

import type { FileEntry } from '@/types';
import type { MediaType, ClassifiedFile, ClassificationResult } from '@/types/series';

// Extension lists
const VIDEO_EXTENSIONS = new Set([
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
]);

const SUBTITLE_EXTENSIONS = new Set(['srt', 'ass', 'ssa', 'vtt', 'sub', 'idx', 'pgs']);

const DUBBING_EXTENSIONS = new Set(['mka', 'ac3', 'dts', 'aac', 'eac3']);

/**
 * Get file extension from filename (lowercase, without dot)
 */
export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Get base name without extension
 */
export function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
}

/**
 * Determine media type from file extension
 */
export function getMediaType(filename: string): MediaType {
  const ext = getExtension(filename);

  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (SUBTITLE_EXTENSIONS.has(ext)) return 'subtitle';
  if (DUBBING_EXTENSIONS.has(ext)) return 'dubbing';
  return 'other';
}

/**
 * Check if file is a video
 */
export function isVideo(filename: string): boolean {
  return getMediaType(filename) === 'video';
}

/**
 * Check if file is a subtitle
 */
export function isSubtitle(filename: string): boolean {
  return getMediaType(filename) === 'subtitle';
}

/**
 * Check if file is a dubbing/audio file
 */
export function isDubbing(filename: string): boolean {
  return getMediaType(filename) === 'dubbing';
}

/**
 * Extract language code from subtitle filename
 * Examples: "movie.Fa.srt" -> "Fa", "movie.English.ass" -> "English"
 */
export function extractLanguage(filename: string): string | undefined {
  const baseName = getBaseName(filename);
  // Common patterns: .Fa., .En., .English., .Persian., etc.
  const langMatch = baseName.match(/\.[\s]*(Fa|En|Ar|Fr|De|Es|It|Pt|Ru|Tr|Ja|Ko|Zh)[\s]*\.?/i);
  if (langMatch) {
    return langMatch[1];
  }

  // Full language names
  const fullLangMatch = baseName.match(
    /\.(English|Persian|Arabic|French|German|Spanish|Italian|Portuguese|Russian|Turkish|Japanese|Korean|Chinese)\./i
  );
  if (fullLangMatch) {
    return fullLangMatch[1];
  }

  return undefined;
}

/**
 * Classify a single file
 */
export function classifyFile(file: FileEntry): ClassifiedFile {
  const mediaType = getMediaType(file.name);
  const language = mediaType === 'subtitle' ? extractLanguage(file.name) : undefined;

  return {
    ...file,
    mediaType,
    language,
  };
}

/**
 * Classify multiple files into categories
 */
export function classifyFiles(files: FileEntry[]): ClassificationResult {
  const classified = files.map(classifyFile);

  return {
    videos: classified.filter((f) => f.mediaType === 'video'),
    subtitles: classified.filter((f) => f.mediaType === 'subtitle'),
    dubs: classified.filter((f) => f.mediaType === 'dubbing'),
    others: classified.filter((f) => f.mediaType === 'other'),
  };
}

/**
 * Get human-readable label for media type
 * Note: This returns keys that should be looked up in translations
 */
export function getMediaTypeLabelKey(type: MediaType): string {
  const keys: Record<MediaType, string> = {
    video: 'video',
    subtitle: 'subtitle',
    dubbing: 'dubbing',
    other: 'other',
  };
  return keys[type];
}

/**
 * @deprecated Use getMediaTypeLabelKey with i18n instead
 */
export function getMediaTypeLabel(type: MediaType): string {
  const labels: Record<MediaType, string> = {
    video: 'ویدیو',
    subtitle: 'زیرنویس',
    dubbing: 'دوبله',
    other: 'سایر',
  };
  return labels[type];
}

/**
 * Get color for media type (for UI)
 */
export function getMediaTypeColor(type: MediaType): string {
  const colors: Record<MediaType, string> = {
    video: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    subtitle: 'bg-green-500/10 text-green-600 border-green-500/20',
    dubbing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[type];
}

/**
 * Get icon color for media type
 */
export function getMediaTypeIconColor(type: MediaType): string {
  const colors: Record<MediaType, string> = {
    video: 'text-blue-500',
    subtitle: 'text-green-500',
    dubbing: 'text-amber-500',
    other: 'text-gray-500',
  };
  return colors[type];
}
