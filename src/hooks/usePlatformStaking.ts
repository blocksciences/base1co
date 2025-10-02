import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export interface LockPeriod {
  id: string;
  name: string;
  period_key: string;
  duration_days: number;
  apy_rate: number;
  multiplier: number;
  description: string;
  is_active: boolean;
}

export interface StakingTier {
  id: string;
  tier_key: string;
  tier_name: string;
  min_stake: number;
  tier_color: string;
  platform_fee_discount: number;
  allocation_multiplier: number;
  early_access_hours: number;
  guaranteed_allocation: boolean;
  governance_votes: number;
  exclusive_whitelist: boolean;
  priority_queue: boolean;
}

export interface PlatformStake {
  id: string;
  wallet_address: string;
  stake_id_onchain: number | null;
  amount: number;
  lock_period_id: string;
  start_time: string;
  unlock_time: string;
  last_reward_claim: string;
  rewards_earned: number;
  total_rewards_claimed: number;
  status: string;
  tx_hash: string | null;
  lock_period?: LockPeriod;
}

export interface UserTier {
  wallet_address: string;
  current_tier: StakingTier;
  total_staked: number;
  next_tier: StakingTier | null;
  progress_to_next: number;
}

export const usePlatformStaking = () => {
  const { address } = useAccount();
  const [lockPeriods, setLockPeriods] = useState<LockPeriod[]>([]);
  const [tiers, setTiers] = useState<StakingTier[]>([]);
  const [userStakes, setUserStakes] = useState<PlatformStake[]>([]);
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);

  // Fetch lock periods
  const fetchLockPeriods = async () => {
    const { data, error } = await supabase
      .from('staking_lock_periods')
      .select('*')
      .eq('is_active', true)
      .order('duration_days', { ascending: true });

    if (error) {
      console.error('Error fetching lock periods:', error);
      return;
    }

    setLockPeriods(data || []);
  };

  // Fetch tiers
  const fetchTiers = async () => {
    const { data, error } = await supabase
      .from('staking_tiers')
      .select('*')
      .order('min_stake', { ascending: true });

    if (error) {
      console.error('Error fetching tiers:', error);
      return;
    }

    setTiers(data || []);
  };

  // Fetch user stakes
  const fetchUserStakes = async () => {
    if (!address) return;

    const { data, error } = await supabase
      .from('platform_stakes')
      .select(`
        *,
        lock_period:staking_lock_periods(*)
      `)
      .eq('wallet_address', address)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user stakes:', error);
      return;
    }

    setUserStakes(data || []);
  };

  // Fetch user tier
  const fetchUserTier = async () => {
    if (!address) return;

    const { data: tierData, error: tierError } = await supabase
      .from('user_tiers')
      .select(`
        *,
        current_tier:staking_tiers!user_tiers_current_tier_id_fkey(*)
      `)
      .eq('wallet_address', address)
      .single();

    if (tierError && tierError.code !== 'PGRST116') {
      console.error('Error fetching user tier:', tierError);
      return;
    }

    if (!tierData) {
      // User has no tier yet, set to "None"
      const noneTier = tiers.find(t => t.tier_key === 'none');
      if (noneTier) {
        setUserTier({
          wallet_address: address,
          current_tier: noneTier,
          total_staked: 0,
          next_tier: tiers[1] || null,
          progress_to_next: 0,
        });
      }
      return;
    }

    const currentTier = tierData.current_tier as unknown as StakingTier;
    const currentTierIndex = tiers.findIndex(t => t.id === currentTier.id);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    
    const progress = nextTier
      ? Math.min(100, (tierData.total_staked / nextTier.min_stake) * 100)
      : 100;

    setUserTier({
      wallet_address: tierData.wallet_address,
      current_tier: currentTier,
      total_staked: tierData.total_staked,
      next_tier: nextTier,
      progress_to_next: progress,
    });
  };

  // Calculate rewards for a stake
  const calculateRewards = async (stakeId: string): Promise<number> => {
    const { data, error } = await supabase.rpc('calculate_platform_stake_rewards', {
      stake_id: stakeId,
    });

    if (error) {
      console.error('Error calculating rewards:', error);
      return 0;
    }

    return data || 0;
  };

  // Stake tokens (this would interact with smart contract)
  const stake = async (amount: number, lockPeriodId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    setStaking(true);
    try {
      // TODO: Interact with smart contract to stake tokens
      // For now, we'll just insert a record in the database
      
      const lockPeriod = lockPeriods.find(p => p.id === lockPeriodId);
      if (!lockPeriod) throw new Error('Invalid lock period');

      const unlockTime = new Date();
      unlockTime.setDate(unlockTime.getDate() + lockPeriod.duration_days);

      const { error } = await supabase.from('platform_stakes').insert({
        wallet_address: address,
        amount,
        lock_period_id: lockPeriodId,
        unlock_time: unlockTime.toISOString(),
        status: 'active',
      });

      if (error) throw error;

      toast.success(`Successfully staked ${amount} LIST tokens!`);
      
      // Refresh data
      await Promise.all([fetchUserStakes(), fetchUserTier()]);
      
      return true;
    } catch (error: any) {
      console.error('Staking error:', error);
      toast.error(error.message || 'Failed to stake tokens');
      return false;
    } finally {
      setStaking(false);
    }
  };

  // Unstake tokens
  const unstake = async (stakeId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const stake = userStakes.find(s => s.id === stakeId);
      if (!stake) throw new Error('Stake not found');

      const now = new Date();
      const unlockTime = new Date(stake.unlock_time);

      if (now < unlockTime) {
        toast.error('Tokens are still locked');
        return false;
      }

      // TODO: Interact with smart contract to unstake

      const { error } = await supabase
        .from('platform_stakes')
        .update({ status: 'unstaked' })
        .eq('id', stakeId);

      if (error) throw error;

      toast.success('Successfully unstaked tokens!');
      
      await Promise.all([fetchUserStakes(), fetchUserTier()]);
      
      return true;
    } catch (error: any) {
      console.error('Unstaking error:', error);
      toast.error(error.message || 'Failed to unstake tokens');
      return false;
    }
  };

  // Claim rewards
  const claimRewards = async (stakeId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const rewards = await calculateRewards(stakeId);
      if (rewards === 0) {
        toast.error('No rewards to claim');
        return false;
      }

      // TODO: Interact with smart contract to claim rewards

      const { error } = await supabase
        .from('platform_stakes')
        .update({
          last_reward_claim: new Date().toISOString(),
          total_rewards_claimed: userStakes.find(s => s.id === stakeId)!.total_rewards_claimed + rewards,
        })
        .eq('id', stakeId);

      if (error) throw error;

      toast.success(`Claimed ${rewards.toFixed(2)} LIST tokens!`);
      
      await fetchUserStakes();
      
      return true;
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error.message || 'Failed to claim rewards');
      return false;
    }
  };

  // Compound rewards
  const compoundRewards = async (stakeId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const rewards = await calculateRewards(stakeId);
      if (rewards === 0) {
        toast.error('No rewards to compound');
        return false;
      }

      // TODO: Interact with smart contract to compound

      const stake = userStakes.find(s => s.id === stakeId);
      if (!stake) throw new Error('Stake not found');

      const { error } = await supabase
        .from('platform_stakes')
        .update({
          amount: stake.amount + rewards,
          last_reward_claim: new Date().toISOString(),
          total_rewards_claimed: stake.total_rewards_claimed + rewards,
        })
        .eq('id', stakeId);

      if (error) throw error;

      toast.success(`Compounded ${rewards.toFixed(2)} LIST tokens!`);
      
      await Promise.all([fetchUserStakes(), fetchUserTier()]);
      
      return true;
    } catch (error: any) {
      console.error('Compound error:', error);
      toast.error(error.message || 'Failed to compound rewards');
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLockPeriods(),
        fetchTiers(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (address && tiers.length > 0) {
      fetchUserStakes();
      fetchUserTier();
    }
  }, [address, tiers.length]);

  return {
    lockPeriods,
    tiers,
    userStakes,
    userTier,
    loading,
    staking,
    stake,
    unstake,
    claimRewards,
    compoundRewards,
    calculateRewards,
    refresh: () => {
      fetchUserStakes();
      fetchUserTier();
    },
  };
};
