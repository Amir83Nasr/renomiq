/**
 * Confirm Rename Dialog Component
 * Shows confirmation before applying renames with summary and preview
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowDown, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/lib/i18n/i18n';
import type { RenamePair } from '@/types';

interface ConfirmRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pairs: RenamePair[];
  loading?: boolean;
}

export function ConfirmRenameDialog({
  open,
  onOpenChange,
  onConfirm,
  pairs,
  loading = false,
}: ConfirmRenameDialogProps) {
  const t = useI18n();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  const conflictCount = pairs.filter((p) => {
    // Check if target file already exists (simple check)
    // In real implementation, you'd check with backend
    return false;
  }).length;

  const previewPairs = pairs.slice(0, 5); // Show first 5 pairs

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle>{t('common.confirm_rename')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {t('common.confirm_rename_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t('common.files_to_rename')}:</span>
                <Badge variant="secondary">{pairs.length}</Badge>
              </div>
              {conflictCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <span className="font-medium">{t('common.conflicts')}:</span>
                  <Badge variant="destructive">{conflictCount}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewPairs.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('common.preview_changes')}</div>
              <ScrollArea className="h-48 rounded-md border p-3">
                <div className="space-y-3">
                  {previewPairs.map((pair, index) => {
                    const oldName = pair.from.split('/').pop() || pair.from;
                    const newName = pair.to.split('/').pop() || pair.to;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-muted-foreground">{oldName}</div>
                            <ArrowDown className="my-1 h-3 w-3 text-muted-foreground" />
                            <div className="truncate font-medium">{newName}</div>
                          </div>
                        </div>
                        {index < previewPairs.length - 1 && (
                          <div className="border-b border-dashed" />
                        )}
                      </div>
                    );
                  })}
                  {pairs.length > previewPairs.length && (
                    <div className="text-center text-xs text-muted-foreground">
                      + {pairs.length - previewPairs.length} {t('common.more_files')}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('common.cancel')}</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={loading || conflictCount > 0} className="gap-2">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('common.processing')}
              </>
            ) : (
              <>
                {t('common.confirm')}
                <Badge variant="secondary" className="ml-1">
                  {pairs.length}
                </Badge>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
