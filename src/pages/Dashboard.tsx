import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, TrendingUp, Clock, Award, Shield,
  ExternalLink, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle 
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserInvestments, useUserTransactions, useUserKYC } from '@/hooks/useUserData';
import { KYCModal } from '@/components/KYCModal';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { isConnected, address } = useAccount();
  const { investments, loading: investmentsLoading } = useUserInvestments();
  const { transactions, loading: transactionsLoading } = useUserTransactions();
  const { kycStatus, refetch: refetchKYC } = useUserKYC();
  const [kycModalOpen, setKycModalOpen] = useState(false);
  
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
  
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount_eth), 0);
  const totalValue = investments.reduce((sum, inv) => sum + (Number(inv.amount_eth) * 1.1), 0); // Mock 10% gain
  const profitLoss = totalValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? ((profitLoss / totalInvested) * 100).toFixed(1) : '0';
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* KYC Alert */}
      {kycStatus !== 'approved' && kycStatus !== 'pending' && (
        <section className="container px-4 pt-6">
          <Alert className="glass border-primary/50">
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Complete KYC Verification</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock higher investment limits and access exclusive features
                </p>
              </div>
              <Button onClick={() => setKycModalOpen(true)} className="bg-gradient-primary">
                Start KYC
              </Button>
            </AlertDescription>
          </Alert>
        </section>
      )}

      {kycStatus === 'pending' && (
        <section className="container px-4 pt-6">
          <Alert className="glass border-secondary/50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>KYC Under Review</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Your verification is being processed. This typically takes 24-48 hours.
              </p>
            </AlertDescription>
          </Alert>
        </section>
      )}
      
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
            <Button variant="outline" className="gap-2" asChild>
              <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </a>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totalInvested.toFixed(2)} ETH</p>
              <p className="text-xs text-muted-foreground">
                Across {investments.length} {investments.length === 1 ? 'project' : 'projects'}
              </p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <Wallet className="h-4 w-4 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{totalValue.toFixed(2)} ETH</p>
              <p className={`text-xs flex items-center gap-1 ${profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {profitLoss >= 0 ? '+' : ''}{profitLossPercent}% overall
              </p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <p className="text-3xl font-bold">{investments.length}</p>
              <p className="text-xs text-muted-foreground">On Base network</p>
            </Card>
            
            <Card className="glass p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <Award className="h-4 w-4 text-success" />
              </div>
              <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ETH
              </p>
              <p className={`text-xs flex items-center gap-1 ${profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {profitLoss >= 0 ? '+' : ''}{profitLossPercent}%
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
            <TabsTrigger value="kyc">KYC Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio" className="space-y-4">
            <Card className="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">My Investments</h2>
                
                {investmentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : investments.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No investments yet</p>
                    <Button asChild className="bg-gradient-primary">
                      <Link to="/projects">Explore Projects</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.map((inv) => {
                      const currentValue = Number(inv.amount_eth) * 1.1; // Mock 10% gain
                      const change = ((currentValue - Number(inv.amount_eth)) / Number(inv.amount_eth) * 100).toFixed(1);
                      
                      return (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center font-bold">
                              {inv.project_symbol.slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold">{inv.project_name}</h3>
                              <p className="text-sm text-muted-foreground">{Number(inv.tokens_received).toLocaleString()} {inv.project_symbol}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Invested</p>
                              <p className="font-semibold">{Number(inv.amount_eth).toFixed(4)} ETH</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Current Value</p>
                              <p className="font-semibold">{currentValue.toFixed(4)} ETH</p>
                            </div>
                            <div className="text-right min-w-[80px]">
                              <Badge className={Number(change) >= 0 ? 'bg-success' : 'bg-destructive'}>
                                {Number(change) >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {Number(change) >= 0 ? '+' : ''}{change}%
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/project/${inv.project_id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card className="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Transaction History</h2>
                
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            tx.transaction_type === 'invest' ? 'bg-primary/20' : 'bg-success/20'
                          }`}>
                            {tx.transaction_type === 'invest' ? (
                              <ArrowUpRight className="h-5 w-5 text-primary" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-success" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{tx.transaction_type}</h3>
                            <p className="text-sm text-muted-foreground">{tx.project_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="font-semibold">{tx.amount_crypto}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-success/20 text-success">
                            {tx.status}
                          </Badge>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`https://basescan.org/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="kyc" className="space-y-4">
            <Card className="glass p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">KYC Verification Status</h2>
                  <p className="text-muted-foreground">Identity verification for enhanced features</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Current Status</span>
                    <Badge className={
                      kycStatus === 'approved' ? 'bg-success' :
                      kycStatus === 'pending' ? 'bg-secondary' :
                      kycStatus === 'rejected' ? 'bg-destructive' :
                      'bg-muted'
                    }>
                      {kycStatus === 'not_submitted' ? 'Not Started' : kycStatus.toUpperCase()}
                    </Badge>
                  </div>

                  {kycStatus === 'not_submitted' && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Complete KYC verification to unlock:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ArrowUpRight className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span>Increased investment limits up to 100 ETH</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowUpRight className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span>Access to exclusive pre-sale opportunities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowUpRight className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span>Priority customer support</span>
                        </li>
                      </ul>
                      <Button 
                        onClick={() => setKycModalOpen(true)} 
                        className="w-full bg-gradient-primary mt-4"
                      >
                        Start KYC Verification
                      </Button>
                    </div>
                  )}

                  {kycStatus === 'pending' && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Your KYC application is currently under review. Our team will process your submission within 24-48 hours.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Estimated processing time: 24-48 hours</span>
                      </div>
                    </div>
                  )}

                  {kycStatus === 'approved' && (
                    <div className="space-y-4">
                      <p className="text-success">
                        ✓ Your identity has been successfully verified!
                      </p>
                      <p className="text-muted-foreground">
                        You now have access to all platform features and increased investment limits.
                      </p>
                    </div>
                  )}

                  {kycStatus === 'rejected' && (
                    <div className="space-y-4">
                      <p className="text-destructive">
                        Your KYC application was not approved.
                      </p>
                      <p className="text-muted-foreground">
                        Please contact support for more information or submit a new application with corrected information.
                      </p>
                      <Button 
                        onClick={() => setKycModalOpen(true)} 
                        variant="outline"
                        className="w-full"
                      >
                        Submit New Application
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <KYCModal 
        open={kycModalOpen} 
        onOpenChange={(open) => {
          setKycModalOpen(open);
          if (!open) refetchKYC();
        }} 
        walletAddress={address || ''} 
      />
    </div>
  );
};

export default Dashboard;