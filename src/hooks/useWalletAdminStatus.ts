import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWalletAdminStatus = (walletAddress: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!walletAddress) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('is_wallet_admin', { check_wallet_address: walletAddress });

        if (error) {
          console.error('Error checking wallet admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('Error checking wallet admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [walletAddress]);

  return { isAdmin, loading };
};
