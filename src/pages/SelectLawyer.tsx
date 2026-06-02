import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, User, Star, MapPin, Clock, Briefcase, CheckCircle,
  Scale, Award, Languages, ArrowRight
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  junior_lawyer: 'Junior Lawyer',
  advocate: 'Advocate',
  senior_advocate: 'Senior Advocate',
  legal_consultant: 'Legal Consultant',
};

const SelectLawyer: React.FC = () => {
  const { t } = useTranslation();
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<any[]>([]);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) fetchData();
  }, [caseId]);

  const fetchData = async () => {
    setLoading(true);
    const [caseRes, matchRes] = await Promise.all([
      supabase.from('cases').select('*').eq('id', caseId!).single(),
      supabase.from('case_matches').select('*').eq('case_id', caseId!).order('match_score', { ascending: false }),
    ]);
    if (caseRes.data) setCaseData(caseRes.data);
    if (matchRes.data && matchRes.data.length > 0) {
      const lawyerIds = matchRes.data.map(m => m.lawyer_id);
      const [profilesRes, lawyerProfilesRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', lawyerIds),
        supabase.from('lawyer_profiles').select('*').in('user_id', lawyerIds),
      ]);
      const profileMap: Record<string, any> = {};
      profilesRes.data?.forEach(p => { profileMap[p.id] = p; });
      const lawyerMap: Record<string, any> = {};
      lawyerProfilesRes.data?.forEach(l => { lawyerMap[l.user_id] = l; });
      const enriched = matchRes.data.map(m => ({
        ...m, profile: profileMap[m.lawyer_id], lawyer: lawyerMap[m.lawyer_id],
      }));
      setMatches(enriched);
    }
    setLoading(false);
  };

  const handleSelectLawyer = async (lawyerId: string) => {
    if (!caseId) return;
    setSelecting(lawyerId);
    try {
      await supabase.from('cases').update({
        lawyer_id: lawyerId, status: 'pending', match_status: 'client_selected',
        updated_at: new Date().toISOString(),
      }).eq('id', caseId);
      await supabase.from('case_matches').update({ status: 'selected' })
        .eq('case_id', caseId).eq('lawyer_id', lawyerId);
      await supabase.from('notifications').insert({
        user_id: lawyerId, title: t('clientSelectedYou'),
        message: t('clientChosenForCase', { caseType: caseData?.case_type }),
        type: 'case_request', related_case_id: caseId,
      });
      toast({ title: t('lawyerSelectedTitle'), description: t('lawyerNotifiedResp') });
      navigate(`/case/${caseId}`);
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/my-cases')} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('backToCases')}
      </Button>

      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center">
            <Scale className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('recommendedLawyersTitle')}</h1>
        <p className="text-muted-foreground">
          {t('weFoundLawyers', { count: matches.length })}{' '}
          <Badge variant="outline">{caseData?.case_type}</Badge> {t('caseLabel')}
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('noMatchingLawyers')}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/my-cases')}>
              {t('viewMyCases')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => {
            const { profile, lawyer } = match;
            const scorePercent = Math.min(100, match.match_score);
            const isAccepted = match.status === 'accepted';
            const isTopMatch = index === 0;

            return (
              <Card key={match.id} className={`hover:shadow-md transition-shadow ${isTopMatch ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      {isTopMatch && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">#1</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">{profile?.name || t('lawyer')}</h3>
                        <Badge variant="outline" className="text-xs">{ROLE_LABELS[lawyer?.role_type] || t('lawyer')}</Badge>
                        {isTopMatch && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{t('bestMatchLabel')}</Badge>}
                        {isAccepted && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{t('accepted')}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-medium text-muted-foreground">{t('matchLabel')}:</span>
                        <Progress value={scorePercent} className="flex-1 h-2" />
                        <span className="text-sm font-bold text-primary">{Math.round(scorePercent)}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(match.match_reasons || []).map((reason: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />{reason}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        {lawyer?.experience > 0 && (
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lawyer.experience} {t('years')}</span>
                        )}
                        {(profile?.city || profile?.state) && (
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                        )}
                        {lawyer?.rating > 0 && (
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{lawyer.rating}</span>
                        )}
                        {lawyer?.consultation_fee > 0 && (
                          <span className="font-medium text-foreground">₹{lawyer.consultation_fee}/{t('perSession')}</span>
                        )}
                      </div>
                      {lawyer?.practice_areas?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lawyer.practice_areas.slice(0, 4).map((a: string) => (
                            <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                          ))}
                          {lawyer.practice_areas.length > 4 && (
                            <Badge variant="outline" className="text-xs">+{lawyer.practice_areas.length - 4}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button onClick={() => handleSelectLawyer(match.lawyer_id)} disabled={selecting === match.lawyer_id} size="sm">
                        {selecting === match.lawyer_id ? t('selectingLabel') : t('chooseLabel')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/lawyer/${match.lawyer_id}`)}>
                        <ArrowRight className="h-3.5 w-3.5 mr-1" />{t('profile')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectLawyer;
