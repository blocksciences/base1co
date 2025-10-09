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
        const normalizedAddress = address.toLowerCase();
        console.log('[KYC Check] Searching for:', normalizedAddress);
        
        // Query with exact lowercase match
        const { data: kycData, error } = await supabase
          .from('kyc_submissions')
          .select('id, status, wallet_address, reviewed_at')
          .eq('status', 'approved')
          .limit(100); // Get all approved to check manually

        if (error) {
          console.error('[KYC Check] Database error:', error);
          setIsKYCApproved(false);
        } else {
          console.log('[KYC Check] Found approved KYCs:', kycData?.length || 0);
          
          // Manual case-insensitive comparison
          const matchingKYC = kycData?.find(kyc => 
            kyc.wallet_address.toLowerCase() === normalizedAddress
          );
          
          console.log('[KYC Check] Match found:', !!matchingKYC, matchingKYC);
          setIsKYCApproved(!!matchingKYC);
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
