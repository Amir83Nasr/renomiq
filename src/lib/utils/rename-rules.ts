export type {
  FileEntry,
  RenameRule,
  PreviewRow,
  RenamePair,
  ApplyResult,
  RenameOptions,
} from '@/types';

import type { RenameRule, RenameOptions, FileEntry, PreviewRow, SeriesOptions } from '@/types';

export interface ExtendedRenameOptions extends RenameOptions {
  series?: SeriesOptions;
}

export function applyRenameRules(opts: ExtendedRenameOptions): RenameRule[] {
  const rules: RenameRule[] = [];

  // Complete rename has priority over other rules
  if (opts.newName && opts.newName.trim()) {
    rules.push({
      type: 'rename',
      newName: opts.newName.trim(),
      keepExtension: opts.keepExtension ?? true,
    });
  }

  if (opts.search) {
    rules.push({
      type: 'search-replace',
      search: opts.search,
      replace: opts.replace,
    });
  }
  if (opts.prefix) {
    rules.push({ type: 'prefix', value: opts.prefix });
  }
  if (opts.suffix) {
    rules.push({ type: 'suffix', value: opts.suffix });
  }
  if (opts.numbering) {
    rules.push({ type: 'numbering', width: opts.numberWidth });
  }
  if (opts.series?.enabled) {
    rules.push({
      type: 'series',
      seriesName: opts.series.seriesName,
      includeSeason: opts.series.includeSeason,
      useExistingEpisodeNumbers: opts.series.useExistingEpisodeNumbers,
      seasonNumber: opts.series.seasonNumber,
      startEpisode: opts.series.startEpisode,
      seasonPrefix: opts.series.seasonPrefix,
      episodePrefix: opts.series.episodePrefix,
      seasonNumberWidth: opts.series.seasonNumberWidth,
      episodeNumberWidth: opts.series.episodeNumberWidth,
    });
  }
  return rules;
}

function padNumber(value: number, width?: number): string {
  if (!width || width <= 1) {
    return String(value);
  }
  return String(value).padStart(width, '0');
}

// Common patterns for episode numbers in filenames
// Ordered by priority - more specific patterns first
const EPISODE_PATTERNS = [
  // Episode X, Ep X, E X (with various separators including space)
  /(?:episode|ep|e)[\s._-]+(\d{1,3})/i,
  // 1x05 (season x episode format - capture episode part)
  /\d+x(\d{1,3})(?:\s|$|[^\d])/i,
  // S01E05 (season episode format - capture episode part)
  /s\d+[e\s](\d{1,3})(?:\s|$|[^\d])/i,
  // Numbers surrounded by brackets/parentheses: (05), [05], {05}
  /[\[{(](\d{1,3})[\]})]/,
  // Standalone numbers at the end: "file 05" or "file_05"
  /[\s._-](\d{1,3})(?:\s*$|\s*[^\d])/,
  // Numbers with "part" prefix: part 5, pt 3
  /(?:part|pt)[\s._-]+(\d{1,3})/i,
  // Any standalone 1-3 digit number surrounded by non-digits (as last resort)
  /[^\d](\d{1,3})[^\d]/,
];

/**
 * Extract episode number from filename
 * Returns null if no episode number found
 *
 * Examples:
 *   "Name ep 12.mp4" -> 12
 *   "Name episode 5.mp4" -> 5
 *   "S01E05.mp4" -> 5
 *   "1x10.mp4" -> 10
 *   "Show [05].mp4" -> 5
 */
export function extractEpisodeNumber(filename: string): number | null {
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension

  // Add spaces at beginning and end to help with pattern matching
  const paddedName = ` ${baseName} `;

  for (const pattern of EPISODE_PATTERNS) {
    const match = paddedName.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num <= 999) {
        // Reasonable range for episodes (1-999)
        return num;
      }
    }
  }
  return null;
}

function applyRulesToBaseName(
  base: string,
  rules: RenameRule[],
  index: number,
  originalFileName?: string
): string {
  let name = base;
  let hasRenameRule = false;
  let renameBase = '';

  // First pass: check for complete rename rule
  for (const rule of rules) {
    if (rule.type === 'rename' && rule.newName) {
      hasRenameRule = true;
      renameBase = rule.newName;
      break;
    }
  }

  // If there's a rename rule, start from the new name
  if (hasRenameRule) {
    name = renameBase;
  }

  // Apply other rules
  for (const rule of rules) {
    switch (rule.type) {
      case 'search-replace': {
        if (rule.search) {
          name = name.split(rule.search).join(rule.replace);
        }
        break;
      }
      case 'prefix': {
        name = `${rule.value}${name}`;
        break;
      }
      case 'suffix': {
        name = `${name}${rule.value}`;
        break;
      }
      case 'numbering': {
        const displayIndex = index + 1;
        name = `${name}_${padNumber(displayIndex, rule.width)}`;
        break;
      }
      case 'series': {
        const seriesName = rule.seriesName?.trim() || '';
        const includeSeason = rule.includeSeason ?? true;
        const useExistingEpisodeNumbers = rule.useExistingEpisodeNumbers ?? false;
        const season = rule.seasonNumber ?? 1;
        const seasonWidth = rule.seasonNumberWidth ?? 2;
        const episodeWidth = rule.episodeNumberWidth ?? 2;

        // Determine episode number
        let episode: number;
        if (useExistingEpisodeNumbers && originalFileName) {
          // Try to extract episode number from original filename
          const extractedEpisode = extractEpisodeNumber(originalFileName);
          episode = extractedEpisode ?? rule.startEpisode ?? 1;
        } else {
          // Use sequential numbering starting from startEpisode
          episode = (rule.startEpisode ?? 1) + index;
        }

        // Build season part (if enabled)
        let seasonStr = '';
        if (includeSeason) {
          seasonStr =
            rule.seasonPrefix === 'Season'
              ? `Season ${season}`
              : `S${padNumber(season, seasonWidth)}`;
        }

        // Build episode part
        const episodeStr =
          rule.episodePrefix === 'Episode'
            ? `Episode ${episode}`
            : `E${padNumber(episode, episodeWidth)}`;

        // Combine: SeriesName Season Episode
        const parts = [seriesName, seasonStr, episodeStr].filter((p) => p.length > 0);
        name = parts.join(' ');
        break;
      }
    }
  }

  return name;
}

export function buildPreview(files: FileEntry[], rules: RenameRule[]): PreviewRow[] {
  const result: PreviewRow[] = [];

  const targetNames = new Map<string, number>();

  files.forEach((file, index) => {
    const dotIndex = file.name.lastIndexOf('.');
    // Handle dotfiles correctly: if dot is at position 0, it's a dotfile with no extension
    const base = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
    const ext = dotIndex > 0 ? file.name.slice(dotIndex) : '';

    const newBase = rules.length ? applyRulesToBaseName(base, rules, index, file.name) : base;

    const newName = `${newBase}${ext}`;
    const changed = newName !== file.name;
    const newPath = changed ? file.path.replace(/[^/]+$/, newName) : file.path;

    result.push({
      path: file.path,
      oldName: file.name,
      newName: changed ? newName : null,
      newPath: changed ? newPath : null,
      changed,
      conflict: false,
    });

    {
      targetNames.set(newPath, (targetNames.get(newPath) ?? 0) + 1);
    }
  });

  // mark conflicts
  for (const row of result) {
    if (row.newPath && (targetNames.get(row.newPath) ?? 0) > 1) {
      row.conflict = true;
    }
  }

  return result;
}
