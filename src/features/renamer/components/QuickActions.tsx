'use client';

import { CheckSquare, Square, RotateCcw, Download, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n/i18n';

interface QuickActionsProps {
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onInvertSelection?: () => void;
  onExportRules?: () => void;
  onImportRules?: () => void;
  onClearAll?: () => void;
  disabled?: boolean;
}

export function QuickActions({
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onExportRules,
  onImportRules,
  onClearAll,
  disabled = false,
}: QuickActionsProps) {
  const t = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2 h-9 sm:h-10">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.settings')}</span>
          <span className="sm:hidden">{t('common.settings')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('common.settings')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Selection Actions */}
        {(onSelectAll || onDeselectAll || onInvertSelection) && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('series_renamer.select_all')}
            </DropdownMenuLabel>
            {onSelectAll && (
              <DropdownMenuItem onClick={onSelectAll} className="gap-2">
                <CheckSquare className="h-4 w-4" />
                <span>{t('series_renamer.select_all')}</span>
              </DropdownMenuItem>
            )}
            {onDeselectAll && (
              <DropdownMenuItem onClick={onDeselectAll} className="gap-2">
                <Square className="h-4 w-4" />
                <span>{t('common.cancel')}</span>
              </DropdownMenuItem>
            )}
            {onInvertSelection && (
              <DropdownMenuItem onClick={onInvertSelection} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Invert Selection</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Import/Export */}
        {(onExportRules || onImportRules) && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Rules</DropdownMenuLabel>
            {onExportRules && (
              <DropdownMenuItem onClick={onExportRules} className="gap-2">
                <Download className="h-4 w-4" />
                <span>Export Rules</span>
              </DropdownMenuItem>
            )}
            {onImportRules && (
              <DropdownMenuItem onClick={onImportRules} className="gap-2">
                <Upload className="h-4 w-4" />
                <span>Import Rules</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Clear */}
        {onClearAll && (
          <DropdownMenuItem onClick={onClearAll} className="gap-2 text-destructive">
            <RotateCcw className="h-4 w-4" />
            <span>Clear All</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
