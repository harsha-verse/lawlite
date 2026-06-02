import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Building, FileCheck, ClipboardList, Users, ShieldCheck, HelpCircle, ExternalLink, CheckCircle2 } from 'lucide-react';

const MSMESupport: React.FC = () => {
  const { t } = useTranslation();

  const msmeCards = [
    { title: t('msmeRegistrationGuidance'), description: t('msmeRegistrationDesc'), icon: Building, items: [t('msmeStep1'), t('msmeStep2'), t('msmeStep3'), t('msmeStep4'), t('msmeStep5'), t('msmeStep6')], badge: t('freeRegistration') },
    { title: t('gstBasics'), description: t('gstBasicsDesc'), icon: FileCheck, items: [t('gstStep1'), t('gstStep2'), t('gstStep3'), t('gstStep4'), t('gstStep5'), t('gstStep6')], badge: t('taxCompliance') },
    { title: t('vendorAgreements'), description: t('vendorAgreementsDesc'), icon: ClipboardList, items: [t('vendorItem1'), t('vendorItem2'), t('vendorItem3'), t('vendorItem4'), t('vendorItem5'), t('vendorItem6')], badge: t('templates'), linkTo: '/templates' },
    { title: t('partnershipDeeds'), description: t('partnershipDeedsDesc'), icon: Users, items: [t('partnershipItem1'), t('partnershipItem2'), t('partnershipItem3'), t('partnershipItem4'), t('partnershipItem5'), t('partnershipItem6')], badge: t('templates'), linkTo: '/templates' },
    { title: t('hrPolicies'), description: t('hrPoliciesDesc'), icon: Users, items: [t('hrItem1'), t('hrItem2'), t('hrItem3'), t('hrItem4'), t('hrItem5'), t('hrItem6')], badge: t('hrCompliance') },
    { title: t('complianceChecklist'), description: t('complianceChecklistDesc'), icon: ShieldCheck, items: [t('complianceItem1'), t('complianceItem2'), t('complianceItem3'), t('complianceItem4'), t('complianceItem5'), t('complianceItem6'), t('complianceItem7'), t('complianceItem8'), t('complianceItem9'), t('complianceItem10')], badge: t('mustDo') },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-foreground mb-2">{t('msmeSupport')}</h1><p className="text-muted-foreground">{t('msmeSupportSubtitle')}</p></div>
        <Link to="/consultants"><Button className="gap-2"><HelpCircle className="h-4 w-4" />{t('askForHelp')}</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {msmeCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3"><div className="bg-primary/10 p-2.5 rounded-lg"><Icon className="h-5 w-5 text-primary" /></div><CardTitle className="text-lg">{card.title}</CardTitle></div>
                  <Badge variant="secondary" className="shrink-0">{card.badge}</Badge>
                </div>
                <CardDescription className="mt-2">{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <ul className="space-y-2 mb-4">{card.items.map((item, i) => (<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{item}</li>))}</ul>
                {card.linkTo && (<Link to={card.linkTo}><Button variant="outline" size="sm" className="gap-2 w-full"><ExternalLink className="h-4 w-4" />{t('viewTemplates')}</Button></Link>)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg"><HelpCircle className="h-6 w-6 text-primary" /></div>
            <div className="flex-1"><h3 className="font-semibold text-lg mb-1">{t('needMSMEGuidance')}</h3><p className="text-muted-foreground text-sm">{t('needMSMEGuidanceDesc')}</p></div>
            <Link to="/consultants"><Button>{t('connectWithConsultant')}</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MSMESupport;
