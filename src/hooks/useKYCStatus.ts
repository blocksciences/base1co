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
        setIsKYCApproved(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Check database for KYC approval
        const { data: kycData } = await supabase
          .from('kyc_submissions')
          .select('status')
          .eq('wallet_address', address.toLowerCase())
          .eq('status', 'approved')
          .maybeSingle();

        setIsKYCApproved(!!kycData);
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setIsKYCApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();
  }, [address, isConnected]);

  return { isKYCApproved, isLoading };
};
