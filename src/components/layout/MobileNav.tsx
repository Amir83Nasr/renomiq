'use client';

import { useState } from 'react';
import { Home, FileText, FolderOpen, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/i18n';

interface MobileNavProps {
  activeTab: 'file' | 'folder';
  onTabChange: (tab: 'file' | 'folder') => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
}

export function MobileNav({
  activeTab,
  onTabChange,
  onHistoryClick,
  onSettingsClick,
}: MobileNavProps) {
  const t = useI18n();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* File Tab */}
        <Button
          variant={activeTab === 'file' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('file')}
          className={cn(
            'flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg',
            activeTab === 'file' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('series_renamer.tab_file')}</span>
        </Button>

        {/* Folder Tab */}
        <Button
          variant={activeTab === 'folder' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('folder')}
          className={cn(
            'flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg',
            activeTab === 'folder' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          )}
        >
          <FolderOpen className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('series_renamer.tab_series')}</span>
        </Button>

        {/* More Options */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('common.settings')}</span>
        </Button>
      </div>

      {/* More Options Menu */}
      {showMore && (
        <div className="absolute bottom-16 left-2 right-2 bg-background border rounded-lg shadow-lg p-2 space-y-1">
          {onHistoryClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onHistoryClick();
                setShowMore(false);
              }}
              className="w-full justify-start gap-2"
            >
              <History className="h-4 w-4" />
              <span className="text-sm">{t('common.undo')}</span>
            </Button>
          )}
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSettingsClick();
                setShowMore(false);
              }}
              className="w-full justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">{t('common.settings')}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
