import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Bug, Star, BookOpen, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HelpSupportSection = () => {
  const { t } = useTranslation();

  const supportItems = [
    { icon: MessageCircle, labelKey: 'contactSupport', descKey: 'contactSupportDesc', action: 'contact' },
    { icon: Bug, labelKey: 'reportAnIssue', descKey: 'reportAnIssueDesc', action: 'report' },
    { icon: Star, labelKey: 'submitFeedback', descKey: 'submitFeedbackDesc', action: 'feedback' },
    { icon: BookOpen, labelKey: 'faq', descKey: 'faqDesc', action: 'faq' },
  ];

  const helplines = [
    { labelKey: 'womenHelpline', number: '181' },
    { labelKey: 'cyberCrime', number: '1930' },
    { labelKey: 'consumerHelpline', number: '1800-11-4000' },
    { labelKey: 'legalAidNALSA', number: '15100' },
    { labelKey: 'police', number: '100' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-4 w-4" /> {t('helpSupport')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportItems.map(item => {
              const Icon = item.icon;
              return (
                <Button key={item.action} variant="outline" className="h-auto p-4 flex items-start gap-3 justify-start"
                  onClick={() => toast({ title: t(item.labelKey), description: t('featureComingSoon') })}>
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{t(item.labelKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-4 w-4" /> {t('legalHelplines')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {helplines.map(h => (
              <div key={h.number} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-foreground">{t(h.labelKey)}</span>
                <a href={`tel:${h.number}`} className="text-sm font-bold text-primary hover:underline">{h.number}</a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportSection;
