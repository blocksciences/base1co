import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Lock periods in seconds (matching contract constants)
const LOCK_30_DAYS = 30 * 24 * 60 * 60;
const LOCK_90_DAYS = 90 * 24 * 60 * 60;
const LOCK_180_DAYS = 180 * 24 * 60 * 60;
const LOCK_365_DAYS = 365 * 24 * 60 * 60;

// StakingVault ABI (matching deployed contract)
const STAKING_VAULT_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "lockPeriod", type: "uint256" }
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "stakeId", type: "uint256" }],
    name: "unstake",
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
    inputs: [{ name: "stakeId", type: "uint256" }],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserActiveStakes",
    outputs: [{ name: "", type: "uint256[]" }],
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
    inputs: [
      { name: "user", type: "address" },
      { name: "stakeId", type: "uint256" }
    ],
    name: "calculateRewards",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "stakes",
    outputs: [
      { name: "amount", type: "uint256" },
      { name: "lockPeriod", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "lastClaimTime", type: "uint256" },
      { name: "accumulatedRewards", type: "uint256" },
      { name: "tier", type: "uint8" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "userStakeCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "totalStakedByUser",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPool",
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
        .maybeSingle();
      
      return data?.staking_vault_address as `0x${string}` | null;
    },
  });

  // Define lock periods as "pools" for UI
  const pools = [
    { id: LOCK_30_DAYS, lockDuration: 30, apy: 5, name: "30 Days" },
    { id: LOCK_90_DAYS, lockDuration: 90, apy: 10, name: "90 Days" },
    { id: LOCK_180_DAYS, lockDuration: 180, apy: 15, name: "180 Days" },
    { id: LOCK_365_DAYS, lockDuration: 365, apy: 25, name: "365 Days" },
  ];

  // Get user stake count
  const { data: userStakeCount } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "userStakeCount",
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address },
  });

  // Get active stake IDs
  const { data: activeStakeIds, refetch: refetchStakes } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "getUserActiveStakes",
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address },
  });

  // Get total staked by user
  const { data: totalStakedByUser } = useReadContract({
    address: vaultAddress,
    abi: STAKING_VAULT_ABI,
    functionName: "totalStakedByUser",
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

  // Get detailed stake info for each active stake
  const { data: userStakes } = useQuery({
    queryKey: ["userStakeDetails", vaultAddress, address, activeStakeIds],
    queryFn: async () => {
      if (!vaultAddress || !address || !activeStakeIds || activeStakeIds.length === 0) {
        return [];
      }

      // Fetch stake details for each active stake ID
      const stakePromises = activeStakeIds.map(async (stakeId) => {
        // This would need multicall in production, but for now we'll return stake IDs
        return {
          stakeId: Number(stakeId),
          // In a real implementation, you'd call stakes(address, stakeId) for each
        };
      });

      return Promise.all(stakePromises);
    },
    enabled: !!vaultAddress && !!address && !!activeStakeIds,
  });

  // Stake mutation
  const stake = useMutation({
    mutationFn: async ({ lockPeriod, amount }: { lockPeriod: number; amount: string }) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "stake",
        args: [parseEther(amount), BigInt(lockPeriod)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Stake successful!");
      queryClient.invalidateQueries({ queryKey: ["stakingVaultAddress"] });
      queryClient.invalidateQueries({ queryKey: ["userStakeDetails"] });
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Stake failed: " + error.message);
    },
  });

  // Unstake mutation
  const unstake = useMutation({
    mutationFn: async (stakeId: number) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "unstake",
        args: [BigInt(stakeId)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Unstake successful!");
      queryClient.invalidateQueries({ queryKey: ["userStakeDetails"] });
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Unstake failed: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["userStakeDetails"] });
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Claim failed: " + error.message);
    },
  });

  // Emergency withdraw mutation
  const emergencyWithdraw = useMutation({
    mutationFn: async (stakeId: number) => {
      if (!vaultAddress || !address) throw new Error("Wallet not connected");
      
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: STAKING_VAULT_ABI,
        functionName: "emergencyWithdraw",
        args: [BigInt(stakeId)],
      } as any);
      
      return hash;
    },
    onSuccess: () => {
      toast.success("Emergency withdrawal successful!");
      queryClient.invalidateQueries({ queryKey: ["userStakeDetails"] });
      refetchStakes();
    },
    onError: (error) => {
      toast.error("Emergency withdrawal failed: " + error.message);
    },
  });

  return {
    vaultAddress,
    pools,
    userStakes: userStakes || [],
    activeStakeIds: activeStakeIds || [],
    userStats: {
      totalStaked: totalStakedByUser ? formatEther(totalStakedByUser) : "0",
      pendingRewards: pendingRewards ? formatEther(pendingRewards) : "0",
      activeStakesCount: activeStakeIds ? activeStakeIds.length : 0,
    },
    stake,
    unstake,
    claimRewards,
    emergencyWithdraw,
  };
};
