import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, TrendingUp, Clock, Award, 
  ExternalLink, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { useAccount } from 'wagmi';

export const Dashboard = () => {
  const { isConnected, address } = useAccount();
  
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="glass p-12 text-center space-y-6 max-w-md">
            <Wallet className="h-16 w-16 text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to view your dashboard
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  const investments = [
    { project: 'DeFi Protocol X', symbol: 'DPX', invested: '2.5 ETH', value: '3.2 ETH', change: '+28%', tokens: '50,000 DPX' },
    { project: 'GameFi Universe', symbol: 'GFU', invested: '1.0 ETH', value: '1.8 ETH', change: '+80%', tokens: '33,333 GFU' },
    { project: 'MetaAI Network', symbol: 'MAI', invested: '5.0 ETH', value: '4.2 ETH', change: '-16%', tokens: '62,500 MAI' },
  ];
  
  const transactions = [
    { type: 'invest', project: 'DeFi Protocol X', amount: '2.5 ETH', date: '2025-09-28', status: 'completed' },
    { type: 'claim', project: 'GameFi Universe', amount: '33,333 GFU', date: '2025-09-27', status: 'completed' },
    { type: 'invest', project: 'MetaAI Network', amount: '5.0 ETH', date: '2025-09-25', status: 'completed' },
  ];
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Stats Overview */}
      <section className="container px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Investment Dashboard</h1>
              <p className="text-sm text-muted-foreground font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold">8.5 ETH</p>
              <p className="text-xs text-success flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +24% this month
              </p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <Wallet className="h-4 w-4 text-secondary" />
              </div>
              <p className="text-3xl font-bold">9.2 ETH</p>
              <p className="text-xs text-success flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +8.2% overall
              </p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Across Base network</p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <Award className="h-4 w-4 text-success" />
              </div>
              <p className="text-3xl font-bold text-success">+0.7 ETH</p>
              <p className="text-xs text-success flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +8.2%
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Detailed View */}
      <section className="container px-4 pb-12">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio" className="space-y-4">
            <Card className="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">My Investments</h2>
                
                <div className="space-y-4">
                  {investments.map((inv, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center font-bold">
                          {inv.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold">{inv.project}</h3>
                          <p className="text-sm text-muted-foreground">{inv.tokens}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Invested</p>
                          <p className="font-semibold">{inv.invested}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="font-semibold">{inv.value}</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <Badge className={inv.change.startsWith('+') ? 'bg-success' : 'bg-destructive'}>
                            {inv.change.startsWith('+') ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {inv.change}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card className="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Transaction History</h2>
                
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          tx.type === 'invest' ? 'bg-primary/20' : 'bg-success/20'
                        }`}>
                          {tx.type === 'invest' ? (
                            <ArrowUpRight className="h-5 w-5 text-primary" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {tx.type === 'invest' ? 'Investment' : 'Token Claim'}
                          </h3>
                          <p className="text-sm text-muted-foreground">{tx.project}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-semibold">{tx.amount}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <Badge variant="outline" className="bg-success/20 text-success">
                          {tx.status}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="glass p-8">
              <h2 className="text-xl font-bold mb-4">Portfolio Analytics</h2>
              <p className="text-muted-foreground">
                Advanced analytics coming soon. Track your investment performance, 
                portfolio allocation, and historical trends.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Dashboard;
