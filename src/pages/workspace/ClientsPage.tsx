import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Phone, MessageCircle, Mail, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/workspace/audit';

const PAYMENT_OPTIONS = ['paid', 'pending', 'partial'];

const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '', payment_status: 'pending' });

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from('lawyer_clients').select('*').eq('lawyer_id', user.id).order('created_at', { ascending: false });
    setClients(data || []);
  };
  useEffect(() => { refresh(); }, [user]);

  const create = async () => {
    if (!user || !form.name.trim()) return;
    const { error } = await (supabase.from('lawyer_clients') as any).insert({ ...form, lawyer_id: user.id });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await logAudit({ lawyerId: user.id, actorId: user.id, action: 'client.created', entityType: 'client' });
    setOpen(false);
    setForm({ name: '', phone: '', email: '', address: '', notes: '', payment_status: 'pending' });
    refresh();
  };

  const updatePayment = async (id: string, payment_status: string) => {
    if (!user) return;
    await supabase.from('lawyer_clients').update({ payment_status }).eq('id', id);
    await logAudit({ lawyerId: user.id, actorId: user.id, action: 'client.payment_updated', entityType: 'client', entityId: id, details: { payment_status } });
    refresh();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await supabase.from('lawyer_clients').delete().eq('id', id);
    await logAudit({ lawyerId: user.id, actorId: user.id, action: 'client.deleted', entityType: 'client', entityId: id });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Client</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Client</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No clients yet.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((c) => (
            <Card key={c.id}><CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{c.name}</p>
                  <Badge variant={c.payment_status === 'paid' ? 'default' : c.payment_status === 'partial' ? 'secondary' : 'outline'}>{c.payment_status}</Badge>
                </div>
                {c.address && <p className="text-xs text-muted-foreground mt-1">📍 {c.address}</p>}
                {c.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.notes}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-1">
                  {c.phone && <Button size="sm" variant="outline" asChild><a href={`tel:${c.phone}`}><Phone className="h-3.5 w-3.5" /></a></Button>}
                  {c.phone && <Button size="sm" variant="outline" asChild><a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /></a></Button>}
                  {c.email && <Button size="sm" variant="outline" asChild><a href={`mailto:${c.email}`}><Mail className="h-3.5 w-3.5" /></a></Button>}
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Select value={c.payment_status} onValueChange={(v) => updatePayment(c.id, v)}>
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
