/**
 * File matching utilities
 * Finds related files (subtitles, dubs) for a video file
 */

import type { FileEntry } from '@/types';
import type { ClassifiedFile, RelatedFilesMatch, EpisodeInfo } from '@/types/series';
import { getBaseName, classifyFiles, getExtension, extractLanguage } from './file-classifier';
import { extractEpisodeInfo } from './episode-extractor';

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance algorithm
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[._-]/g, ' ').trim();
  const s2 = str2.toLowerCase().replace(/[._-]/g, ' ').trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - distance / maxLength;
}

/**
 * Normalize filename for comparison
 * Removes common variations and normalizes separators
 */
export function normalizeForComparison(filename: string): string {
  return getBaseName(filename)
    .toLowerCase()
    .replace(/[._\-\s]+/g, ' ')
    .replace(/\[[^\]]*\]/g, '') // Remove [tags]
    .replace(/\([^)]*\)/g, '') // Remove (tags)
    .replace(/\d{3,4}p/g, '') // Remove resolution
    .replace(/x\d{3,4}/g, '') // Remove dimensions
    .replace(/(bluray|web.?dl|hdrip|dvdrip|webrip|hdtv)/gi, '')
    .replace(/(aac|ac3|dts|x264|x265|hevc|h264|h265)/gi, '')
    .replace(/\b(fa|en|ar|fr|de|es|it|pt|ru|tr)\b/gi, '') // Remove language codes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two files are likely related
 * Compares normalized names and episode info
 */
export function areFilesRelated(
  videoFile: ClassifiedFile,
  otherFile: ClassifiedFile,
  minSimilarity: number = 0.6
): boolean {
  // Extract episode info from both
  const videoEpisode = extractEpisodeInfo(videoFile.name);
  const otherEpisode = extractEpisodeInfo(otherFile.name);

  // If both have episode info, they should match
  if (videoEpisode && otherEpisode) {
    if (videoEpisode.episode === otherEpisode.episode) {
      return true;
    }
  }

  // Otherwise, use name similarity
  const videoNorm = normalizeForComparison(videoFile.name);
  const otherNorm = normalizeForComparison(otherFile.name);

  // Quick check: if normalized names are very similar
  const similarity = calculateSimilarity(videoNorm, otherNorm);

  return similarity >= minSimilarity;
}

/**
 * Find all related files for a video
 */
export function findRelatedFiles(
  videoFile: ClassifiedFile,
  allFiles: ClassifiedFile[],
  minSimilarity: number = 0.6
): { subtitles: ClassifiedFile[]; dubs: ClassifiedFile[] } {
  const subtitles: ClassifiedFile[] = [];
  const dubs: ClassifiedFile[] = [];

  for (const file of allFiles) {
    if (file.path === videoFile.path) continue;

    if (areFilesRelated(videoFile, file, minSimilarity)) {
      if (file.mediaType === 'subtitle') {
        subtitles.push(file);
      } else if (file.mediaType === 'dubbing') {
        dubs.push(file);
      }
    }
  }

  return { subtitles, dubs };
}

/**
 * Group all files by their related video
 */
export function groupFilesByVideo(
  files: FileEntry[],
  minSimilarity: number = 0.6
): Map<string, RelatedFilesMatch> {
  const classified = classifyFiles(files);
  const groups = new Map<string, RelatedFilesMatch>();
  const matchedFiles = new Set<string>();

  // Sort videos by episode number for consistent ordering
  const sortedVideos = [...classified.videos].sort((a, b) => {
    const infoA = extractEpisodeInfo(a.name);
    const infoB = extractEpisodeInfo(b.name);
    if (infoA && infoB) return infoA.episode - infoB.episode;
    return a.name.localeCompare(b.name);
  });

  for (const video of sortedVideos) {
    const { subtitles, dubs } = findRelatedFiles(
      video,
      [...classified.subtitles, ...classified.dubs],
      minSimilarity
    );

    // Mark files as matched
    for (const s of subtitles) matchedFiles.add(s.path);
    for (const d of dubs) matchedFiles.add(d.path);

    groups.set(video.path, {
      video,
      subtitles,
      dubs,
      confidence: calculateMatchConfidence(video, subtitles, dubs),
    });
  }

  // Handle unmatched subtitles - try to match by episode number only
  for (const subtitle of classified.subtitles) {
    if (matchedFiles.has(subtitle.path)) continue;

    const subEpisode = extractEpisodeInfo(subtitle.name);
    if (!subEpisode) continue;

    // Find a video with matching episode
    for (const [videoPath, group] of groups) {
      const videoEpisode = extractEpisodeInfo(group.video.name);
      if (videoEpisode && videoEpisode.episode === subEpisode.episode) {
        group.subtitles.push(subtitle);
        matchedFiles.add(subtitle.path);
        break;
      }
    }
  }

  // Handle unmatched dubs similarly
  for (const dub of classified.dubs) {
    if (matchedFiles.has(dub.path)) continue;

    const dubEpisode = extractEpisodeInfo(dub.name);
    if (!dubEpisode) continue;

    for (const [videoPath, group] of groups) {
      const videoEpisode = extractEpisodeInfo(group.video.name);
      if (videoEpisode && videoEpisode.episode === dubEpisode.episode) {
        group.dubs.push(dub);
        matchedFiles.add(dub.path);
        break;
      }
    }
  }

  return groups;
}

/**
 * Calculate confidence score for a match
 */
function calculateMatchConfidence(
  video: ClassifiedFile,
  subtitles: ClassifiedFile[],
  dubs: ClassifiedFile[]
): number {
  let score = 0.5; // Base score

  // Higher confidence if we have matching episode numbers
  const videoEpisode = extractEpisodeInfo(video.name);
  if (videoEpisode) {
    const matchingSubs = subtitles.filter((s) => {
      const se = extractEpisodeInfo(s.name);
      return se && se.episode === videoEpisode.episode;
    }).length;

    const matchingDubs = dubs.filter((d) => {
      const de = extractEpisodeInfo(d.name);
      return de && de.episode === videoEpisode.episode;
    }).length;

    if (matchingSubs > 0 || matchingDubs > 0) {
      score += 0.3;
    }
  }

  // Bonus for having related files
  if (subtitles.length > 0) score += 0.1;
  if (dubs.length > 0) score += 0.1;

  return Math.min(score, 1);
}

/**
 * Generate a unique ID for a file group
 */
export function generateGroupId(videoPath: string, episode?: number): string {
  if (episode !== undefined) {
    return `ep-${episode}`;
  }
  // Use last part of path as fallback
  const parts = videoPath.split('/');
  return parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '_');
}
