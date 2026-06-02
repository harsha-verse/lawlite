import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Clock, CheckCircle, MessageCircle, Calendar, Users, Briefcase, GraduationCap, Award } from 'lucide-react';
import BookSessionDialog from '@/components/Consultants/BookSessionDialog';
import MessageDialog from '@/components/Messaging/MessageDialog';

interface Consultant {
  id: string; name: string; specialization: string; qualification: string | null; description: string | null;
  experience: number; rating: number; total_reviews: number; consultation_fee: number;
  city: string | null; state: string | null; languages: string[]; expertise: string[];
  avatar_url: string | null; verified: boolean;
}

const Consultants: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [active, setActive] = useState<Consultant | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('consultants' as any).select('*').eq('is_active', true).order('rating', { ascending: false });
    setConsultants((data as any) || []);
    setLoading(false);
  };

  const filtered = consultants.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openBook = (c: Consultant) => { setActive(c); setBookOpen(true); };
  const openMsg = (c: Consultant) => { setActive(c); setMsgOpen(true); };
  const avgExp = consultants.length ? Math.round(consultants.reduce((s, c) => s + c.experience, 0) / consultants.length) : 0;
  const avgRating = consultants.length ? (consultants.reduce((s, c) => s + Number(c.rating), 0) / consultants.length).toFixed(1) : '—';

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold text-foreground mb-2">{t('consultants')}</h1><p className="text-muted-foreground">{t('consultantsSubtitle')}</p></div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input type="search" placeholder={t('searchConsultantsPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{consultants.length}+</p><p className="text-sm text-muted-foreground">{t('expertConsultants')}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{avgExp}+</p><p className="text-sm text-muted-foreground">{t('yearsAvgExperience')}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Star className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{avgRating}</p><p className="text-sm text-muted-foreground">{t('averageRating')}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Award className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">100%</p><p className="text-sm text-muted-foreground">{t('verifiedExperts')}</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading consultants…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16"><AvatarImage src={c.avatar_url || undefined} /><AvatarFallback>{c.name.split(' ').map(n => n[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2"><CardTitle className="text-lg">{c.name}</CardTitle>{c.verified && <CheckCircle className="h-5 w-5 text-green-500" />}</div>
                    {c.qualification && <p className="text-sm text-muted-foreground">{c.qualification}</p>}
                    <Badge variant="secondary" className="mt-1">{c.specialization}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                  {c.expertise.length > 0 && (
                    <div><p className="text-sm font-medium mb-2">{t('expertise')}:</p>
                      <div className="flex flex-wrap gap-1">{c.expertise.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{c.experience} {t('yearsExp')}</span></div>
                    {c.city && <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{c.city}</span></div>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{c.rating}</span><span className="text-sm text-muted-foreground">({c.total_reviews})</span></div>
                    <div className="text-right"><p className="font-semibold">₹{c.consultation_fee.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t('perSession')}</p></div>
                  </div>
                  {c.languages.length > 0 && (
                    <div><p className="text-sm font-medium mb-1">{t('languages')}:</p>
                      <div className="flex flex-wrap gap-1">{c.languages.map(l => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}</div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button className="flex-1" size="sm" onClick={() => openBook(c)}><Calendar className="h-4 w-4 mr-2" />{t('bookSession')}</Button>
                    <Button variant="outline" size="sm" onClick={() => openMsg(c)} aria-label="Message consultant"><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && <div className="text-center py-12"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">{t('noConsultantsFound')}</h3><p className="text-muted-foreground">{t('noConsultantsFoundDesc')}</p></div>}

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg"><Briefcase className="h-6 w-6 text-primary" /></div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('whyChooseConsultants')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{t('allVerified')}</span></div>
                <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{t('specializedExpertise')}</span></div>
                <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{t('flexibleConsultation')}</span></div>
                <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{t('confidentialService')}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookSessionDialog open={bookOpen} onOpenChange={setBookOpen} consultant={active} />
      <MessageDialog open={msgOpen} onOpenChange={setMsgOpen} recipient={active ? { id: active.id, name: active.name, type: 'consultant' } : null} />
    </div>
  );
};

export default Consultants;
