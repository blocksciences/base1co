import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, formatEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';

// ICO Contract ABI - minimal interface for investment and claiming
const ICO_ABI = [
  {
    inputs: [],
    name: 'invest',
    outputs: [],
    stateMutability: 'payable',
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
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'contributions',
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

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        value: valueInWei,
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
      toast.loading('Preparing claim transaction...', { id: 'claim' });

      // Encode the claimTokens() function call
      const data = encodeFunctionData({
        abi: ICO_ABI,
        functionName: 'claimTokens',
        args: [], // claimTokens takes no arguments
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data, // Include the encoded function call
      } as any);

      toast.loading('Claim submitted. Waiting for confirmation...', { id: 'claim' });

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success('Tokens claimed successfully!', { id: 'claim' });
      return true;
    } catch (error: any) {
      console.error('Claim error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'claim' });
      } else {
        toast.error('Claim failed. Please try again.', { id: 'claim' });
      }
      
      return false;
    }
  };

  const getUserContribution = async () => {
    if (!isConnected || !address || !publicClient) {
      return '0';
    }

    try {
      // Read user contribution from contract
      // Note: Contract must implement contributions(address) view function
      // Uncomment when contract is deployed with this functionality:
      // const contribution = await publicClient.readContract({
      //   address: contractAddress as `0x${string}`,
      //   abi: ICO_ABI,
      //   functionName: 'contributions',
      //   args: [address],
      // });
      // return formatEther(contribution);
      
      return '0';
    } catch (error) {
      console.error('Error fetching contribution:', error);
      return '0';
    }
  };

  return {
    invest,
    claimTokens,
    getUserContribution,
    isConnected,
  };
};
