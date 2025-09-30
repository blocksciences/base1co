import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, TrendingUp, Info } from 'lucide-react';
import { useState } from 'react';

export const Staking = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  
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
              <p className="text-sm text-muted-foreground">Total Staked</p>
              <p className="text-3xl font-bold">5.2M ETH</p>
              <p className="text-xs text-success">+12% this week</p>
            </Card>
            <Card className="glass p-6 space-y-2">
              <p className="text-sm text-muted-foreground">APY</p>
              <p className="text-3xl font-bold text-success">18.5%</p>
              <p className="text-xs text-muted-foreground">Variable rate</p>
            </Card>
            <Card className="glass p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Your Stake</p>
              <p className="text-3xl font-bold">0.00 ETH</p>
              <p className="text-xs text-muted-foreground">Start earning today</p>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Amount to Stake</label>
                      <span className="text-xs text-muted-foreground">Balance: 0.00 ETH</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="h-14 text-lg"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setStakeAmount('0.25')}>
                        25%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStakeAmount('0.50')}>
                        50%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStakeAmount('0.75')}>
                        75%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStakeAmount('1.00')}>
                        MAX
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Annual Rewards</span>
                      <span className="font-semibold">
                        {stakeAmount ? (parseFloat(stakeAmount) * 0.185).toFixed(4) : '0.0000'} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lock Period</span>
                      <span className="font-semibold">Flexible</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-semibold text-success">18.5%</span>
                    </div>
                  </div>
                  
                  <Button className="w-full h-12 bg-gradient-primary hover:opacity-90">
                    Stake Tokens
                  </Button>
                  
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Your staked tokens will start earning rewards immediately. 
                      You can unstake at any time with no penalties.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="unstake" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Amount to Unstake</label>
                      <span className="text-xs text-muted-foreground">Staked: 0.00 ETH</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="h-14 text-lg"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setUnstakeAmount('0.25')}>
                        25%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUnstakeAmount('0.50')}>
                        50%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUnstakeAmount('0.75')}>
                        75%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUnstakeAmount('1.00')}>
                        MAX
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending Rewards</span>
                      <span className="font-semibold">0.0000 ETH</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unstaking Fee</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">You Will Receive</span>
                      <span className="font-semibold text-success">
                        {unstakeAmount || '0.0000'} ETH
                      </span>
                    </div>
                  </div>
                  
                  <Button className="w-full h-12 bg-gradient-primary hover:opacity-90">
                    Unstake Tokens
                  </Button>
                  
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Unstaking is instant with no penalties. Your rewards will be automatically 
                      claimed when you unstake.
                    </p>
                  </div>
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
