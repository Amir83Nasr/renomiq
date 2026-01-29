/**
 * Series metadata form component
 * Allows user to input series name, season, and episode settings
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeriesMetadata } from '@/types/series';

interface SeriesMetadataFormProps {
  metadata: SeriesMetadata;
  onChange: (metadata: SeriesMetadata) => void;
  className?: string;
}

export function SeriesMetadataForm({
  metadata,
  onChange,
  className = '',
}: SeriesMetadataFormProps) {
  const handleNameChange = (name: string) => {
    onChange({ ...metadata, name });
  };

  const handleSeasonChange = (seasonStr: string) => {
    const season = parseInt(seasonStr, 10) || 1;
    onChange({ ...metadata, season });
  };

  const handleStartEpisodeChange = (startEpisodeStr: string) => {
    const startEpisode = parseInt(startEpisodeStr, 10) || 1;
    onChange({ ...metadata, startEpisode });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">اطلاعات سریال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="series-name">نام سریال</Label>
          <Input
            id="series-name"
            placeholder="مثال: Breaking Bad"
            value={metadata.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-left"
            dir="auto"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="season">شماره فصل</Label>
            <Input
              id="season"
              type="number"
              min={1}
              max={99}
              value={metadata.season}
              onChange={(e) => handleSeasonChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-episode">شروع از قسمت</Label>
            <Input
              id="start-episode"
              type="number"
              min={1}
              max={999}
              value={metadata.startEpisode}
              onChange={(e) => handleStartEpisodeChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
