import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export interface DeployListTokenParams {
  network?: 'baseSepolia' | 'base';
}

export const useListTokenDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const { address } = useAccount();

  const deployListToken = async (params: DeployListTokenParams = {}) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsDeploying(true);
    const toastId = toast.loading('Deploying LIST Token and Staking Vault...');

    try {
      const deployParams = {
        network: params.network || 'baseSepolia',
      };

      console.log('Deploying complete platform suite:', deployParams);

      const { data, error } = await supabase.functions.invoke('deploy-list-token', {
        body: deployParams,
      });

      if (error) throw error;

      toast.success('Platform suite deployed successfully!', { id: toastId });
      
      console.log('Deployment result:', data);
      
      return data;
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.message || 'Failed to deploy LIST Token', { id: toastId });
      return null;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deployListToken,
    isDeploying,
  };
};
