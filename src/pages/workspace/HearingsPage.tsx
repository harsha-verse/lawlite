import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Building } from 'lucide-react';

const HearingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hearings, setHearings] = useState<any[]>([]);
  const [cases, setCases] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: h } = await supabase.from('workspace_hearings').select('*').eq('lawyer_id', user.id).gte('hearing_date', today).order('hearing_date', { ascending: true });
      setHearings(h || []);
      const ids = Array.from(new Set((h || []).map((x) => x.case_id)));
      if (ids.length) {
        const { data: c } = await supabase.from('cases').select('id,title').in('id', ids);
        const m: Record<string, any> = {};
        (c || []).forEach((cc) => (m[cc.id] = cc));
        setCases(m);
      }
    })();
  }, [user]);

  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const h of hearings) {
    (grouped[h.hearing_date] ||= []).push(h);
  }

  if (hearings.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">
      <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>No upcoming hearings. Add hearings from a case.</p>
    </CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-sm font-semibold text-muted-foreground mb-2">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="space-y-2">
            {items.map((h) => (
              <Card key={h.id} className="hover:shadow-md cursor-pointer" onClick={() => navigate(`/workspace/cases/${h.case_id}`)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{h.hearing_time || 'All day'} · {cases[h.case_id]?.title || 'Case'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      {h.court_name && <span className="flex items-center gap-1"><Building className="h-3 w-3" />{h.court_name}</span>}
                      {h.purpose && <span>· {h.purpose}</span>}
                    </p>
                  </div>
                  <Badge variant="outline">{h.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HearingsPage;
