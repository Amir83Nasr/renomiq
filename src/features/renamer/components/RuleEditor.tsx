'use client';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/i18n';
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
  const t = useI18n();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base">{t('rule_editor.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-xs">{t('rule_editor.search_replace')}</Label>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
            <Input
              placeholder={t('rule_editor.search_placeholder')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Input
              placeholder={t('rule_editor.replace_placeholder')}
              value={replace}
              onChange={(e) => onReplaceChange(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">{t('rule_editor.prefix')}</Label>
            <Input
              placeholder={t('rule_editor.prefix_placeholder')}
              value={prefix}
              onChange={(e) => onPrefixChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('rule_editor.suffix')}</Label>
            <Input
              placeholder={t('rule_editor.suffix_placeholder')}
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t('rule_editor.numbering')}</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="numbering"
                type="checkbox"
                className="h-4 w-4 rounded border border-border accent-primary"
                checked={numbering}
                onChange={(e) => onNumberingChange(e.target.checked)}
              />
              <Label htmlFor="numbering" className="text-xs text-muted-foreground">
                {t('rule_editor.numbering_checkbox')}
              </Label>
            </div>
            {numbering && (
              <div className="space-y-1">
                <Label className="text-xs">{t('rule_editor.number_width_label')}</Label>
                <Select
                  value={String(numberWidth)}
                  onValueChange={(value) => onNumberWidthChange(Number(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t('rule_editor.digit_1')}</SelectItem>
                    <SelectItem value="2">{t('rule_editor.digit_2')}</SelectItem>
                    <SelectItem value="3">{t('rule_editor.digit_3')}</SelectItem>
                    <SelectItem value="4">{t('rule_editor.digit_4')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {preview.length} {t('rule_editor.files_loaded')}. {t('rule_editor.conflicts_skipped')}
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onApplyRename}
            disabled={loading || !folder || preview.length === 0}
          >
            {t('rule_editor.apply_changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
