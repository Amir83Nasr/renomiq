/**
 * Series Renamer Section
 * Main section for renaming TV series files with subtitle/dub matching
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { FileService } from '@/lib/services/file-service';
import { DropZone } from '@/components/DropZone';
import { SeriesMetadataForm } from '@/components/SeriesMetadataForm';
import { EpisodePatternEditor } from '@/components/EpisodePatternEditor';
import { FileGroupList } from '@/components/FileGroupList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Sparkles } from 'lucide-react';
import { ConfirmRenameDialog } from '@/components/ConfirmRenameDialog';
import { UndoButton } from '@/components/UndoButton';
import { UndoService } from '@/lib/services/undo-service';

// Utils
import { groupFilesByVideo, generateGroupId } from '@/lib/file-matcher';
import { classifyFiles, classifyFile } from '@/lib/file-classifier';
import {
  extractEpisodeInfo,
  sortFilesByEpisode,
  detectSeriesName,
  detectSeason,
} from '@/lib/episode-extractor';
import {
  buildFilenameFromPattern,
  getActiveTemplate,
  detectMetadataFromGroups,
} from '@/lib/patterns/pattern-builder';
import { PREDEFINED_PATTERNS } from '@/lib/patterns/series-patterns';

// Types
import type { FileEntry, RenamePair } from '@/types';
import type { FileGroup, SeriesMetadata, ClassifiedFile } from '@/types/series';

export function SeriesRenamerSection() {
  // State
  const [folder, setFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File groups
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  // Metadata & Pattern
  const [metadata, setMetadata] = useState<SeriesMetadata>({
    name: '',
    season: 1,
    startEpisode: 1,
    pattern: PREDEFINED_PATTERNS[0]?.template ?? '{series} - S{season}E{episode}',
  });
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    PREDEFINED_PATTERNS[0]?.id ?? 'custom'
  );
  const [customTemplate, setCustomTemplate] = useState<string>('{series} - S{season}E{episode}');

  // Handle files received from DropZone
  const handleFilesReceived = useCallback((receivedFiles: FileEntry[], folderPath: string) => {
    setFiles(receivedFiles);
    setFolder(folderPath);
    setError(null);

    // Process files into groups
    const groups = processFilesIntoGroups(receivedFiles);
    setFileGroups(groups);

    // Select all by default
    setSelectedGroupIds(new Set(groups.map((g) => g.id)));

    // Auto-detect metadata
    const detected = detectMetadataFromGroups(groups);
    if (detected.name || detected.season) {
      setMetadata((prev) => ({
        ...prev,
        name: detected.name || prev.name,
        season: detected.season ?? prev.season,
        startEpisode: detected.startEpisode ?? prev.startEpisode,
      }));
    }
  }, []);

  // Process files into groups
  const processFilesIntoGroups = (fileEntries: FileEntry[]): FileGroup[] => {
    const grouped = groupFilesByVideo(fileEntries);
    const groups: FileGroup[] = [];

    for (const [videoPath, match] of grouped) {
      const episodeInfo = extractEpisodeInfo(match.video.name) || {
        episode: groups.length + 1,
        rawMatch: String(groups.length + 1),
        patternType: 'number',
      };

      groups.push({
        id: generateGroupId(videoPath, episodeInfo.episode),
        episodeInfo,
        videoFile: match.video,
        subtitleFiles: match.subtitles,
        dubbingFiles: match.dubs,
        otherFiles: [],
        previewNames: new Map(),
        hasConflict: false,
        selected: true,
      });
    }

    return sortFilesByEpisode(groups.map((g) => ({ ...g, name: g.videoFile.name })));
  };

  // Calculate preview names
  const previewNames = useMemo(() => {
    const template =
      selectedPatternId === 'custom'
        ? customTemplate
        : (PREDEFINED_PATTERNS.find((p) => p.id === selectedPatternId)?.template ?? customTemplate);

    const names = new Map<string, string>();

    for (const group of fileGroups) {
      // Video file
      const videoName = buildFilenameFromPattern(
        template,
        metadata,
        group.episodeInfo,
        group.videoFile
      );
      names.set(group.videoFile.path, videoName);

      // Subtitle files
      for (const sub of group.subtitleFiles) {
        const subName = buildFilenameFromPattern(template, metadata, group.episodeInfo, sub);
        names.set(sub.path, subName);
      }

      // Dub files
      for (const dub of group.dubbingFiles) {
        const dubName = buildFilenameFromPattern(template, metadata, group.episodeInfo, dub);
        names.set(dub.path, dubName);
      }
    }

    return names;
  }, [fileGroups, metadata, selectedPatternId, customTemplate]);

  // Handle selection changes
  const handleSelectionChange = useCallback((groupId: string, selected: boolean) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedGroupIds(new Set(fileGroups.map((g) => g.id)));
      } else {
        setSelectedGroupIds(new Set());
      }
    },
    [fileGroups]
  );

  // Apply rename
  const handleApplyRename = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const pairs: RenamePair[] = [];

      for (const group of fileGroups) {
        if (!selectedGroupIds.has(group.id)) continue;
        if (group.hasConflict) continue;

        // Video
        const videoNewName = previewNames.get(group.videoFile.path);
        if (videoNewName && videoNewName !== group.videoFile.name) {
          pairs.push({
            from: group.videoFile.path,
            to: group.videoFile.path.replace(group.videoFile.name, videoNewName),
          });
        }

        // Subtitles
        for (const sub of group.subtitleFiles) {
          const subNewName = previewNames.get(sub.path);
          if (subNewName && subNewName !== sub.name) {
            pairs.push({
              from: sub.path,
              to: sub.path.replace(sub.name, subNewName),
            });
          }
        }

        // Dubs
        for (const dub of group.dubbingFiles) {
          const dubNewName = previewNames.get(dub.path);
          if (dubNewName && dubNewName !== dub.name) {
            pairs.push({
              from: dub.path,
              to: dub.path.replace(dub.name, dubNewName),
            });
          }
        }
      }

      if (pairs.length === 0) {
        setError('تغییری برای اعمال وجود ندارد');
        setLoading(false);
        return;
      }

      // Apply in Tauri
      const { TauriService } = await import('@/lib/services/tauri');
      const result = await TauriService.applyRenames(pairs);

      if (!result.success) {
        setError(result.error ?? 'خطا در تغییر نام');
        setLoading(false);
        return;
      }

      // Add to undo history
      const historyEntry = UndoService.createHistoryEntry(
        pairs,
        folder || '',
        `تغییر نام ${pairs.length} فایل`
      );
      UndoService.addToHistory(historyEntry);

      // Show success message
      setSuccessMessage(`${pairs.length} فایل با موفقیت تغییر نام یافت`);

      // Refresh
      if (folder) {
        const entries = await FileService.listFiles(folder);
        handleFilesReceived(entries, folder);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'خطای ناشناخته';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle confirm dialog
  const handleConfirmDialogOpen = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDialogClose = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmDialogConfirm = () => {
    setShowConfirmDialog(false);
    handleApplyRename();
  };

  // Get pairs for confirm dialog
  const getConfirmPairs = (): RenamePair[] => {
    const pairs: RenamePair[] = [];

    for (const group of fileGroups) {
      if (!selectedGroupIds.has(group.id)) continue;
      if (group.hasConflict) continue;

      // Video
      const videoNewName = previewNames.get(group.videoFile.path);
      if (videoNewName && videoNewName !== group.videoFile.name) {
        pairs.push({
          from: group.videoFile.path,
          to: group.videoFile.path.replace(group.videoFile.name, videoNewName),
        });
      }

      // Subtitles
      for (const sub of group.subtitleFiles) {
        const subNewName = previewNames.get(sub.path);
        if (subNewName && subNewName !== sub.name) {
          pairs.push({
            from: sub.path,
            to: sub.path.replace(sub.name, subNewName),
          });
        }
      }

      // Dubs
      for (const dub of group.dubbingFiles) {
        const dubNewName = previewNames.get(dub.path);
        if (dubNewName && dubNewName !== dub.name) {
          pairs.push({
            from: dub.path,
            to: dub.path.replace(dub.name, dubNewName),
          });
        }
      }
    }

    return pairs;
  };

  // Stats
  const stats = useMemo(() => {
    const selectedGroups = fileGroups.filter((g) => selectedGroupIds.has(g.id));
    const totalFiles = selectedGroups.reduce(
      (acc, g) => acc + 1 + g.subtitleFiles.length + g.dubbingFiles.length,
      0
    );
    const conflictCount = selectedGroups.filter((g) => g.hasConflict).length;

    return {
      selectedCount: selectedGroups.length,
      totalFiles,
      conflictCount,
    };
  }, [fileGroups, selectedGroupIds]);

  return (
    <div className="space-y-4">
      <DropZone
        onFilesReceived={handleFilesReceived}
        onLoadingChange={setLoading}
        onError={setError}
      />

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-md text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
          <UndoButton onUndoComplete={() => setSuccessMessage(null)} />
        </div>
      )}

      {folder && (
        <div className="text-xs text-muted-foreground">
          📁 پوشه فعال: <span className="font-mono">{folder}</span>
        </div>
      )}

      {fileGroups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4">
          {/* Left Panel - Settings */}
          <div className="space-y-4">
            <SeriesMetadataForm metadata={metadata} onChange={setMetadata} />

            <EpisodePatternEditor
              selectedPatternId={selectedPatternId}
              customTemplate={customTemplate}
              onPatternChange={setSelectedPatternId}
              onCustomTemplateChange={setCustomTemplate}
            />

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium">خلاصه</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>گروه‌های انتخاب شده:</span>
                    <Badge variant="secondary">{stats.selectedCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>فایل‌های کل:</span>
                    <Badge variant="secondary">{stats.totalFiles}</Badge>
                  </div>
                  {stats.conflictCount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>تداخل‌ها:</span>
                      <Badge variant="destructive">{stats.conflictCount}</Badge>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-4"
                  disabled={loading || stats.selectedCount === 0 || stats.conflictCount > 0}
                  onClick={handleConfirmDialogOpen}
                >
                  {loading ? (
                    'در حال پردازش...'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 ml-2" />
                      اعمال تغییرات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <Card className="flex flex-col">
            <CardContent className="p-4 flex-1">
              <FileGroupList
                groups={fileGroups}
                previewNames={previewNames}
                selectedGroupIds={selectedGroupIds}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmRenameDialog
        open={showConfirmDialog}
        onOpenChange={handleConfirmDialogClose}
        onConfirm={handleConfirmDialogConfirm}
        pairs={getConfirmPairs()}
        loading={loading}
      />
    </div>
  );
}
