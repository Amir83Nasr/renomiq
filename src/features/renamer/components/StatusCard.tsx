'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n/i18n';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  FolderOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'idle' | 'processing' | 'success' | 'error' | 'warning';

interface StatusCardProps {
  status: StatusType;
  fileCount?: number;
  folderCount?: number;
  processedCount?: number;
  totalCount?: number;
  message?: string;
  progress?: number;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    badgeVariant: 'secondary' as const,
  },
  processing: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/50',
    badgeVariant: 'default' as const,
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    badgeVariant: 'default' as const,
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    badgeVariant: 'secondary' as const,
  },
};

export function StatusCard({
  status,
  fileCount = 0,
  folderCount = 0,
  processedCount = 0,
  totalCount = 0,
  message,
  progress,
  className,
}: StatusCardProps) {
  const t = useI18n();
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const getStatusMessage = () => {
    if (message) return message;
    switch (status) {
      case 'idle':
        return t('status.idle');
      case 'processing':
        return t('status.processing');
      case 'success':
        return t('status.success');
      case 'error':
        return t('status.error');
      case 'warning':
        return t('status.warning');
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    if (progress !== undefined) return progress;
    if (totalCount === 0) return 0;
    return Math.round((processedCount / totalCount) * 100);
  };

  return (
    <Card
      className={cn(
        'p-4 md:p-6 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        'border-2',
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn('flex-shrink-0', config.color)}>
              <StatusIcon className={cn('h-5 w-5', status === 'processing' && 'animate-spin')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.badgeVariant} className="text-xs">
                  {t(`status.${status}`)}
                </Badge>
              </div>
              <p className="text-sm font-medium mt-1 truncate">{getStatusMessage()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {(fileCount > 0 || folderCount > 0) && (
          <div className="flex items-center gap-4 text-sm">
            {fileCount > 0 && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{fileCount}</span>
                <span className="text-muted-foreground text-xs">{t('common.files')}</span>
              </div>
            )}
            {fileCount > 0 && folderCount > 0 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
            {folderCount > 0 && (
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{folderCount}</span>
                <span className="text-muted-foreground text-xs">{t('common.folders')}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {(status === 'processing' || processedCount > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('status.progress')}</span>
              <span className="font-medium">
                {processedCount} / {totalCount}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        )}
      </div>
    </Card>
  );
}
