import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Plus, FileText, Trash2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/workspace/audit';

const STAGES = ['filing', 'hearing', 'evidence', 'arguments', 'judgment', 'closed'];
const TAGS = ['Evidence', 'Affidavit', 'Agreement', 'Pleading', 'Order', 'Other'];

const CaseDetailWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newHearing, setNewHearing] = useState({ hearing_date: '', hearing_time: '', purpose: '', court_name: '' });
  const [tagChoice, setTagChoice] = useState<string>('Evidence');

  const refresh = async () => {
    if (!id) return;
    const { data: c } = await supabase.from('cases').select('*').eq('id', id).maybeSingle();
    setCaseData(c);
    if (c?.workspace_client_id) {
      const { data: cl } = await supabase.from('lawyer_clients').select('*').eq('id', c.workspace_client_id).maybeSingle();
      setClient(cl);
    }
    const { data: v } = await supabase.from('workspace_document_versions').select('*').eq('case_id', id).order('created_at', { ascending: false });
    setVersions(v || []);
    const { data: t } = await supabase.from('workspace_tasks').select('*').eq('case_id', id).order('created_at', { ascending: false });
    setTasks(t || []);
    const { data: h } = await supabase.from('workspace_hearings').select('*').eq('case_id', id).order('hearing_date', { ascending: true });
    setHearings(h || []);
    const { data: a } = await supabase.from('workspace_audit_log').select('*').eq('case_id', id).order('created_at', { ascending: false }).limit(50);
    setAudit(a || []);
  };

  useEffect(() => { refresh(); }, [id]);

  if (!caseData) return <div className="p-4">Loading…</div>;

  const update = (patch: Partial<typeof caseData>) => setCaseData({ ...caseData, ...patch });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('cases').update({
      title: caseData.title,
      case_type: caseData.case_type,
      case_stage: caseData.case_stage,
      case_number: caseData.case_number,
      court_name: caseData.court_name,
      description: caseData.description,
      next_hearing_date: caseData.next_hearing_date,
      opponent_name: caseData.opponent_name,
      opponent_contact: caseData.opponent_contact,
      updated_at: new Date().toISOString(),
    }).eq('id', caseData.id);
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'case.updated', entityType: 'case', entityId: caseData.id, caseId: caseData.id });
    toast({ title: 'Saved' });
    refresh();
  };

  const handleUpload = async (file: File) => {
    if (!user || !caseData) return;
    setUploading(true);
    try {
      const path = `${caseData.lawyer_id}/${caseData.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('case-documents').upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from('case-documents').createSignedUrl(path, 60 * 60 * 24 * 7);
      const sameName = versions.filter((v) => v.file_name === file.name);
      const nextVersion = sameName.length > 0 ? Math.max(...sameName.map((v) => v.version_number)) + 1 : 1;
      const { error: insErr } = await (supabase.from('workspace_document_versions') as any).insert({
        case_id: caseData.id,
        lawyer_id: caseData.lawyer_id,
        version_number: nextVersion,
        file_name: file.name,
        file_url: signed?.signedUrl || path,
        file_type: file.type,
        tag: tagChoice,
        uploaded_by: user.id,
      });
      if (insErr) throw insErr;
      await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'document.uploaded', entityType: 'document', caseId: caseData.id, details: { file: file.name, version: nextVersion, tag: tagChoice } });
      toast({ title: `Uploaded v${nextVersion}` });
      refresh();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.trim()) return;
    const { error } = await (supabase.from('workspace_tasks') as any).insert({
      case_id: caseData.id, lawyer_id: caseData.lawyer_id, title: newTask.trim(), status: 'todo',
    });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'task.created', entityType: 'task', caseId: caseData.id });
    setNewTask('');
    refresh();
  };

  const moveTask = async (taskId: string, status: string) => {
    if (!user) return;
    await supabase.from('workspace_tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', taskId);
    await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'task.moved', entityType: 'task', entityId: taskId, caseId: caseData.id, details: { status } });
    refresh();
  };

  const addHearing = async () => {
    if (!user || !newHearing.hearing_date) return;
    const { error } = await (supabase.from('workspace_hearings') as any).insert({
      case_id: caseData.id, lawyer_id: caseData.lawyer_id,
      hearing_date: newHearing.hearing_date,
      hearing_time: newHearing.hearing_time || null,
      purpose: newHearing.purpose || null,
      court_name: newHearing.court_name || caseData.court_name || null,
    });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('cases').update({ next_hearing_date: newHearing.hearing_date }).eq('id', caseData.id);
    await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'hearing.added', entityType: 'hearing', caseId: caseData.id, details: newHearing });
    setNewHearing({ hearing_date: '', hearing_time: '', purpose: '', court_name: '' });
    refresh();
  };

  const removeTask = async (taskId: string) => {
    if (!user) return;
    await supabase.from('workspace_tasks').delete().eq('id', taskId);
    await logAudit({ lawyerId: caseData.lawyer_id, actorId: user.id, action: 'task.deleted', entityType: 'task', entityId: taskId, caseId: caseData.id });
    refresh();
  };

  const tasksByStatus = (s: string) => tasks.filter((t) => t.status === s);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/workspace')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <Button size="sm" onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? 'Saving…' : 'Save'}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            {caseData.title}
            <Badge variant="outline">{caseData.case_type}</Badge>
            <Badge variant="secondary">{caseData.case_stage || 'filing'}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="documents">Documents ({versions.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="hearings">Hearings ({hearings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Title</Label><Input value={caseData.title || ''} onChange={(e) => update({ title: e.target.value })} /></div>
            <div><Label>Case Number</Label><Input value={caseData.case_number || ''} onChange={(e) => update({ case_number: e.target.value })} /></div>
            <div><Label>Court</Label><Input value={caseData.court_name || ''} onChange={(e) => update({ court_name: e.target.value })} /></div>
            <div><Label>Stage</Label>
              <Select value={caseData.case_stage || 'filing'} onValueChange={(v) => update({ case_stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Next Hearing</Label>
              <Input type="date" value={caseData.next_hearing_date ? caseData.next_hearing_date.split('T')[0] : ''} onChange={(e) => update({ next_hearing_date: e.target.value || null })} />
            </div>
          </div>
          <div><Label>Summary</Label><Textarea rows={4} value={caseData.description || ''} onChange={(e) => update({ description: e.target.value })} /></div>
        </TabsContent>

        <TabsContent value="parties" className="space-y-3">
          <Card><CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
            <CardContent>
              {client ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{client.name}</p>
                  {client.phone && <p className="text-muted-foreground">📞 {client.phone}</p>}
                  {client.email && <p className="text-muted-foreground">✉ {client.email}</p>}
                  {client.address && <p className="text-muted-foreground">📍 {client.address}</p>}
                </div>
              ) : <p className="text-sm text-muted-foreground">No linked client.</p>}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Opponent</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Name</Label><Input value={caseData.opponent_name || ''} onChange={(e) => update({ opponent_name: e.target.value })} /></div>
              <div><Label>Contact</Label><Input value={caseData.opponent_contact || ''} onChange={(e) => update({ opponent_contact: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <Card><CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <Select value={tagChoice} onValueChange={setTagChoice}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="file" id="ws-doc-upload" className="hidden" accept="application/pdf,image/*,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <Button asChild disabled={uploading}>
              <label htmlFor="ws-doc-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />{uploading ? 'Uploading…' : 'Upload Document'}
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">Tip: re-uploading the same filename creates a new version.</p>
          </CardContent></Card>
          {versions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No documents yet.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <Card key={v.id}><CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.file_name}</p>
                      <div className="flex gap-2 items-center text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs"><History className="h-3 w-3 mr-1" />v{v.version_number}</Badge>
                        {v.tag && <Badge variant="secondary" className="text-xs">{v.tag}</Badge>}
                        <span>{new Date(v.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild><a href={v.file_url} target="_blank" rel="noreferrer">Open</a></Button>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-2">
          {audit.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : audit.map((a) => (
            <div key={a.id} className="text-sm border-l-2 border-primary/40 pl-3 py-1">
              <p><span className="font-medium">{a.action}</span> <span className="text-muted-foreground">· {a.entity_type}</span></p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="New task title…" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
            <Button onClick={addTask}><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'todo', label: 'To Do' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'done', label: 'Done' },
            ].map((col) => (
              <Card key={col.key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{col.label} ({tasksByStatus(col.key).length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {tasksByStatus(col.key).map((t) => (
                    <div key={t.id} className="p-2 rounded border border-border bg-card">
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.deadline && <p className="text-xs text-muted-foreground">Due {new Date(t.deadline).toLocaleDateString()}</p>}
                      <div className="flex gap-1 mt-2">
                        {col.key !== 'todo' && <Button size="sm" variant="ghost" onClick={() => moveTask(t.id, 'todo')}>← Todo</Button>}
                        {col.key !== 'in_progress' && <Button size="sm" variant="ghost" onClick={() => moveTask(t.id, 'in_progress')}>Doing</Button>}
                        {col.key !== 'done' && <Button size="sm" variant="ghost" onClick={() => moveTask(t.id, 'done')}>Done →</Button>}
                        <Button size="sm" variant="ghost" onClick={() => removeTask(t.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  {tasksByStatus(col.key).length === 0 && <p className="text-xs text-muted-foreground">Empty</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hearings" className="space-y-3">
          <Card><CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Date</Label><Input type="date" value={newHearing.hearing_date} onChange={(e) => setNewHearing({ ...newHearing, hearing_date: e.target.value })} /></div>
            <div><Label>Time</Label><Input type="time" value={newHearing.hearing_time} onChange={(e) => setNewHearing({ ...newHearing, hearing_time: e.target.value })} /></div>
            <div><Label>Purpose</Label><Input value={newHearing.purpose} onChange={(e) => setNewHearing({ ...newHearing, purpose: e.target.value })} /></div>
            <div className="flex items-end"><Button onClick={addHearing} className="w-full"><Plus className="h-4 w-4 mr-1" />Add Hearing</Button></div>
          </CardContent></Card>
          {hearings.length === 0 ? <p className="text-sm text-muted-foreground">No hearings yet.</p> : (
            <div className="space-y-2">
              {hearings.map((h) => (
                <Card key={h.id}><CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{new Date(h.hearing_date).toLocaleDateString()} {h.hearing_time || ''}</p>
                    <p className="text-xs text-muted-foreground">{h.purpose || '—'} {h.court_name ? `· ${h.court_name}` : ''}</p>
                  </div>
                  <Badge variant="outline">{h.status}</Badge>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetailWorkspace;
