'use client';

import { CheckSquare, Undo, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/i18n';

interface FloatingActionButtonsProps {
  onSelectAll?: () => void;
  onUndo?: () => void;
  onApply?: () => void;
  showApply?: boolean;
  disabled?: boolean;
  selectedCount?: number;
}

export function FloatingActionButtons({
  onSelectAll,
  onUndo,
  onApply,
  showApply = false,
  disabled = false,
  selectedCount = 0,
}: FloatingActionButtonsProps) {
  const t = useI18n();

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center justify-center gap-2 md:hidden">
      {/* Select All Button */}
      {onSelectAll && (
        <Button
          variant="secondary"
          size="lg"
          onClick={onSelectAll}
          disabled={disabled}
          className="flex-1 h-14 gap-2 shadow-lg"
        >
          <CheckSquare className="h-5 w-5" />
          <span className="text-sm font-medium">{t('series_renamer.select_all')}</span>
        </Button>
      )}

      {/* Undo Button */}
      {onUndo && (
        <Button
          variant="outline"
          size="lg"
          onClick={onUndo}
          disabled={disabled}
          className="h-14 w-14 shadow-lg"
        >
          <Undo className="h-5 w-5" />
        </Button>
      )}

      {/* Apply Button */}
      {showApply && onApply && (
        <Button
          variant="default"
          size="lg"
          onClick={onApply}
          disabled={disabled || selectedCount === 0}
          className={cn('flex-1 h-14 gap-2 shadow-lg', selectedCount > 0 && 'animate-pulse')}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">{t('rule_editor.apply_changes')}</span>
          {selectedCount > 0 && (
            <span className="ml-1 bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs">
              {selectedCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
