'use client';

import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  progress?: number;
  className?: string;
}

export function ProgressIndicator({
  status,
  message,
  progress,
  className,
}: ProgressIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        status === 'loading' && 'border-primary/30 bg-primary/5',
        status === 'success' && 'border-green-500/30 bg-green-500/5',
        status === 'error' && 'border-destructive/30 bg-destructive/5',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {status === 'loading' && (
          <div className="relative">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            {progress !== undefined && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-primary">
                {Math.round(progress)}
              </span>
            )}
          </div>
        )}
        {status === 'success' && (
          <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
        )}
        {status === 'error' && (
          <AlertCircle className="h-5 w-5 text-destructive animate-in zoom-in duration-300" />
        )}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        {message && (
          <p
            className={cn(
              'text-sm font-medium truncate',
              status === 'loading' && 'text-foreground',
              status === 'success' && 'text-green-600 dark:text-green-400',
              status === 'error' && 'text-destructive'
            )}
          >
            {message}
          </p>
        )}
        {progress !== undefined && status === 'loading' && (
          <div className="mt-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
