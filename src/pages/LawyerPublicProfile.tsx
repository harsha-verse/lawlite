import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle, MapPin, Clock, Star, Briefcase, GraduationCap, Globe,
  Calendar, Phone, Video, Users, ArrowLeft, Scale, BarChart3, Building
} from 'lucide-react';
import TrustBadges from '@/components/Lawyer/TrustBadges';
import PerformanceStats from '@/components/Lawyer/PerformanceStats';
import ReviewsList from '@/components/Lawyer/ReviewsList';
import ReviewForm from '@/components/Lawyer/ReviewForm';
import MessageDialog from '@/components/Messaging/MessageDialog';

const LawyerPublicProfile: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [caseStats, setCaseStats] = useState<any[]>([]);
  const [consultationCount, setConsultationCount] = useState(0);
  const [completedCasesCount, setCompletedCasesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const isDemo = !!id && id.startsWith('demo:');
  const demoId = isDemo ? id!.slice(5) : null;

  useEffect(() => {
    if (!id) return;
    if (isDemo) fetchDemo(demoId!); else fetchLawyerProfile(id);
  }, [id]);

  const fetchDemo = async (demoLawyerId: string) => {
    setLoading(true);
    const { data } = await supabase.from('demo_lawyers' as any).select('*').eq('id', demoLawyerId).maybeSingle();
    if (data) {
      const d: any = data;
      setLawyer({
        ...d,
        verification_status: 'verified',
        consultation_duration: 30,
        rating: Number(d.rating) || 0,
      });
      setProfileData({ id: d.id, name: d.name, avatar_url: d.avatar_url, city: d.city, state: d.state, email: d.email });
      setEducation((d.education as any[]) || []);
      setCaseStats((d.case_stats as any[]) || []);
      setCompletedCasesCount(d.total_cases || 0);
      setConsultationCount(0);
    }
    setLoading(false);
  };

  const fetchLawyerProfile = async (userId: string) => {
    setLoading(true);
    const [lpRes, profRes, eduRes, csRes] = await Promise.all([
      supabase.from('lawyer_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('lawyer_education' as any).select('*').eq('user_id', userId),
      supabase.from('lawyer_case_stats' as any).select('*').eq('user_id', userId),
    ]);
    if (lpRes.data) setLawyer(lpRes.data);
    if (profRes.data) setProfileData(profRes.data);
    if (eduRes.data) setEducation(eduRes.data as any[]);
    if (csRes.data) setCaseStats(csRes.data as any[]);
    const [consRes, casesRes] = await Promise.all([
      supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('lawyer_id', userId).eq('status', 'completed'),
      supabase.from('cases').select('id', { count: 'exact', head: true }).eq('lawyer_id', userId).eq('status', 'closed'),
    ]);
    setConsultationCount(consRes.count || 0);
    setCompletedCasesCount(casesRes.count || 0);
    setLoading(false);
  };

  const roleLabel = (r: string) => r?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const totalCases = caseStats.reduce((sum, s) => sum + (s.cases_handled || 0), 0);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><p className="text-muted-foreground">{t('loadingProfileLabel')}</p></div>;
  if (!lawyer || !profileData) return <div className="p-6 text-center"><p className="text-muted-foreground">{t('lawyerProfileNotFound')}</p><Button variant="outline" className="mt-4" onClick={() => navigate('/lawyers')}><ArrowLeft className="h-4 w-4 mr-2" />{t('backToLawyers')}</Button></div>;

  const isVerified = lawyer.verification_status === 'verified';
  const isClient = user && user.id !== id;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate('/lawyers')}><ArrowLeft className="h-4 w-4 mr-2" />{t('backToLawyers')}</Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-28 w-28 border-4 border-primary/20">
              <AvatarImage src={profileData.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {(profileData.name || '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{profileData.name}</h1>
              </div>
              <p className="text-muted-foreground font-medium">{roleLabel(lawyer.role_type)}</p>
              {lawyer.tagline && <p className="text-foreground italic">"{lawyer.tagline}"</p>}
              <TrustBadges isVerified={isVerified} rating={lawyer.rating || 0} totalReviews={lawyer.total_reviews || 0} experience={lawyer.experience || 0} totalCases={totalCases} />
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profileData.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profileData.city}, {profileData.state}</span>}
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lawyer.experience || 0} {t('yearsExperience')}</span>
                {lawyer.law_firm && <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" />{lawyer.law_firm}</span>}
                {lawyer.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{lawyer.rating} ({lawyer.total_reviews} {t('reviews')})</span>}
              </div>
              <div className="flex gap-2 pt-2 flex-wrap">
                {isDemo ? (
                  <Button onClick={() => setMsgOpen(true)}><Calendar className="h-4 w-4 mr-2" />Request Consultation</Button>
                ) : (
                  <Button onClick={() => navigate(`/book-consultation?lawyer=${id}`)}><Calendar className="h-4 w-4 mr-2" />{t('bookConsultation')}</Button>
                )}
                <Button variant="outline" onClick={() => setMsgOpen(true)}>Send Message</Button>
                {!isDemo && <Button variant="outline" onClick={() => navigate(`/submit-case?lawyer=${id}`)}>{t('submitCaseBtn')}</Button>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">{t('aboutTab')}</TabsTrigger>
              <TabsTrigger value="reviews">{t('reviewsTabLabel')} ({lawyer.total_reviews || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 mt-4">
              {lawyer.bio && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5" />{t('aboutTab')}</CardTitle></CardHeader>
                  <CardContent><p className="text-foreground leading-relaxed whitespace-pre-wrap">{lawyer.bio}</p></CardContent>
                </Card>
              )}
              {lawyer.practice_areas?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Scale className="h-5 w-5" />{t('practiceAreas')}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.practice_areas.map((a: string) => <Badge key={a} variant="secondary">{a}</Badge>)}
                    </div>
                    {lawyer.specialization && (
                      <p className="text-sm text-muted-foreground mt-3">{t('primarySpecLabel')}: <span className="font-medium text-foreground">{lawyer.specialization}</span></p>
                    )}
                  </CardContent>
                </Card>
              )}
              {education.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5" />{t('educationQualifications')}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {education.map((edu, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.university} – {edu.graduation_year}</p>
                          {edu.certifications && <p className="text-xs text-muted-foreground mt-0.5">{edu.certifications}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {caseStats.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />{t('casesHandledTitle')} ({totalCases} {t('totalSuffix')})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {caseStats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{stat.case_category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((stat.cases_handled / Math.max(totalCases, 1)) * 100, 100)}%` }} />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">{stat.cases_handled}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 mt-4">
              {isDemo ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/30">Verified client reviews appear here once this lawyer activates their LawLite account.</div>
              ) : (
                <>
                  {isClient && (
                    <div>
                      {showReviewForm ? (
                        <ReviewForm lawyerId={id!} onSubmitted={() => setShowReviewForm(false)} />
                      ) : (
                        <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                          <Star className="h-4 w-4 mr-2" />{t('writeReview')}
                        </Button>
                      )}
                    </div>
                  )}
                  <ReviewsList lawyerId={id!} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <PerformanceStats rating={lawyer.rating || 0} totalReviews={lawyer.total_reviews || 0}
            casesHandled={totalCases} casesCompleted={completedCasesCount} consultationCount={consultationCount} />

          <Card>
            <CardHeader><CardTitle className="text-lg">{t('consultationTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {lawyer.consultation_fee > 0 && (
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">₹{lawyer.consultation_fee}</p>
                  <p className="text-xs text-muted-foreground">{t('perLabel')} {lawyer.consultation_duration || 30} {t('minSession')}</p>
                </div>
              )}
              {lawyer.consultation_types?.length > 0 && (
                <div className="space-y-2">
                  {lawyer.consultation_types.map((type: string) => {
                    const Icon = type.includes('Online') ? Video : type.includes('Phone') ? Phone : Users;
                    return <div key={type} className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-muted-foreground" />{type}</div>;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {lawyer.available_days?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('availabilityTitle')}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {lawyer.available_days.map((day: string) => <Badge key={day} variant="outline" className="text-xs">{day.slice(0, 3)}</Badge>)}
                </div>
                <p className="text-sm text-muted-foreground">{lawyer.available_start_time} – {lawyer.available_end_time}</p>
              </CardContent>
            </Card>
          )}

          {lawyer.languages_spoken?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />{t('languages')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lawyer.languages_spoken.map((l: string) => <Badge key={l} variant="outline">{l}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {lawyer.court_jurisdictions?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('courtJurisdictionsTitle')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lawyer.court_jurisdictions.map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">{t('professionalInfoTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('barCouncilNo')}</span><span className="font-medium">{lawyer.bar_council_number}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">{t('practicingSince')}</span><span className="font-medium">{lawyer.year_of_practice}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MessageDialog open={msgOpen} onOpenChange={setMsgOpen} recipient={profileData ? { id: isDemo ? demoId! : id!, name: profileData.name, type: isDemo ? 'demo_lawyer' : 'lawyer' } : null} />
    </div>
  );
};

export default LawyerPublicProfile;
