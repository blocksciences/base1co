import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, TrendingUp, Info, Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useStakingPools, useUserStakes, useTotalStaked, useStake, useUnstake, useUpdateRewards } from '@/hooks/useStaking';
import { toast } from 'sonner';
import { parseEther, formatEther } from 'viem';

export const Staking = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: pools, isLoading: loadingPools } = useStakingPools();
  const { data: userStakes, isLoading: loadingStakes } = useUserStakes();
  const { totalStaked, totalRewards } = useTotalStaked();
  const updateRewards = useUpdateRewards();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [selectedStakeId, setSelectedStakeId] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  
  const stakeMutation = useStake();
  const unstakeMutation = useUnstake();
  
  const selectedPool = pools?.find(p => p.id === selectedPoolId);
  const selectedStake = userStakes?.find(s => s.id === selectedStakeId);
  
  // Auto-select first pool on load
  useEffect(() => {
    if (pools && pools.length > 0 && !selectedPoolId) {
      setSelectedPoolId(pools[0].id);
    }
  }, [pools, selectedPoolId]);
  
  // Update rewards periodically
  useEffect(() => {
    if (!userStakes || userStakes.length === 0) return;
    
    const interval = setInterval(() => {
      userStakes.forEach(stake => {
        updateRewards.mutate(stake.id);
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [userStakes]);
  
  const handleStake = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!selectedPoolId) {
      toast.error('Please select a staking pool');
      return;
    }
    
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (selectedPool && amount < selectedPool.min_stake_amount) {
      toast.error(`Minimum stake amount is ${selectedPool.min_stake_amount} ETH`);
      return;
    }
    
    if (balance && amount > parseFloat(formatEther(balance.value))) {
      toast.error('Insufficient balance');
      return;
    }
    
    try {
      await stakeMutation.mutateAsync({
        poolId: selectedPoolId,
        amount,
      });
      
      toast.success('Successfully staked!');
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      toast.error('Failed to stake');
    }
  };
  
  const handleUnstake = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!selectedStakeId || !selectedStake) {
      toast.error('Please select a stake to unstake');
      return;
    }
    
    const amount = parseFloat(unstakeAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > selectedStake.staked_amount) {
      toast.error('Amount exceeds staked balance');
      return;
    }
    
    try {
      const result = await unstakeMutation.mutateAsync({
        stakeId: selectedStakeId,
        amount,
      });
      
      toast.success(`Successfully unstaked ${amount} ETH + ${result.rewards.toFixed(4)} ETH rewards!`);
      setUnstakeAmount('');
      setSelectedStakeId('');
    } catch (error) {
      console.error('Unstaking error:', error);
      toast.error('Failed to unstake');
    }
  };
  
  const setMaxStake = () => {
    if (balance) {
      // Reserve some for gas
      const maxAmount = Math.max(0, parseFloat(formatEther(balance.value)) - 0.01);
      setStakeAmount(maxAmount.toString());
    }
  };
  
  const setMaxUnstake = () => {
    if (selectedStake) {
      setUnstakeAmount(selectedStake.staked_amount.toString());
    }
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="container px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Stake & <span className="bg-gradient-primary bg-clip-text text-transparent">Earn</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stake your tokens to earn rewards and support the ecosystem
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Total Platform Staked</p>
              <p className="text-3xl font-bold">
                {loadingPools ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${pools?.reduce((sum, p) => sum + Number(p.total_staked), 0).toFixed(2) || '0.00'} ETH`
                )}
              </p>
              <p className="text-xs text-success">Across all pools</p>
            </Card>
            <Card className="glass p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Best APY</p>
              <p className="text-3xl font-bold text-success">
                {loadingPools ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${pools?.[0]?.apy_rate || '0'}%`
                )}
              </p>
              <p className="text-xs text-muted-foreground">90-day lock period</p>
            </Card>
            <Card className="glass p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Your Total Staked</p>
              <p className="text-3xl font-bold">
                {loadingStakes ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${totalStaked.toFixed(4)} ETH`
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalRewards > 0 ? `+${totalRewards.toFixed(6)} ETH rewards` : 'Start earning today'}
              </p>
            </Card>
          </div>
          
          {/* Staking Interface */}
          <Card className="glass p-8">
            <Tabs defaultValue="stake" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Stake
                </TabsTrigger>
                <TabsTrigger value="unstake" className="gap-2">
                  <Unlock className="h-4 w-4" />
                  Unstake
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stake" className="space-y-6">
                <div className="space-y-4">
                  {/* Pool Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Staking Pool</label>
                    <div className="grid grid-cols-1 gap-3">
                      {pools?.map((pool) => (
                        <Card
                          key={pool.id}
                          className={`p-4 cursor-pointer transition-all ${
                            selectedPoolId === pool.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedPoolId(pool.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedPoolId === pool.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                              <div>
                                <p className="font-semibold">{pool.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Min: {pool.min_stake_amount} ETH
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-success text-success-foreground">
                                {pool.apy_rate}% APY
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {pool.lock_period_days > 0
                                  ? `${pool.lock_period_days}-day lock`
                                  : 'Flexible'}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Amount to Stake</label>
                      <span className="text-xs text-muted-foreground">
                        Balance: {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.00'} ETH
                      </span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="h-14 text-lg"
                      disabled={!isConnected}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setStakeAmount(balance ? (parseFloat(formatEther(balance.value)) * 0.25).toString() : '0')
                        }
                        disabled={!isConnected}
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setStakeAmount(balance ? (parseFloat(formatEther(balance.value)) * 0.5).toString() : '0')
                        }
                        disabled={!isConnected}
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setStakeAmount(balance ? (parseFloat(formatEther(balance.value)) * 0.75).toString() : '0')
                        }
                        disabled={!isConnected}
                      >
                        75%
                      </Button>
                      <Button size="sm" variant="outline" onClick={setMaxStake} disabled={!isConnected}>
                        MAX
                      </Button>
                    </div>
                  </div>
                  
                  {selectedPool && stakeAmount && parseFloat(stakeAmount) > 0 && (
                    <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Annual Rewards</span>
                        <span className="font-semibold">
                          {(parseFloat(stakeAmount) * (selectedPool.apy_rate / 100)).toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lock Period</span>
                        <span className="font-semibold">
                          {selectedPool.lock_period_days > 0
                            ? `${selectedPool.lock_period_days} days`
                            : 'Flexible'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">APY</span>
                        <span className="font-semibold text-success">{selectedPool.apy_rate}%</span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    className="w-full h-12 bg-gradient-primary hover:opacity-90"
                    onClick={handleStake}
                    disabled={!isConnected || stakeMutation.isPending || !stakeAmount}
                  >
                    {stakeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Staking...
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : (
                      'Stake Tokens'
                    )}
                  </Button>
                  
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Your staked tokens will start earning rewards immediately. 
                      {selectedPool?.lock_period_days === 0
                        ? ' You can unstake at any time with no penalties.'
                        : ` Lock period: ${selectedPool?.lock_period_days} days.`}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="unstake" className="space-y-6">
                <div className="space-y-4">
                  {/* Active Stakes Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Stake to Unstake</label>
                    {loadingStakes ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userStakes && userStakes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {userStakes.map((stake) => (
                          <Card
                            key={stake.id}
                            className={`p-4 cursor-pointer transition-all ${
                              selectedStakeId === stake.id
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setSelectedStakeId(stake.id);
                              setUnstakeAmount(stake.staked_amount.toString());
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {selectedStakeId === stake.id && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                                <div>
                                  <p className="font-semibold">{stake.staked_amount} ETH Staked</p>
                                  <p className="text-xs text-muted-foreground">
                                    Since {new Date(stake.staked_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-success">
                                  +{stake.rewards_earned.toFixed(6)} ETH
                                </p>
                                <p className="text-xs text-muted-foreground">Rewards</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No active stakes</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Stake some tokens to start earning rewards
                        </p>
                      </Card>
                    )}
                  </div>

                  {selectedStake && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Amount to Unstake</label>
                          <span className="text-xs text-muted-foreground">
                            Staked: {selectedStake.staked_amount} ETH
                          </span>
                        </div>
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          className="h-14 text-lg"
                          max={selectedStake.staked_amount}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnstakeAmount((selectedStake.staked_amount * 0.25).toString())}
                          >
                            25%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnstakeAmount((selectedStake.staked_amount * 0.5).toString())}
                          >
                            50%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnstakeAmount((selectedStake.staked_amount * 0.75).toString())}
                          >
                            75%
                          </Button>
                          <Button size="sm" variant="outline" onClick={setMaxUnstake}>
                            MAX
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Pending Rewards</span>
                          <span className="font-semibold">{selectedStake.rewards_earned.toFixed(6)} ETH</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Unstaking Fee</span>
                          <span className="font-semibold">0%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">You Will Receive</span>
                          <span className="font-semibold text-success">
                            {unstakeAmount ? (
                              parseFloat(unstakeAmount) + selectedStake.rewards_earned
                            ).toFixed(6) : '0.000000'} ETH
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full h-12 bg-gradient-primary hover:opacity-90"
                        onClick={handleUnstake}
                        disabled={unstakeMutation.isPending || !unstakeAmount}
                      >
                        {unstakeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Unstaking...
                          </>
                        ) : (
                          'Unstake Tokens'
                        )}
                      </Button>
                      
                      <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Unstaking is instant with no penalties. Your rewards will be automatically 
                          claimed when you unstake.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          
          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass p-6 space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <h3 className="text-lg font-bold">Flexible Staking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Stake and unstake at any time with no lock-up periods or penalties. 
                Your rewards are calculated and distributed in real-time.
              </p>
            </Card>
            
            <Card className="glass p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Secure & Audited</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our staking contracts are audited by leading security firms and built 
                with battle-tested OpenZeppelin contracts.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Staking;
