'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/lib/i18n/i18n';
import { ChevronDown, ChevronUp, Search, Type, Hash, Sparkles } from 'lucide-react';

interface CollapsibleRuleEditorProps {
  search: string;
  replace: string;
  prefix: string;
  suffix: string;
  numbering: boolean;
  numberWidth: number;
  loading: boolean;
  hasItems: boolean;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onNumberingChange: (checked: boolean) => void;
  onNumberWidthChange: (width: number) => void;
  onApplyRename: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children, isActive }: SectionProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-primary/10 text-primary' : 'bg-muted/50 hover:bg-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

export function CollapsibleRuleEditor({
  search,
  replace,
  prefix,
  suffix,
  numbering,
  numberWidth,
  loading,
  hasItems,
  onSearchChange,
  onReplaceChange,
  onPrefixChange,
  onSuffixChange,
  onNumberingChange,
  onNumberWidthChange,
  onApplyRename,
}: CollapsibleRuleEditorProps) {
  const t = useI18n();

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['search']));

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hasSearchReplace = search.length > 0;
  const hasPrefixSuffix = prefix.length > 0 || suffix.length > 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          {t('rule_editor.title')}
        </div>

        {/* Search & Replace Section */}
        <CollapsibleSection
          title={t('rule_editor.search_replace')}
          icon={<Search className="h-4 w-4" />}
          isOpen={openSections.has('search')}
          onToggle={() => toggleSection('search')}
          isActive={hasSearchReplace}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('common.search')}
                </Label>
                <Input
                  placeholder={t('rule_editor.search_placeholder')}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('common.replace')}
                </Label>
                <Input
                  placeholder={t('rule_editor.replace_placeholder')}
                  value={replace}
                  onChange={(e) => onReplaceChange(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Prefix & Suffix Section */}
        <CollapsibleSection
          title={`${t('rule_editor.prefix')} / ${t('rule_editor.suffix')}`}
          icon={<Type className="h-4 w-4" />}
          isOpen={openSections.has('prefix')}
          onToggle={() => toggleSection('prefix')}
          isActive={hasPrefixSuffix}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {t('rule_editor.prefix')}
              </Label>
              <Input
                placeholder={t('rule_editor.prefix_placeholder')}
                value={prefix}
                onChange={(e) => onPrefixChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {t('rule_editor.suffix')}
              </Label>
              <Input
                placeholder={t('rule_editor.suffix_placeholder')}
                value={suffix}
                onChange={(e) => onSuffixChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Numbering Section */}
        <CollapsibleSection
          title={t('rule_editor.numbering')}
          icon={<Hash className="h-4 w-4" />}
          isOpen={openSections.has('numbering')}
          onToggle={() => toggleSection('numbering')}
          isActive={numbering}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="numbering"
                checked={numbering}
                onCheckedChange={(checked) => onNumberingChange(checked as boolean)}
              />
              <Label htmlFor="numbering" className="text-sm cursor-pointer">
                {t('rule_editor.numbering_checkbox')}
              </Label>
            </div>

            {numbering && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('rule_editor.number_width_label')}
                </Label>
                <Select
                  value={String(numberWidth)}
                  onValueChange={(value) => onNumberWidthChange(Number(value))}
                >
                  <SelectTrigger className="h-8 text-sm">
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
        </CollapsibleSection>

        {/* Apply Button */}
        <Button className="w-full mt-4" disabled={loading || !hasItems} onClick={onApplyRename}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {t('common.processing')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t('rule_editor.apply_changes')}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
