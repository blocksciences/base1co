import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Link } from 'react-router-dom';
import { 
  Rocket, Shield, Zap, TrendingUp, ArrowRight, Loader2, 
  CheckCircle2, Users, Lock, BarChart3, Gift, Coins,
  FileCheck, Droplets, Clock, Target, Sparkles, ChevronRight
} from 'lucide-react';

const Index = () => {
  const { data: projects, isLoading } = useProjects();
  const liveProjects = projects?.filter(p => p.status === 'live').slice(0, 3);
  const upcomingProjects = projects?.filter(p => p.status === 'upcoming').slice(0, 3);
  const completedProjects = projects?.filter(p => p.status === 'success').slice(0, 3);
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container relative px-4">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <Badge className="mx-auto bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Base Network
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
                The Future of{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Fundraising
                </span>
              </h1>
              <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Launch, invest, and grow with the most advanced ICO launchpad. 
                Institutional-grade security meets Web3 innovation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/projects">
                <Button size="lg" className="h-16 px-10 text-lg bg-gradient-primary hover:opacity-90 gap-2 shadow-glow-cyan">
                  Explore Projects
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/launch">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg border-primary/30 hover:bg-primary/10">
                  Launch Your ICO
                  <Rocket className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">$50M+</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-secondary">25K+</p>
                <p className="text-sm text-muted-foreground">Active Investors</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-success">150+</p>
                <p className="text-sm text-muted-foreground">Projects Launched</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Security Audited</p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8 opacity-60">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Audited Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="text-sm">KYC Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Regulatory Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects */}
      <section className="container px-4 py-20">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Live Token Sales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invest in carefully vetted projects with institutional-grade security
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : liveProjects && liveProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No live projects at the moment</p>
            </div>
          )}
          
          <div className="text-center">
            <Link to="/projects">
              <Button size="lg" variant="outline" className="gap-2">
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Upcoming Projects */}
      {!isLoading && upcomingProjects && upcomingProjects.length > 0 && (
        <section className="container px-4 py-20 border-t border-border/50">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Upcoming Launches
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get ready for the next wave of innovative projects
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Completed Projects */}
      {!isLoading && completedProjects && completedProjects.length > 0 && (
        <section className="container px-4 py-20 border-t border-border/50">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Successfully Funded
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Projects that reached their goals and are now live
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <Badge className="bg-secondary/10 border-secondary/20 text-secondary">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Launch in 3 Easy Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to funding in minutes, not months
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass p-8 space-y-4 relative overflow-hidden group hover:shadow-glow-cyan transition-all">
              <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">01</div>
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Submit Your Project</h3>
              <p className="text-muted-foreground">
                Complete KYC verification and submit your project details. Our team reviews within 24 hours.
              </p>
            </Card>

            <Card className="glass p-8 space-y-4 relative overflow-hidden group hover:shadow-glow-purple transition-all">
              <div className="absolute top-4 right-4 text-6xl font-bold text-secondary/10">02</div>
              <div className="h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold">Deploy Smart Contracts</h3>
              <p className="text-muted-foreground">
                Automatically deploy audited smart contracts with built-in vesting, KYC, and security features.
              </p>
            </Card>

            <Card className="glass p-8 space-y-4 relative overflow-hidden group hover:shadow-glow-cyan transition-all">
              <div className="absolute top-4 right-4 text-6xl font-bold text-success/10">03</div>
              <div className="h-16 w-16 rounded-2xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold">Raise Capital</h3>
              <p className="text-muted-foreground">
                Go live and access our community of 25K+ verified investors ready to fund innovation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <Badge className="bg-primary/10 border-primary/20 text-primary">
              Complete Ecosystem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools for both project creators and investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass p-6 space-y-3 hover:shadow-glow-cyan transition-all group">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">KYC & Compliance</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered KYC verification with geo-blocking and sanctions screening
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-purple transition-all group">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">Token Staking</h3>
              <p className="text-sm text-muted-foreground">
                Stake platform tokens to earn rewards and access exclusive tiers
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-cyan transition-all group">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold">Token Vesting</h3>
              <p className="text-sm text-muted-foreground">
                Customizable vesting schedules with cliff periods for team tokens
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-purple transition-all group">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Liquidity Locks</h3>
              <p className="text-sm text-muted-foreground">
                Lock liquidity tokens to build trust and protect investors
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-cyan transition-all group">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">Referral System</h3>
              <p className="text-sm text-muted-foreground">
                Earn rewards by referring investors and builders to the platform
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-purple transition-all group">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Real-time insights into performance, investor behavior, and ROI
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-cyan transition-all group">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Priority Queue</h3>
              <p className="text-sm text-muted-foreground">
                Fair access system with tiered priority for stakers
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-purple transition-all group">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">Smart Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Battle-tested, audited contracts deployed automatically
              </p>
            </Card>

            <Card className="glass p-6 space-y-3 hover:shadow-glow-cyan transition-all group">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold">Base Network</h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast transactions with minimal gas fees
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-12 md:p-16 text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="h-6 w-6 text-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Trusted by the Best
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of successful projects and investors who have raised millions on our platform
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                <div className="space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="space-y-2">
                  <Shield className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-2xl font-bold">Zero</p>
                  <p className="text-sm text-muted-foreground">Security Breaches</p>
                </div>
                <div className="space-y-2">
                  <Users className="h-8 w-8 text-secondary mx-auto" />
                  <p className="text-2xl font-bold">25K+</p>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                </div>
                <div className="space-y-2">
                  <TrendingUp className="h-8 w-8 text-success mx-auto" />
                  <p className="text-2xl font-bold">$50M+</p>
                  <p className="text-sm text-muted-foreground">Raised</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="container px-4 py-24">
        <Card className="glass relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-cyber opacity-20" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/30 rounded-full blur-[100px]" />
          <div className="relative p-12 md:p-20 text-center space-y-8">
            <div className="flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-cyan">
                <Rocket className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Ready to{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Launch?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the future of fundraising. Connect with verified investors and raise capital 
                with institutional-grade security.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/launch">
                <Button size="lg" className="h-16 px-10 text-lg bg-gradient-primary hover:opacity-90 shadow-glow-cyan gap-2">
                  Launch Your ICO
                  <Rocket className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg border-primary/30 hover:bg-primary/10 gap-2">
                  Explore Projects
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Deploy in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  LaunchBase
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The premier ICO launchpad for next-generation blockchain projects on Base Network.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/projects" className="block hover:text-primary transition-colors">
                  Explore Projects
                </Link>
                <Link to="/launch" className="block hover:text-primary transition-colors">
                  Launch ICO
                </Link>
                <Link to="/staking" className="block hover:text-primary transition-colors">
                  Staking
                </Link>
                <Link to="/referrals" className="block hover:text-primary transition-colors">
                  Referrals
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/analytics" className="block hover:text-primary transition-colors">
                  Analytics
                </Link>
                <Link to="/dashboard" className="block hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <a href="#" className="block hover:text-primary transition-colors">
                  Documentation
                </a>
                <a href="#" className="block hover:text-primary transition-colors">
                  Support
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold">Connect</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-primary transition-colors">
                  Twitter
                </a>
                <a href="#" className="block hover:text-primary transition-colors">
                  Discord
                </a>
                <a href="#" className="block hover:text-primary transition-colors">
                  Telegram
                </a>
                <a href="#" className="block hover:text-primary transition-colors">
                  Medium
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 LaunchBase. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
