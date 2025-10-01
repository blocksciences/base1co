import { useState, useEffect } from 'react';
import { useICOContract } from './useICOContract';

export interface BlockchainSaleInfo {
  fundsRaised: number;
  hardCap: number;
  softCap: number;
  contributorCount: number;
  progressPercentage: number;
}

export const useProjectBlockchainData = (contractAddress: string | null, refreshInterval: number = 30000) => {
  const [saleInfo, setSaleInfo] = useState<BlockchainSaleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getSaleInfo } = useICOContract(contractAddress || '');

  const fetchData = async () => {
    if (!contractAddress) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const info = await getSaleInfo();
      if (info) {
        setSaleInfo(info);
      } else {
        setError('Failed to fetch blockchain data');
      }
    } catch (err: any) {
      console.error('Error fetching blockchain data:', err);
      setError(err.message || 'Failed to fetch blockchain data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up interval to refresh data
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [contractAddress, refreshInterval]);

  return {
    saleInfo,
    isLoading,
    error,
    refetch: fetchData,
  };
};
