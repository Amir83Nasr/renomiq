'use client';

import { useState, useMemo } from 'react';

import { FileSelector } from '@/components/FileSelector';
import { RuleEditor } from '@/components/RuleEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { TauriService } from '@/src/services/tauri';

import type { FileEntry, RenamePair, RenameRule } from '@/types';
import { applyRenameRules, buildPreview } from '@/lib/rename-rules';

function useRenamePreview(files: FileEntry[], rules: RenameRule[]) {
  return useMemo(() => buildPreview(files, rules), [files, rules]);
}

export default function Page() {
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

  async function handleChooseFolder() {
    setError(null);
    setLoading(true);
    try {
      const result = await TauriService.chooseFolder();
      if (!result) return;
      setFolder(result);
      const entries = await TauriService.listFiles(result);
      setFiles(entries);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load folder';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyRename() {
    setError(null);
    setLoading(true);
    try {
      const pairs: RenamePair[] = preview
        .filter((p) => p.newName && p.newName !== p.oldName && !p.conflict)
        .map((p) => ({ from: p.path, to: p.newPath! }));

      if (pairs.length === 0) {
        setError('No changes to apply.');
        return;
      }

      const result = await TauriService.applyRenames(pairs);

      if (!result.success) {
        setError(result.error ?? 'Rename failed');
        return;
      }

      // Refresh list
      if (folder) {
        const entries = await TauriService.listFiles(folder);
        setFiles(entries);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to apply rename';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col gap-4 p-4 sm:p-6">
      <FileSelector folder={folder} loading={loading} onChooseFolder={handleChooseFolder} />

      {folder && (
        <p className="text-xs text-muted-foreground truncate">
          Active folder: <span className="font-mono">{folder}</span>
        </p>
      )}

      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      )}

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
