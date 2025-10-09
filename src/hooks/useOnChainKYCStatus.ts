import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

const KYC_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isKYCApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const useOnChainKYCStatus = (walletAddress: string | undefined, kycRegistryAddress: string | undefined) => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  useEffect(() => {
    const checkStatus = async () => {
      if (!walletAddress || !kycRegistryAddress || !publicClient) {
        setIsApproved(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await publicClient.readContract({
          address: kycRegistryAddress as `0x${string}`,
          abi: KYC_REGISTRY_ABI,
          functionName: 'isKYCApproved',
          args: [walletAddress as `0x${string}`],
        } as any);

        setIsApproved(result as boolean);
      } catch (err: any) {
        console.error('Error reading on-chain KYC status:', err);
        setError(err.message || 'Failed to read on-chain status');
        setIsApproved(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [walletAddress, kycRegistryAddress, publicClient]);

  return { isApproved, isLoading, error };
};
