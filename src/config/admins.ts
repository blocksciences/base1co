import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a user has admin privileges from the database
 * @param userId - User ID to check
 * @returns Promise<boolean> indicating if user is an admin
 */
export const isAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .rpc('is_admin', { check_user_id: userId });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
