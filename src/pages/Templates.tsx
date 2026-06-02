import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Home, Building, Users, ShieldCheck, Briefcase, IndianRupee } from 'lucide-react';
import { legalTemplates, templateCategories, LegalTemplate } from '@/data/templateData';
import TemplateCard from '@/components/Templates/TemplateCard';
import TemplatePreview from '@/components/Templates/TemplatePreview';

const categoryIcons: Record<string, React.ElementType> = {
  FileText, Home, Briefcase, ShieldCheck, Users, IndianRupee, Building,
};

const Templates: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || 'all';

  const setSelectedCategory = (cat: string) => {
    setSearchParams(cat === 'all' ? {} : { category: cat });
  };

  const filteredTemplates = legalTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = (template: LegalTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Free Legal Templates</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Download ready-to-use legal document templates. Fill in details and download as PDF or Word.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search templates — e.g. rental agreement, complaint letter, loan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {templateCategories.map((cat) => {
          const Icon = categoryIcons[cat.icon] || FileText;
          const isActive = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{cat.name}</span>
              <span className="sm:hidden">{cat.name.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
      </p>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} onPreview={handlePreview} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try a different search term or category.</p>
        </div>
      )}

      {/* Help card */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">{t('needHelpLegalDoc')}</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {t('aiRecommendTemplate')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">{t('chatWithAIBtn')}</Button>
              <Button variant="outline" size="sm">{t('findLawyerBtn')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <TemplatePreview template={selectedTemplate} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
};

export default Templates;
