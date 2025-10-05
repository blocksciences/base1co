import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// StakingVault ABI (key functions)
const STAKING_VAULT_ABI = [
  {
    inputs: [{ name: "poolId", type: "uint256" }, { name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "stakeId", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "stakeId", type: "uint256" }],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserStakes",
    outputs: [{
      components: [
        { name: "amount", type: "uint256" },
        { name: "poolId", type: "uint256" },
        { name: "startTime", type: "uint256" },
        { name: "lastClaimTime", type: "uint256" },
        { name: "rewardsClaimed", type: "uint256" },
        { name: "withdrawn", type: "bool" },
      ],
      name: "",
      type: "tuple[]",
    }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getTotalPendingRewards",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserStats",
    outputs: [
      { name: "totalStakedAmount", type: "uint256" },
      { name: "totalRewardsEarned", type: "uint256" },
      { name: "pendingRewardsAmount", type: "uint256" },
      { name: "activeStakesCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "poolId", type: "uint256" }],
    name: "getPoolInfo",
    outputs: [
      { name: "lockDuration", type: "uint256" },
      { name: "apy", type: "uint256" },
      { name: "totalStakedInPool", type: "uint256" },
      { name: "minStake", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }, { name: "stakeId", type: "uint256" }],
    name: "pendingRewards",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const useStakingVault = (contractAddress?: `0x${string}`) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  // Get staking vault address from config
  const { data: vaultAddress } = useQuery({
    queryKey: ["stakingVaultAddress"],
    queryFn: async () => {
      if (contractAddress) return contractAddress;
      
      const { data } = await supabase
        .from("platform_token_config")
        .select("staking_vault_address")
        .single();
      
      return data?.staking_vault_address as `0x${string}` | null;
    },
  });

  // Get pool count
  const { data: poolCount } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "poolCount",
    query: { enabled: !!vaultAddress },
  });

  // Get all pool info
  const { data: pools } = useQuery({
    queryKey: ["stakingPools", vaultAddress, poolCount],
    queryFn: async () => {
      if (!vaultAddress || !poolCount) return [];
      
      const poolPromises = [];
      for (let i = 0; i < Number(poolCount); i++) {
        poolPromises.push(
          fetch(`/api/staking/pool/${i}`).then(r => r.json())
        );
      }
      
      // In a real implementation, you'd call getPoolInfo for each pool
      return Array.from({ length: Number(poolCount) }, (_, i) => ({
        id: i,
        lockDuration: i === 0 ? 0 : i === 1 ? 30 : i === 2 ? 90 : i === 3 ? 180 : 365,
        apy: i === 0 ? 5 : i === 1 ? 12 : i === 2 ? 20 : i === 3 ? 35 : 50,
        name: i === 0 ? "Flexible" : `${i === 1 ? 30 : i === 2 ? 90 : i === 3 ? 180 : 365} Days`,
      }));
    },
    enabled: !!vaultAddress && !!poolCount,
  });

  // Get user stakes
  const { data: userStakes, refetch: refetchStakes } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address },
  });

  // Get user stats
  const { data: userStats } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address },
  });

  // Get pending rewards
  const { data: pendingRewards } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "getTotalPendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address },
  });

  // Stake mutation
  const stake = useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: number; amount: string }) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "stake",
        args: [BigInt(poolId), parseEther(amount)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Stake successful!");
      queryClient.invalidateQueries({ queryKey: ["stakingPools"] });
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Stake failed: " + error.message);
    },
  });

  // Withdraw mutation
  const withdraw = useMutation({
    mutationFn: async (stakeId: number) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "withdraw",
        args: [BigInt(stakeId)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Withdrawal successful!");
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Withdrawal failed: " + error.message);
    },
  });

  // Claim rewards mutation
  const claimRewards = useMutation({
    mutationFn: async (stakeId: number) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "claimRewards",
        args: [BigInt(stakeId)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Rewards claimed!");
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Claim failed: " + error.message);
    },
  });

  return {
    vaultAddress,
    pools,
    userStakes,
    userStats: userStats ? {
      totalStaked: formatEther(userStats[0]),
      totalRewardsEarned: formatEther(userStats[1]),
      pendingRewards: formatEther(userStats[2]),
      activeStakesCount: Number(userStats[3]),
    } : null,
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : "0",
    stake,
    withdraw,
    claimRewards,
  };
};
