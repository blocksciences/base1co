import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { usePlatformStaking } from "@/hooks/usePlatformStaking";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Lock, TrendingUp, Gift, Trophy, Clock, CheckCircle2, Coins, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Staking = () => {
  const { address } = useAccount();
  const {
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
  } = usePlatformStaking();

  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<string>("");
  const [rewards, setRewards] = useState<Record<string, number>>({});

  const handleStake = async () => {
    if (!stakeAmount || !selectedLockPeriod) {
      toast.error("Please enter amount and select lock period");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error("Minimum stake is 100 LIST tokens");
      return;
    }

    const success = await stake(amount, selectedLockPeriod);
    if (success) {
      setStakeAmount("");
      setSelectedLockPeriod("");
    }
  };

  const handleUnstake = async (stakeId: string) => {
    await unstake(stakeId);
  };

  const handleClaimRewards = async (stakeId: string) => {
    await claimRewards(stakeId);
  };

  const handleCompound = async (stakeId: string) => {
    await compoundRewards(stakeId);
  };

  // Load rewards for active stakes
  useEffect(() => {
    const loadRewards = async () => {
      const rewardsMap: Record<string, number> = {};
      for (const stake of userStakes.filter(s => s.status === 'active')) {
        const reward = await calculateRewards(stake.id);
        rewardsMap[stake.id] = reward;
      }
      setRewards(rewardsMap);
    };

    if (userStakes.length > 0) {
      loadRewards();
      // Refresh rewards every minute
      const interval = setInterval(loadRewards, 60000);
      return () => clearInterval(interval);
    }
  }, [userStakes]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            LIST Token <span className="bg-gradient-primary bg-clip-text text-transparent">Staking</span>
          </h1>
          <p className="text-muted-foreground">Stake LIST tokens to earn rewards and unlock platform benefits</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading staking data...</p>
          </div>
        ) : (
          <Tabs defaultValue="stake" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="my-stakes">My Stakes</TabsTrigger>
              <TabsTrigger value="tiers">Tiers & Benefits</TabsTrigger>
            </TabsList>

            {/* Overview Cards */}
            {address && userTier && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Your Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" style={{ color: userTier.current_tier.tier_color }} />
                      <span className="text-2xl font-bold">{userTier.current_tier.tier_name}</span>
                    </div>
                    {userTier.next_tier && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Next: {userTier.next_tier.tier_name}</span>
                          <span>{userTier.progress_to_next.toFixed(0)}%</span>
                        </div>
                        <Progress value={userTier.progress_to_next} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userTier.total_staked.toLocaleString()} LIST</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userStakes.filter(s => s.status === 'active').length} active stakes
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Platform Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{userTier.current_tier.platform_fee_discount}%</span> fee discount
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{userTier.current_tier.allocation_multiplier}x</span> allocation
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{userTier.current_tier.governance_votes}</span> governance votes
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Stake LIST Tokens</CardTitle>
                  <CardDescription>Choose a lock period and stake amount to start earning rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="amount">Amount to Stake (Minimum: 100 LIST)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label className="mb-4 block">Select Lock Period</Label>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {lockPeriods.map((period) => (
                          <Card
                            key={period.id}
                            className={`cursor-pointer transition-all hover:border-primary ${
                              selectedLockPeriod === period.id ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedLockPeriod(period.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{period.name}</h3>
                                <Badge variant="secondary" className="bg-success text-success-foreground">{period.apy_rate}% APY</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{period.description}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <Lock className="h-4 w-4" />
                                <span>{period.duration_days === 0 ? 'No lock' : `${period.duration_days} days`}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{period.multiplier}x multiplier</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleStake}
                      disabled={!address || !stakeAmount || !selectedLockPeriod || staking}
                      className="w-full h-12 bg-gradient-primary hover:opacity-90"
                      size="lg"
                    >
                      {staking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Staking...
                        </>
                      ) : address ? (
                        'Stake Tokens'
                      ) : (
                        'Connect Wallet'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* APY Calculator */}
              {stakeAmount && selectedLockPeriod && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Estimated Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const amount = parseFloat(stakeAmount) || 0;
                      const period = lockPeriods.find(p => p.id === selectedLockPeriod);
                      if (!period || amount < 100) return null;

                      const yearlyReward = amount * (period.apy_rate / 100) * period.multiplier;
                      const dailyReward = yearlyReward / 365;

                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Rewards:</span>
                            <span className="font-semibold">{dailyReward.toFixed(2)} LIST</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Yearly Rewards:</span>
                            <span className="font-semibold">{yearlyReward.toFixed(2)} LIST</span>
                          </div>
                          <div className="flex justify-between text-lg">
                            <span className="font-medium">Total After Period:</span>
                            <span className="font-bold text-success">
                              {(amount + (yearlyReward * (period.duration_days / 365))).toFixed(2)} LIST
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Stakes Tab */}
            <TabsContent value="my-stakes">
              {!address ? (
                <Card className="glass">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Connect your wallet to view your stakes</p>
                  </CardContent>
                </Card>
              ) : userStakes.length === 0 ? (
                <Card className="glass">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">You don't have any stakes yet</p>
                    <Button className="mt-4" onClick={() => document.querySelector<HTMLElement>('[value="stake"]')?.click()}>
                      Start Staking
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userStakes.map((stake) => (
                    <Card key={stake.id} className="glass">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Coins className="h-5 w-5 text-primary" />
                              <span className="text-2xl font-bold">{stake.amount.toLocaleString()} LIST</span>
                              <Badge variant={stake.status === 'active' ? 'default' : 'secondary'}>
                                {stake.status}
                              </Badge>
                            </div>
                            {stake.lock_period && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Lock className="h-4 w-4" />
                                  <span>{stake.lock_period.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{stake.lock_period.apy_rate}% APY</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {new Date(stake.unlock_time) > new Date()
                                      ? `Unlocks ${formatDistanceToNow(new Date(stake.unlock_time), { addSuffix: true })}`
                                      : 'Unlocked'}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Gift className="h-4 w-4 text-success" />
                              <span>Pending Rewards: <strong>{(rewards[stake.id] || 0).toFixed(4)} LIST</strong></span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Claimed: {stake.total_rewards_claimed.toFixed(4)} LIST
                            </div>
                          </div>

                          {stake.status === 'active' && (
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClaimRewards(stake.id)}
                                disabled={!rewards[stake.id] || rewards[stake.id] === 0}
                              >
                                Claim Rewards
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompound(stake.id)}
                                disabled={!rewards[stake.id] || rewards[stake.id] === 0}
                              >
                                Compound
                              </Button>
                              {new Date(stake.unlock_time) <= new Date() && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUnstake(stake.id)}
                                >
                                  Unstake
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tiers Tab */}
            <TabsContent value="tiers">
              <div className="grid gap-4">
                {tiers.map((tier, index) => (
                  <Card key={tier.id} className={`glass ${index === 0 ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-6 w-6" style={{ color: tier.tier_color }} />
                            <div>
                              <h3 className="text-xl font-bold">{tier.tier_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Minimum Stake: {tier.min_stake.toLocaleString()} LIST
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span>{tier.platform_fee_discount}% Platform Fee Discount</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span>{tier.allocation_multiplier}x Allocation Multiplier</span>
                            </div>
                            {tier.early_access_hours > 0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>{tier.early_access_hours}h Early Access</span>
                              </div>
                            )}
                            {tier.guaranteed_allocation && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>Guaranteed Allocation</span>
                              </div>
                            )}
                            {tier.governance_votes > 0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>{tier.governance_votes} Governance Votes</span>
                              </div>
                            )}
                            {tier.exclusive_whitelist && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>Exclusive Project Whitelist</span>
                              </div>
                            )}
                            {tier.priority_queue && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>Priority Queue Access</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {userTier && userTier.current_tier.id === tier.id && (
                          <Badge className="ml-4 bg-gradient-primary">Your Tier</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Staking;
