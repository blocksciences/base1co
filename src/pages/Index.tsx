import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { 
  Rocket, Shield, Zap, TrendingUp, ArrowRight, Loader2, 
  CheckCircle2, Users, Lock, BarChart3, Gift, Coins,
  FileCheck, Droplets, Clock, Target, Sparkles, Award,
  Globe, Layers, Star
} from 'lucide-react';

const Index = () => {
  const { data: projects, isLoading } = useProjects();
  const liveProjects = projects?.filter(p => p.status === 'live').slice(0, 3);
  const upcomingProjects = projects?.filter(p => p.status === 'upcoming').slice(0, 3);
  const completedProjects = projects?.filter(p => p.status === 'success').slice(0, 3);
  
  return (
    <div className="min-h-screen">
      <SEO 
        title="LaunchBase - Premier ICO Launchpad on Base Network"
        description="Launch and invest in next-generation blockchain projects on Base. Secure, transparent ICO launchpad with institutional-grade security. $50M+ raised, 25K+ investors."
        keywords="ICO launchpad, Base network, token sale, crypto fundraising, blockchain investment, DeFi, Web3"
      />
      <Header />
      
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 grid-background opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="container relative px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8 mb-16">
              {/* Top badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium">Founded 2024 • Trusted by 25,000+ Investors</span>
              </div>
              
              {/* Main headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight">
                Base's Premier
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Token Launchpad
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The most trusted platform for launching and investing in Web3 projects.
                <br className="hidden md:block" />
                Backed by institutional-grade security and battle-tested smart contracts.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/projects">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-glow-cyan">
                    Explore Token Sales
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/launch">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    Launch Your Project
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { value: "$50M+", label: "Total Raised", icon: TrendingUp, color: "text-primary" },
                { value: "25K+", label: "Active Investors", icon: Users, color: "text-secondary" },
                { value: "150+", label: "Projects Funded", icon: Rocket, color: "text-success" },
                { value: "100%", label: "Audited Contracts", icon: Shield, color: "text-primary" }
              ].map((stat, i) => (
                <Card key={i} className="glass p-6 text-center space-y-3 border-border/50 hover:border-primary/30 transition-all group">
                  <stat.icon className={`h-8 w-8 mx-auto ${stat.color} opacity-80 group-hover:scale-110 transition-transform`} />
                  <p className={`text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/50 bg-muted/30 backdrop-blur-sm">
        <div className="container px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Smart Contracts Audited</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>KYC & AML Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Regulatory Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span>Base Network Official Partner</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Token Sales */}
      <section className="container px-4 py-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">LIVE NOW</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Active Token Sales</h2>
              <p className="text-muted-foreground">Invest in carefully vetted, high-potential projects</p>
            </div>
            <Link to="/projects" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : liveProjects && liveProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="text-center md:hidden">
                <Link to="/projects">
                  <Button variant="outline" className="gap-2">
                    View All Projects
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Card className="glass p-12 text-center">
              <Rocket className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">No active token sales at the moment</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new opportunities</p>
            </Card>
          )}
        </div>
      </section>
      
      {/* Upcoming Projects */}
      {!isLoading && upcomingProjects && upcomingProjects.length > 0 && (
        <section className="container px-4 py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <Badge className="bg-secondary/10 text-secondary border-secondary/20">Coming Soon</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">Upcoming Launches</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Be the first to invest in the next generation of blockchain innovation
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

      {/* Successfully Funded */}
      {!isLoading && completedProjects && completedProjects.length > 0 && (
        <section className="container px-4 py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <Badge className="bg-success/10 text-success border-success/20">Success Stories</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">Successfully Funded</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of investors who backed winning projects
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

      {/* Why Choose LaunchBase */}
      <section className="container px-4 py-24 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Choose LaunchBase?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive launchpad ecosystem on Base Network
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Institutional Security",
                description: "Bank-grade KYC/AML with AI verification and multi-layer protection",
                color: "primary"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Deploy contracts and launch in minutes on Base's high-speed network",
                color: "secondary"
              },
              {
                icon: Users,
                title: "25K+ Investors",
                description: "Access a vetted community ready to fund your vision",
                color: "success"
              },
              {
                icon: Lock,
                title: "Liquidity Locks",
                description: "Build trust with automated liquidity locking mechanisms",
                color: "primary"
              },
              {
                icon: Clock,
                title: "Token Vesting",
                description: "Customizable vesting schedules with cliff periods",
                color: "secondary"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Track performance with advanced investor insights",
                color: "success"
              },
              {
                icon: Gift,
                title: "Referral Rewards",
                description: "Earn by bringing quality projects and investors",
                color: "primary"
              },
              {
                icon: Coins,
                title: "Staking Tiers",
                description: "Stake $LIST tokens for exclusive access and benefits",
                color: "secondary"
              },
              {
                icon: Globe,
                title: "Global Compliance",
                description: "Regulatory compliant across 150+ jurisdictions",
                color: "success"
              }
            ].map((feature, i) => (
              <Card key={i} className="glass p-6 space-y-4 hover:shadow-glow-cyan transition-all group border-border/50">
                <div className={`h-14 w-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="border-primary/20">For Project Creators</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Launch Your Project in{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to funded in days, not months
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileCheck,
                title: "Submit & Verify",
                description: "Complete your project application and KYC verification. Get approved within 24 hours by our expert team.",
                color: "primary"
              },
              {
                step: "02",
                icon: Layers,
                title: "Deploy Contracts",
                description: "Our platform automatically deploys audited smart contracts with vesting, KYC, and security built-in.",
                color: "secondary"
              },
              {
                step: "03",
                icon: Rocket,
                title: "Go Live & Raise",
                description: "Launch your token sale and connect with 25,000+ verified investors ready to fund innovation.",
                color: "success"
              }
            ].map((item, i) => (
              <Card key={i} className="glass relative overflow-hidden group hover:shadow-glow-cyan transition-all border-border/50">
                <div className="absolute top-0 right-0 text-[120px] font-bold opacity-5 leading-none">
                  {item.step}
                </div>
                <div className="p-8 space-y-4 relative">
                  <div className={`h-16 w-16 rounded-2xl bg-${item.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-8 w-8 text-${item.color}`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`text-sm font-bold text-${item.color}`}>STEP {item.step}</div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-8">
            <Link to="/launch">
              <Button size="lg" className="gap-2">
                Start Your Launch
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <Card className="glass relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
            
            <div className="relative p-12 md:p-16 text-center space-y-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-cyan">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Launch?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join 150+ successful projects and 25,000+ verified investors building the future of Web3
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/launch">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-glow-cyan gap-2">
                    Launch Your Project
                    <Rocket className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2">
                    Explore Opportunities
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                <div className="space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                  <p className="font-semibold">No Setup Fees</p>
                </div>
                <div className="space-y-2">
                  <Shield className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-semibold">100% Secure</p>
                </div>
                <div className="space-y-2">
                  <Zap className="h-8 w-8 text-secondary mx-auto" />
                  <p className="font-semibold">Launch in Minutes</p>
                </div>
                <div className="space-y-2">
                  <Users className="h-8 w-8 text-success mx-auto" />
                  <p className="font-semibold">24/7 Support</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
