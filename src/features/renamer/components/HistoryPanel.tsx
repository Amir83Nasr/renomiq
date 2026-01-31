'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/lib/i18n/i18n';
import { FileText, FolderOpen, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface HistoryItem {
  id: string;
  type: 'file' | 'folder';
  action: 'rename' | 'delete' | 'create';
  name: string;
  newName?: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
}

interface HistoryPanelProps {
  items: HistoryItem[];
  maxHeight?: string;
}

export function HistoryPanel({ items, maxHeight = '400px' }: HistoryPanelProps) {
  const t = useI18n();

  const getIcon = (type: 'file' | 'folder') => {
    return type === 'file' ? <FileText className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />;
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            {t('history.success')}
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive">{t('history.error')}</Badge>;
      case 'pending':
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500/30">
            {t('history.pending')}
          </Badge>
        );
    }
  };

  const getActionText = (action: 'rename' | 'delete' | 'create') => {
    switch (action) {
      case 'rename':
        return t('history.rename');
      case 'delete':
        return t('history.delete');
      case 'create':
        return t('history.create');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('history.title')}
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className="h-[var(--max-height)]"
          style={{ '--max-height': maxHeight } as React.CSSProperties}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
                >
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {getActionText(item.action)}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    {item.newName && (
                      <div className="text-xs text-muted-foreground">→ {item.newName}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.timestamp, {
                        addSuffix: true,
                        locale: faIR,
                      })}
                    </div>
                  </div>
                  <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
