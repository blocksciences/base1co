import { Header } from '@/components/Header';
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
  Loader2, CheckCircle2, AlertCircle, Lock, Copy
} from 'lucide-react';
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
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleSocialLink('Website', project.socialLinks?.website)}
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleSocialLink('Twitter', project.socialLinks?.twitter)}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleSocialLink('Whitepaper', project.socialLinks?.whitepaper)}
                >
                  <FileText className="h-4 w-4" />
                  Whitepaper
                  <ExternalLink className="h-3 w-3" />
                </Button>
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
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
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
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-4">About the Project</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {project.description} This innovative platform leverages cutting-edge blockchain technology 
                  to deliver unprecedented value to users. Built on Base, the project ensures fast transactions, 
                  low fees, and maximum security.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  The team has extensive experience in blockchain development and has successfully delivered 
                  multiple projects in the past. With a strong focus on community and transparency, this 
                  project aims to revolutionize its industry.
                </p>
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
          
          <TabsContent value="tokenomics" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Token Distribution</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    { label: 'Public Sale', value: 40, color: 'bg-primary' },
                    { label: 'Team & Advisors', value: 20, color: 'bg-secondary' },
                    { label: 'Ecosystem Fund', value: 25, color: 'bg-success' },
                    { label: 'Liquidity', value: 15, color: 'bg-accent' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded ${item.color}`} />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                    <p className="text-2xl font-bold">1,000,000,000 {project.symbol}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Initial Market Cap</p>
                    <p className="text-2xl font-bold">$50,000,000</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-1">Network</p>
                    <p className="text-2xl font-bold">{project.network}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="roadmap" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Development Roadmap</h2>
              
              <div className="space-y-6">
                {[
                  { quarter: 'Q4 2024', title: 'Platform Launch', status: 'completed', items: ['Smart contract deployment', 'Security audit completion', 'Website launch'] },
                  { quarter: 'Q1 2025', title: 'Token Sale', status: 'current', items: ['Public sale begins', 'Marketing campaign', 'Community building'] },
                  { quarter: 'Q2 2025', title: 'Product Development', status: 'upcoming', items: ['Beta version release', 'Partnership announcements', 'Exchange listings'] },
                  { quarter: 'Q3 2025', title: 'Ecosystem Expansion', status: 'upcoming', items: ['Mobile app launch', 'Additional features', 'Global expansion'] },
                ].map((phase, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        phase.status === 'completed' ? 'bg-success' :
                        phase.status === 'current' ? 'bg-primary' :
                        'bg-muted'
                      }`}>
                        {phase.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                        {phase.status === 'current' && <Clock className="h-5 w-5 animate-pulse" />}
                        {phase.status === 'upcoming' && <Target className="h-5 w-5" />}
                      </div>
                      {index < 3 && <div className="w-0.5 h-full bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{phase.quarter}</Badge>
                        <h3 className="font-bold text-lg">{phase.title}</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6">
            <Card className="glass p-8">
              <h2 className="text-2xl font-bold mb-6">Our Team</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Alex Chen', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
                  { name: 'Sarah Johnson', role: 'CTO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
                  { name: 'Michael Park', role: 'Lead Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
                  { name: 'Emma Rodriguez', role: 'Head of Marketing', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
                  { name: 'David Kim', role: 'Blockchain Architect', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
                  { name: 'Lisa Anderson', role: 'Community Manager', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' },
                ].map((member) => (
                  <div key={member.name} className="text-center space-y-3">
                    <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default ProjectDetail;
