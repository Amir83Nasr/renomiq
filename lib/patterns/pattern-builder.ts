/**
 * Pattern builder utilities
 * Helps users create custom naming patterns
 */

import type { NamingPattern, SeriesMetadata, FileGroup } from '@/types/series';
import {
  buildFilenameFromPattern,
  PREDEFINED_PATTERNS,
  createCustomPattern,
} from './series-patterns';
import { extractEpisodeInfo } from '../episode-extractor';
import { classifyFile } from '../file-classifier';

/**
 * Pattern builder state
 */
export interface PatternBuilderState {
  selectedPatternId: string | null;
  customTemplate: string;
  metadata: SeriesMetadata;
}

/**
 * Initial pattern builder state
 */
export function createInitialPatternBuilderState(): PatternBuilderState {
  return {
    selectedPatternId: PREDEFINED_PATTERNS[0]?.id ?? null,
    customTemplate: '{series} - S{season}E{episode}',
    metadata: {
      name: '',
      season: 1,
      startEpisode: 1,
      pattern: PREDEFINED_PATTERNS[0]?.template ?? '{series} - S{season}E{episode}',
    },
  };
}

/**
 * Get the active template from state
 */
export function getActiveTemplate(state: PatternBuilderState): string {
  if (state.selectedPatternId === 'custom') {
    return state.customTemplate;
  }

  const pattern = PREDEFINED_PATTERNS.find((p) => p.id === state.selectedPatternId);
  return pattern?.template ?? state.customTemplate;
}

/**
 * Build preview for all file groups
 */
export interface PatternPreviewResult {
  groupId: string;
  originalVideoName: string;
  newVideoName: string;
  subtitlePreviews: { original: string; new: string }[];
  dubPreviews: { original: string; new: string }[];
  hasConflict: boolean;
}

export function buildPatternPreview(
  fileGroups: FileGroup[],
  metadata: SeriesMetadata
): PatternPreviewResult[] {
  const results: PatternPreviewResult[] = [];
  const usedNames = new Set<string>();

  for (const group of fileGroups) {
    const episodeNum = group.episodeInfo.episode;
    const adjustedMetadata: SeriesMetadata = {
      ...metadata,
      // If we're renumbering, calculate new episode number
      // Otherwise keep original
    };

    // Build new video name
    const videoPreview = buildFilenameFromPattern(
      metadata.pattern,
      adjustedMetadata,
      group.episodeInfo,
      group.videoFile
    );

    // Build subtitle previews
    const subtitlePreviews = group.subtitleFiles.map((sub) => ({
      original: sub.name,
      new: buildFilenameFromPattern(metadata.pattern, adjustedMetadata, group.episodeInfo, sub),
    }));

    // Build dub previews
    const dubPreviews = group.dubbingFiles.map((dub) => ({
      original: dub.name,
      new: buildFilenameFromPattern(metadata.pattern, adjustedMetadata, group.episodeInfo, dub),
    }));

    // Check for conflicts
    const hasConflict = usedNames.has(videoPreview.toLowerCase());
    usedNames.add(videoPreview.toLowerCase());

    results.push({
      groupId: group.id,
      originalVideoName: group.videoFile.name,
      newVideoName: videoPreview,
      subtitlePreviews,
      dubPreviews,
      hasConflict,
    });
  }

  return results;
}

/**
 * Detect series metadata from file groups
 */
export function detectMetadataFromGroups(fileGroups: FileGroup[]): Partial<SeriesMetadata> {
  if (fileGroups.length === 0) {
    return {
      season: 1,
      startEpisode: 1,
    };
  }

  // Detect series name from first video
  const firstVideo = fileGroups[0]?.videoFile;
  if (!firstVideo) {
    return { season: 1, startEpisode: 1 };
  }

  // Extract series name
  const baseName = firstVideo.name.replace(/\.[^.]+$/, '');
  const seriesName = baseName
    .replace(/[Ss]\d{1,2}[Ee]\d{1,3}/, '')
    .replace(/\d{1,2}[xX]\d{1,3}/, '')
    .replace(/[._\-]+$/, '')
    .replace(/[._]/g, ' ')
    .trim();

  // Detect season from episode info
  const seasons = fileGroups
    .map((g) => g.episodeInfo.season)
    .filter((s): s is number => s !== undefined);

  const season = seasons.length > 0 ? Math.min(...seasons) : 1;

  // Detect start episode
  const episodes = fileGroups.map((g) => g.episodeInfo.episode);
  const startEpisode = episodes.length > 0 ? Math.min(...episodes) : 1;

  return {
    name: seriesName,
    season,
    startEpisode,
  };
}

/**
 * Apply renumbering to episodes
 */
export function applyRenumbering(fileGroups: FileGroup[], startEpisode: number): FileGroup[] {
  const sortedGroups = [...fileGroups].sort((a, b) => {
    return a.episodeInfo.episode - b.episodeInfo.episode;
  });

  return sortedGroups.map((group, index) => ({
    ...group,
    episodeInfo: {
      ...group.episodeInfo,
      episode: startEpisode + index,
    },
  }));
}

/**
 * Pattern suggestions based on detected content
 */
export function suggestPatterns(fileGroups: FileGroup[]): NamingPattern[] {
  if (fileGroups.length === 0) return PREDEFINED_PATTERNS.slice(0, 3);

  // Check if files have season info
  const hasSeasonInfo = fileGroups.some((g) => g.episodeInfo.season !== undefined);

  if (hasSeasonInfo) {
    // Suggest SxE patterns
    return PREDEFINED_PATTERNS.filter((p) => p.id.includes('sxe') || p.id === 'xsep');
  }

  // Suggest simpler patterns
  return PREDEFINED_PATTERNS.filter(
    (p) => p.id === 'episode-only' || p.id === 'simple' || p.id === 'persian'
  );
}

// Re-exports for convenience
export { PREDEFINED_PATTERNS, createCustomPattern, buildFilenameFromPattern };
