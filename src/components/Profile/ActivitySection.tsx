import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, MessageSquare, Users, FileText, Download, AlertCircle, Eye } from 'lucide-react';

const ActivitySection = () => {
  const { t } = useTranslation();

  const activities = [
    { type: 'chat', title: t('propertyDisputeQuery'), date: '2 Mar 2026', status: t('completed'), icon: MessageSquare },
    { type: 'consultation', title: t('consultationWithLawyer'), date: '28 Feb 2026', status: t('completed'), icon: Users },
    { type: 'template', title: t('rentalAgreementTemplate'), date: '25 Feb 2026', status: t('downloaded'), icon: Download },
    { type: 'document', title: t('legalNoticeDraft'), date: '20 Feb 2026', status: t('generated'), icon: FileText },
    { type: 'chat', title: t('consumerRightsQuery'), date: '18 Feb 2026', status: t('completed'), icon: MessageSquare },
    { type: 'complaint', title: t('onlineFraudComplaint'), date: '15 Feb 2026', status: t('inProgress'), icon: AlertCircle },
  ];

  const statusColors: Record<string, string> = {
    [t('completed')]: 'bg-green-100 text-green-700 border-green-200',
    [t('downloaded')]: 'bg-blue-100 text-blue-700 border-blue-200',
    [t('generated')]: 'bg-purple-100 text-purple-700 border-purple-200',
    [t('inProgress')]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-4 w-4" /> {t('myLegalActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${statusColors[a.status] || ''}`}>{a.status}</Badge>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitySection;
