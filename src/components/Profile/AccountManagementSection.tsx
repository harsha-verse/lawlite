import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Settings, UserX, Trash2, Download, FileText, Shield } from 'lucide-react';

const AccountManagementSection = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" /> {t('accountManagement')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3"
            onClick={() => toast({ title: t('dataExport'), description: t('dataExportDesc') })}>
            <Download className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">{t('exportPersonalData')}</p>
              <p className="text-xs text-muted-foreground">{t('exportPersonalDataDesc')}</p>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3"
            onClick={() => toast({ title: t('accountDeactivation'), description: t('accountDeactivationDesc'), variant: 'destructive' })}>
            <UserX className="h-4 w-4 text-yellow-600" />
            <div className="text-left">
              <p className="text-sm font-medium">{t('deactivateAccount')}</p>
              <p className="text-xs text-muted-foreground">{t('deactivateAccountDesc')}</p>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 border-destructive/30 hover:bg-destructive/5"
            onClick={() => toast({ title: t('accountDeletion'), description: t('accountDeletionDesc'), variant: 'destructive' })}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <div className="text-left">
              <p className="text-sm font-medium text-destructive">{t('requestAccountDeletion')}</p>
              <p className="text-xs text-muted-foreground">{t('requestAccountDeletionDesc')}</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" /> {t('legal')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
            <FileText className="h-4 w-4" /> {t('privacyPolicy')}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
            <FileText className="h-4 w-4" /> {t('termsAndConditions')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagementSection;
