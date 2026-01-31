/**
 * Undo Button Component
 * Displays undo functionality with file count and relative time
 */

'use client';

import { useState } from 'react';
import { Undo2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UndoService } from '@/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';
import type { RenameHistoryEntry } from '@/types';

interface UndoButtonProps {
  onUndoComplete?: () => void;
  className?: string;
}

export function UndoButton({ onUndoComplete, className }: UndoButtonProps) {
  const t = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const lastOperation = UndoService.getLastOperation();

  const handleUndo = async () => {
    if (!lastOperation) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await UndoService.undo();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onUndoComplete?.();
        }, 2000);
      } else {
        setError(result.error ?? t('errors.undo_failed'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.undo_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!lastOperation) {
    return null;
  }

  const relativeTime = UndoService.formatRelativeTime(lastOperation.timestamp);
  const fileCount = lastOperation.originalPairs.length;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('common.undo_success')}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleUndo}
        disabled={loading || success}
        className="gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
        <span>{t('common.undo')}</span>
        <span className="text-muted-foreground">({fileCount})</span>
      </Button>

      <span className="text-xs text-muted-foreground">{relativeTime}</span>
    </div>
  );
}
