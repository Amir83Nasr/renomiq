/**
 * Undo Button Component
 * Displays undo functionality with file count, relative time, and confirmation modal
 */

'use client';

import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UndoService } from '@/services/undo-service';
import { useI18n } from '@/lib/i18n/i18n';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface UndoButtonProps {
  onUndoComplete?: () => void;
  className?: string;
}

export function UndoButton({ onUndoComplete, className }: UndoButtonProps) {
  const t = useI18n();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const lastOperation = UndoService.getLastOperation();

  const handleUndoClick = () => {
    if (!lastOperation) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmUndo = async () => {
    if (!lastOperation) return;

    setLoading(true);
    try {
      const result = await UndoService.undo();

      if (result.success) {
        onUndoComplete?.();
      }
    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (!lastOperation) {
    return null;
  }

  const relativeTime = UndoService.formatRelativeTime(lastOperation.timestamp);
  const fileCount = lastOperation.originalPairs.length;

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="outline" size="sm" onClick={handleUndoClick} className="gap-2">
          <Undo2 className="h-4 w-4" />
          <span>{t('common.undo')}</span>
          <span className="text-muted-foreground">({fileCount})</span>
        </Button>

        <span className="text-xs text-muted-foreground">{relativeTime}</span>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmUndo}
        title={t('common.undo') || 'Undo Changes'}
        description={(
          t('undo.confirm_description') ||
          'Are you sure you want to revert the rename of {count} files?'
        ).replace('{count}', String(fileCount))}
        confirmText={t('common.yes') || 'Yes, Undo'}
        cancelText={t('common.no') || 'Cancel'}
        loading={loading}
        loadingText={t('common.processing') || 'Processing...'}
        variant="warning"
      />
    </>
  );
}
