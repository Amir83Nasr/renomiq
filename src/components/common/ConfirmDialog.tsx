'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trash2, RotateCcw, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string | React.ReactNode;
  variant?: 'default' | 'danger' | 'warning';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  loadingText = 'Processing...',
}: ConfirmDialogProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-8 h-8 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-600" />;
      default:
        return <RotateCcw className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={() => !loading && onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          disabled={loading}
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header with icon */}
        <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4',
              variantStyles[variant].iconBg
            )}
          >
            {getIcon()}
          </div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <div className="text-sm text-muted-foreground mt-2">{description}</div>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 h-10 text-sm"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={variant === 'danger' ? 'destructive' : 'default'}
            className={cn('flex-1 h-10 text-sm gap-2', loading && 'opacity-70')}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
