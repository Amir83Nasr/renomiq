/**
 * File type badge component
 * Shows colored badge for video/subtitle/dubbing file types
 */

import { Video, Subtitles, Music, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMediaTypeLabel, getMediaTypeColor } from '@/lib/file-classifier';
import type { MediaType } from '@/types/series';

interface FileTypeBadgeProps {
  type: MediaType;
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const iconMap = {
  video: Video,
  subtitle: Subtitles,
  dubbing: Music,
  other: File,
};

export function FileTypeBadge({
  type,
  showLabel = true,
  showIcon = true,
  className = '',
}: FileTypeBadgeProps) {
  const Icon = iconMap[type];
  const label = getMediaTypeLabel(type);
  const colorClass = getMediaTypeColor(type);

  return (
    <Badge variant="outline" className={`gap-1 font-normal ${colorClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}
