import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('workspace_audit_log').select('*').eq('lawyer_id', user.id).order('created_at', { ascending: false }).limit(200);
      setLogs(data || []);
    })();
  }, [user]);

  if (logs.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">
      <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>No activity yet.</p>
    </CardContent></Card>;
  }

  return (
    <div className="space-y-2">
      {logs.map((l) => (
        <Card key={l.id}><CardContent className="p-3 text-sm flex items-center justify-between">
          <div>
            <p><span className="font-medium">{l.action}</span> <span className="text-muted-foreground">· {l.entity_type}</span></p>
            {l.details && <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{JSON.stringify(l.details, null, 0)}</pre>}
          </div>
          <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
        </CardContent></Card>
      ))}
    </div>
  );
};

export default AuditPage;
