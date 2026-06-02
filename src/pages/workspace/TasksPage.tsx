import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListChecks } from 'lucide-react';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [cases, setCases] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: t } = await supabase.from('workspace_tasks').select('*').eq('lawyer_id', user.id).order('created_at', { ascending: false });
      setTasks(t || []);
      const ids = Array.from(new Set((t || []).map((x) => x.case_id)));
      if (ids.length) {
        const { data: c } = await supabase.from('cases').select('id,title').in('id', ids);
        const map: Record<string, any> = {};
        (c || []).forEach((cc) => (map[cc.id] = cc));
        setCases(map);
      }
    })();
  }, [user]);

  const cols = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  const move = async (id: string, status: string) => {
    await supabase.from('workspace_tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  if (tasks.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">
      <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>No tasks yet. Open a case to add tasks.</p>
    </CardContent></Card>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map((col) => (
        <Card key={col.key}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{col.label} ({tasks.filter((t) => t.status === col.key).length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks.filter((t) => t.status === col.key).map((t) => (
              <div key={t.id} className="p-2 rounded border border-border bg-card">
                <p className="text-sm font-medium">{t.title}</p>
                {cases[t.case_id] && (
                  <button className="text-xs text-primary hover:underline" onClick={() => navigate(`/workspace/cases/${t.case_id}`)}>
                    {cases[t.case_id].title}
                  </button>
                )}
                {t.deadline && <p className="text-xs text-muted-foreground mt-1">Due {new Date(t.deadline).toLocaleDateString()}</p>}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {col.key !== 'todo' && <Button size="sm" variant="ghost" onClick={() => move(t.id, 'todo')}>← Todo</Button>}
                  {col.key !== 'in_progress' && <Button size="sm" variant="ghost" onClick={() => move(t.id, 'in_progress')}>Doing</Button>}
                  {col.key !== 'done' && <Button size="sm" variant="ghost" onClick={() => move(t.id, 'done')}>Done →</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TasksPage;
