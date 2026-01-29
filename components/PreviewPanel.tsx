'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/i18n';
import type { PreviewRow } from '@/types';

interface PreviewPanelProps {
  preview: PreviewRow[];
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
  const t = useI18n();

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{t('preview_panel.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="border-border h-full overflow-auto rounded-md border text-xs">
          <table className="w-full border-collapse text-left">
            <thead className="bg-muted/60 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 font-medium">{t('preview_panel.number')}</th>
                <th className="px-3 py-2 font-medium">{t('preview_panel.current_name')}</th>
                <th className="px-3 py-2 font-medium">{t('preview_panel.new_name')}</th>
                <th className="px-3 py-2 font-medium">{t('preview_panel.status')}</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, index) => (
                <tr key={row.path} className="border-border/60 border-t last:border-b">
                  <td className="px-3 py-1 align-top text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-1 align-top font-mono text-[11px]">{row.oldName}</td>
                  <td className="px-3 py-1 align-top font-mono text-[11px]">
                    {row.newName ?? '—'}
                  </td>
                  <td className="px-3 py-1 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        row.conflict
                          ? 'bg-destructive/10 text-destructive'
                          : !row.changed
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {row.conflict
                        ? t('preview_panel.status_conflict')
                        : !row.changed
                          ? t('preview_panel.status_unchanged')
                          : t('preview_panel.status_ok')}
                    </span>
                  </td>
                </tr>
              ))}
              {preview.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-xs text-muted-foreground">
                    {t('preview_panel.empty_message')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
