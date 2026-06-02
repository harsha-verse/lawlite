import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText, ArrowLeft, ArrowRight, Download, Copy, Printer, Check,
  Loader2, ExternalLink, AlertTriangle, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { DOCUMENT_TYPES, type DocumentType } from '@/data/documentTypes';

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi / हिन्दी' },
  { value: 'kn', label: 'Kannada / ಕನ್ನಡ' },
  { value: 'ta', label: 'Tamil / தமிழ்' },
  { value: 'te', label: 'Telugu / తెలుగు' },
  { value: 'mr', label: 'Marathi / मराठी' },
  { value: 'bn', label: 'Bengali / বাংলা' },
];

type Step = 'select' | 'fill' | 'generating' | 'preview';

const DocumentGenerator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [docLanguage, setDocLanguage] = useState(i18n.language || 'en');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const isHindi = i18n.language === 'hi';

  const filteredDocs = DOCUMENT_TYPES.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.category.includes(q);
  });

  const handleSelectDoc = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setAnswers({});
    setStep('fill');
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const isFormValid = () => {
    if (!selectedDoc) return false;
    return selectedDoc.fields.filter(f => f.required).every(f => answers[f.id]?.trim());
  };

  const handleGenerate = async () => {
    if (!selectedDoc || !isFormValid()) return;
    setStep('generating');
    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const resp = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentType: selectedDoc.title,
          answers: Object.fromEntries(
            selectedDoc.fields.map(f => [f.label, answers[f.id] || 'Not provided'])
          ),
          language: docLanguage,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate document');
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let buffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setGeneratedContent(content);
            }
          } catch { /* partial JSON */ }
        }
      }

      setStep('preview');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to generate document');
      setStep('fill');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success(t('copiedToClipboard'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${selectedDoc?.title}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.6}h1,h2,h3{margin-top:1.5em}hr{margin:2em 0}</style>
      </head><body>${previewRef.current?.innerHTML || ''}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadText = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc?.id || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('generateLegalDocuments')}</h1>
          <p className="text-muted-foreground mt-1">{t('docGeneratorSubtitle')}</p>
        </div>
        {step !== 'select' && (
          <Button variant="outline" onClick={() => { setStep('select'); setSelectedDoc(null); setGeneratedContent(''); }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('back')}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Document Type */}
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder={t('searchDocuments')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map(doc => (
                <Card key={doc.id} className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all" onClick={() => handleSelectDoc(doc)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <CardTitle className="text-sm">{isHindi ? doc.titleHi : doc.title}</CardTitle>
                        <Badge variant="outline" className="text-[10px] mt-1">{doc.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{isHindi ? doc.descriptionHi : doc.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Fill Form */}
        {step === 'fill' && selectedDoc && (
          <motion.div key="fill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedDoc.icon}</span>
                  <div>
                    <CardTitle>{isHindi ? selectedDoc.titleHi : selectedDoc.title}</CardTitle>
                    <CardDescription>{isHindi ? selectedDoc.descriptionHi : selectedDoc.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language selector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t('documentLanguage')}</label>
                  <Select value={docLanguage} onValueChange={setDocLanguage}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fields */}
                {selectedDoc.fields.map(field => (
                  <div key={field.id}>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {isHindi ? field.labelHi : field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <Input
                        value={answers[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <Textarea
                        value={answers[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        type="date"
                        value={answers[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                      />
                    )}
                    {field.type === 'select' && field.options && (
                      <Select value={answers[field.id] || ''} onValueChange={v => handleFieldChange(field.id, v)}>
                        <SelectTrigger><SelectValue placeholder={t('select')} /></SelectTrigger>
                        <SelectContent>
                          {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-4">
                  <Button onClick={handleGenerate} disabled={!isFormValid()} className="gap-2">
                    <FileText className="h-4 w-4" /> {t('generateDocument')}
                  </Button>
                  <Button variant="outline" onClick={() => { setStep('select'); setSelectedDoc(null); }}>
                    {t('cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-lg font-medium text-foreground">{t('generatingYourDocument')}</p>
                  <p className="text-sm text-muted-foreground">{t('generatingPleaseWait')}</p>
                </div>
                {generatedContent && (
                  <div className="mt-6 border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Actions bar */}
            <Card>
              <CardContent className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleCopy} variant="outline" className="gap-1.5">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t('copied') : t('copyText')}
                  </Button>
                  <Button size="sm" onClick={handleDownloadText} variant="outline" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> {t('downloadTxt')}
                  </Button>
                  <Button size="sm" onClick={handlePrint} variant="outline" className="gap-1.5">
                    <Printer className="h-3.5 w-3.5" /> {t('print')}
                  </Button>
                  <Button size="sm" variant="default" onClick={() => { setStep('fill'); setGeneratedContent(''); }} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> {t('editAndRegenerate')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {isHindi && selectedDoc ? selectedDoc.titleHi : selectedDoc?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[600px]">
                  <div ref={previewRef} className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Authority suggestion */}
            {selectedDoc?.suggestedAuthority && (
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('submitTo')}: {selectedDoc.suggestedAuthority}</p>
                      {selectedDoc.authorityLink && (
                        <Button size="sm" variant="link" className="p-0 h-auto text-xs gap-1" asChild>
                          <a href={selectedDoc.authorityLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" /> {t('visitPortal')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center px-4">
              ⚠️ {t('documentDisclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentGenerator;
