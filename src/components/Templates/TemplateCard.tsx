import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye } from 'lucide-react';
import { LegalTemplate } from '@/data/templateData';

interface TemplateCardProps {
  template: LegalTemplate;
  onPreview: (template: LegalTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{template.title}</CardTitle>
            <CardDescription className="mt-1 text-sm line-clamp-2">{template.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">{template.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {template.languages.map((lang) => (
            <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{template.downloads.toLocaleString()} downloads</p>
        <div className="flex gap-2">
          <Button onClick={() => onPreview(template)} size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button onClick={() => onPreview(template)} size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
