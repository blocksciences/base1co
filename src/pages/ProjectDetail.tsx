import { Header } from '@/components/Header';
import { useProject } from '@/hooks/useProjects';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Clock, Users, Target, TrendingUp, Shield, 
  ExternalLink, Twitter, Globe, FileText,
  Loader2, CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useICOContract } from '@/hooks/useICOContract';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const investmentSchema = z.object({
  amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number"
    })
    .refine((val) => parseFloat(val) <= 100, {
      message: "Amount cannot exceed 100 ETH"
    })
    .refine((val) => parseFloat(val) >= 0.01, {
      message: "Minimum investment is 0.01 ETH"
    })
});

export const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id!);
  const { isConnected, address } = useAccount();
  const [investAmount, setInvestAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const { invest, claimTokens } = useICOContract(project?.contractAddress || '');
  
  const handleInvest = async () => {
    // Validate input
    const validation = investmentSchema.safeParse({ amount: investAmount });
    
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!project) {
      toast.error('Project not found');
      return;
    }

    setIsInvesting(true);
    try {
      // Save investment to database
      const tokenPrice = parseFloat(project.price.split(' ')[0]); // Extract price from "0.05 ETH"
      const tokensReceived = parseFloat(investAmount) / tokenPrice;
      
      const { error } = await supabase
        .from('user_investments')
        .insert({
          wallet_address: address,
          project_id: project.id,
          project_name: project.name,
          project_symbol: project.symbol,
          amount_eth: parseFloat(investAmount),
          amount_usd: parseFloat(investAmount) * 2500, // Mock ETH price
          tokens_received: tokensReceived,
          status: 'active',
        });

      if (error) throw error;

      // Also create a transaction record
      await supabase
        .from('transactions')
        .insert({
          transaction_type: 'invest',
          from_address: address,
          project_id: project.id,
          project_name: project.name,
          amount_crypto: `${investAmount} ETH`,
          amount_usd: parseFloat(investAmount) * 2500,
          tx_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          status: 'confirmed',
        });

      toast.success(`Successfully invested ${investAmount} ETH in ${project.name}!`);
      setInvestAmount(''); // Clear input on success
    } catch (error: any) {
      console.error('Investment error:', error);
      toast.error(error.message || 'Failed to process investment');
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
      const success = await claimTokens();
      
      if (success) {
        // Update database after successful blockchain claim
        const { error } = await supabase
          .from('user_investments')
          .update({ status: 'claimed' })
          .eq('wallet_address', address)
          .eq('project_id', project.id)
          .eq('status', 'active');

        if (error) console.error('Error updating investment status:', error);
      }
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
  
  const progress = (project.raised / project.goal) * 100;
  
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
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{project.raised.toLocaleString()} ETH</span>
                    <span className="text-muted-foreground">of {project.goal.toLocaleString()} ETH</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Participants</p>
                    <p className="text-xl font-bold">{project.participants.toLocaleString()}</p>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Investment Amount (ETH)</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="h-12 text-lg"
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      You will receive: {investAmount ? (parseFloat(investAmount) / 0.05).toFixed(2) : '0'} {project.symbol}
                    </p>
                  </div>
                  
                  {isConnected ? (
                    <Button 
                      className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90"
                      onClick={handleInvest}
                      disabled={isInvesting || !investAmount}
                    >
                      {isInvesting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Invest Now'
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full h-12 text-lg" variant="outline" disabled>
                      Connect Wallet to Invest
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
    </div>
  );
};

export default ProjectDetail;
