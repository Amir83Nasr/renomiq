/**
 * File group list component
 * Displays all file groups with their previews
 */

'use client';

import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileGroupCard } from './FileGroupCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FileGroup } from '@/types/series';

interface FileGroupListProps {
  groups: FileGroup[];
  previewNames: Map<string, string>;
  selectedGroupIds: Set<string>;
  onSelectionChange: (groupId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  className?: string;
}

export function FileGroupList({
  groups,
  previewNames,
  selectedGroupIds,
  onSelectionChange,
  onSelectAll,
  className = '',
}: FileGroupListProps) {
  const allSelected = groups.length > 0 && groups.every((g) => selectedGroupIds.has(g.id));
  const someSelected = groups.some((g) => selectedGroupIds.has(g.id)) && !allSelected;

  const conflictCount = useMemo(() => groups.filter((g) => g.hasConflict).length, [groups]);

  const selectedCount = selectedGroupIds.size;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked === true)}
          />
          <Label className="text-sm">
            {selectedCount} از {groups.length} گروه انتخاب شده
          </Label>
        </div>

        {conflictCount > 0 && (
          <div className="text-xs text-destructive">⚠️ {conflictCount} تداخل شناسایی شد</div>
        )}
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-2">
          {groups.map((group) => (
            <FileGroupCard
              key={group.id}
              group={group}
              previewNames={previewNames}
              isSelected={selectedGroupIds.has(group.id)}
              onSelectChange={(selected) => onSelectionChange(group.id, selected)}
            />
          ))}

          {groups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">فایلی یافت نشد</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
