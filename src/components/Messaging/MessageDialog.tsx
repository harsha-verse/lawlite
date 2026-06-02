import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  recipient: { id: string; name: string; type: 'lawyer' | 'consultant' | 'demo_lawyer' } | null;
}

const MessageDialog: React.FC<Props> = ({ open, onOpenChange, recipient }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) { toast({ title: 'Please log in to send messages' }); navigate('/login'); return; }
    if (!recipient || !message.trim()) { toast({ title: 'Message cannot be empty', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.from('direct_messages' as any).insert({
      sender_id: user.id,
      recipient_type: recipient.type,
      recipient_id: recipient.id,
      subject: subject || null,
      message,
      contact_email: email || null,
      contact_phone: phone || null,
    });
    setSaving(false);
    if (error) { toast({ title: 'Send failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Message sent', description: `${recipient.name} will respond via your contact details.` });
    onOpenChange(false);
    setSubject(''); setMessage(''); setEmail(''); setPhone('');
  };

  if (!recipient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" />Message {recipient.name}</DialogTitle>
          <DialogDescription>Send a direct enquiry. Reply will arrive on your contact details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Need help with rental dispute" /></div>
          <div><Label>Message *</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your matter…" rows={5} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91…" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Sending…' : 'Send Message'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
