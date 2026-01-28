export type {
  FileEntry,
  RenameRule,
  PreviewRow,
  RenamePair,
  ApplyResult,
  RenameOptions,
} from '@/types';

import type { RenameRule, RenameOptions, FileEntry, PreviewRow } from '@/types';

export function applyRenameRules(opts: RenameOptions): RenameRule[] {
  const rules: RenameRule[] = [];
  if (opts.search) {
    rules.push({
      type: 'search-replace',
      search: opts.search,
      replace: opts.replace,
    });
  }
  if (opts.prefix) {
    rules.push({ type: 'prefix', value: opts.prefix });
  }
  if (opts.suffix) {
    rules.push({ type: 'suffix', value: opts.suffix });
  }
  if (opts.numbering) {
    rules.push({ type: 'numbering', width: opts.numberWidth });
  }
  return rules;
}

function padNumber(value: number, width?: number): string {
  if (!width || width <= 1) {
    return String(value);
  }
  return String(value).padStart(width, '0');
}

function applyRulesToBaseName(base: string, rules: RenameRule[], index: number): string {
  let name = base;

  for (const rule of rules) {
    switch (rule.type) {
      case 'search-replace': {
        if (rule.search) {
          name = name.split(rule.search).join(rule.replace);
        }
        break;
      }
      case 'prefix': {
        name = `${rule.value}${name}`;
        break;
      }
      case 'suffix': {
        name = `${name}${rule.value}`;
        break;
      }
      case 'numbering': {
        const displayIndex = index + 1;
        name = `${name}_${padNumber(displayIndex, rule.width)}`;
        break;
      }
    }
  }

  return name;
}

export function buildPreview(files: FileEntry[], rules: RenameRule[]): PreviewRow[] {
  const result: PreviewRow[] = [];

  const targetNames = new Map<string, number>();

  files.forEach((file, index) => {
    const dotIndex = file.name.lastIndexOf('.');
    // Handle dotfiles correctly: if dot is at position 0, it's a dotfile with no extension
    const base = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
    const ext = dotIndex > 0 ? file.name.slice(dotIndex) : '';

    const newBase = rules.length ? applyRulesToBaseName(base, rules, index) : base;

    const newName = `${newBase}${ext}`;
    const changed = newName !== file.name;
    const newPath = changed ? file.path.replace(/[^/]+$/, newName) : file.path;

    result.push({
      path: file.path,
      oldName: file.name,
      newName: changed ? newName : null,
      newPath: changed ? newPath : null,
      changed,
      conflict: false,
    });

    {
      targetNames.set(newPath, (targetNames.get(newPath) ?? 0) + 1);
    }
  });

  // mark conflicts
  for (const row of result) {
    if (row.newPath && (targetNames.get(row.newPath) ?? 0) > 1) {
      row.conflict = true;
    }
  }

  return result;
}
