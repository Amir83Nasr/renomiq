'use client';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PreviewRow } from '@/types';

interface RuleEditorProps {
  search: string;
  replace: string;
  prefix: string;
  suffix: string;
  numbering: boolean;
  numberWidth: number;
  preview: PreviewRow[];
  loading: boolean;
  folder: string | null;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onNumberingChange: (checked: boolean) => void;
  onNumberWidthChange: (width: number) => void;
  onApplyRename: () => void;
}

export function RuleEditor({
  search,
  replace,
  prefix,
  suffix,
  numbering,
  numberWidth,
  preview,
  loading,
  folder,
  onSearchChange,
  onReplaceChange,
  onPrefixChange,
  onSuffixChange,
  onNumberingChange,
  onNumberWidthChange,
  onApplyRename,
}: RuleEditorProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base">Rename rules</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Search and replace</label>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
            <Input
              placeholder="Search for..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Input
              placeholder="Replace with..."
              value={replace}
              onChange={(e) => onReplaceChange(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Prefix</label>
            <Input
              placeholder="e.g. IMG_"
              value={prefix}
              onChange={(e) => onPrefixChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Suffix</label>
            <Input
              placeholder="e.g. _v1"
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Numbering</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="numbering"
                type="checkbox"
                className="h-3 w-3 rounded border border-border"
                checked={numbering}
                onChange={(e) => onNumberingChange(e.target.checked)}
              />
              <label htmlFor="numbering" className="text-xs text-muted-foreground">
                Add incremental numbers at the end
              </label>
            </div>
            {numbering && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Numbering width</label>
                <select
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                  value={numberWidth}
                  onChange={(e) => onNumberWidthChange(Number(e.target.value))}
                >
                  <option value={1}>1 digit (1, 2, 3)</option>
                  <option value={2}>2 digits (01, 02, 03)</option>
                  <option value={3}>3 digits (001, 002, 003)</option>
                  <option value={4}>4 digits (0001, 0002, 0003)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {preview.length} files loaded. Conflicts and unchanged files are skipped automatically.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onApplyRename}
            disabled={loading || !folder || preview.length === 0}
          >
            Apply changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
