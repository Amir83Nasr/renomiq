'use client';

import { Button } from '@/components/ui/button';
import { isTauriEnvironment } from '@/src/services/tauri';

interface FileSelectorProps {
  folder: string | null;
  loading: boolean;
  onChooseFolder: () => void;
}

export function FileSelector({ folder, loading, onChooseFolder }: FileSelectorProps) {
  const isTauri = isTauriEnvironment();

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Renomiq Renamer</h1>
        <p className="text-muted-foreground text-sm">
          Choose a folder, configure rename rules, and safely batch-rename files.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onChooseFolder} disabled={loading}>
          {folder ? 'Change folder' : 'Choose folder'}
        </Button>
        {!isTauri && (
          <p className="text-xs text-muted-foreground max-w-xs text-right">
            Folder selection is only available in the desktop app. Run{' '}
            <code className="font-mono">pnpm tauri dev</code>.
          </p>
        )}
      </div>
    </div>
  );
}
