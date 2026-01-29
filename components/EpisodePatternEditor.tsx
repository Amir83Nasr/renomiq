/**
 * Episode pattern editor component
 * Allows user to select or create custom naming patterns
 */

'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PREDEFINED_PATTERNS, validatePatternTemplate } from '@/lib/patterns/series-patterns';
import { useI18n } from '@/lib/i18n/i18n';

interface EpisodePatternEditorProps {
  selectedPatternId: string;
  customTemplate: string;
  onPatternChange: (patternId: string) => void;
  onCustomTemplateChange: (template: string) => void;
  className?: string;
}

export function EpisodePatternEditor({
  selectedPatternId,
  customTemplate,
  onPatternChange,
  onCustomTemplateChange,
  className = '',
}: EpisodePatternEditorProps) {
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomChange = (value: string) => {
    onCustomTemplateChange(value);
    const error = validatePatternTemplate(value);
    setCustomError(error);
  };

  const isCustomSelected = selectedPatternId === 'custom';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">الگوی نام‌گذاری</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedPatternId} onValueChange={onPatternChange} className="space-y-3">
          {PREDEFINED_PATTERNS.map((pattern) => (
            <div key={pattern.id} className="flex items-start space-x-2 space-x-reverse">
              <RadioGroupItem value={pattern.id} id={pattern.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={pattern.id} className="cursor-pointer">
                  <span className="font-medium">{pattern.label}</span>
                </Label>
                <Badge variant="secondary" className="mr-2 text-[10px] font-mono">
                  {pattern.template}
                </Badge>
              </div>
            </div>
          ))}

          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="custom" id="custom" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom" className="cursor-pointer font-medium">
                سفارشی
              </Label>
              {isCustomSelected && (
                <div className="space-y-1">
                  <Input
                    placeholder="مثال: {series} - S{season}E{episode}"
                    value={customTemplate}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="text-left font-mono text-sm"
                    dir="ltr"
                  />
                  {customError && <p className="text-xs text-destructive">{customError}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted"
                      onClick={() => handleCustomChange(customTemplate + '{series}')}
                    >
                      {'{series}'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted"
                      onClick={() => handleCustomChange(customTemplate + '{season}')}
                    >
                      {'{season}'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted"
                      onClick={() => handleCustomChange(customTemplate + '{episode}')}
                    >
                      {'{episode}'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted"
                      onClick={() => handleCustomChange(customTemplate + '{sxe}')}
                    >
                      {'{sxe}'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
