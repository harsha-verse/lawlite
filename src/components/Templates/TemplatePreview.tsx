import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import { LegalTemplate } from '@/data/templateData';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface TemplatePreviewProps {
  template: LegalTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, open, onOpenChange }) => {
  const { t } = useTranslation();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('preview');

  if (!template) return null;

  const getProcessedContent = () => {
    let content = template.content;
    template.fields.forEach((field) => {
      const value = fieldValues[field.key] || field.placeholder;
      content = content.split(field.placeholder).join(value);
    });
    return content;
  };

  const downloadPDF = () => {
    const content = getProcessedContent();
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 170);
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;
    lines.forEach((line: string) => {
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.text(line, 20, y);
      y += 6;
    });
    doc.save(`${template.title.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadWord = async () => {
    const content = getProcessedContent();
    const paragraphs = content.split('\n').map(
      (line) => new Paragraph({ children: [new TextRun({ text: line, size: 24 })], spacing: { after: 120 } })
    );
    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${template.title.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {template.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="secondary">{template.type}</Badge>
            {template.languages.map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
            ))}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">{t('previewTab')}</TabsTrigger>
            <TabsTrigger value="edit">{t('fillDetailsTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="bg-muted/30 border rounded-lg p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
              {getProcessedContent()}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {template.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input id={field.key} type={field.type || 'text'} placeholder={field.placeholder}
                    value={fieldValues[field.key] || ''}
                    onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-accent/50 border border-accent rounded-lg p-3 flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
          <span>{t('templateDisclaimer')}</span>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={downloadPDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />{t('downloadPDF')}
          </Button>
          <Button onClick={downloadWord} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />{t('downloadWord')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreview;
