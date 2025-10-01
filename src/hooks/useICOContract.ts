import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, formatEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';

// ICO Contract ABI - minimal interface for investment and claiming
const ICO_ABI = [
  {
    inputs: [],
    name: 'buyTokens',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'contributions',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fundsRaised',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hardCap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'softCap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContributorCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const useICOContract = (contractAddress: string) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const invest = async (amountInEth: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return false;
    }

    try {
      const amount = parseFloat(amountInEth);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return false;
      }

      const valueInWei = parseEther(amountInEth);

      toast.loading('Preparing transaction...', { id: 'invest' });

      // Encode the buyTokens() function call
      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'buyTokens',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        value: valueInWei,
        data,
      } as any);

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'invest' });

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success(`Successfully invested ${amountInEth} ETH!`, { id: 'invest' });
      return true;
    } catch (error: any) {
      console.error('Investment error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'invest' });
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds in wallet', { id: 'invest' });
      } else {
        toast.error('Investment failed. Please try again.', { id: 'invest' });
      }
      
      return false;
    }
  };

  const claimRefund = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return false;
    }

    try {
      toast.loading('Preparing refund claim...', { id: 'claim' });

      // Encode the claimRefund() function call
      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'claimRefund',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Refund submitted. Waiting for confirmation...', { id: 'claim' });

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success('Refund claimed successfully!', { id: 'claim' });
      return true;
    } catch (error: any) {
      console.error('Claim refund error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'claim' });
      } else {
        toast.error('Refund claim failed. Please try again.', { id: 'claim' });
      }
      
      return false;
    }
  };

  const getUserContribution = async () => {
    if (!isConnected || !address || !publicClient) {
      return '0';
    }

    try {
      const contribution = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ICO_ABI,
        functionName: 'contributions',
        args: [address],
      } as any);
      return formatEther(contribution as bigint);
    } catch (error) {
      console.error('Error fetching contribution:', error);
      return '0';
    }
  };

  const getSaleInfo = async () => {
    if (!publicClient || !contractAddress) {
      return null;
    }

    try {
      const [fundsRaised, hardCap, softCap, contributorCount] = await Promise.all([
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'fundsRaised',
        } as any),
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'hardCap',
        } as any),
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'softCap',
        } as any),
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'getContributorCount',
        } as any),
      ]);

      const raisedEth = parseFloat(formatEther(fundsRaised as bigint));
      const hardCapEth = parseFloat(formatEther(hardCap as bigint));
      const softCapEth = parseFloat(formatEther(softCap as bigint));
      const progress = hardCapEth > 0 ? (raisedEth / hardCapEth) * 100 : 0;

      return {
        fundsRaised: raisedEth,
        hardCap: hardCapEth,
        softCap: softCapEth,
        contributorCount: Number(contributorCount),
        progressPercentage: Math.min(Math.round(progress), 100),
      };
    } catch (error) {
      console.error('Error fetching sale info:', error);
      return null;
    }
  };

  return {
    invest,
    claimRefund,
    getUserContribution,
    getSaleInfo,
    isConnected,
  };
};
