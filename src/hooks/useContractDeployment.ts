import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export interface DeploymentParams {
  // Token Details
  projectName: string;
  tokenSymbol: string;
  totalSupply: string;
  tokenDecimals: number;
  tokenPrice: string;
  softCap: string;
  hardCap: string;
  minContribution: string;
  maxContribution: string;
  startDate: string;
  endDate: string;
  
  // Company Information
  companyLegalName: string;
  registrationNumber: string;
  registrationCountry: string;
  companyAddress: string;
  businessEmail: string;
  businessPhone: string;
  
  // Project Details
  projectDescription: string;
  problemStatement: string;
  solution: string;
  targetMarket: string;
  useOfFunds: string;
  
  // Team Information
  founderName: string;
  founderRole: string;
  founderLinkedin: string;
  founderBio: string;
  teamSize: string;
  advisors: string;
  
  // Social Links
  website: string;
  whitepaper: string;
  twitter: string;
  telegram: string;
  discord: string;
  medium: string;
  github: string;
  
  // Tokenomics
  publicSaleAllocation: string;
  teamAllocation: string;
  ecosystemAllocation: string;
  liquidityAllocation: string;
  vestingSchedule: string;
  
  // Legal & Compliance
  jurisdictionCompliance: string;
  auditReport: string;
  kycProvider: string;
  legalOpinion: string;
}

export const useContractDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const { address } = useAccount();

  const deployContracts = async (params: DeploymentParams) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsDeploying(true);
    const toastId = toast.loading('Initiating contract deployment...');

    try {
      const { data, error } = await supabase.functions.invoke('deploy-ico-contracts', {
        body: {
          ...params,
          deployerAddress: address,
        },
      });

      if (error) throw error;

      toast.success('Deployment initiated successfully!', { id: toastId });
      
      return data;
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.message || 'Failed to deploy contracts', { id: toastId });
      return null;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deployContracts,
    isDeploying,
  };
};
