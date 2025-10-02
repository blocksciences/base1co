import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Link } from 'react-router-dom';
import { Rocket, Shield, Zap, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: projects, isLoading } = useProjects();
  const liveProjects = projects?.filter(p => p.status === 'live').slice(0, 3);
  const upcomingProjects = projects?.filter(p => p.status === 'upcoming').slice(0, 3);
  const completedProjects = projects?.filter(p => p.status === 'success').slice(0, 3);
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container relative px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Launch Your Project on{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Base
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                The premier ICO launchpad for next-generation blockchain projects. 
                Secure, transparent, and community-driven.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/projects">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-primary hover:opacity-90 gap-2">
                  Explore Projects
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-primary">$50M+</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-secondary">25K+</p>
                <p className="text-sm text-muted-foreground">Investors</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-success">15+</p>
                <p className="text-sm text-muted-foreground">Projects Launched</p>
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

      {/* Features */}
      <section className="container px-4 py-20 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass p-8 space-y-4 hover:shadow-glow-cyan transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Secure & Audited</h3>
            <p className="text-muted-foreground">
              All smart contracts are audited by leading security firms. 
              Your funds are protected by battle-tested code.
            </p>
          </Card>
          
          <Card className="glass p-8 space-y-4 hover:shadow-glow-purple transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <Zap className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold">Fast & Low Cost</h3>
            <p className="text-muted-foreground">
              Built on Base for lightning-fast transactions with minimal fees. 
              No more expensive gas wars.
            </p>
          </Card>
          
          <Card className="glass p-8 space-y-4 hover:shadow-glow-cyan transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold">Vetted Projects</h3>
            <p className="text-muted-foreground">
              Every project undergoes rigorous due diligence. 
              Only the best make it to our platform.
            </p>
          </Card>
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
