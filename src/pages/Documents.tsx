import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Edit, Share, Search, Eye, Trash2, Upload, Calendar } from 'lucide-react';

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const documents = [
    { id: 1, title: 'Rental Agreement - Mumbai Flat', type: 'Agreement', category: 'Property', createdAt: '2024-07-15', updatedAt: '2024-07-20', status: 'finalized', size: '245 KB', lawyerReviewed: true, reviewedBy: 'Adv. Priya Sharma' },
    { id: 2, title: 'Employment Contract - TechCorp', type: 'Contract', category: 'Employment', createdAt: '2024-07-10', updatedAt: '2024-07-12', status: 'draft', size: '189 KB', lawyerReviewed: false },
    { id: 3, title: 'Power of Attorney - Property Sale', type: 'Legal Document', category: 'Personal', createdAt: '2024-07-05', updatedAt: '2024-07-05', status: 'finalized', size: '156 KB', lawyerReviewed: true, reviewedBy: 'Adv. Rajesh Kumar' },
    { id: 4, title: 'NDA - Business Partnership', type: 'Agreement', category: 'Business', createdAt: '2024-06-28', updatedAt: '2024-07-01', status: 'review_pending', size: '203 KB', lawyerReviewed: false },
    { id: 5, title: 'Consumer Complaint - Defective Product', type: 'Complaint', category: 'Consumer', createdAt: '2024-06-25', updatedAt: '2024-06-26', status: 'submitted', size: '178 KB', lawyerReviewed: true, reviewedBy: 'Adv. Meera Patel' },
  ];

  const filters = [
    { id: 'all', name: t('allDocuments') },
    { id: 'draft', name: t('drafts') },
    { id: 'review_pending', name: t('pendingReview') },
    { id: 'finalized', name: t('finalized') },
    { id: 'submitted', name: t('submitted') },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review_pending': return 'bg-orange-100 text-orange-800';
      case 'finalized': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) { case 'draft': return t('draft'); case 'review_pending': return t('pendingReview'); case 'finalized': return t('finalized'); case 'submitted': return t('submitted'); default: return status; }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-foreground mb-2">{t('documents')}</h1><p className="text-muted-foreground">{t('documentsSubtitle')}</p></div>
        <Button className="flex items-center space-x-2"><Upload className="h-4 w-4" /><span>{t('uploadDocument')}</span></Button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input type="search" placeholder={t('searchDocumentsPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
          <TabsList>{filters.map((filter) => (<TabsTrigger key={filter.id} value={filter.id}>{filter.name}</TabsTrigger>))}</TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold">{doc.title}</h3>
                    <Badge variant="outline">{doc.type}</Badge><Badge className={getStatusColor(doc.status)}>{getStatusText(doc.status)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                    <div><span className="font-medium">{t('category')}:</span> {doc.category}</div>
                    <div><span className="font-medium">{t('size')}:</span> {doc.size}</div>
                    <div><span className="font-medium">{t('created')}:</span> {new Date(doc.createdAt).toLocaleDateString()}</div>
                    <div><span className="font-medium">{t('updated')}:</span> {new Date(doc.updatedAt).toLocaleDateString()}</div>
                  </div>
                  {doc.lawyerReviewed && <div className="flex items-center space-x-2 text-sm text-green-600 mb-4"><div className="w-2 h-2 bg-green-500 rounded-full" /><span>{t('reviewedBy')} {doc.reviewedBy}</span></div>}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Share className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">{t('noDocumentsFound')}</h3><p className="text-muted-foreground mb-4">{t('noDocumentsFoundDesc')}</p><Button><Upload className="h-4 w-4 mr-2" />{t('uploadFirstDocument')}</Button></div>
        )}
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">{t('needHelpDocuments')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2"><FileText className="h-4 w-4" /><span>{t('createFromTemplate')}</span></Button>
            <Button variant="outline" className="flex items-center space-x-2"><Eye className="h-4 w-4" /><span>{t('getDocumentReviewed')}</span></Button>
            <Button variant="outline" className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{t('scheduleConsultation')}</span></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
