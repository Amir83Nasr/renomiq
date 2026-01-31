/**
 * Confirm Rename Dialog Component
 * Beautiful, modern design for rename confirmation
 */

'use client';

import { useState } from 'react';
import { ArrowRight, FileText, X, CheckCircle2, Loader2, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/lib/i18n/i18n';
import { cn } from '@/lib/utils';
import type { RenamePair } from '@/types';

interface ConfirmRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  pairs: RenamePair[];
  loading?: boolean;
  operationInProgress?: boolean;
  onAbort?: () => void;
  isTauri?: boolean;
}

export function ConfirmRenameDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  pairs,
  loading = false,
  operationInProgress = false,
  onAbort,
  isTauri = true,
}: ConfirmRenameDialogProps) {
  const t = useI18n();
  const [showAll, setShowAll] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const previewPairs = showAll ? pairs : pairs.slice(0, 5);
  const hasMore = pairs.length > 5;
  const isConfirmDisabled = loading || pairs.length === 0 || !isTauri;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => !operationInProgress && handleCancel()}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                {operationInProgress ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Files className="w-6 h-6 text-primary" />
                )}
              </div>
              {!operationInProgress && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {pairs.length}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {operationInProgress ? t('common.processing') : t('common.confirm_rename')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {operationInProgress
                  ? t('common.operation_in_progress_description')
                  : `${pairs.length} ${t('common.files_to_rename')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {!isTauri && !operationInProgress && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-[10px]">!</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t('errors.tauri_required_description')}
              </p>
            </div>
          )}

          {/* Preview List */}
          {!operationInProgress && pairs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('common.preview_changes')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {pairs.length} {t('common.files')}
                </span>
              </div>

              <ScrollArea className="h-[220px] rounded-xl border border-border/50 bg-muted/20">
                <div className="p-3 space-y-2">
                  {previewPairs.map((pair, index) => {
                    const oldName = pair.from.split('/').pop() || pair.from;
                    const newName = pair.to.split('/').pop() || pair.to;
                    return (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="flex-1 min-w-0 truncate text-xs text-muted-foreground">
                            {oldName}
                          </span>
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                          <span className="flex-1 min-w-0 truncate text-xs font-medium text-foreground">
                            {newName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 rounded-lg"
                >
                  {showAll ? t('common.show_less') : `${t('common.show_all')} (${pairs.length})`}
                </button>
              )}
            </div>
          )}

          {/* Processing State */}
          {operationInProgress && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="220"
                    strokeDashoffset="55"
                    strokeLinecap="round"
                    className="text-primary animate-spin"
                    style={{ animationDuration: '1.5s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{pairs.length}</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">{t('common.processing')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('common.operation_in_progress_description')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex gap-3">
          {operationInProgress ? (
            onAbort && (
              <Button variant="outline" onClick={onAbort} className="w-full h-10 text-sm gap-2">
                <X className="w-4 h-4" />
                {t('common.abort_operation')}
              </Button>
            )
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 h-10 text-sm"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isConfirmDisabled}
                className={cn(
                  'flex-1 h-10 text-sm gap-2',
                  isConfirmDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {t('common.confirm')}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
