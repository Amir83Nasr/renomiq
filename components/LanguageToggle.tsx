'use client';

import { Languages } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useAppContext();
  const t = useI18n();

  const getLanguageLabel = () => {
    switch (language) {
      case 'en':
        return 'EN';
      case 'fa':
        return 'FA';
      default:
        return (language as string).toUpperCase();
    }
  };

  const getLanguageName = () => {
    switch (language) {
      case 'en':
        return t('common.english');
      case 'fa':
        return t('common.persian');
      default:
        return (language as string).toUpperCase();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{getLanguageName()}</span>
            <span className="text-xs font-mono">{getLanguageLabel()}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
          <span className="text-xs font-mono">EN</span>
          <span>{t('common.english')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fa')} className="gap-2">
          <span className="text-xs font-mono">FA</span>
          <span>{t('common.persian')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
