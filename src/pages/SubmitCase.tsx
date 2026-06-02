import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Scale } from 'lucide-react';
import { INDIAN_STATES } from '@/types';

const CASE_TYPES = [
  'Criminal Law', 'Civil Litigation', 'Family Law', 'Property Disputes',
  'Consumer Law', 'Corporate Law', 'Labour Law', 'Cyber Law',
  'Intellectual Property', 'Startup & MSME Law', 'Tax Law', 'Other',
];

const SubmitCase: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lawyerId = searchParams.get('lawyer');

  const [formData, setFormData] = useState({
    title: '',
    case_type: '',
    description: '',
    priority: 'medium',
    preferred_consultation: 'online',
    client_location_city: profile?.city || '',
    client_location_state: profile?.state || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.title || !formData.case_type || !formData.description) {
      toast({ title: t('error'), description: t('pleaseFillRequired'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('cases').insert({
        client_id: user.id,
        lawyer_id: lawyerId || null,
        title: formData.title,
        case_type: formData.case_type,
        description: formData.description,
        priority: formData.priority,
        preferred_consultation: formData.preferred_consultation,
        client_location_city: formData.client_location_city,
        client_location_state: formData.client_location_state,
        status: lawyerId ? 'pending' : 'pending',
      } as any).select().single();

      if (error) throw error;
      const caseId = (data as any).id;

      if (lawyerId) {
        // Direct lawyer request
        await supabase.from('notifications').insert({
          user_id: lawyerId,
          title: t('newCaseRequest'),
          message: `${t('newCaseRequest')}: "${formData.title}" (${formData.case_type})`,
          type: 'case_request',
          related_case_id: caseId,
        });
        toast({ title: t('caseSubmitted'), description: t('caseSentToLawyer') });
        navigate('/my-cases');
      } else {
        // Trigger smart matching
        toast({ title: t('caseSubmitted'), description: t('findingBestLawyers') });
        try {
          const { data: matchData } = await supabase.functions.invoke('match-lawyers', {
            body: { case_id: caseId, action: 'match' },
          });
          if (matchData?.auto_assigned) {
            toast({ title: t('lawyerAutoAssigned'), description: t('urgentLawyerAssigned') });
            navigate(`/case/${caseId}`);
          } else if (matchData?.matches?.length > 0) {
            navigate(`/case/${caseId}/select-lawyer`);
          } else {
            navigate('/my-cases');
          }
        } catch {
          navigate('/my-cases');
        }
      }
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('back')}
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Scale className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>{t('submitCaseRequest')}</CardTitle>
          <CardDescription>{t('describeLegalIssue')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('caseTitle')} *</Label>
              <Input placeholder={t('caseTitlePlaceholder')} value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>{t('caseTypeLabel')} *</Label>
              <Select value={formData.case_type} onValueChange={v => setFormData(p => ({ ...p, case_type: v }))}>
                <SelectTrigger><SelectValue placeholder={t('selectCaseType')} /></SelectTrigger>
                <SelectContent>{CASE_TYPES.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('describeProblem')} *</Label>
              <Textarea placeholder={t('provideDetails')} value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="min-h-[120px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('priority')}</Label>
                <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('low')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                    <SelectItem value="urgent">{t('urgentLabel')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('preferredConsultation')}</Label>
                <Select value={formData.preferred_consultation} onValueChange={v => setFormData(p => ({ ...p, preferred_consultation: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">{t('online')}</SelectItem>
                    <SelectItem value="phone">{t('phoneLabel')}</SelectItem>
                    <SelectItem value="in_person">{t('inPerson')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('city')}</Label>
                <Input placeholder={t('yourCity')} value={formData.client_location_city}
                  onChange={e => setFormData(p => ({ ...p, client_location_city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('state')}</Label>
                <Select value={formData.client_location_state} onValueChange={v => setFormData(p => ({ ...p, client_location_state: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectState')} /></SelectTrigger>
                  <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submitCaseRequest')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitCase;
