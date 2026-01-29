/**
 * File group card component
 * Shows a video file with its related subtitles and dubs
 * Expandable/collapsible with animation
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Video, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileTypeBadge } from './FileTypeBadge';
import { getMediaTypeIconColor } from '@/lib/file-classifier';
import type { FileGroup, MediaType } from '@/types/series';

interface FileGroupCardProps {
  group: FileGroup;
  previewNames: Map<string, string>;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  className?: string;
}

interface FileRowProps {
  name: string;
  newName: string | null;
  type: MediaType;
  hasChange: boolean;
  language?: string;
}

function FileRow({ name, newName, type, hasChange, language }: FileRowProps) {
  const iconColor = getMediaTypeIconColor(type);

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 text-sm border-b last:border-b-0 border-border/50">
      <div className={`${iconColor} shrink-0`}>
        {type === 'video' && <Video className="h-4 w-4" />}
        {type === 'subtitle' && <span className="text-xs font-medium">CC</span>}
        {type === 'dubbing' && <span className="text-xs font-medium">♪</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="truncate text-muted-foreground line-through text-xs">{name}</div>
        {hasChange && newName && (
          <div className="truncate font-medium text-foreground">{newName}</div>
        )}
      </div>

      {language && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
          {language}
        </Badge>
      )}

      {hasChange && <Check className="h-4 w-4 text-green-500 shrink-0" />}
    </div>
  );
}

export function FileGroupCard({
  group,
  previewNames,
  isSelected,
  onSelectChange,
  className = '',
}: FileGroupCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const videoNewName = previewNames.get(group.videoFile.path) || null;
  const videoHasChange = videoNewName !== null && videoNewName !== group.videoFile.name;

  const subtitleCount = group.subtitleFiles.length;
  const dubCount = group.dubbingFiles.length;

  return (
    <Card
      className={`overflow-hidden ${className} ${group.hasConflict ? 'border-destructive' : ''}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-3 space-y-0">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                onSelectChange(checked === true)
              }
              className="shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileTypeBadge type="video" showLabel={false} />
                <span className="font-medium truncate">
                  {group.episodeInfo.episode > 0 && (
                    <span className="text-muted-foreground mr-1">
                      #{group.episodeInfo.episode}:
                    </span>
                  )}
                  {videoNewName || group.videoFile.name}
                </span>
              </div>

              {(subtitleCount > 0 || dubCount > 0) && (
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {subtitleCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">{subtitleCount}</span> زیرنویس
                    </span>
                  )}
                  {dubCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-amber-500">{dubCount}</span> دوبله
                    </span>
                  )}
                </div>
              )}
            </div>

            {group.hasConflict && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}

            {(subtitleCount > 0 || dubCount > 0) && (
              <CollapsibleTrigger>
                <button className="p-1 hover:bg-muted rounded shrink-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-0 bg-muted/30">
            {group.subtitleFiles.map((sub) => {
              const newName = previewNames.get(sub.path) || null;
              const hasChange = newName !== null && newName !== sub.name;
              return (
                <FileRow
                  key={sub.path}
                  name={sub.name}
                  newName={newName}
                  type="subtitle"
                  hasChange={hasChange}
                  language={sub.language}
                />
              );
            })}

            {group.dubbingFiles.map((dub) => {
              const newName = previewNames.get(dub.path) || null;
              const hasChange = newName !== null && newName !== dub.name;
              return (
                <FileRow
                  key={dub.path}
                  name={dub.name}
                  newName={newName}
                  type="dubbing"
                  hasChange={hasChange}
                />
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
