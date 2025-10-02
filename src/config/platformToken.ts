// Platform Token (LIST) Configuration
export const PLATFORM_TOKEN_CONFIG = {
  name: 'List Token',
  symbol: 'LIST',
  decimals: 18,
  totalSupply: '10000000000', // 10 Billion tokens
  
  // Token Allocation (percentages)
  allocation: {
    stakingRewards: 30,    // 3B tokens - 30% for staking rewards
    icoParticipants: 25,   // 2.5B tokens - 25% ICO participants
    team: 20,              // 2B tokens - 20% team (vested)
    liquidity: 15,         // 1.5B tokens - 15% liquidity
    ecosystem: 10,         // 1B tokens - 10% ecosystem development
  },
  
  // Calculated token amounts (in base units)
  allocationAmounts: {
    stakingRewards: '3000000000',
    icoParticipants: '2500000000',
    team: '2000000000',
    liquidity: '1500000000',
    ecosystem: '1000000000',
  },
} as const;

// Staking Lock Periods with APY
export const STAKING_LOCK_PERIODS = [
  {
    id: 'flexible',
    name: 'Flexible',
    days: 0,
    apyRate: 3,
    description: 'Withdraw anytime with lower rewards',
    multiplier: 1.0,
  },
  {
    id: 'lock-30',
    name: '30 Days',
    days: 30,
    apyRate: 5,
    description: 'Lock for 1 month',
    multiplier: 1.1,
  },
  {
    id: 'lock-90',
    name: '90 Days',
    days: 90,
    apyRate: 12,
    description: 'Lock for 3 months',
    multiplier: 1.3,
  },
  {
    id: 'lock-180',
    name: '180 Days',
    days: 180,
    apyRate: 25,
    description: 'Lock for 6 months',
    multiplier: 1.6,
  },
  {
    id: 'lock-365',
    name: '365 Days',
    days: 365,
    apyRate: 50,
    description: 'Lock for 1 year - Maximum rewards',
    multiplier: 2.0,
  },
] as const;

// Minimum stake to prevent spam
export const MIN_STAKE_AMOUNT = 100; // 100 LIST tokens

// Platform Fee Configuration
export const PLATFORM_FEE_CONFIG = {
  defaultFeePercentage: 2.0, // 2% fee on ICO launches
  feeDistribution: {
    burned: 50,        // 50% burned
    stakingRewards: 50, // 50% to staking rewards pool
  },
} as const;

// Staking Tiers with Benefits
export const STAKING_TIERS = [
  {
    id: 'none',
    name: 'None',
    minStake: 0,
    color: 'gray',
    benefits: {
      platformFeeDiscount: 0,
      allocationMultiplier: 1.0,
      earlyAccessHours: 0,
      guaranteedAllocation: false,
      governanceVotes: 0,
      exclusiveWhitelist: false,
      priorityQueue: false,
    },
  },
  {
    id: 'bronze',
    name: 'Bronze',
    minStake: 1000,      // 1K LIST
    color: '#CD7F32',
    benefits: {
      platformFeeDiscount: 5,      // 5% off (1.9% fee)
      allocationMultiplier: 1.2,
      earlyAccessHours: 1,
      guaranteedAllocation: false,
      governanceVotes: 1,
      exclusiveWhitelist: false,
      priorityQueue: false,
    },
  },
  {
    id: 'silver',
    name: 'Silver',
    minStake: 5000,      // 5K LIST
    color: '#C0C0C0',
    benefits: {
      platformFeeDiscount: 15,     // 15% off (1.7% fee)
      allocationMultiplier: 1.5,
      earlyAccessHours: 3,
      guaranteedAllocation: false,
      governanceVotes: 2,
      exclusiveWhitelist: true,
      priorityQueue: true,
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    minStake: 25000,     // 25K LIST
    color: '#FFD700',
    benefits: {
      platformFeeDiscount: 25,     // 25% off (1.5% fee)
      allocationMultiplier: 2.0,
      earlyAccessHours: 12,
      guaranteedAllocation: true,
      governanceVotes: 5,
      exclusiveWhitelist: true,
      priorityQueue: true,
    },
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minStake: 100000,    // 100K LIST
    color: '#E5E4E2',
    benefits: {
      platformFeeDiscount: 50,     // 50% off (1.0% fee)
      allocationMultiplier: 3.0,
      earlyAccessHours: 24,
      guaranteedAllocation: true,
      governanceVotes: 15,
      exclusiveWhitelist: true,
      priorityQueue: true,
    },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    minStake: 500000,    // 500K LIST
    color: '#B9F2FF',
    benefits: {
      platformFeeDiscount: 75,     // 75% off (0.5% fee)
      allocationMultiplier: 5.0,
      earlyAccessHours: 48,
      guaranteedAllocation: true,
      governanceVotes: 50,
      exclusiveWhitelist: true,
      priorityQueue: true,
    },
  },
] as const;

// Helper function to get tier by stake amount
export function getTierByStakeAmount(stakeAmount: number) {
  // Find the highest tier that the user qualifies for
  return [...STAKING_TIERS]
    .reverse()
    .find(tier => stakeAmount >= tier.minStake) || STAKING_TIERS[0];
}

// Helper function to calculate actual platform fee after discount
export function calculatePlatformFee(baseAmount: number, tierDiscount: number): number {
  const baseFee = baseAmount * (PLATFORM_FEE_CONFIG.defaultFeePercentage / 100);
  const discount = baseFee * (tierDiscount / 100);
  return baseFee - discount;
}
