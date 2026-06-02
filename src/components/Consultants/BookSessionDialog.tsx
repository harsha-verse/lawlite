import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultant: { id: string; name: string; specialization: string; consultation_fee: number } | null;
}

const TIMES = ['10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

const BookSessionDialog: React.FC<Props> = ({ open, onOpenChange, consultant }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState('online');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) { toast({ title: 'Please log in', description: 'Login required to book a session.' }); navigate('/login'); return; }
    if (!consultant || !date) { toast({ title: 'Please select a date', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.from('consultant_bookings' as any).insert({
      consultant_id: consultant.id,
      client_id: user.id,
      scheduled_date: date,
      scheduled_time: time,
      consultation_type: type,
      topic: topic || null,
      notes: notes || null,
    });
    setSaving(false);
    if (error) { toast({ title: 'Booking failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Session booked', description: `Your session with ${consultant.name} is pending confirmation.` });
    onOpenChange(false);
    setDate(''); setTopic(''); setNotes('');
  };

  if (!consultant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Book Session with {consultant.name}</DialogTitle>
          <DialogDescription>{consultant.specialization}{consultant.consultation_fee > 0 && <> · <IndianRupee className="inline h-3 w-3" />{consultant.consultation_fee}/session</>}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Date</Label><Input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} /></div>
          <div><Label>Time slot</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Consultation type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online (Video)</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Topic (optional)</Label><Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Startup compliance review" /></div>
          <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Brief context for the consultant" rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Booking…' : 'Confirm Booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookSessionDialog;
