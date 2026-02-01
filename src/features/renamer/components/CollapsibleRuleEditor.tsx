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
import { ChevronDown, ChevronUp, Search, Type, Hash, Sparkles, FileEdit, Tv } from 'lucide-react';

interface CollapsibleRuleEditorProps {
  search: string;
  replace: string;
  prefix: string;
  suffix: string;
  numbering: boolean;
  numberWidth: number;
  newName?: string;
  keepExtension?: boolean;
  // Series options
  seriesEnabled?: boolean;
  seriesName?: string;
  includeSeason?: boolean;
  useExistingEpisodeNumbers?: boolean;
  seasonNumber?: number;
  startEpisode?: number;
  seasonPrefix?: 'S' | 'Season';
  episodePrefix?: 'E' | 'Episode';
  seasonNumberWidth?: 1 | 2 | 3;
  episodeNumberWidth?: 1 | 2 | 3;
  loading: boolean;
  hasItems: boolean;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onNumberingChange: (checked: boolean) => void;
  onNumberWidthChange: (width: number) => void;
  onNewNameChange?: (value: string) => void;
  onKeepExtensionChange?: (checked: boolean) => void;
  // Series handlers
  onSeriesEnabledChange?: (checked: boolean) => void;
  onSeriesNameChange?: (value: string) => void;
  onIncludeSeasonChange?: (checked: boolean) => void;
  onUseExistingEpisodeNumbersChange?: (checked: boolean) => void;
  onSeasonNumberChange?: (value: number) => void;
  onStartEpisodeChange?: (value: number) => void;
  onSeasonPrefixChange?: (prefix: 'S' | 'Season') => void;
  onEpisodePrefixChange?: (prefix: 'E' | 'Episode') => void;
  onSeasonNumberWidthChange?: (width: 1 | 2 | 3) => void;
  onEpisodeNumberWidthChange?: (width: 1 | 2 | 3) => void;
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
  newName = '',
  keepExtension = true,
  // Series options
  seriesEnabled = false,
  seriesName = '',
  includeSeason = true,
  useExistingEpisodeNumbers = false,
  seasonNumber = 1,
  startEpisode = 1,
  seasonPrefix = 'S',
  episodePrefix = 'E',
  seasonNumberWidth = 2,
  episodeNumberWidth = 2,
  loading,
  hasItems,
  onSearchChange,
  onReplaceChange,
  onPrefixChange,
  onSuffixChange,
  onNumberingChange,
  onNumberWidthChange,
  onNewNameChange,
  onKeepExtensionChange,
  // Series handlers
  onSeriesEnabledChange,
  onSeriesNameChange,
  onIncludeSeasonChange,
  onUseExistingEpisodeNumbersChange,
  onSeasonNumberChange,
  onStartEpisodeChange,
  onSeasonPrefixChange,
  onEpisodePrefixChange,
  onSeasonNumberWidthChange,
  onEpisodeNumberWidthChange,
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
  const hasNewName = newName.length > 0;
  const hasSeries = seriesEnabled;

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

        {/* Complete Rename Section */}
        <CollapsibleSection
          title={t('rule_editor.complete_rename') || 'Complete Rename'}
          icon={<FileEdit className="h-4 w-4" />}
          isOpen={openSections.has('rename')}
          onToggle={() => toggleSection('rename')}
          isActive={hasNewName}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {t('rule_editor.new_name') || 'New Name'}
              </Label>
              <Input
                placeholder={t('rule_editor.new_name_placeholder') || 'e.g. document'}
                value={newName}
                onChange={(e) => onNewNameChange?.(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="keepExtension"
                checked={keepExtension}
                onCheckedChange={(checked) => onKeepExtensionChange?.(checked as boolean)}
              />
              <Label htmlFor="keepExtension" className="text-sm cursor-pointer">
                {t('rule_editor.keep_extension') || 'Keep file extension'}
              </Label>
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

        {/* Series Section */}
        <CollapsibleSection
          title={t('rule_editor.series') || 'Series / TV Shows'}
          icon={<Tv className="h-4 w-4" />}
          isOpen={openSections.has('series')}
          onToggle={() => toggleSection('series')}
          isActive={hasSeries}
        >
          <div className="space-y-3">
            {/* Enable Series Renaming */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="seriesEnabled"
                checked={seriesEnabled}
                onCheckedChange={(checked) => onSeriesEnabledChange?.(checked as boolean)}
              />
              <Label htmlFor="seriesEnabled" className="text-sm cursor-pointer">
                {t('rule_editor.enable_series') || 'Enable series naming'}
              </Label>
            </div>

            {seriesEnabled && (
              <>
                {/* Series Name */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    {t('rule_editor.series_name') || 'Series Name'}
                  </Label>
                  <Input
                    placeholder={t('rule_editor.series_name_placeholder') || 'e.g. Breaking Bad'}
                    value={seriesName}
                    onChange={(e) => onSeriesNameChange?.(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                {/* Include Season Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="includeSeason"
                    checked={includeSeason}
                    onCheckedChange={(checked) => onIncludeSeasonChange?.(checked as boolean)}
                  />
                  <Label htmlFor="includeSeason" className="text-sm cursor-pointer">
                    {t('rule_editor.include_season') || 'Include season number'}
                  </Label>
                </div>

                {/* Use Existing Episode Numbers Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="useExistingEpisodeNumbers"
                    checked={useExistingEpisodeNumbers}
                    onCheckedChange={(checked) =>
                      onUseExistingEpisodeNumbersChange?.(checked as boolean)
                    }
                  />
                  <Label htmlFor="useExistingEpisodeNumbers" className="text-sm cursor-pointer">
                    {t('rule_editor.use_existing_episode_numbers') ||
                      'Use existing episode numbers from filenames'}
                  </Label>
                </div>

                {/* Season & Episode Settings */}
                <div className="grid grid-cols-2 gap-2">
                  {includeSeason && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">
                        {t('rule_editor.season_number') || 'Season'}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={seasonNumber}
                        onChange={(e) => onSeasonNumberChange?.(Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      {t('rule_editor.start_episode') || 'Start Episode'}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={startEpisode}
                      onChange={(e) => onStartEpisodeChange?.(Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Prefix Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {includeSeason && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">
                        {t('rule_editor.season_prefix') || 'Season Prefix'}
                      </Label>
                      <Select
                        value={seasonPrefix}
                        onValueChange={(value) =>
                          value && onSeasonPrefixChange?.(value as 'S' | 'Season')
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S (S01)</SelectItem>
                          <SelectItem value="Season">Season (Season 1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      {t('rule_editor.episode_prefix') || 'Episode Prefix'}
                    </Label>
                    <Select
                      value={episodePrefix}
                      onValueChange={(value) =>
                        value && onEpisodePrefixChange?.(value as 'E' | 'Episode')
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E">E (E01)</SelectItem>
                        <SelectItem value="Episode">Episode (Episode 1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Number Width - Separate for Season and Episode */}
                <div className="grid grid-cols-2 gap-2">
                  {includeSeason && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">
                        {t('rule_editor.season_number_width') || 'Season Digits'}
                      </Label>
                      <Select
                        value={String(seasonNumberWidth)}
                        onValueChange={(value) =>
                          onSeasonNumberWidthChange?.(Number(value) as 1 | 2 | 3)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (1)</SelectItem>
                          <SelectItem value="2">2 (01)</SelectItem>
                          <SelectItem value="3">3 (001)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      {t('rule_editor.episode_number_width') || 'Episode Digits'}
                    </Label>
                    <Select
                      value={String(episodeNumberWidth)}
                      onValueChange={(value) =>
                        onEpisodeNumberWidthChange?.(Number(value) as 1 | 2 | 3)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (1)</SelectItem>
                        <SelectItem value="2">2 (01)</SelectItem>
                        <SelectItem value="3">3 (001)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview Example */}
                <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  {t('rule_editor.preview_example') || 'Example'}:{' '}
                  <span className="font-mono text-foreground">
                    {seriesName || 'Name'}
                    {includeSeason && (
                      <>
                        {' '}
                        {seasonPrefix === 'S'
                          ? `S${String(seasonNumber).padStart(seasonNumberWidth, '0')}`
                          : `Season ${seasonNumber}`}
                      </>
                    )}{' '}
                    {episodePrefix === 'E'
                      ? `E${String(startEpisode).padStart(episodeNumberWidth, '0')}`
                      : `Episode ${startEpisode}`}
                  </span>
                </div>
              </>
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
