import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  action: string;
  target_user_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Hook for logging admin actions to audit trail
 */
export const useAdminAudit = () => {
  const logAction = async (entry: AuditLogEntry) => {
    try {
      // Get client info
      const userAgent = navigator.userAgent;
      
      // Note: Getting real IP address requires server-side implementation
      // For now, we'll store placeholder
      const ipAddress = 'client-side';

      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          action: entry.action,
          target_user_id: entry.target_user_id,
          details: entry.details,
          ip_address: entry.ip_address || ipAddress,
          user_agent: entry.user_agent || userAgent,
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  };

  return { logAction };
};