import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase, Plus, Search, Clock, CheckCircle, AlertTriangle,
  ArrowRight, Calendar, MapPin, Filter
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  consultation_scheduled: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  under_review: 'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  waiting_for_client: 'bg-orange-100 text-orange-800 border-orange-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
};

const MyCases: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const isLawyer = profile?.user_type === 'lawyer';

  useEffect(() => {
    if (user) fetchCases();
  }, [user]);

  const fetchCases = async () => {
    setLoading(true);
    let query = supabase.from('cases').select('*').order('created_at', { ascending: false });
    if (isLawyer) {
      query = query.or(`lawyer_id.eq.${user!.id},and(status.eq.pending,lawyer_id.is.null)`);
    } else {
      query = query.eq('client_id', user!.id);
    }
    const { data } = await query;
    setCases(data || []);
    setLoading(false);
  };

  const filteredCases = cases.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.case_type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType !== 'all' && c.case_type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const pendingCases = filteredCases.filter(c => c.status === 'pending' && (!c.lawyer_id || c.lawyer_id === user?.id));
  const activeCases = filteredCases.filter(c => ['accepted', 'consultation_scheduled', 'under_review', 'in_progress', 'waiting_for_client'].includes(c.status));
  const completedCases = filteredCases.filter(c => ['closed', 'declined'].includes(c.status));

  const caseTypes = [...new Set(cases.map(c => c.case_type))];

  const summaryCards = [
    { label: t('caseRequests'), count: cases.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: t('activeCases'), count: cases.filter(c => ['accepted', 'in_progress', 'under_review', 'consultation_scheduled', 'waiting_for_client'].includes(c.status)).length, icon: Briefcase, color: 'text-blue-600' },
    { label: t('completedLabel'), count: cases.filter(c => c.status === 'closed').length, icon: CheckCircle, color: 'text-green-600' },
  ];

  const CaseCard = ({ caseItem }: { caseItem: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/case/${caseItem.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{caseItem.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">{caseItem.case_type}</Badge>
              <Badge className={`text-xs ${STATUS_COLORS[caseItem.status] || ''}`}>
                {caseItem.status.replace(/_/g, ' ')}
              </Badge>
               {caseItem.priority === 'urgent' && <Badge variant="destructive" className="text-xs">{t('urgent')}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{caseItem.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(caseItem.created_at).toLocaleDateString()}</span>
              {(caseItem.client_location_city || caseItem.client_location_state) && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[caseItem.client_location_city, caseItem.client_location_state].filter(Boolean).join(', ')}</span>
              )}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isLawyer ? t('caseDashboard') : t('myCasesTitle')}</h1>
          <p className="text-muted-foreground">{isLawyer ? t('manageCaseRequests') : t('trackManageCases')}</p>
        </div>
        {!isLawyer && (
          <Button onClick={() => navigate('/submit-case')}>
            <Plus className="h-4 w-4 mr-2" />{t('submitNewCase')}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.count}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchCases')} className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder={t('caseType')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            {caseTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="pending">{t('pending')}</SelectItem>
            <SelectItem value="accepted">{t('accepted')}</SelectItem>
            <SelectItem value="in_progress">{t('inProgressLabel')}</SelectItem>
            <SelectItem value="closed">{t('closed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">{isLawyer ? t('caseRequests') : t('pending')} ({pendingCases.length})</TabsTrigger>
            <TabsTrigger value="active">{t('active')} ({activeCases.length})</TabsTrigger>
            <TabsTrigger value="completed">{t('completedLabel')} ({completedCases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-3 mt-4">
            {pendingCases.length === 0 ? <EmptyState message={isLawyer ? t('noPendingCaseRequestsLawyer') : t('noPendingCases')} /> :
              pendingCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeCases.length === 0 ? <EmptyState message={t('noActiveCasesLabel')} /> :
              activeCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedCases.length === 0 ? <EmptyState message={t('noCompletedCases')} /> :
              completedCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyCases;
