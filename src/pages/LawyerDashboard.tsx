import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, Upload, FileText, ShieldCheck, Clock, CheckCircle,
  XCircle, User, Briefcase, MessageCircle, Star, AlertTriangle, Edit,
  Bell, ArrowRight, Calendar, MapPin, TrendingUp
} from 'lucide-react';
import PerformanceStats from '@/components/Lawyer/PerformanceStats';
import ReviewsList from '@/components/Lawyer/ReviewsList';

const VERIFICATION_DOCS = [
  { type: 'bar_certificate', labelKey: 'barCertificate', icon: Scale },
  { type: 'government_id', labelKey: 'governmentIdDoc', icon: ShieldCheck },
  { type: 'professional_photo', labelKey: 'professionalPhoto', icon: User },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
};

const LawyerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, lawyerProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchCases();
      fetchNotifications();
    }
  }, [user]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('lawyer-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { fetchNotifications(); fetchCases(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    const { data } = await supabase.from('lawyer_documents').select('*').eq('user_id', user.id);
    if (data) setDocuments(data);
  };

  const fetchCases = async () => {
    if (!user) return;
    const { data } = await supabase.from('cases').select('*')
      .or(`lawyer_id.eq.${user.id},and(status.eq.pending,lawyer_id.is.null)`)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setCases(data);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleUpload = async (docType: string, file: File) => {
    if (!user) return;
    setUploading(docType);
    try {
      const filePath = `${user.id}/${docType}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lawyer-documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('lawyer-documents').getPublicUrl(filePath);

      await supabase.from('lawyer_documents').insert({
        user_id: user.id, document_type: docType, file_url: publicUrl, file_name: file.name,
      });

      const updatedDocs = [...documents, { document_type: docType }];
      const uploadedTypes = new Set(updatedDocs.map(d => d.document_type));
      if (uploadedTypes.has('bar_certificate') && uploadedTypes.has('government_id') && uploadedTypes.has('professional_photo')) {
        await supabase.from('lawyer_profiles').update({ verification_status: 'under_review' }).eq('user_id', user.id);
        await refreshProfile();
      }

      toast({ title: t('documentUploaded2'), description: `${file.name} ${t('uploadedSuccessfully')}` });
      fetchDocuments();
    } catch (err: any) {
      toast({ title: t('uploadFailed'), description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    const { error } = await supabase.from('cases').update({
      status: 'accepted', lawyer_id: user!.id, accepted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', caseId);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('caseAccepted') });
      fetchCases();
    }
  };

  const handleDeclineCase = async (caseId: string) => {
    const { error } = await supabase.from('cases').update({
      status: 'declined', updated_at: new Date().toISOString(),
    }).eq('id', caseId);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('caseDeclined') });
      fetchCases();
    }
  };

  const getDocStatus = (docType: string) => documents.find(d => d.document_type === docType);

  const statusBadge = (status: string) => {
    const config: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { labelKey: 'pendingVerification', variant: 'outline', icon: Clock },
      under_review: { labelKey: 'underReviewLabel', variant: 'secondary', icon: Clock },
      verified: { labelKey: 'verifiedLawyer', variant: 'default', icon: CheckCircle },
      rejected: { labelKey: 'rejectedLabel', variant: 'destructive', icon: XCircle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return <Badge variant={c.variant} className="text-sm"><Icon className="h-3 w-3 mr-1" />{t(c.labelKey)}</Badge>;
  };

  const verificationStatus = lawyerProfile?.verification_status || 'pending';
  const pendingCases = cases.filter(c => c.status === 'pending' && !c.lawyer_id);
  const activeCases = cases.filter(c => ['accepted', 'in_progress', 'under_review', 'consultation_scheduled', 'waiting_for_client'].includes(c.status) && c.lawyer_id === user?.id);
  const completedCases = cases.filter(c => c.status === 'closed' && c.lawyer_id === user?.id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('lawyerDashboard')}</h1>
            <p className="text-muted-foreground">{t('welcomeName')}, {profile?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/lawyer-profile/edit')}>
              <Edit className="h-4 w-4 mr-2" />{t('editProfile')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-cases')}>
              <Briefcase className="h-4 w-4 mr-2" />{t('allCases')}
            </Button>
            {statusBadge(verificationStatus)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('caseRequests'), count: pendingCases.length, icon: Clock, color: 'text-yellow-600' },
          { label: t('activeCases'), count: activeCases.length, icon: Briefcase, color: 'text-blue-600' },
          { label: t('completedLabel'), count: completedCases.length, icon: CheckCircle, color: 'text-green-600' },
          { label: t('notificationsLabel'), count: notifications.length, icon: Bell, color: 'text-purple-600' },
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

      {/* Verification Banner */}
      {verificationStatus !== 'verified' && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                {verificationStatus === 'pending' && t('completeVerification')}
                {verificationStatus === 'under_review' && t('verificationInProgress')}
                {verificationStatus === 'rejected' && t('verificationRejected')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {verificationStatus === 'pending' && t('uploadDocsToVerify')}
                {verificationStatus === 'under_review' && t('docsBeingReviewed')}
                {verificationStatus === 'rejected' && t('reuploadDocs')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={verificationStatus === 'verified' ? 'cases' : 'verification'} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="verification">{t('verification')}</TabsTrigger>
          <TabsTrigger value="cases">{t('caseRequests')} ({pendingCases.length})</TabsTrigger>
          <TabsTrigger value="active">{t('active')} ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="notifications">{t('notificationsLabel')} ({notifications.length})</TabsTrigger>
          <TabsTrigger value="performance">{t('performance')}</TabsTrigger>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
        </TabsList>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> {t('documentVerification')}</CardTitle>
              <CardDescription>{t('uploadCredentials')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {VERIFICATION_DOCS.map(doc => {
                const existing = getDocStatus(doc.type);
                const Icon = doc.icon;
                return (
                  <div key={doc.type} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t(doc.labelKey)}</p>
                        {existing ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{existing.file_name}</span>
                            <Badge variant="outline" className={
                              existing.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                              existing.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }>{existing.status}</Badge>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">{t('notUploaded')}</p>
                        )}
                      </div>
                    </div>
                    {(!existing || existing.status === 'rejected') && (
                      <div>
                        <Input type="file" accept="image/*,.pdf" className="hidden" id={`upload-${doc.type}`}
                          onChange={e => { const file = e.target.files?.[0]; if (file) handleUpload(doc.type, file); }} />
                        <Button size="sm" variant="outline" disabled={uploading === doc.type} asChild>
                          <label htmlFor={`upload-${doc.type}`} className="cursor-pointer">
                            <Upload className="h-3.5 w-3.5 mr-1" />{uploading === doc.type ? t('uploading') : t('upload')}
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Requests Tab */}
        <TabsContent value="cases" className="space-y-3">
          {pendingCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{verificationStatus !== 'verified' ? t('completeVerificationForCases') : t('noPendingCaseRequests')}</p>
              </CardContent>
            </Card>
          ) : (
            pendingCases.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{c.case_type}</Badge>
                        {c.priority === 'urgent' && <Badge variant="destructive" className="text-xs">{t('urgent')}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.created_at).toLocaleDateString()}</span>
                        {(c.client_location_city || c.client_location_state) && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[c.client_location_city, c.client_location_state].filter(Boolean).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => handleAcceptCase(c.id)}><CheckCircle className="h-3.5 w-3.5 mr-1" />{t('accept')}</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeclineCase(c.id)}><XCircle className="h-3.5 w-3.5 mr-1" />{t('decline')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/case/${c.id}`)}><ArrowRight className="h-3.5 w-3.5 mr-1" />{t('details')}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Active Cases Tab */}
        <TabsContent value="active" className="space-y-3">
          {activeCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{t('noActiveCases')}</p>
              </CardContent>
            </Card>
          ) : (
            activeCases.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/case/${c.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{c.case_type}</Badge>
                        <Badge className={`text-xs ${STATUS_COLORS[c.status] || ''}`}>{c.status.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{t('noNewNotifications')}</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(n => (
              <Card key={n.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {n.related_case_id && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/case/${n.related_case_id}`)}>View</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => markNotificationRead(n.id)}>Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <PerformanceStats
            rating={lawyerProfile?.rating || 0}
            totalReviews={lawyerProfile?.total_reviews || 0}
            casesHandled={activeCases.length + completedCases.length}
            casesCompleted={completedCases.length}
            consultationCount={0}
          />
          <ReviewsList lawyerId={user?.id || ''} />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t('professionalProfile')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground text-xs">{t('name')}</Label><p className="font-medium">{profile?.name}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('email')}</Label><p className="font-medium">{profile?.email}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('phone')}</Label><p className="font-medium">{profile?.phone || t('notSetLabel')}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('state')}</Label><p className="font-medium">{profile?.state || t('notSetLabel')}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('barCouncilNumber')}</Label><p className="font-medium">{lawyerProfile?.bar_council_number}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('role')}</Label><p className="font-medium capitalize">{lawyerProfile?.role_type?.replace('_', ' ')}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('experience')}</Label><p className="font-medium">{lawyerProfile?.experience} {t('years')}</p></div>
                <div><Label className="text-muted-foreground text-xs">{t('consultationFeeLabel')}</Label><p className="font-medium">₹{lawyerProfile?.consultation_fee}/{t('perHour')}</p></div>
              </div>
              {lawyerProfile?.practice_areas && lawyerProfile.practice_areas.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">{t('practiceAreas')}</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {lawyerProfile.practice_areas.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LawyerDashboard;
