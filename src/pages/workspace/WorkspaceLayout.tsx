import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Users, ListChecks, CalendarDays, ShieldCheck, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/workspace', label: 'Cases', icon: Briefcase, end: true },
  { to: '/workspace/clients', label: 'Clients', icon: Users },
  { to: '/workspace/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/workspace/hearings', label: 'Hearings', icon: CalendarDays },
  { to: '/workspace/audit', label: 'Audit Log', icon: ShieldCheck },
];

const WorkspaceLayout: React.FC = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading workspace…</div>;
  }
  if (profile?.user_type !== 'lawyer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Advocate Workspace</h1>
          <p className="text-sm text-muted-foreground">Your private digital legal workflow</p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              )
            }
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default WorkspaceLayout;
