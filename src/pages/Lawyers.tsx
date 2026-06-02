import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatBot from '@/components/Chat/ChatBot';
import FeaturedLawyers from '@/components/Lawyer/FeaturedLawyers';
import MessageDialog from '@/components/Messaging/MessageDialog';
import { Search, Star, MapPin, Clock, CheckCircle, MessageCircle, Calendar, Scale, Users, Building, Shield, Laptop, Heart, Gavel, Globe } from 'lucide-react';

interface LawyerResult {
  is_demo?: boolean;
  user_id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  role_type: string;
  specialization: string | null;
  practice_areas: string[];
  experience: number;
  rating: number;
  total_reviews: number;
  consultation_fee: number;
  bio: string | null;
  tagline: string | null;
  languages_spoken: string[];
}

const Lawyers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showChatBot, setShowChatBot] = useState(false);
  const [lawyers, setLawyers] = useState<LawyerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTarget, setMsgTarget] = useState<LawyerResult | null>(null);

  const specializations = [
    { id: 'all', name: t('allLawyers'), icon: Scale },
    { id: 'Family Law', name: t('familyLaw'), icon: Heart },
    { id: 'Criminal Law', name: t('criminalLaw'), icon: Gavel },
    { id: 'Corporate Law', name: t('corporateLaw'), icon: Building },
    { id: 'Civil Litigation', name: t('civilLaw'), icon: Users },
    { id: 'Cyber Law', name: t('cyberLaw'), icon: Laptop },
    { id: 'Property Disputes', name: t('propertyLaw'), icon: Shield },
  ];

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    const [lpRes, demoRes] = await Promise.all([
      supabase.from('lawyer_profiles').select('*').eq('verification_status', 'verified').eq('profile_visible', true),
      supabase.from('demo_lawyers' as any).select('*').eq('is_active', true),
    ]);

    const lawyerProfiles = lpRes.data || [];
    const demos = (demoRes.data as any[]) || [];

    let real: LawyerResult[] = [];
    if (lawyerProfiles.length) {
      const userIds = lawyerProfiles.map(lp => lp.user_id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      real = lawyerProfiles.map(lp => {
        const p = profileMap.get(lp.user_id);
        return {
          user_id: lp.user_id,
          name: p?.name || 'Lawyer',
          avatar_url: p?.avatar_url || null,
          city: p?.city || null,
          state: p?.state || null,
          role_type: lp.role_type,
          specialization: lp.specialization,
          practice_areas: lp.practice_areas || [],
          experience: lp.experience || 0,
          rating: Number(lp.rating) || 0,
          total_reviews: lp.total_reviews || 0,
          consultation_fee: lp.consultation_fee || 0,
          bio: lp.bio,
          tagline: (lp as any).tagline,
          languages_spoken: (lp as any).languages_spoken || [],
        };
      });
    }

    const demoMapped: LawyerResult[] = demos.map(d => ({
      is_demo: true,
      user_id: d.id,
      name: d.name,
      avatar_url: d.avatar_url,
      city: d.city,
      state: d.state,
      role_type: d.role_type,
      specialization: d.specialization,
      practice_areas: d.practice_areas || [],
      experience: d.experience || 0,
      rating: Number(d.rating) || 0,
      total_reviews: d.total_reviews || 0,
      consultation_fee: d.consultation_fee || 0,
      bio: d.bio,
      tagline: d.tagline,
      languages_spoken: d.languages_spoken || [],
    }));

    setLawyers([...real, ...demoMapped]);
    setLoading(false);
  };

  const openMessage = (l: LawyerResult) => { setMsgTarget(l); setMsgOpen(true); };
  const profilePath = (l: LawyerResult) => l.is_demo ? `/lawyer/demo:${l.user_id}` : `/lawyer/${l.user_id}`;

  const filteredLawyers = lawyers.filter(lawyer => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || lawyer.name.toLowerCase().includes(q) ||
      (lawyer.specialization || '').toLowerCase().includes(q) ||
      (lawyer.city || '').toLowerCase().includes(q) ||
      lawyer.practice_areas.some(a => a.toLowerCase().includes(q));
    const matchesSpec = selectedSpecialization === 'all' ||
      lawyer.practice_areas.includes(selectedSpecialization) ||
      lawyer.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  const roleLabel = (r: string) => r?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('lawyers')}</h1>
        <p className="text-muted-foreground">{t('findConnectLawyers')}</p>
      </div>

      {/* Featured Lawyers */}
      <FeaturedLawyers />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input type="search" placeholder={t('searchLawyersPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
        <TabsList className="grid w-full grid-cols-7">
          {specializations.map((spec) => { const Icon = spec.icon; return (<TabsTrigger key={spec.id} value={spec.id} className="flex items-center space-x-1 text-xs"><Icon className="h-3 w-3" /><span className="hidden sm:inline">{spec.name}</span></TabsTrigger>); })}
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">{t('loadingLawyers')}</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer) => (
                <Card key={lawyer.user_id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(profilePath(lawyer))}>
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={lawyer.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">{lawyer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">{roleLabel(lawyer.role_type)}</p>
                        {lawyer.specialization && <Badge variant="secondary" className="mt-1">{lawyer.specialization}</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lawyer.tagline && <p className="text-sm text-muted-foreground italic">"{lawyer.tagline}"</p>}
                      {!lawyer.tagline && lawyer.bio && <p className="text-sm text-muted-foreground line-clamp-2">{lawyer.bio}</p>}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{lawyer.experience} {t('yearsExp')}</span></div>
                        {lawyer.city && <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{lawyer.city}</span></div>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{lawyer.rating || '–'}</span>
                          {lawyer.total_reviews > 0 && <span className="text-sm text-muted-foreground">({lawyer.total_reviews})</span>}
                        </div>
                        {lawyer.consultation_fee > 0 && (
                          <div className="text-right"><p className="font-semibold text-primary">₹{lawyer.consultation_fee}</p><p className="text-xs text-muted-foreground">{t('perConsultation')}</p></div>
                        )}
                      </div>
                      {lawyer.languages_spoken.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lawyer.languages_spoken.slice(0, 3).map(l => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                          {lawyer.languages_spoken.length > 3 && <Badge variant="outline" className="text-xs">+{lawyer.languages_spoken.length - 3}</Badge>}
                        </div>
                      )}
                      <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                        <Button className="flex-1" size="sm" onClick={() => navigate(profilePath(lawyer))}><Calendar className="h-4 w-4 mr-2" />{t('bookConsultation')}</Button>
                        <Button variant="outline" size="sm" onClick={() => openMessage(lawyer)} aria-label="Message lawyer"><MessageCircle className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredLawyers.length === 0 && (
            <div className="text-center py-12"><Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">{t('noLawyersFound')}</h3><p className="text-muted-foreground">{t('noLawyersFoundDesc')}</p></div>
          )}
        </div>
      </Tabs>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg"><Scale className="h-6 w-6 text-primary" /></div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('needHelpChoosing')}</h3>
              <p className="text-muted-foreground mb-4">{t('needHelpChoosingDesc')}</p>
              <Button variant="outline" size="sm" onClick={() => setShowChatBot(true)}>{t('getAIRecommendations')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {showChatBot && <ChatBot />}
      <MessageDialog open={msgOpen} onOpenChange={setMsgOpen} recipient={msgTarget ? { id: msgTarget.user_id, name: msgTarget.name, type: msgTarget.is_demo ? 'demo_lawyer' : 'lawyer' } : null} />
    </div>
  );
};

export default Lawyers;
