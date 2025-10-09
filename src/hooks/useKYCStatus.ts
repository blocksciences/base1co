import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export const useKYCStatus = () => {
  const { address, isConnected } = useAccount();
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!isConnected || !address) {
        console.log('Not connected or no address');
        setIsKYCApproved(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const normalizedAddress = address.toLowerCase();
        console.log('Checking KYC for address:', address, 'normalized:', normalizedAddress);
        
        // Check database for KYC approval using ilike for case-insensitive comparison
        const { data: kycData, error } = await supabase
          .from('kyc_submissions')
          .select('status, wallet_address')
          .ilike('wallet_address', normalizedAddress)
          .eq('status', 'approved')
          .maybeSingle();

        if (error) {
          console.error('Error checking KYC:', error);
        }

        console.log('KYC check result:', kycData);
        const approved = !!kycData;
        console.log('KYC approved:', approved);
        setIsKYCApproved(approved);
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setIsKYCApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();

    // Set up realtime subscription to watch for KYC changes
    if (address) {
      const channel = supabase
        .channel('kyc-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kyc_submissions'
          },
          (payload) => {
            console.log('KYC status changed:', payload);
            // Re-check KYC when any change happens
            checkKYCStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);

  return { isKYCApproved, isLoading };
};
