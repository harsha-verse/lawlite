import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, User, Briefcase, GraduationCap, Globe, Calendar, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';

const PRACTICE_AREAS = [
  'Criminal Law', 'Civil Litigation', 'Family Law', 'Property Disputes',
  'Consumer Law', 'Corporate Law', 'Labour Law', 'Cyber Law',
  'Intellectual Property', 'Startup & MSME Law',
];
const COURT_JURISDICTIONS = ['District Court', 'High Court', 'Supreme Court', 'Consumer Forum', 'Family Court', 'Labour Court', 'NCLT', 'Tribunal'];
const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Urdu', 'Odia', 'Assamese'];
const CONSULTATION_TYPES = ['Online Consultation', 'Phone Consultation', 'In-Person Meeting'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Education { id?: string; degree: string; university: string; graduation_year: number; certifications: string; }
interface CaseStat { id?: string; case_category: string; cases_handled: number; }

const LawyerProfileEdit: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, lawyerProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState(0);
  const [experience, setExperience] = useState(0);
  const [practiceAreas, setPracticeAreas] = useState<string[]>([]);
  const [courtJurisdictions, setCourtJurisdictions] = useState<string[]>([]);
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  const [profileVisible, setProfileVisible] = useState(true);
  const [consultationTypes, setConsultationTypes] = useState<string[]>([]);
  const [consultationDuration, setConsultationDuration] = useState(30);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableStartTime, setAvailableStartTime] = useState('10:00');
  const [availableEndTime, setAvailableEndTime] = useState('18:00');
  const [education, setEducation] = useState<Education[]>([]);
  const [caseStats, setCaseStats] = useState<CaseStat[]>([]);

  useEffect(() => {
    if (lawyerProfile) {
      setTagline((lawyerProfile as any).tagline || ''); setBio(lawyerProfile.bio || '');
      setLawFirm((lawyerProfile as any).law_firm || ''); setSpecialization(lawyerProfile.specialization || '');
      setConsultationFee(lawyerProfile.consultation_fee || 0); setExperience(lawyerProfile.experience || 0);
      setPracticeAreas(lawyerProfile.practice_areas || []); setCourtJurisdictions((lawyerProfile as any).court_jurisdictions || []);
      setLanguagesSpoken((lawyerProfile as any).languages_spoken || []); setProfileVisible((lawyerProfile as any).profile_visible ?? true);
      setConsultationTypes((lawyerProfile as any).consultation_types || []); setConsultationDuration((lawyerProfile as any).consultation_duration || 30);
      setAvailableDays((lawyerProfile as any).available_days || []); setAvailableStartTime((lawyerProfile as any).available_start_time || '10:00');
      setAvailableEndTime((lawyerProfile as any).available_end_time || '18:00');
    }
    if (user) { fetchEducation(); fetchCaseStats(); }
  }, [lawyerProfile, user]);

  const fetchEducation = async () => { const { data } = await supabase.from('lawyer_education' as any).select('*').eq('user_id', user!.id); if (data) setEducation(data as any[]); };
  const fetchCaseStats = async () => { const { data } = await supabase.from('lawyer_case_stats' as any).select('*').eq('user_id', user!.id); if (data) setCaseStats(data as any[]); };
  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => { setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]); };

  const saveProfile = async () => {
    if (!user) return; setSaving(true);
    try {
      const { error } = await supabase.from('lawyer_profiles').update({
        tagline, bio, law_firm: lawFirm, specialization, consultation_fee: consultationFee, experience,
        practice_areas: practiceAreas, court_jurisdictions: courtJurisdictions, languages_spoken: languagesSpoken,
        profile_visible: profileVisible, consultation_types: consultationTypes, consultation_duration: consultationDuration,
        available_days: availableDays, available_start_time: availableStartTime, available_end_time: availableEndTime,
      } as any).eq('user_id', user.id);
      if (error) throw error;
      for (const edu of education) {
        if (edu.id) { await (supabase.from('lawyer_education' as any) as any).update({ degree: edu.degree, university: edu.university, graduation_year: edu.graduation_year, certifications: edu.certifications }).eq('id', edu.id); }
        else { await (supabase.from('lawyer_education' as any) as any).insert({ user_id: user.id, degree: edu.degree, university: edu.university, graduation_year: edu.graduation_year, certifications: edu.certifications }); }
      }
      for (const stat of caseStats) {
        if (stat.id) { await (supabase.from('lawyer_case_stats' as any) as any).update({ case_category: stat.case_category, cases_handled: stat.cases_handled }).eq('id', stat.id); }
        else { await (supabase.from('lawyer_case_stats' as any) as any).insert({ user_id: user.id, case_category: stat.case_category, cases_handled: stat.cases_handled }); }
      }
      await refreshProfile(); await fetchEducation(); await fetchCaseStats();
      toast({ title: t('profileUpdated'), description: t('profileSavedDesc') });
    } catch (err: any) { toast({ title: t('error'), description: err.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const addEducation = () => setEducation([...education, { degree: '', university: '', graduation_year: new Date().getFullYear(), certifications: '' }]);
  const removeEducation = async (idx: number) => { const edu = education[idx]; if (edu.id) await (supabase.from('lawyer_education' as any) as any).delete().eq('id', edu.id); setEducation(education.filter((_, i) => i !== idx)); };
  const addCaseStat = () => setCaseStats([...caseStats, { case_category: '', cases_handled: 0 }]);
  const removeCaseStat = async (idx: number) => { const stat = caseStats[idx]; if (stat.id) await (supabase.from('lawyer_case_stats' as any) as any).delete().eq('id', stat.id); setCaseStats(caseStats.filter((_, i) => i !== idx)); };
  const roleLabel = (role: string) => role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('editProfessionalProfile')}</h1>
          <p className="text-muted-foreground mt-1">{t('buildPresence')}</p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? t('savingLabel') : t('saveAllChanges')}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><User className="h-3.5 w-3.5 mr-1" />{t('overviewTab')}</TabsTrigger>
          <TabsTrigger value="specialization"><Briefcase className="h-3.5 w-3.5 mr-1" />{t('practiceTab')}</TabsTrigger>
          <TabsTrigger value="education"><GraduationCap className="h-3.5 w-3.5 mr-1" />{t('educationTab')}</TabsTrigger>
          <TabsTrigger value="experience"><BarChart3 className="h-3.5 w-3.5 mr-1" />{t('casesTab')}</TabsTrigger>
          <TabsTrigger value="consultation"><Calendar className="h-3.5 w-3.5 mr-1" />{t('consultationTabLabel')}</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" />{t('settingsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('professionalOverview')}</CardTitle><CardDescription>{t('publicFacingInfo')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('name')}</Label><Input value={profile?.name || ''} disabled className="bg-muted" /></div>
                <div><Label>{t('roleTitle')}</Label><Input value={roleLabel(lawyerProfile?.role_type || '')} disabled className="bg-muted" /></div>
              </div>
              <div><Label>{t('professionalTagline')}</Label><Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Criminal & Civil Lawyer | 12 Years Experience" maxLength={120} /><p className="text-xs text-muted-foreground mt-1">{tagline.length}/120 {t('characters')}</p></div>
              <div><Label>{t('lawFirmOrg')}</Label><Input value={lawFirm} onChange={e => setLawFirm(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('yearsOfExperience')}</Label><Input type="number" value={experience} onChange={e => setExperience(parseInt(e.target.value) || 0)} min={0} /></div>
                <div><Label>{t('barCouncilNumber')}</Label><Input value={lawyerProfile?.bar_council_number || ''} disabled className="bg-muted" /></div>
              </div>
              <div><Label>{t('professionalSummary')}</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t('describeLegalExperience')} rows={5} maxLength={1000} /><p className="text-xs text-muted-foreground mt-1">{bio.length}/1000 {t('characters')}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialization" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('areasOfSpecialization')}</CardTitle><CardDescription>{t('selectPracticeAreasHelp')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t('primarySpecialization')}</Label>
                <Select value={specialization || ''} onValueChange={setSpecialization}><SelectTrigger><SelectValue placeholder={t('selectPrimarySpec')} /></SelectTrigger><SelectContent>{PRACTICE_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="mb-2 block">{t('practiceAreasMultiple')}</Label><div className="grid grid-cols-2 gap-2">{PRACTICE_AREAS.map(area => (<div key={area} className="flex items-center space-x-2"><Checkbox checked={practiceAreas.includes(area)} onCheckedChange={() => toggleArrayItem(practiceAreas, area, setPracticeAreas)} /><label className="text-sm">{area}</label></div>))}</div></div>
              <div><Label className="mb-2 block">{t('courtJurisdictions')}</Label><div className="grid grid-cols-2 gap-2">{COURT_JURISDICTIONS.map(court => (<div key={court} className="flex items-center space-x-2"><Checkbox checked={courtJurisdictions.includes(court)} onCheckedChange={() => toggleArrayItem(courtJurisdictions, court, setCourtJurisdictions)} /><label className="text-sm">{court}</label></div>))}</div></div>
              <div><Label className="mb-2 block">{t('languagesSpoken')}</Label><div className="flex flex-wrap gap-2">{LANGUAGES.map(lang => (<Badge key={lang} variant={languagesSpoken.includes(lang) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayItem(languagesSpoken, lang, setLanguagesSpoken)}>{lang}</Badge>))}</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between">{t('educationQualifications')}<Button size="sm" variant="outline" onClick={addEducation}><Plus className="h-3.5 w-3.5 mr-1" />{t('add')}</Button></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {education.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('noEducationEntries')}</p>}
              {education.map((edu, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium">{t('entryLabel')} {idx + 1}</span><Button size="icon" variant="ghost" onClick={() => removeEducation(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t('degreeLabel')}</Label><Input value={edu.degree} onChange={e => { const u = [...education]; u[idx].degree = e.target.value; setEducation(u); }} placeholder="LLB / LLM" /></div>
                    <div><Label>{t('graduationYear')}</Label><Input type="number" value={edu.graduation_year} onChange={e => { const u = [...education]; u[idx].graduation_year = parseInt(e.target.value) || 0; setEducation(u); }} /></div>
                  </div>
                  <div><Label>{t('universityLawCollege')}</Label><Input value={edu.university} onChange={e => { const u = [...education]; u[idx].university = e.target.value; setEducation(u); }} /></div>
                  <div><Label>{t('certificationsTraining')}</Label><Input value={edu.certifications} onChange={e => { const u = [...education]; u[idx].certifications = e.target.value; setEducation(u); }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between">{t('casesHandledTitle')}<Button size="sm" variant="outline" onClick={addCaseStat}><Plus className="h-3.5 w-3.5 mr-1" />{t('addCategory')}</Button></CardTitle><CardDescription>{t('showcaseExperience')}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {caseStats.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('noCaseCategories')}</p>}
              {caseStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Input className="flex-1" value={stat.case_category} onChange={e => { const u = [...caseStats]; u[idx].case_category = e.target.value; setCaseStats(u); }} />
                  <Input className="w-24" type="number" value={stat.cases_handled} onChange={e => { const u = [...caseStats]; u[idx].cases_handled = parseInt(e.target.value) || 0; setCaseStats(u); }} min={0} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{t('casesLabel')}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeCaseStat(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('consultationDetails')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="mb-2 block">{t('consultationTypesLabel')}</Label><div className="flex flex-wrap gap-2">{CONSULTATION_TYPES.map(type => (<Badge key={type} variant={consultationTypes.includes(type) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayItem(consultationTypes, type, setConsultationTypes)}>{type}</Badge>))}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('consultationFeeRupees')}</Label><Input type="number" value={consultationFee} onChange={e => setConsultationFee(parseInt(e.target.value) || 0)} min={0} /></div>
                <div><Label>{t('durationMinutes')}</Label><Select value={String(consultationDuration)} onValueChange={v => setConsultationDuration(parseInt(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem></SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('availabilitySchedule')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="mb-2 block">{t('availableDaysLabel')}</Label><div className="flex flex-wrap gap-2">{DAYS.map(day => (<Badge key={day} variant={availableDays.includes(day) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayItem(availableDays, day, setAvailableDays)}>{day}</Badge>))}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('startTime')}</Label><Input type="time" value={availableStartTime} onChange={e => setAvailableStartTime(e.target.value)} /></div>
                <div><Label>{t('endTime')}</Label><Input type="time" value={availableEndTime} onChange={e => setAvailableEndTime(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>{t('profileSettingsTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {profileVisible ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{t('profileVisibility')}</p>
                    <p className="text-sm text-muted-foreground">{profileVisible ? t('profileVisibleDesc') : t('profileHiddenDesc')}</p>
                  </div>
                </div>
                <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LawyerProfileEdit;
