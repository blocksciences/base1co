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
    inputs: [],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserTokenInfo',
    outputs: [
      { internalType: 'uint256', name: 'purchased', type: 'uint256' },
      { internalType: 'uint256', name: 'claimed', type: 'uint256' },
      { internalType: 'uint256', name: 'claimable', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'kycRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
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
  {
    inputs: [],
    name: 'startTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'endTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minContribution',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxContribution',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'finalizeSale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'enableEmergencyMode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyWithdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const KYC_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isEligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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

    if (!walletClient || !publicClient) {
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

      // Simulate transaction first to catch revert reason
      try {
        await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'buyTokens',
          account: address,
          value: valueInWei,
        });
      } catch (simError: any) {
        console.error('[Invest] Simulation failed:', simError);
        
        // Parse revert reason
        const reason = simError.message || simError.shortMessage || '';
        if (reason.includes('Not KYC approved')) {
          toast.error('KYC approval required. Please complete KYC first.', { id: 'invest' });
        } else if (reason.includes('Insufficient tokens')) {
          toast.error('Sale contract has insufficient tokens. Contact project team.', { id: 'invest' });
        } else if (reason.includes('Below minimum')) {
          toast.error('Amount below minimum contribution', { id: 'invest' });
        } else if (reason.includes('Exceeds maximum')) {
          toast.error('Amount exceeds maximum contribution limit', { id: 'invest' });
        } else if (reason.includes('paused')) {
          toast.error('Sale is currently paused', { id: 'invest' });
        } else {
          toast.error(`Transaction would fail: ${reason}`, { id: 'invest' });
        }
        return false;
      }

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
        gas: 500000n,
      } as any);

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'invest' });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'reverted') {
        toast.error('Transaction reverted. Please contact support.', { id: 'invest' });
        return false;
      }

      toast.success(`Investment successful! Tokens will be claimable after sale ends.`, { id: 'invest' });
      return true;
    } catch (error: any) {
      console.error('[Invest] Transaction error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'invest' });
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds in wallet', { id: 'invest' });
      } else {
        toast.error(error.shortMessage || error.message || 'Transaction failed', { id: 'invest' });
      }
      
      return false;
    }
  };

  const claimTokens = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return false;
    }

    try {
      toast.loading('Preparing token claim...', { id: 'claimTokens' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'claimTokens',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Claim submitted. Waiting for confirmation...', { id: 'claimTokens' });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success('Tokens claimed successfully!', { id: 'claimTokens' });
      return true;
    } catch (error: any) {
      console.error('Claim tokens error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'claimTokens' });
      } else {
        toast.error('Token claim failed. Please try again.', { id: 'claimTokens' });
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
      const [fundsRaised, hardCap, softCap, contributorCount, minContribution, maxContribution] = await Promise.all([
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
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'minContribution',
        } as any),
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'maxContribution',
        } as any),
      ]);

      const raisedEth = parseFloat(formatEther(fundsRaised as bigint));
      const hardCapEth = parseFloat(formatEther(hardCap as bigint));
      const softCapEth = parseFloat(formatEther(softCap as bigint));
      const minContributionEth = parseFloat(formatEther(minContribution as bigint));
      const maxContributionEth = parseFloat(formatEther(maxContribution as bigint));
      const progress = hardCapEth > 0 ? (raisedEth / hardCapEth) * 100 : 0;

      return {
        fundsRaised: raisedEth,
        hardCap: hardCapEth,
        softCap: softCapEth,
        contributorCount: Number(contributorCount),
        progressPercentage: Math.min(Math.round(progress), 100),
        minContribution: minContributionEth,
        maxContribution: maxContributionEth,
      };
    } catch (error) {
      console.error('Error fetching sale info:', error);
      return null;
    }
  };

  const checkKYCStatus = async (): Promise<boolean> => {
    if (!isConnected || !address || !publicClient) {
      return false;
    }

    try {
      // Get KYC registry address from ICO contract
      const kycRegistryAddress = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ICO_ABI,
        functionName: 'kycRegistry',
      } as any);

      // Check if user is eligible
      const isEligible = await publicClient.readContract({
        address: kycRegistryAddress as `0x${string}`,
        abi: KYC_REGISTRY_ABI,
        functionName: 'isEligible',
        args: [address],
      } as any);

      return Boolean(isEligible);
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return false;
    }
  };

  const checkSaleStatus = async () => {
    if (!publicClient || !contractAddress) {
      console.log('No blockchain client or contract address available');
      return { hasStarted: false, hasEnded: false, canInvest: false, startTime: 0, endTime: 0 };
    }

    try {
      const [startTime, endTime] = await Promise.all([
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'startTime',
        } as any),
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ICO_ABI,
          functionName: 'endTime',
        } as any),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const hasStarted = now >= Number(startTime);
      const hasEnded = now > Number(endTime);
      const canInvest = hasStarted && !hasEnded;

      console.log('Sale status from blockchain:', {
        now,
        startTime: Number(startTime),
        endTime: Number(endTime),
        hasStarted,
        hasEnded,
        canInvest
      });

      return { 
        hasStarted, 
        hasEnded, 
        canInvest,
        startTime: Number(startTime),
        endTime: Number(endTime)
      };
    } catch (error) {
      console.error('Error checking sale status from blockchain:', error);
      return { hasStarted: false, hasEnded: false, canInvest: false, startTime: 0, endTime: 0 };
    }
  };

  /**
   * Finalize the sale (admin only)
   */
  const finalizeSale = async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      toast.loading('Finalizing sale...', { id: 'finalize' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'finalizeSale',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Waiting for confirmation...', { id: 'finalize' });
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success('Sale finalized successfully!', { id: 'finalize' });
      return true;
    } catch (error: any) {
      console.error('Error finalizing sale:', error);
      toast.error(error.message || 'Failed to finalize sale', { id: 'finalize' });
      return false;
    }
  };

  /**
   * Enable emergency mode (admin only)
   */
  const enableEmergencyMode = async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      toast.loading('Enabling emergency mode...', { id: 'emergency' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'enableEmergencyMode',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Waiting for confirmation...', { id: 'emergency' });
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success('Emergency mode enabled', { id: 'emergency' });
      return true;
    } catch (error: any) {
      console.error('Error enabling emergency mode:', error);
      toast.error(error.message || 'Failed to enable emergency mode', { id: 'emergency' });
      return false;
    }
  };

  /**
   * Emergency withdraw ETH (admin only)
   */
  const emergencyWithdrawETH = async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      toast.loading('Withdrawing ETH...', { id: 'withdraw' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'emergencyWithdrawETH',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Waiting for confirmation...', { id: 'withdraw' });
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success('ETH withdrawn successfully', { id: 'withdraw' });
      return true;
    } catch (error: any) {
      console.error('Error withdrawing ETH:', error);
      toast.error(error.message || 'Failed to withdraw ETH', { id: 'withdraw' });
      return false;
    }
  };

  /**
   * Pause the contract (admin only)
   */
  const pauseContract = async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      toast.loading('Pausing contract...', { id: 'pause' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'pause',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Waiting for confirmation...', { id: 'pause' });
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success('Contract paused', { id: 'pause' });
      return true;
    } catch (error: any) {
      console.error('Error pausing contract:', error);
      toast.error(error.message || 'Failed to pause contract', { id: 'pause' });
      return false;
    }
  };

  /**
   * Unpause the contract (admin only)
   */
  const unpauseContract = async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      toast.loading('Unpausing contract...', { id: 'unpause' });

      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'unpause',
        args: [],
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      } as any);

      toast.loading('Waiting for confirmation...', { id: 'unpause' });
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success('Contract unpaused', { id: 'unpause' });
      return true;
    } catch (error: any) {
      console.error('Error unpausing contract:', error);
      toast.error(error.message || 'Failed to unpause contract', { id: 'unpause' });
      return false;
    }
  };

  const getUserTokenInfo = async () => {
    if (!isConnected || !address || !publicClient) {
      return null;
    }

    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ICO_ABI,
        functionName: 'getUserTokenInfo',
        args: [address],
      } as any);

      const [purchased, claimed, claimable] = result as [bigint, bigint, bigint];

      return {
        purchased: formatEther(purchased),
        claimed: formatEther(claimed),
        claimable: formatEther(claimable),
      };
    } catch (error) {
      console.error('Error fetching user token info:', error);
      return null;
    }
  };

  return {
    invest,
    claimTokens,
    claimRefund,
    getUserContribution,
    getUserTokenInfo,
    getSaleInfo,
    checkKYCStatus,
    checkSaleStatus,
    finalizeSale,
    enableEmergencyMode,
    emergencyWithdrawETH,
    pauseContract,
    unpauseContract,
    isConnected,
  };
};
