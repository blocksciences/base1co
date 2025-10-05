import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Link } from 'react-router-dom';
import { Rocket, Shield, Zap, TrendingUp, ArrowRight, Loader2, Users, Lock, Globe, Star, CheckCircle } from 'lucide-react';

const Index = () => {
  const { data: projects, isLoading } = useProjects();
  const liveProjects = projects?.filter(p => p.status === 'live').slice(0, 3);
  const upcomingProjects = projects?.filter(p => p.status === 'upcoming').slice(0, 3);
  const completedProjects = projects?.filter(p => p.status === 'success').slice(0, 3);
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Audited Smart Contracts',
      description: 'Professionally audited by leading security firms for maximum safety',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure Staking',
      description: 'Earn rewards by staking your tokens in our flexible pools',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Referral Rewards',
      description: 'Earn commission by referring friends to the platform',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Base Network',
      description: 'Built on Base for fast transactions and minimal fees',
    },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-20"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">Secure & Transparent</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Invest in the
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Future of DeFi</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Join thousands of investors in the most secure and transparent token sales. Earn passive income through staking and referrals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/projects">
                  <Button size="lg" className="group h-14 px-8 text-lg bg-gradient-primary hover:opacity-90">
                    Explore Projects
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Stats Card */}
            <div className="relative">
              <Card className="glass p-8 border-border shadow-2xl">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Total Raised</span>
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">$50M+</div>
                    </div>
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Investors</span>
                        <Users className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="text-2xl font-bold">25K+</div>
                    </div>
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Projects</span>
                        <Rocket className="w-5 h-5 text-success" />
                      </div>
                      <div className="text-2xl font-bold">15+</div>
                    </div>
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Network</span>
                        <Zap className="w-5 h-5 text-accent" />
                      </div>
                      <div className="text-2xl font-bold">Base</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Smart contracts audited by leading firms</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>KYC verified and compliant</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Built on Base for speed and low fees</span>
                    </div>
                  </div>

                  <Link to="/projects" className="block">
                    <Button className="w-full h-12 bg-gradient-primary hover:opacity-90">
                      Start Investing Now
                    </Button>
                  </Link>
                </div>
              </Card>
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

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">LaunchBase</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with security, transparency, and investor success in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group glass p-6 border-border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-2">
                <div className="w-16 h-16 rounded-xl bg-gradient-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container px-4 py-20">
        <Card className="glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-cyber opacity-20" />
          <div className="relative p-12 md:p-16 text-center space-y-6">
            <Rocket className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Launch Your Project?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the future of fundraising. Connect your wallet and start exploring 
              groundbreaking blockchain projects today.
            </p>
            <Link to="/launch">
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-primary hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </Card>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                LaunchBase
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LaunchBase. Built on Base Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
