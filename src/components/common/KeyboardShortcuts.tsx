'use client';

import { useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/i18n';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  const t = useI18n();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const pressedKey = event.key.toLowerCase();

      for (const shortcut of shortcuts) {
        const shortcutKey = shortcut.key.toLowerCase();

        // Handle Ctrl/Cmd + key combinations
        if (shortcutKey.includes('ctrl+') || shortcutKey.includes('cmd+')) {
          const modifier = shortcutKey.includes('ctrl+') ? 'ctrl' : 'meta';
          const key = shortcutKey.replace(/ctrl\+|cmd\+/, '');

          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === key) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        } else if (pressedKey === shortcutKey) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  const t = useI18n();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{t('common.settings')}</h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut.key}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
