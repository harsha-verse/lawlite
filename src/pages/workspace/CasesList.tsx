import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, ArrowRight, Briefcase, Calendar, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/workspace/audit';

const CASE_TYPES = ['Civil', 'Criminal', 'Corporate', 'Family', 'Property', 'Consumer', 'Labour', 'Tax', 'Other'];
const STAGES = ['filing', 'hearing', 'evidence', 'arguments', 'judgment', 'closed'];

const CasesList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', case_type: 'Civil', case_number: '', court_name: '', case_stage: 'filing',
    description: '', workspace_client_id: '', opponent_name: '', opponent_contact: '',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('cases').select('*').eq('lawyer_id', user.id).order('created_at', { ascending: false });
      setCases(data || []);
      const { data: cl } = await supabase.from('lawyer_clients').select('id,name').eq('lawyer_id', user.id);
      setClients(cl || []);
    })();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !form.title.trim()) return;
    const payload: any = {
      title: form.title.trim(),
      case_type: form.case_type,
      description: form.description || form.title,
      client_id: user.id, // self-owned workspace case (lawyer-created)
      lawyer_id: user.id,
      status: 'in_progress',
      case_stage: form.case_stage,
      case_number: form.case_number || null,
      court_name: form.court_name || null,
      opponent_name: form.opponent_name || null,
      opponent_contact: form.opponent_contact || null,
      workspace_client_id: form.workspace_client_id || null,
    };
    const { data, error } = await supabase.from('cases').insert(payload).select().single();
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit({ lawyerId: user.id, actorId: user.id, action: 'case.created', entityType: 'case', entityId: data.id, caseId: data.id });
    setCases((prev) => [data, ...prev]);
    setOpen(false);
    setForm({ title: '', case_type: 'Civil', case_number: '', court_name: '', case_stage: 'filing', description: '', workspace_client_id: '', opponent_name: '', opponent_contact: '' });
    toast({ title: 'Case created' });
  };

  const filtered = cases.filter((c) => {
    const matchSearch = !search || [c.title, c.case_number, c.court_name].some((v) => (v || '').toLowerCase().includes(search.toLowerCase()));
    const matchStage = stageFilter === 'all' || c.case_stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title, case no, court…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Case</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Case</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <Select value={form.case_type} onValueChange={(v) => setForm({ ...form, case_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CASE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Stage</Label>
                  <Select value={form.case_stage} onValueChange={(v) => setForm({ ...form, case_stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Case Number</Label><Input value={form.case_number} onChange={(e) => setForm({ ...form, case_number: e.target.value })} /></div>
                <div><Label>Court</Label><Input value={form.court_name} onChange={(e) => setForm({ ...form, court_name: e.target.value })} /></div>
              </div>
              <div><Label>Client</Label>
                <Select value={form.workspace_client_id || 'none'} onValueChange={(v) => setForm({ ...form, workspace_client_id: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Opponent Name</Label><Input value={form.opponent_name} onChange={(e) => setForm({ ...form, opponent_name: e.target.value })} /></div>
                <div><Label>Opponent Contact</Label><Input value={form.opponent_contact} onChange={(e) => setForm({ ...form, opponent_contact: e.target.value })} /></div>
              </div>
              <div><Label>Summary</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No cases yet. Create your first case.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/workspace/cases/${c.id}`)}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{c.title}</h3>
                    <Badge variant="outline">{c.case_type}</Badge>
                    <Badge variant="secondary">{c.case_stage || 'filing'}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                    {c.case_number && <span>#{c.case_number}</span>}
                    {c.court_name && <span className="flex items-center gap-1"><Building className="h-3 w-3" />{c.court_name}</span>}
                    {c.next_hearing_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.next_hearing_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CasesList;
