import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { BadgeCheck, Upload, FileText, ShieldCheck } from 'lucide-react';

type VerificationStatus = 'not_verified' | 'under_review' | 'verified';

const VerificationSection = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [idStatus, setIdStatus] = useState<VerificationStatus>('not_verified');
  const [addressStatus, setAddressStatus] = useState<VerificationStatus>('not_verified');

  const statusConfig: Record<VerificationStatus, { label: string; color: string }> = {
    not_verified: { label: t('notVerified'), color: 'bg-red-100 text-red-700 border-red-200' },
    under_review: { label: t('underReview'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    verified: { label: t('verified'), color: 'bg-green-100 text-green-700 border-green-200' },
  };

  const handleUpload = (type: 'id' | 'address') => {
    const setter = type === 'id' ? setIdStatus : setAddressStatus;
    setter('under_review');
    toast({
      title: t('documentUploaded'),
      description: type === 'id' ? t('governmentIdUploaded') : t('addressProofUploaded'),
    });
  };

  const DocCard = ({ title, icon: Icon, status, onUpload }: { title: string; icon: any; status: VerificationStatus; onUpload: () => void }) => {
    const config = statusConfig[status];
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <Badge variant="outline" className={`text-xs mt-0.5 ${config.color}`}>{config.label}</Badge>
          </div>
        </div>
        {status === 'not_verified' && (
          <Button size="sm" variant="outline" onClick={onUpload}>
            <Upload className="h-3.5 w-3.5 mr-1" /> {t('upload')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BadgeCheck className="h-4 w-4" /> {t('identityVerification')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('identityVerificationDesc')}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <DocCard title={t('governmentId')} icon={FileText} status={idStatus} onUpload={() => handleUpload('id')} />
        <DocCard title={t('addressProof')} icon={ShieldCheck} status={addressStatus} onUpload={() => handleUpload('address')} />
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground"><strong>{t('verificationNote')}</strong></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationSection;
