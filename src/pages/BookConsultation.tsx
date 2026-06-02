import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ArrowLeft, CalendarIcon, Clock, Video, Phone, MapPin, User, Scale, CheckCircle
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const BookConsultation: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lawyerId = searchParams.get('lawyer');
  const caseId = searchParams.get('case');

  const CONSULTATION_TYPES = [
    { value: 'online', label: t('onlineVideoConsultation'), icon: Video },
    { value: 'phone', label: t('phoneConsultation'), icon: Phone },
    { value: 'in_person', label: t('inPersonMeeting'), icon: MapPin },
  ];

  const [lawyer, setLawyer] = useState<any>(null);
  const [lawyerProfile, setLawyerProfile] = useState<any>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [consultationType, setConsultationType] = useState('online');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingConsultations, setExistingConsultations] = useState<any[]>([]);

  useEffect(() => {
    if (lawyerId) {
      fetchLawyer();
      fetchExistingConsultations();
    }
  }, [lawyerId]);

  const fetchLawyer = async () => {
    const [profileRes, lawyerRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', lawyerId!).single(),
      supabase.from('lawyer_profiles').select('*').eq('user_id', lawyerId!).single(),
    ]);
    if (profileRes.data) setLawyer(profileRes.data);
    if (lawyerRes.data) setLawyerProfile(lawyerRes.data);
  };

  const fetchExistingConsultations = async () => {
    const { data } = await supabase.from('consultations').select('scheduled_date, scheduled_time')
      .eq('lawyer_id', lawyerId!)
      .in('status', ['pending', 'accepted', 'confirmed']);
    if (data) setExistingConsultations(data);
  };

  const getAvailableTimeSlots = () => {
    if (!date || !lawyerProfile) return TIME_SLOTS;
    const dayName = format(date, 'EEEE');
    const availableDays = lawyerProfile.available_days || [];
    if (availableDays.length > 0 && !availableDays.includes(dayName)) return [];
    const startTime = lawyerProfile.available_start_time || '10:00';
    const endTime = lawyerProfile.available_end_time || '18:00';
    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedTimes = existingConsultations
      .filter(c => c.scheduled_date === dateStr)
      .map(c => c.scheduled_time);
    return TIME_SLOTS.filter(slot => {
      if (slot < startTime || slot >= endTime) return false;
      if (bookedTimes.includes(slot)) return false;
      return true;
    });
  };

  const handleSubmit = async () => {
    if (!user || !lawyerId || !date || !time) {
      toast({ title: t('error'), description: t('pleaseSelectDateTime'), variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const meetingLink = consultationType === 'online'
        ? `https://meet.google.com/lookup/${crypto.randomUUID().slice(0, 12)}`
        : undefined;
      const { error } = await supabase.from('consultations').insert({
        client_id: user.id,
        lawyer_id: lawyerId,
        case_id: caseId || null,
        consultation_type: consultationType,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        scheduled_time: time,
        duration_minutes: lawyerProfile?.consultation_duration || 30,
        meeting_link: meetingLink,
      } as any);
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: lawyerId,
        title: t('newConsultationRequest'),
        message: t('requestedConsultation', { type: consultationType, date: format(date, 'PPP'), time }),
        type: 'consultation_request',
        related_case_id: caseId || null,
      });
      toast({ title: t('consultationRequested'), description: t('lawyerWillReview') });
      navigate('/my-consultations');
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlots = getAvailableTimeSlots();
  const isLawyerUnavailable = date && availableSlots.length === 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('back')}
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>{t('bookAConsultation')}</CardTitle>
          <CardDescription>{t('scheduleMeetingLawyer')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {lawyer && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{lawyer.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{lawyerProfile?.role_type?.replace('_', ' ')} • {lawyerProfile?.experience} {t('years')}</p>
                {lawyerProfile?.consultation_fee > 0 && (
                  <p className="text-sm text-primary font-medium">₹{lawyerProfile.consultation_fee}/{t('perSession')}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('consultationType')}</Label>
            <div className="grid grid-cols-3 gap-3">
              {CONSULTATION_TYPES.map(ct => {
                const Icon = ct.icon;
                const isSelected = consultationType === ct.value;
                const isAvailable = !lawyerProfile?.consultation_types?.length || lawyerProfile.consultation_types.includes(ct.value);
                return (
                  <button
                    key={ct.value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setConsultationType(ct.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors text-sm',
                      isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50',
                      !isAvailable && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-center text-xs">{ct.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('selectDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : t('pickADate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setTime(''); }}
                  disabled={(d) => d < new Date() || d.getDay() === 0} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {date && (
            <div className="space-y-2">
              <Label>{t('availableTimeSlots')}</Label>
              {isLawyerUnavailable ? (
                <p className="text-sm text-destructive">{t('lawyerUnavailableDate')}</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <Button key={slot} type="button" variant={time === slot ? 'default' : 'outline'} size="sm"
                      onClick={() => setTime(slot)} className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />{slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('additionalNotes')}</Label>
            <Textarea placeholder={t('describeDiscuss')} value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px]" />
          </div>

          {date && time && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <p className="font-medium text-sm text-foreground">{t('consultationSummary')}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">{t('date')}:</span>
                <span>{format(date, 'PPP')}</span>
                <span className="text-muted-foreground">{t('time')}:</span>
                <span>{time}</span>
                <span className="text-muted-foreground">{t('type')}:</span>
                <span className="capitalize">{consultationType.replace('_', ' ')}</span>
                <span className="text-muted-foreground">{t('duration')}:</span>
                <span>{lawyerProfile?.consultation_duration || 30} {t('minutes')}</span>
                {lawyerProfile?.consultation_fee > 0 && (
                  <>
                    <span className="text-muted-foreground">{t('fee')}:</span>
                    <span>₹{lawyerProfile.consultation_fee}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={!date || !time || isSubmitting}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? t('bookingLabel') : t('requestConsultation')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookConsultation;
