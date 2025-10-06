import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useProject } from '@/hooks/useProjects';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, Users, Target, TrendingUp, Shield, 
  ExternalLink, Twitter, Globe, FileText,
  Loader2, CheckCircle2, AlertCircle, Lock, Copy, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useICOContract } from '@/hooks/useICOContract';
import { useProjectBlockchainData } from '@/hooks/useProjectBlockchainData';
import { supabase } from '@/integrations/supabase/client';
import { KYCModal } from '@/components/KYCModal';
import { InvestmentModal } from '@/components/InvestmentModal';
import { CountdownTimer } from '@/components/CountdownTimer';

// Schema will be validated dynamically with actual contract values

export const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id!);
  const { isConnected, address } = useAccount();
  const [isInvesting, setIsInvesting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [checkingKYC, setCheckingKYC] = useState(false);
  const [saleStatus, setSaleStatus] = useState({ hasStarted: false, hasEnded: false, canInvest: false });
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  
  const { invest, claimRefund, checkKYCStatus, checkSaleStatus } = useICOContract(project?.contractAddress || '');
  const { saleInfo, isLoading: blockchainLoading } = useProjectBlockchainData(project?.contractAddress || null);
  
  // Check KYC and sale status when wallet connects or contract changes
  useEffect(() => {
    const checkStatuses = async () => {
      if (!isConnected || !address || !project?.contractAddress) {
        setIsKYCApproved(false);
        return;
      }

      setCheckingKYC(true);
      try {
        const [kycStatus, status] = await Promise.all([
          checkKYCStatus(),
          checkSaleStatus()
        ]);
        setIsKYCApproved(kycStatus);
        setSaleStatus(status);
      } catch (error) {
        console.error('Error checking statuses:', error);
      } finally {
        setCheckingKYC(false);
      }
    };

    checkStatuses();
  }, [isConnected, address, project?.contractAddress]);
  
  const handleInvest = async (amount: string): Promise<boolean> => {
    setIsInvesting(true);
    try {
      // STEP 1: Call the blockchain contract's buyTokens()
      const success = await invest(amount);
      
      if (!success) {
        return false;
      }

      // STEP 2: Save investment to database AFTER successful blockchain transaction
      const tokenPrice = parseFloat(project!.price.split(' ')[0]);
      const tokensReceived = parseFloat(amount) / tokenPrice;
      
      const { error } = await supabase
        .from('user_investments')
        .insert({
          wallet_address: address,
          project_id: project!.id,
          project_name: project!.name,
          project_symbol: project!.symbol,
          amount_eth: parseFloat(amount),
          amount_usd: parseFloat(amount) * 2500,
          tokens_received: tokensReceived,
          status: 'active',
        });

      if (error) throw error;

      toast.success(`Successfully invested ${amount} ETH in ${project!.name}!`);
      return true;
    } catch (error: any) {
      console.error('Investment error:', error);
      toast.error(error.message || 'Failed to process investment');
      return false;
    } finally {
      setIsInvesting(false);
    }
  };
  
  const handleClaimTokens = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsClaiming(true);
    try {
      // Tokens are transferred immediately during buyTokens()
      // This should only be visible if soft cap wasn't reached (for refunds)
      toast.info('Tokens are automatically transferred when you invest. No claim needed!');
    } finally {
      setIsClaiming(false);
    }
  };
  
  const handleSocialLink = (platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(`${platform} link will be available soon`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Project Not Found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Use blockchain data if available, otherwise fall back to database values
  const raised = saleInfo?.fundsRaised ?? project.raised;
  const goal = saleInfo?.hardCap ?? project.goal;
  const progress = saleInfo?.progressPercentage ?? ((raised / goal) * 100);
  const participants = saleInfo?.contributorCount ?? project.participants;
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 border-b border-border/50">
        <div className="absolute inset-0 grid-background opacity-20" />
        <div className="container relative px-4">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Project Info */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-primary/30">
                  <img 
                    src={project.logo} 
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{project.name}</h1>
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {project.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground">{project.symbol}</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-3xl">
                {project.description}
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3">
                {(project as any).website && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).website, '_blank')}
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).whitepaper && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).whitepaper, '_blank')}
                  >
                    <FileText className="h-4 w-4" />
                    Whitepaper
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).twitter && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).twitter, '_blank')}
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).telegram && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).telegram, '_blank')}
                  >
                    <span className="text-sm">💬</span>
                    Telegram
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).discord && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).discord, '_blank')}
                  >
                    <span className="text-sm">🎮</span>
                    Discord
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).medium && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).medium, '_blank')}
                  >
                    <span className="text-sm">M</span>
                    Medium
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {(project as any).github && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open((project as any).github, '_blank')}
                  >
                    <span className="text-sm">⚙️</span>
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Investment Card */}
            <Card className="w-full md:w-[400px] glass p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Token Price</span>
                  <span className="text-2xl font-bold text-primary">{project.price}</span>
                </div>
                
                {/* Sale Limits */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hard Cap</p>
                    <p className="text-sm font-semibold">
                      {blockchainLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : `${(saleInfo?.hardCap || goal).toFixed(2)} ETH`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Soft Cap</p>
                    <p className="text-sm font-semibold">
                      {blockchainLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : `${(saleInfo?.softCap || goal * 0.5).toFixed(2)} ETH`}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Per Wallet Limits</p>
                    <p className="text-sm font-semibold">
                      {blockchainLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : (
                        `${(saleInfo?.minContribution || 0.01).toFixed(4)} - ${(saleInfo?.maxContribution || 10).toFixed(2)} ETH`
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {blockchainLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : `${progress.toFixed(1)}%`}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {blockchainLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : `${raised.toFixed(4)} ETH`}
                    </span>
                    <span className="text-muted-foreground">of {goal.toFixed(2)} ETH</span>
                  </div>
                </div>
                
                <div className="space-y-4 py-4 border-y border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Participants</p>
                      <p className="text-xl font-bold">
                        {blockchainLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : participants.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ends In</p>
                      <p className="text-xl font-bold">{project.endsIn}</p>
                    </div>
                  </div>
                  
                  {/* Sale Start/End Times */}
                  <div className="space-y-4 pt-2 border-t border-border/30">
                    {project.startDate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">Sale Starts:</span>
                          <span className="font-semibold text-green-500">
                            {format(new Date(project.startDate), 'MMM dd, yyyy - hh:mm a')}
                          </span>
                        </div>
                        {new Date(project.startDate) > new Date() && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Starts in:</p>
                            <CountdownTimer endDate={project.startDate} />
                          </div>
                        )}
                      </div>
                    )}
                    {project.endDate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">Sale Ends:</span>
                          <span className="font-semibold text-red-500">
                            {format(new Date(project.endDate), 'MMM dd, yyyy - hh:mm a')}
                          </span>
                        </div>
                        {new Date(project.endDate) > new Date() && new Date(project.startDate || 0) <= new Date() && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Ends in:</p>
                            <CountdownTimer endDate={project.endDate} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Investment Form */}
              {project.status === 'live' && (
                <div className="space-y-4">
                  {/* KYC/Sale Status Alerts */}
                  {isConnected && !checkingKYC && (
                    <>
                      {!saleStatus.hasStarted && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                          <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-yellow-600">Sale hasn't started yet</p>
                            <p className="text-sm text-muted-foreground">Check back when the sale begins</p>
                          </div>
                        </div>
                      )}
                      
                      {saleStatus.hasEnded && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-600">Sale has ended</p>
                            <p className="text-sm text-muted-foreground">This ICO is no longer accepting investments</p>
                          </div>
                        </div>
                      )}
                      
                      {!isKYCApproved && saleStatus.canInvest && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
                          <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-orange-600">KYC Required</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              You must complete KYC verification before investing
                            </p>
                            <Button 
                              size="sm" 
                              onClick={() => setShowKYCModal(true)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Complete KYC
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {isKYCApproved && saleStatus.canInvest && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <p className="text-sm text-green-600 font-medium">KYC Approved - Ready to invest</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {!isConnected ? (
                    <Button className="w-full h-14 text-lg" variant="outline" disabled>
                      Connect Wallet to Invest
                    </Button>
                  ) : checkingKYC ? (
                    <Button className="w-full h-14 text-lg" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking Status...
                    </Button>
                  ) : !isKYCApproved ? (
                    <Button 
                      className="w-full h-14 text-lg" 
                      variant="outline"
                      onClick={() => setShowKYCModal(true)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Complete KYC to Invest
                    </Button>
                  ) : !saleStatus.canInvest ? (
                    <Button className="w-full h-14 text-lg" variant="outline" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      {!saleStatus.hasStarted ? 'Sale Not Started' : 'Sale Ended'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90"
                      onClick={() => setShowInvestModal(true)}
                      disabled={isInvesting}
                    >
                      {isInvesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Buy Tokens Now'
                      )}
                    </Button>
                  )}
                </div>
              )}
              
              {project.status === 'upcoming' && (
                <Button className="w-full h-12 text-lg" variant="outline" disabled>
                  Coming Soon
                </Button>
              )}
              
              {project.status === 'success' && (
                <Button 
                  className="w-full h-12 text-lg bg-success hover:bg-success/90"
                  onClick={handleClaimTokens}
                  disabled={isClaiming || !isConnected}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Claiming...
                    </>
                  ) : (
                    'Claim Tokens'
                  )}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </section>
      
      {/* Details Section */}
      <section className="container px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-4">About the Project</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                
                {(project as any).problem_statement && (
                  <div className="mt-6 p-6 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Problem Statement
                    </h3>
                    <p className="text-muted-foreground">{(project as any).problem_statement}</p>
                  </div>
                )}
                
                {(project as any).solution && (
                  <div className="mt-6 p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Our Solution
                    </h3>
                    <p className="text-muted-foreground">{(project as any).solution}</p>
                  </div>
                )}
                
                {(project as any).target_market && (
                  <div className="mt-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Target Market
                    </h3>
                    <p className="text-muted-foreground">{(project as any).target_market}</p>
                  </div>
                )}
                
                {(project as any).use_of_funds && (
                  <div className="mt-6 p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Use of Funds
                    </h3>
                    <p className="text-muted-foreground">{(project as any).use_of_funds}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/20">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Security First</h3>
                    <p className="text-sm text-muted-foreground">
                      Audited by leading security firms
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/20">
                  <Users className="h-8 w-8 text-secondary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Community Driven</h3>
                    <p className="text-sm text-muted-foreground">
                      Governed by token holders
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/20">
                  <TrendingUp className="h-8 w-8 text-success flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Proven Track Record</h3>
                    <p className="text-sm text-muted-foreground">
                      Experienced team with successful launches
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Company Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {(project as any).company_legal_name && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
                    <p className="font-semibold">{(project as any).company_legal_name}</p>
                  </div>
                )}
                {(project as any).registration_number && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                    <p className="font-semibold">{(project as any).registration_number}</p>
                  </div>
                )}
                {(project as any).registration_country && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Country</p>
                    <p className="font-semibold">{(project as any).registration_country}</p>
                  </div>
                )}
                {(project as any).company_address && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-semibold">{(project as any).company_address}</p>
                  </div>
                )}
                {(project as any).business_email && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Business Email</p>
                    <p className="font-semibold">{(project as any).business_email}</p>
                  </div>
                )}
                {(project as any).business_phone && (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Business Phone</p>
                    <p className="font-semibold">{(project as any).business_phone}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          {/* Tokenomics Tab */}
          <TabsContent value="tokenomics" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Token Distribution</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {(project as any).public_sale_allocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-primary" />
                          <span>Public Sale</span>
                        </div>
                        <span className="font-semibold">{(project as any).public_sale_allocation}%</span>
                      </div>
                      <Progress value={(project as any).public_sale_allocation} className="h-2" />
                    </div>
                  )}
                  {(project as any).team_allocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-secondary" />
                          <span>Team & Advisors</span>
                        </div>
                        <span className="font-semibold">{(project as any).team_allocation}%</span>
                      </div>
                      <Progress value={(project as any).team_allocation} className="h-2" />
                    </div>
                  )}
                  {(project as any).ecosystem_allocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-success" />
                          <span>Ecosystem Fund</span>
                        </div>
                        <span className="font-semibold">{(project as any).ecosystem_allocation}%</span>
                      </div>
                      <Progress value={(project as any).ecosystem_allocation} className="h-2" />
                    </div>
                  )}
                  {(project as any).liquidity_allocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-accent" />
                          <span>Liquidity</span>
                        </div>
                        <span className="font-semibold">{(project as any).liquidity_allocation}%</span>
                      </div>
                      <Progress value={(project as any).liquidity_allocation} className="h-2" />
                    </div>
                  )}
                  {(project as any).seed_investors_allocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-blue-500" />
                          <span>Seed Investors</span>
                        </div>
                        <span className="font-semibold">{(project as any).seed_investors_allocation}%</span>
                      </div>
                      <Progress value={(project as any).seed_investors_allocation} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {(project as any).total_supply && (
                    <div className="p-4 rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                      <p className="text-2xl font-bold">{Number((project as any).total_supply).toLocaleString()} {project.symbol}</p>
                    </div>
                  )}
                  {(project as any).token_price && (
                    <div className="p-4 rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-1">Token Price</p>
                      <p className="text-2xl font-bold">{(project as any).token_price} ETH</p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Network</p>
                    <p className="text-2xl font-bold">{project.network}</p>
                  </div>
                </div>
              </div>
              
              {(project as any).allocation_image_url && (
                <div className="mt-8 border-t border-border/50 pt-8">
                  <h3 className="text-lg font-semibold mb-4">Token Allocation Chart</h3>
                  <img 
                    src={(project as any).allocation_image_url} 
                    alt="Token Allocation"
                    className="w-full rounded-lg border border-border/50"
                  />
                </div>
              )}
              
              {(project as any).vesting_schedule && (
                <div className="mt-8 border-t border-border/50 pt-8">
                  <h3 className="text-lg font-semibold mb-4">Vesting Schedule</h3>
                  <p className="text-muted-foreground mb-4">{(project as any).vesting_schedule}</p>
                  {(project as any).vesting_schedule_image_url && (
                    <img 
                      src={(project as any).vesting_schedule_image_url} 
                      alt="Vesting Schedule"
                      className="w-full rounded-lg border border-border/50"
                    />
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Meet the Team</h2>
              
              {(project as any).founder_name && (
                <div className="mb-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-6">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{(project as any).founder_name}</h3>
                        {(project as any).founder_role && (
                          <Badge variant="outline">{(project as any).founder_role}</Badge>
                        )}
                      </div>
                      {(project as any).founder_bio && (
                        <p className="text-muted-foreground mb-4">{(project as any).founder_bio}</p>
                      )}
                      {(project as any).founder_linkedin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => window.open((project as any).founder_linkedin, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          LinkedIn Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                {(project as any).team_size && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2">Team Size</p>
                    <p className="text-2xl font-bold">{(project as any).team_size} Members</p>
                  </div>
                )}
                {(project as any).advisors && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2">Advisors</p>
                    <p className="text-muted-foreground">{(project as any).advisors}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          {/* Legal Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Legal & Compliance</h2>
              <div className="space-y-6">
                {(project as any).jurisdiction_compliance && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Jurisdiction & Compliance
                    </h3>
                    <p className="text-muted-foreground">{(project as any).jurisdiction_compliance}</p>
                  </div>
                )}
                
                {(project as any).kyc_provider && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      KYC Provider
                    </h3>
                    <p className="text-muted-foreground">{(project as any).kyc_provider}</p>
                  </div>
                )}
                
                {(project as any).audit_report && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Security Audit
                    </h3>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open((project as any).audit_report, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Audit Report
                    </Button>
                  </div>
                )}
                
                {(project as any).legal_opinion && (
                  <div className="p-6 rounded-xl bg-muted/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      Legal Opinion
                    </h3>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open((project as any).legal_opinion, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Legal Opinion
                    </Button>
                  </div>
                )}
                
                <div className="p-6 rounded-xl bg-muted/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Copy className="h-5 w-5 text-primary" />
                    Contract Addresses
                  </h3>
                  <div className="space-y-4">
                    {(project as any).token_address && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Token Contract</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-background px-3 py-2 rounded flex-1 overflow-x-auto">
                            {(project as any).token_address}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText((project as any).token_address);
                              toast.success('Address copied!');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {project.contractAddress && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Sale Contract</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-background px-3 py-2 rounded flex-1 overflow-x-auto">
                            {project.contractAddress}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(project.contractAddress);
                              toast.success('Address copied!');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Modals */}
      <KYCModal 
        open={showKYCModal} 
        onOpenChange={setShowKYCModal}
        walletAddress={address || ''}
      />
      
      {project && isConnected && (
        <InvestmentModal
          open={showInvestModal}
          onOpenChange={setShowInvestModal}
          projectName={project.name}
          projectSymbol={project.symbol}
          tokenPrice={project.price}
          minContribution={saleInfo?.minContribution || 0.01}
          maxContribution={saleInfo?.maxContribution || 10}
          onInvest={handleInvest}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
