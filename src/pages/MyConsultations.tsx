import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CalendarIcon, Clock, Video, Phone, MapPin, User, CheckCircle,
  XCircle, Star, MessageCircle, StickyNote, Search, Filter, ArrowRight, ExternalLink
} from 'lucide-react';

const MyConsultations: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: t('pending'), color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    accepted: { label: t('accepted'), color: 'bg-green-100 text-green-800 border-green-200' },
    confirmed: { label: t('confirm'), color: 'bg-blue-100 text-blue-800 border-blue-200' },
    rescheduled: { label: t('rescheduleLabel'), color: 'bg-purple-100 text-purple-800 border-purple-200' },
    completed: { label: t('completed'), color: 'bg-green-100 text-green-800 border-green-200' },
    cancelled: { label: t('cancel'), color: 'bg-red-100 text-red-800 border-red-200' },
    declined: { label: t('decline'), color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
    online: Video, phone: Phone, in_person: MapPin,
  };

  const [consultations, setConsultations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');
  const [clientRating, setClientRating] = useState(0);
  const [suggestedDate, setSuggestedDate] = useState<Date>();
  const [suggestedTime, setSuggestedTime] = useState('');

  const isLawyer = profile?.user_type === 'lawyer';

  useEffect(() => {
    if (user) fetchConsultations();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('consultations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' },
        () => fetchConsultations()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchConsultations = async () => {
    setLoading(true);
    const column = isLawyer ? 'lawyer_id' : 'client_id';
    const { data } = await supabase.from('consultations').select('*')
      .eq(column, user!.id).order('scheduled_date', { ascending: true });
    if (data) {
      setConsultations(data);
      const otherIds = [...new Set(data.map(c => isLawyer ? c.client_id : c.lawyer_id))];
      if (otherIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', otherIds);
        if (profilesData) {
          const map: Record<string, any> = {};
          profilesData.forEach(p => { map[p.id] = p; });
          setProfiles(map);
        }
      }
    }
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    const { error } = await supabase.from('consultations').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('consultationAccepted') });
      const c = consultations.find(x => x.id === id);
      if (c) {
        await supabase.from('notifications').insert({
          user_id: c.client_id, title: t('consultationAccepted'),
          message: `${c.scheduled_date} ${c.scheduled_time}`,
          type: 'consultation_update', related_case_id: c.case_id,
        });
      }
      fetchConsultations();
    }
  };

  const handleDecline = async (id: string) => {
    const { error } = await supabase.from('consultations').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('consultationDeclined') });
      fetchConsultations();
    }
  };

  const handleReschedule = async (id: string) => {
    if (!suggestedDate || !suggestedTime) {
      toast({ title: t('error'), description: t('pleaseSuggestDateTime'), variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('consultations').update({
      status: 'rescheduled', suggested_date: format(suggestedDate, 'yyyy-MM-dd'),
      suggested_time: suggestedTime, updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('rescheduledSent') });
      setSelectedConsultation(null);
      fetchConsultations();
    }
  };

  const handleComplete = async (id: string) => {
    const updates: any = { status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (lawyerNotes) updates.lawyer_notes = lawyerNotes;
    const { error } = await supabase.from('consultations').update(updates).eq('id', id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('consultationCompleted') });
      setLawyerNotes('');
      setSelectedConsultation(null);
      fetchConsultations();
    }
  };

  const handleFeedback = async (id: string) => {
    const { error } = await supabase.from('consultations').update({
      client_feedback: clientFeedback, client_rating: clientRating, updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('feedbackSubmittedLabel') });
      setClientFeedback('');
      setClientRating(0);
      setSelectedConsultation(null);
      fetchConsultations();
    }
  };

  const filtered = consultations.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const otherProfile = profiles[isLawyer ? c.client_id : c.lawyer_id];
      const name = otherProfile?.name || '';
      if (!name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.consultation_type.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const upcoming = filtered.filter(c => ['pending', 'accepted', 'confirmed', 'rescheduled'].includes(c.status));
  const past = filtered.filter(c => ['completed', 'cancelled', 'declined'].includes(c.status));

  const ConsultationCard = ({ item }: { item: any }) => {
    const otherProfile = profiles[isLawyer ? item.client_id : item.lawyer_id];
    const TypeIcon = TYPE_ICONS[item.consultation_type] || Video;
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{otherProfile?.name || t('unknownLabel')}</p>
                  <p className="text-xs text-muted-foreground">{isLawyer ? t('clientLabel') : t('lawyer')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                <span className="text-sm flex items-center gap-1 text-muted-foreground">
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span className="capitalize">{item.consultation_type.replace('_', ' ')}</span>
                </span>
                <span className="text-sm flex items-center gap-1 text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {new Date(item.scheduled_date).toLocaleDateString()}
                </span>
                <span className="text-sm flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {item.scheduled_time} ({item.duration_minutes}{t('minutes')})
                </span>
              </div>

              {item.status === 'rescheduled' && item.suggested_date && (
                <p className="text-sm text-primary mt-2">
                  {t('suggestedLabel')}: {new Date(item.suggested_date).toLocaleDateString()} {item.suggested_time}
                </p>
              )}

              {item.meeting_link && ['accepted', 'confirmed'].includes(item.status) && (
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <a href={item.meeting_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />{t('joinMeeting')}
                  </a>
                </Button>
              )}

              {item.client_rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= item.client_rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {isLawyer && item.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => handleAccept(item.id)}><CheckCircle className="h-3.5 w-3.5 mr-1" />{t('accept')}</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedConsultation(item)}>
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />{t('rescheduleLabel')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{t('suggestNewTime')}</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t('date')}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn('w-full justify-start', !suggestedDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {suggestedDate ? format(suggestedDate, 'PPP') : t('pickADate')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={suggestedDate} onSelect={setSuggestedDate}
                                disabled={d => d < new Date()} className={cn("p-3 pointer-events-auto")} />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('time')}</Label>
                          <Select value={suggestedTime} onValueChange={setSuggestedTime}>
                            <SelectTrigger><SelectValue placeholder={t('selectTimeLabel')} /></SelectTrigger>
                            <SelectContent>
                              {['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'].map(slot => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={() => handleReschedule(item.id)}>{t('sendSuggestion')}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="destructive" onClick={() => handleDecline(item.id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />{t('decline')}
                  </Button>
                </>
              )}

              {isLawyer && ['accepted', 'confirmed'].includes(item.status) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setSelectedConsultation(item); setLawyerNotes(item.lawyer_notes || ''); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />{t('completed')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t('completeConsultation')}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('consultationNotesPrivate')}</Label>
                        <Textarea placeholder={t('summaryPlaceholder')} value={lawyerNotes}
                          onChange={e => setLawyerNotes(e.target.value)} className="min-h-[120px]" />
                      </div>
                      <Button className="w-full" onClick={() => handleComplete(item.id)}>{t('markAsCompleted')}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {!isLawyer && item.status === 'completed' && !item.client_rating && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setSelectedConsultation(item)}>
                      <Star className="h-3.5 w-3.5 mr-1" />{t('rateLabel')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t('rateConsultation')}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setClientRating(s)}>
                            <Star className={`h-8 w-8 transition-colors ${s <= clientRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label>{t('feedbackOptional')}</Label>
                        <Textarea placeholder={t('howWasExperience')} value={clientFeedback}
                          onChange={e => setClientFeedback(e.target.value)} />
                      </div>
                      <Button className="w-full" onClick={() => handleFeedback(item.id)} disabled={clientRating === 0}>
                        {t('submitFeedbackBtn')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {item.case_id && (
                <Button size="sm" variant="ghost" onClick={() => navigate(`/case/${item.case_id}`)}>
                  <ArrowRight className="h-3.5 w-3.5 mr-1" />{t('caseLabel')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isLawyer ? t('consultationManagement') : t('myConsultationsTitle')}</h1>
          <p className="text-muted-foreground">{isLawyer ? t('manageConsultSchedule') : t('trackConsultAppts')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('pending'), count: consultations.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: t('upcomingLabel'), count: consultations.filter(c => ['accepted', 'confirmed'].includes(c.status)).length, icon: CalendarIcon, color: 'text-blue-600' },
          { label: t('completed'), count: consultations.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'text-green-600' },
          { label: t('totalLabel'), count: consultations.length, icon: MessageCircle, color: 'text-primary' },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{card.count}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('search')}  className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Clock className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">{t('upcomingTab')} ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">{t('pastTab')} ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{t('noUpcomingConsultations')}</p>
              </div>
            ) : upcoming.map(c => <ConsultationCard key={c.id} item={c} />)}
          </TabsContent>

          <TabsContent value="past" className="space-y-3 mt-4">
            {past.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{t('noPastConsultations')}</p>
              </div>
            ) : past.map(c => <ConsultationCard key={c.id} item={c} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyConsultations;
