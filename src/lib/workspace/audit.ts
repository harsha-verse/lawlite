import { supabase } from '@/integrations/supabase/client';

interface LogParams {
  lawyerId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  caseId?: string | null;
  details?: Record<string, any>;
}

export const logAudit = async (p: LogParams) => {
  try {
    await (supabase.from('workspace_audit_log') as any).insert({
      lawyer_id: p.lawyerId,
      actor_id: p.actorId,
      action: p.action,
      entity_type: p.entityType,
      entity_id: p.entityId ?? null,
      case_id: p.caseId ?? null,
      details: p.details ?? null,
    });
  } catch {
    // never block UX on audit failure
  }
};
