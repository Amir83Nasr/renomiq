/**
 * Undo Button Component
 * Displays undo functionality with file count and relative time
 */

'use client';

import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UndoService } from '@/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';

interface UndoButtonProps {
  onUndoComplete?: () => void;
  className?: string;
}

export function UndoButton({ onUndoComplete, className }: UndoButtonProps) {
  const t = useI18n();

  const lastOperation = UndoService.getLastOperation();

  const handleUndo = async () => {
    if (!lastOperation) return;

    try {
      const result = await UndoService.undo();

      if (result.success) {
        onUndoComplete?.();
      }
    } catch {
      // Silent error handling
    }
  };

  if (!lastOperation) {
    return null;
  }

  const relativeTime = UndoService.formatRelativeTime(lastOperation.timestamp);
  const fileCount = lastOperation.originalPairs.length;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={handleUndo} className="gap-2">
        <Undo2 className="h-4 w-4" />
        <span>{t('common.undo')}</span>
        <span className="text-muted-foreground">({fileCount})</span>
      </Button>

      <span className="text-xs text-muted-foreground">{relativeTime}</span>
    </div>
  );
}
