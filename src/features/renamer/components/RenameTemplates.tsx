'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Calendar, Hash, Type, Image, Video, FileText } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n';
import { cn } from '@/lib/utils';

interface RenameTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  apply: () => void;
}

interface RenameTemplatesProps {
  onTemplateApply?: (template: RenameTemplate) => void;
}

export function RenameTemplates({ onTemplateApply }: RenameTemplatesProps) {
  const t = useI18n();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates: RenameTemplate[] = [
    {
      id: 'date-prefix',
      name: 'Date Prefix',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Add YYYY-MM-DD prefix to files',
      apply: () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        console.log('Applying date prefix:', dateStr);
      },
    },
    {
      id: 'numbering',
      name: 'Sequential Numbering',
      icon: <Hash className="h-4 w-4" />,
      description: 'Add sequential numbers (001, 002, ...)',
      apply: () => {
        console.log('Applying sequential numbering');
      },
    },
    {
      id: 'lowercase',
      name: 'Lowercase',
      icon: <Type className="h-4 w-4" />,
      description: 'Convert all filenames to lowercase',
      apply: () => {
        console.log('Converting to lowercase');
      },
    },
    {
      id: 'remove-spaces',
      name: 'Remove Spaces',
      icon: <FileText className="h-4 w-4" />,
      description: 'Replace spaces with underscores',
      apply: () => {
        console.log('Removing spaces');
      },
    },
    {
      id: 'image-prefix',
      name: 'Image Prefix',
      icon: <Image className="h-4 w-4" />,
      description: 'Add IMG_ prefix to image files',
      apply: () => {
        console.log('Adding IMG_ prefix');
      },
    },
    {
      id: 'video-prefix',
      name: 'Video Prefix',
      icon: <Video className="h-4 w-4" />,
      description: 'Add VID_ prefix to video files',
      apply: () => {
        console.log('Adding VID_ prefix');
      },
    },
  ];

  const handleApplyTemplate = (template: RenameTemplate) => {
    setSelectedTemplate(template.id);
    template.apply();
    onTemplateApply?.(template);
    setTimeout(() => setSelectedTemplate(null), 1000);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-sm sm:text-base font-medium">Quick Templates</h3>
        </div>

        <ScrollArea className="h-48 sm:h-56">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className={cn(
                  'h-auto p-3 flex flex-col items-start gap-2 text-left',
                  'hover:bg-primary/5 hover:border-primary/50',
                  selectedTemplate === template.id && 'bg-primary/10 border-primary'
                )}
                onClick={() => handleApplyTemplate(template)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-shrink-0 text-muted-foreground">{template.icon}</div>
                  <span className="text-sm font-medium truncate flex-1">{template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
