/**
 * Episode information extraction from filenames
 * Detects S01E05, 1x05, Episode 5, etc.
 */

import type { EpisodeInfo } from '@/types/series';
import { getBaseName } from './file-classifier';

/**
 * Patterns for episode extraction
 * Each pattern has a regex and group indices for season/episode
 */
const EPISODE_PATTERNS: Array<{
  regex: RegExp;
  seasonGroup?: number;
  episodeGroup: number;
  type: EpisodeInfo['patternType'];
}> = [
  // S01E05, s01e05, S1E5, etc.
  { regex: /[Ss](\d{1,2})[Ee](\d{1,3})/, seasonGroup: 1, episodeGroup: 2, type: 'sxe' },

  // 1x05, 01x05, 1x5, etc.
  { regex: /(\d{1,2})[xX](\d{1,3})/, seasonGroup: 1, episodeGroup: 2, type: 'xsep' },

  // Episode 5, Ep 5, Ep.5, etc.
  { regex: /[Ee]p?(?:isode)?[\s.]*(\d{1,3})/, episodeGroup: 1, type: 'episode' },

  // E05, e05
  { regex: /\b[Ee](\d{1,3})\b/, episodeGroup: 1, type: 'episode' },

  // Season 1 Episode 5
  {
    regex: /[Ss]eason\s*(\d{1,2}).*?[Ee]p(?:isode)?\s*(\d{1,3})/,
    seasonGroup: 1,
    episodeGroup: 2,
    type: 'sxe',
  },

  // Part 5, Pt 5
  { regex: /[Pp](?:art|t)[\s.]*(\d{1,3})/, episodeGroup: 1, type: 'episode' },

  // Chapter 5
  { regex: /[Cc]hapter[\s.]*(\d{1,3})/, episodeGroup: 1, type: 'episode' },
];

/**
 * Extract episode information from filename
 * Returns null if no pattern matches
 */
export function extractEpisodeInfo(filename: string): EpisodeInfo | null {
  const baseName = getBaseName(filename);

  for (const pattern of EPISODE_PATTERNS) {
    const match = baseName.match(pattern.regex);
    if (match) {
      const season = pattern.seasonGroup ? parseInt(match[pattern.seasonGroup], 10) : undefined;
      const episode = parseInt(match[pattern.episodeGroup], 10);

      // Validate episode number (should be reasonable)
      if (episode > 0 && episode < 1000) {
        return {
          season,
          episode,
          rawMatch: match[0],
          patternType: pattern.type,
        };
      }
    }
  }

  return null;
}

/**
 * Extract episode number with fallback to position
 * If no pattern matches, returns episode as position in list
 */
export function extractEpisodeInfoWithFallback(filename: string, position: number): EpisodeInfo {
  const extracted = extractEpisodeInfo(filename);
  if (extracted) {
    return extracted;
  }

  return {
    episode: position + 1,
    rawMatch: String(position + 1),
    patternType: 'number',
  };
}

/**
 * Format season/episode to S01E05 format
 */
export function formatSxE(season: number | undefined, episode: number): string {
  const s = season !== undefined ? String(season).padStart(2, '0') : '';
  const e = String(episode).padStart(2, '0');
  return s ? `S${s}E${e}` : `E${e}`;
}

/**
 * Format to 1x05 format
 */
export function formatXSep(season: number | undefined, episode: number): string {
  const s = season !== undefined ? String(season) : '';
  const e = String(episode).padStart(2, '0');
  return s ? `${s}x${e}` : `${e}`;
}

/**
 * Pad episode number with leading zeros
 */
export function padEpisode(episode: number, width: number = 2): string {
  return String(episode).padStart(width, '0');
}

/**
 * Detect if multiple files are from the same series
 * by checking for common patterns in their names
 */
export function detectSeriesName(filenames: string[]): string | null {
  if (filenames.length === 0) return null;
  if (filenames.length === 1) {
    // Try to extract series name from single file
    const baseName = getBaseName(filenames[0]);
    // Remove episode patterns and common suffixes
    const cleaned = baseName
      .replace(/[Ss]\d{1,2}[Ee]\d{1,3}/, '')
      .replace(/\d{1,2}[xX]\d{1,3}/, '')
      .replace(/[Ee]p?(?:isode)?[\s.]*\d{1,3}/, '')
      .replace(/\d{4}p/, '') // 1080p, 720p
      .replace(/\d{3,4}x\d{3,4}/, '') // resolution
      .replace(/\[[^\]]+\]/g, '') // [tag]
      .replace(/\([^)]+\)/g, '') // (tag)
      .replace(/[._-]+/g, ' ')
      .trim();

    return cleaned || null;
  }

  // Find common prefix among multiple files
  const baseNames = filenames.map(getBaseName);
  let commonPrefix = baseNames[0];

  for (let i = 1; i < baseNames.length; i++) {
    while (!baseNames[i].toLowerCase().startsWith(commonPrefix.toLowerCase())) {
      commonPrefix = commonPrefix.slice(0, -1);
      if (commonPrefix.length === 0) break;
    }
  }

  // Clean up the common prefix
  const cleaned = commonPrefix
    .replace(/[._-]+$/, '')
    .replace(/[._-]/g, ' ')
    .trim();

  return cleaned || null;
}

/**
 * Detect season number from multiple files
 * Returns the most common season number or 1 as default
 */
export function detectSeason(filenames: string[]): number {
  const seasons: number[] = [];

  for (const filename of filenames) {
    const info = extractEpisodeInfo(filename);
    if (info?.season !== undefined) {
      seasons.push(info.season);
    }
  }

  if (seasons.length === 0) return 1;

  // Return most common season
  const counts = new Map<number, number>();
  for (const s of seasons) {
    counts.set(s, (counts.get(s) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommon = 1;
  for (const [season, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = season;
    }
  }

  return mostCommon;
}

/**
 * Sort files by episode number
 * Files without episode info are sorted by name
 */
export function sortFilesByEpisode<T extends { name: string }>(files: T[]): T[] {
  return [...files].sort((a, b) => {
    const infoA = extractEpisodeInfo(a.name);
    const infoB = extractEpisodeInfo(b.name);

    // If both have episode info, sort by episode
    if (infoA && infoB) {
      // First by season
      if (infoA.season !== undefined && infoB.season !== undefined) {
        if (infoA.season !== infoB.season) {
          return infoA.season - infoB.season;
        }
      }
      // Then by episode
      return infoA.episode - infoB.episode;
    }

    // If only one has episode info, it comes first
    if (infoA && !infoB) return -1;
    if (!infoA && infoB) return 1;

    // Neither has episode info, sort by name
    return a.name.localeCompare(b.name);
  });
}
