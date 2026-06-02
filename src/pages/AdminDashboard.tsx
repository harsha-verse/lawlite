import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, XCircle, Clock, Eye, Scale, Users, ShieldCheck,
  Briefcase, ArrowRight, AlertTriangle, MapPin, BarChart3
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Record<string, any[]>>({});
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [cases, setCases] = useState<any[]>([]);
  const [caseMatches, setCaseMatches] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchLawyers();
      fetchCases();
    }
  }, [isAdmin]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  async function fetchLawyers() {
    const { data } = await supabase.from('lawyer_profiles').select('*');
    if (data) {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });
      const enriched = data.map(l => ({ ...l, profile: profileMap[l.user_id] }));
      setLawyers(enriched);

      const { data: docs } = await supabase.from('lawyer_documents').select('*');
      const docMap: Record<string, any[]> = {};
      docs?.forEach(d => {
        if (!docMap[d.user_id]) docMap[d.user_id] = [];
        docMap[d.user_id].push(d);
      });
      setDocuments(docMap);
    }
  }

  async function fetchCases() {
    const { data: casesData } = await supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(100);
    if (casesData) setCases(casesData);
    const { data: matchData } = await supabase.from('case_matches').select('*');
    if (matchData) setCaseMatches(matchData);
  }

  const handleApprove = async (userId: string) => {
    await supabase.from('lawyer_profiles').update({ verification_status: 'verified', verified_at: new Date().toISOString() }).eq('user_id', userId);
    await supabase.from('lawyer_documents').update({ status: 'approved', admin_notes: adminNotes || null }).eq('user_id', userId);
    toast({ title: 'Lawyer Approved' });
    setSelectedLawyer(null);
    setAdminNotes('');
    fetchLawyers();
  };

  const handleReject = async (userId: string) => {
    await supabase.from('lawyer_profiles').update({ verification_status: 'rejected' }).eq('user_id', userId);
    await supabase.from('lawyer_documents').update({ status: 'rejected', admin_notes: adminNotes || 'Rejected by admin' }).eq('user_id', userId);
    toast({ title: 'Lawyer Rejected' });
    setSelectedLawyer(null);
    setAdminNotes('');
    fetchLawyers();
  };

  const handleRerunMatching = async (caseId: string) => {
    try {
      await supabase.functions.invoke('match-lawyers', { body: { case_id: caseId, action: 'match' } });
      toast({ title: 'Matching rerun successfully' });
      fetchCases();
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const filtered = filter === 'all' ? lawyers : lawyers.filter(l => l.verification_status === filter);

  const lawyerStats = {
    total: lawyers.length,
    pending: lawyers.filter(l => l.verification_status === 'pending').length,
    under_review: lawyers.filter(l => l.verification_status === 'under_review').length,
    verified: lawyers.filter(l => l.verification_status === 'verified').length,
    rejected: lawyers.filter(l => l.verification_status === 'rejected').length,
  };

  const caseStats = {
    total: cases.length,
    unmatched: cases.filter(c => c.match_status === 'unmatched' || !c.match_status).length,
    matched: cases.filter(c => c.match_status === 'matched').length,
    assigned: cases.filter(c => c.lawyer_id).length,
    urgent: cases.filter(c => c.priority === 'urgent').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage lawyers, cases, and platform operations</p>
      </div>

      <Tabs defaultValue="lawyers">
        <TabsList>
          <TabsTrigger value="lawyers">Lawyer Verification ({lawyerStats.pending + lawyerStats.under_review})</TabsTrigger>
          <TabsTrigger value="cases">Case Distribution ({caseStats.total})</TabsTrigger>
        </TabsList>

        {/* Lawyers Tab */}
        <TabsContent value="lawyers" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: lawyerStats.total, icon: Users, color: 'bg-primary/10 text-primary' },
              { label: 'Pending', value: lawyerStats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Under Review', value: lawyerStats.under_review, icon: Eye, color: 'bg-blue-100 text-blue-700' },
              { label: 'Verified', value: lawyerStats.verified, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
              { label: 'Rejected', value: lawyerStats.rejected, icon: XCircle, color: 'bg-red-100 text-red-700' },
            ].map(s => (
              <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter(s.label === 'Total' ? 'all' : s.label.toLowerCase().replace(' ', '_'))}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5" /> Lawyer Applications
                <Badge variant="outline" className="ml-2">{filtered.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No applications found.</p>
              ) : filtered.map(lawyer => (
                <div key={lawyer.id} className={`p-4 rounded-lg border transition-colors ${selectedLawyer === lawyer.user_id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scale className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{lawyer.profile?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{lawyer.profile?.email} • {lawyer.bar_council_number}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{lawyer.role_type?.replace('_', ' ')}</Badge>
                          <span className="text-xs text-muted-foreground">{lawyer.experience}y exp</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lawyer.verification_status === 'verified' ? 'default' : lawyer.verification_status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                        {lawyer.verification_status?.replace('_', ' ')}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setSelectedLawyer(selectedLawyer === lawyer.user_id ? null : lawyer.user_id)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Review
                      </Button>
                    </div>
                  </div>

                  {selectedLawyer === lawyer.user_id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-muted-foreground">State:</span> <span className="font-medium">{lawyer.profile?.state}</span></div>
                        <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{lawyer.profile?.phone || 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Fee:</span> <span className="font-medium">₹{lawyer.consultation_fee}/hr</span></div>
                        <div><span className="text-muted-foreground">Started:</span> <span className="font-medium">{lawyer.year_of_practice}</span></div>
                      </div>
                      {lawyer.practice_areas?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lawyer.practice_areas.map((a: string) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium mb-2">Uploaded Documents</p>
                        {documents[lawyer.user_id]?.length ? (
                          <div className="space-y-2">
                            {documents[lawyer.user_id].map((doc: any) => (
                              <div key={doc.id} className="flex items-center justify-between p-2 rounded border bg-card">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{doc.document_type.replace('_', ' ')}</span>
                                  <span className="text-xs text-muted-foreground">— {doc.file_name}</span>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
                      </div>
                      {(lawyer.verification_status === 'under_review' || lawyer.verification_status === 'pending') && (
                        <div className="space-y-3">
                          <Textarea placeholder="Admin notes (optional)" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                          <div className="flex gap-2">
                            <Button onClick={() => handleApprove(lawyer.user_id)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button variant="destructive" onClick={() => handleReject(lawyer.user_id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Distribution Tab */}
        <TabsContent value="cases" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cases', value: caseStats.total, icon: Briefcase, color: 'bg-primary/10 text-primary' },
              { label: 'Unmatched', value: caseStats.unmatched, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Matched', value: caseStats.matched, icon: BarChart3, color: 'bg-blue-100 text-blue-700' },
              { label: 'Urgent', value: caseStats.urgent, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5" /> Case Distribution Monitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cases yet.</p>
              ) : cases.slice(0, 20).map(c => {
                const matchCount = caseMatches.filter(m => m.case_id === c.id).length;
                const isOverdue = c.response_deadline && new Date(c.response_deadline) < new Date() && !c.lawyer_id;
                return (
                  <div key={c.id} className={`p-4 rounded-lg border ${isOverdue ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{c.title}</p>
                          <Badge variant="outline" className="text-xs">{c.case_type}</Badge>
                          {c.priority === 'urgent' && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                          {c.auto_assigned && <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Auto-Assigned</Badge>}
                          {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Status: <span className="capitalize font-medium">{c.status}</span></span>
                          <span>Match: <span className="font-medium">{c.match_status || 'unmatched'}</span></span>
                          <span>Lawyers matched: <span className="font-medium">{matchCount}</span></span>
                          {c.lawyer_id && <span className="text-green-600 font-medium">Assigned ✓</span>}
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!c.lawyer_id && (
                          <Button size="sm" variant="outline" onClick={() => handleRerunMatching(c.id)}>
                            <BarChart3 className="h-3.5 w-3.5 mr-1" />Rematch
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/case/${c.id}`)}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
