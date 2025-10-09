import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export const useKYCStatus = () => {
  const { address, isConnected } = useAccount();
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkTrigger, setCheckTrigger] = useState(0);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!isConnected || !address) {
        setIsKYCApproved(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('[KYC Check] Checking for address:', address);
        
        // Use text filter with exact match, case insensitive
        const { data: kycData, error } = await supabase
          .from('kyc_submissions')
          .select('status, wallet_address')
          .filter('wallet_address', 'ilike', address)
          .filter('status', 'eq', 'approved')
          .limit(1);

        if (error) {
          console.error('[KYC Check] Error:', error);
          setIsKYCApproved(false);
        } else {
          const approved = kycData && kycData.length > 0;
          console.log('[KYC Check] Result:', { found: kycData?.length || 0, approved });
          setIsKYCApproved(approved);
        }
      } catch (error) {
        console.error('[KYC Check] Exception:', error);
        setIsKYCApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();

    // Listen for custom events
    const handleKYCChange = () => {
      console.log('[KYC Check] Custom event triggered, re-checking...');
      setCheckTrigger(prev => prev + 1);
    };
    
    window.addEventListener('kyc-status-changed', handleKYCChange);

    // Set up realtime subscription for instant updates
    if (address) {
      const channel = supabase
        .channel('kyc-status-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kyc_submissions'
          },
          (payload) => {
            console.log('[KYC Realtime] Change detected:', payload);
            setCheckTrigger(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        window.removeEventListener('kyc-status-changed', handleKYCChange);
        supabase.removeChannel(channel);
      };
    }

    return () => {
      window.removeEventListener('kyc-status-changed', handleKYCChange);
    };
  }, [address, isConnected, checkTrigger]);

  return { isKYCApproved, isLoading };
};
