import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface StakingPool {
  id: string;
  name: string;
  token_address: string;
  token_symbol: string;
  apy_rate: number;
  total_staked: number;
  min_stake_amount: number;
  lock_period_days: number;
  is_active: boolean;
}

export interface UserStake {
  id: string;
  wallet_address: string;
  pool_id: string;
  staked_amount: number;
  rewards_earned: number;
  last_reward_calculation: string;
  staked_at: string;
  unstaked_at?: string;
  status: 'active' | 'unstaked';
}

// Fetch all staking pools
export const useStakingPools = () => {
  return useQuery({
    queryKey: ['staking-pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staking_pools')
        .select('*')
        .eq('is_active', true)
        .order('apy_rate', { ascending: false });

      if (error) throw error;
      return data as StakingPool[];
    },
  });
};

// Fetch user's active stakes
export const useUserStakes = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-stakes', address],
    queryFn: async () => {
      if (!address) return [];

      const { data, error } = await supabase
        .from('user_stakes')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .eq('status', 'active')
        .order('staked_at', { ascending: false });

      if (error) throw error;
      return data as UserStake[];
    },
    enabled: !!address,
  });
};

// Calculate total staked by user
export const useTotalStaked = () => {
  const { data: stakes } = useUserStakes();
  
  const totalStaked = stakes?.reduce((sum, stake) => sum + Number(stake.staked_amount), 0) || 0;
  const totalRewards = stakes?.reduce((sum, stake) => sum + Number(stake.rewards_earned), 0) || 0;

  return { totalStaked, totalRewards };
};

// Create stake transaction
export const useStake = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: string; amount: number }) => {
      if (!address) throw new Error('Wallet not connected');

      // Insert stake record
      const { data: stake, error: stakeError } = await supabase
        .from('user_stakes')
        .insert({
          wallet_address: address.toLowerCase(),
          pool_id: poolId,
          staked_amount: amount,
          status: 'active',
        })
        .select()
        .single();

      if (stakeError) throw stakeError;

      // Record transaction
      const { error: txError } = await supabase
        .from('staking_transactions')
        .insert({
          wallet_address: address.toLowerCase(),
          pool_id: poolId,
          transaction_type: 'stake',
          amount,
          status: 'confirmed',
        });

      if (txError) throw txError;

      // Update pool total staked
      const { data: pool } = await supabase
        .from('staking_pools')
        .select('total_staked')
        .eq('id', poolId)
        .single();

      if (pool) {
        await supabase
          .from('staking_pools')
          .update({ total_staked: Number(pool.total_staked) + amount })
          .eq('id', poolId);
      }

      return stake;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['staking-pools'] });
    },
  });
};

// Unstake
export const useUnstake = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({ stakeId, amount }: { stakeId: string; amount: number }) => {
      if (!address) throw new Error('Wallet not connected');

      // Get stake details
      const { data: stake } = await supabase
        .from('user_stakes')
        .select('*, staking_pools(*)')
        .eq('id', stakeId)
        .single();

      if (!stake) throw new Error('Stake not found');

      // Calculate final rewards
      const { data: finalReward } = await supabase.rpc('calculate_staking_rewards', {
        stake_id: stakeId,
      });

      const totalRewards = Number(stake.rewards_earned) + (Number(finalReward) || 0);

      // Update stake to unstaked
      const { error: updateError } = await supabase
        .from('user_stakes')
        .update({
          status: 'unstaked',
          unstaked_at: new Date().toISOString(),
          rewards_earned: totalRewards,
        })
        .eq('id', stakeId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from('staking_transactions')
        .insert({
          wallet_address: address.toLowerCase(),
          pool_id: stake.pool_id,
          transaction_type: 'unstake',
          amount,
          status: 'confirmed',
        });

      if (txError) throw txError;

      // Update pool total staked
      await supabase
        .from('staking_pools')
        .update({ 
          total_staked: Math.max(0, Number(stake.staking_pools.total_staked) - amount) 
        })
        .eq('id', stake.pool_id);

      return { amount, rewards: totalRewards };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['staking-pools'] });
    },
  });
};

// Update rewards for active stakes
export const useUpdateRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stakeId: string) => {
      // Calculate current rewards
      const { data: newRewards } = await supabase.rpc('calculate_staking_rewards', {
        stake_id: stakeId,
      });

      if (!newRewards) return;

      // Update stake with new rewards
      const { data: stake } = await supabase
        .from('user_stakes')
        .select('rewards_earned')
        .eq('id', stakeId)
        .single();

      if (stake) {
        await supabase
          .from('user_stakes')
          .update({
            rewards_earned: Number(stake.rewards_earned) + Number(newRewards),
            last_reward_calculation: new Date().toISOString(),
          })
          .eq('id', stakeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
    },
  });
};
