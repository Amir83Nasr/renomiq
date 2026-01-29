'use client';

import { useState, useMemo } from 'react';

import { DropZone } from '@/components/DropZone';
import { RuleEditor } from '@/components/RuleEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { FileService } from '@/lib/services/file-service';
import { useI18n } from '@/lib/i18n/i18n';

import type { FileEntry, RenamePair, RenameRule } from '@/types';
import { applyRenameRules, buildPreview } from '@/lib/rename-rules';

function useRenamePreview(files: FileEntry[], rules: RenameRule[]) {
  return useMemo(() => buildPreview(files, rules), [files, rules]);
}

export default function Page() {
  const t = useI18n();
  const [folder, setFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numbering, setNumbering] = useState(false);
  const [numberWidth, setNumberWidth] = useState(2);

  const preview = useRenamePreview(
    files,
    applyRenameRules({
      search,
      replace,
      prefix,
      suffix,
      numbering,
      numberWidth,
    })
  );

  const handleFilesReceived = (receivedFiles: FileEntry[], folderPath: string) => {
    setFiles(receivedFiles);
    setFolder(folderPath);
    setError(null);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  async function handleApplyRename() {
    setError(null);
    setLoading(true);
    try {
      const pairs: RenamePair[] = preview
        .filter((p) => p.newName && p.newName !== p.oldName && !p.conflict)
        .map((p) => ({ from: p.path, to: p.newPath! }));

      if (pairs.length === 0) {
        setError(t('home.no_changes_to_apply'));
        return;
      }

      // Apply rename is only available in Tauri
      const { TauriService } = await import('@/lib/services/tauri');
      const result = await TauriService.applyRenames(pairs);

      if (!result.success) {
        setError(result.error ?? t('home.rename_failed'));
        return;
      }

      // Refresh list
      if (folder) {
        const entries = await FileService.listFiles(folder);
        setFiles(entries);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('errors.failed_to_apply_rename');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('home.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('home.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {folder && (
        <p className="text-xs text-muted-foreground truncate">
          {t('home.active_folder')} <span className="font-mono">{folder}</span>
        </p>
      )}

      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <DropZone
        onFilesReceived={handleFilesReceived}
        onLoadingChange={handleLoadingChange}
        onError={handleError}
      />

      <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <RuleEditor
          search={search}
          replace={replace}
          prefix={prefix}
          suffix={suffix}
          numbering={numbering}
          numberWidth={numberWidth}
          preview={preview}
          loading={loading}
          folder={folder}
          onSearchChange={setSearch}
          onReplaceChange={setReplace}
          onPrefixChange={setPrefix}
          onSuffixChange={setSuffix}
          onNumberingChange={setNumbering}
          onNumberWidthChange={setNumberWidth}
          onApplyRename={handleApplyRename}
        />

        <PreviewPanel preview={preview} />
      </div>
    </main>
  );
}
