'use client';

import { useRef, useState, TouchEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, File, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileEntry, PreviewRow } from '@/types';

interface SwipeableFileItemProps {
  file: FileEntry;
  previewRow?: PreviewRow;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onClick?: () => void;
}

export function SwipeableFileItem({
  file,
  previewRow,
  isSelected,
  onSelectionChange,
  onClick,
}: SwipeableFileItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    const maxSwipe = 80;
    setSwipeX(Math.max(-maxSwipe, Math.min(maxSwipe, diff)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 40;
    if (Math.abs(swipeX) > threshold) {
      onSelectionChange(!isSelected);
    }
    setSwipeX(0);
  };

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) {
      return <File className="h-4 w-4 text-blue-500" />;
    }
    if (['srt', 'ass', 'ssa', 'vtt', 'sub'].includes(ext)) {
      return <FileText className="h-4 w-4 text-green-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <File className="h-4 w-4 text-purple-500" />;
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
      return <File className="h-4 w-4 text-orange-500" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (!previewRow) return null;

    if (previewRow.conflict) {
      return (
        <Badge variant="destructive" className="text-[10px] h-5 gap-1">
          <XCircle className="h-3 w-3" />
          Conflict
        </Badge>
      );
    }

    if (!previewRow.changed) {
      return (
        <Badge variant="secondary" className="text-[10px] h-5">
          Unchanged
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-[10px] h-5 bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3" />
        OK
      </Badge>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        !isSelected && 'opacity-60'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Background */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-colors',
          swipeX < -20 ? 'bg-green-500/10' : swipeX > 20 ? 'bg-red-500/10' : 'bg-transparent'
        )}
      >
        {swipeX < -20 && <CheckCircle2 className="h-6 w-6 text-green-500" />}
        {swipeX > 20 && <XCircle className="h-6 w-6 text-red-500" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'relative flex items-center gap-3 p-3 bg-background transition-transform duration-200',
          isDragging && 'shadow-lg'
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onClick={onClick}
      >
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(checked as boolean)}
          className="h-4 w-4 flex-shrink-0"
        />

        {/* File Icon */}
        <div className="flex-shrink-0">{getFileIcon(file.extension)}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono truncate text-muted-foreground">{file.name}</p>
          {previewRow?.newName && previewRow.changed && isSelected && (
            <p className="text-sm font-mono truncate text-primary mt-0.5">→ {previewRow.newName}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">{getStatusBadge()}</div>
      </div>
    </div>
  );
}
