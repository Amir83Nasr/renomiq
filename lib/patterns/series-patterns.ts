/**
 * Predefined naming patterns for series files
 */

import type { NamingPattern, SeriesMetadata, EpisodeInfo, ClassifiedFile } from '@/types/series';
import { formatSxE, formatXSep, padEpisode } from '../episode-extractor';

/**
 * Available predefined patterns
 * Labels are translation keys
 */
export const PREDEFINED_PATTERNS: NamingPattern[] = [
  {
    id: 'sxe-dash',
    label: 'pattern_sxe_dash',
    template: '{series} - S{season}E{episode}',
  },
  {
    id: 'sxe-dot',
    label: 'pattern_sxe_dot',
    template: '{series}.S{season}E{episode}',
  },
  {
    id: 'sxe-space',
    label: 'pattern_sxe_space',
    template: '{series} S{season}E{episode}',
  },
  {
    id: 'xsep',
    label: 'pattern_xsep',
    template: '{series} - {season}x{episode}',
  },
  {
    id: 'episode-only',
    label: 'pattern_episode_only',
    template: '{series} - E{episode}',
  },
  {
    id: 'persian',
    label: 'pattern_persian',
    template: '{series} - قسمت {episode}',
  },
  {
    id: 'simple',
    label: 'pattern_simple',
    template: '{series} {episode}',
  },
];

/**
 * Pattern placeholder definitions
 */
export const PATTERN_PLACEHOLDERS = {
  series: {
    label: 'نام سریال',
    description: 'نام سریال (مثال: Breaking Bad)',
  },
  season: {
    label: 'شماره فصل',
    description: 'شماره فصل با 2 رقم (01, 02, ...)',
  },
  episode: {
    label: 'شماره قسمت',
    description: 'شماره قسمت با صفرهای ابتدایی',
  },
  sxe: {
    label: 'S01E05',
    description: 'فرمت کامل S01E05',
  },
  xsep: {
    label: '1x05',
    description: 'فرمت 1x05',
  },
} as const;

/**
 * Build a filename from a pattern template
 */
export function buildFilenameFromPattern(
  template: string,
  metadata: SeriesMetadata,
  episodeInfo: EpisodeInfo,
  originalFile: ClassifiedFile
): string {
  let result = template;

  // Replace series name
  result = result.replace(/\{series\}/g, metadata.name);

  // Replace season
  const seasonStr = String(metadata.season).padStart(2, '0');
  result = result.replace(/\{season\}/g, seasonStr);

  // Replace episode
  const episodeNum = episodeInfo.episode;
  const episodeStr = padEpisode(episodeNum, 2);
  result = result.replace(/\{episode\}/g, episodeStr);

  // Replace SxE format
  const sxe = formatSxE(metadata.season, episodeNum);
  result = result.replace(/\{sxe\}/g, sxe);

  // Replace xSep format
  const xsep = formatXSep(metadata.season, episodeNum);
  result = result.replace(/\{xsep\}/g, xsep);

  // Add extension
  const ext = originalFile.extension;
  if (ext) {
    // Preserve language code for subtitles
    if (originalFile.mediaType === 'subtitle' && originalFile.language) {
      result = `${result}.${originalFile.language}.${ext}`;
    } else {
      result = `${result}.${ext}`;
    }
  }

  return result;
}

/**
 * Get pattern by ID
 */
export function getPatternById(id: string): NamingPattern | undefined {
  return PREDEFINED_PATTERNS.find((p) => p.id === id);
}

/**
 * Validate a custom pattern template
 * Returns error message if invalid, null if valid
 */
export function validatePatternTemplate(template: string): string | null {
  if (!template.trim()) {
    return 'الگو نمی‌تواند خالی باشد';
  }

  // Check for invalid characters
  const invalidChars = /[<>:"\\|?*]/;
  if (invalidChars.test(template)) {
    return 'الگو حاوی کاراکترهای غیرمجاز است';
  }

  // Check for at least one placeholder
  const hasPlaceholder = /\{[^}]+\}/.test(template);
  if (!hasPlaceholder) {
    return 'الگو باید حداقل یک placeholder داشته باشد (مثال: {series})';
  }

  return null;
}

/**
 * Extract placeholders from a template
 */
export function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Preview pattern result for a single file
 */
export function previewPattern(
  template: string,
  metadata: SeriesMetadata,
  episodeInfo: EpisodeInfo,
  originalFile: ClassifiedFile
): string {
  return buildFilenameFromPattern(template, metadata, episodeInfo, originalFile);
}

/**
 * Create a custom pattern
 */
export function createCustomPattern(label: string, template: string): NamingPattern {
  return {
    id: `custom-${Date.now()}`,
    label,
    template,
    isCustom: true,
  };
}
