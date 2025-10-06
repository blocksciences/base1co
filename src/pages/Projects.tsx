import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Loader2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

export const Projects = () => {
  const { data: projects, isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  
  // Calculate platform stats
  const platformStats = useMemo(() => {
    if (!projects) return { totalRaised: 0, activeProjects: 0, totalInvestors: 0 };
    
    const totalRaised = projects.reduce((sum, p) => sum + (p.raised || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'live').length;
    const totalInvestors = projects.reduce((sum, p) => sum + (p.participants || 0), 0);
    
    return { totalRaised, activeProjects, totalInvestors };
  }, [projects]);
  
  const filterProjects = (status?: string) => {
    if (!projects) return [];
    
    let filtered = projects;
    
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort projects
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          const progressA = (a.raised / a.goal) * 100;
          const progressB = (b.raised / b.goal) * 100;
          return progressB - progressA;
        case 'newest':
          // Sort by endDate as proxy for newest
          const endDateA = a.endDate ? new Date(a.endDate).getTime() : 0;
          const endDateB = b.endDate ? new Date(b.endDate).getTime() : 0;
          return endDateB - endDateA;
        case 'ending-soon':
          const endingSoonA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const endingSoonB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          return endingSoonA - endingSoonB;
        case 'most-funded':
          return (b.raised || 0) - (a.raised || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  const featuredProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(p => {
        const progress = (p.raised / p.goal) * 100;
        return p.status === 'live' && progress > 50;
      })
      .sort((a, b) => {
        const progressA = (a.raised / a.goal) * 100;
        const progressB = (b.raised / b.goal) * 100;
        return progressB - progressA;
      })
      .slice(0, 3);
  }, [projects]);
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-30" />
        <div className="container relative px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="glass px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2 inline" />
              {platformStats.activeProjects} Live Projects
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              Discover <span className="bg-gradient-primary bg-clip-text text-transparent">Innovative</span>
              <br />Blockchain Projects
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of investors backing the next generation of decentralized applications on Base network
            </p>
            
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold">
                    ${(platformStats.totalRaised / 1000).toFixed(0)}K+
                  </div>
                  <div className="text-sm text-muted-foreground">Total Raised</div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold">
                    {platformStats.activeProjects}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold">
                    {platformStats.totalInvestors}+
                  </div>
                  <div className="text-sm text-muted-foreground">Investors</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto pt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by name, symbol, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg glass"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="container px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
      
      {/* Projects Section */}
      <section className="container px-4 pb-20">
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList className="glass w-full md:w-auto">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="live">
                <span className="flex items-center gap-2">
                  Live
                  <Badge variant="secondary" className="h-5 px-2">
                    {projects?.filter(p => p.status === 'live').length || 0}
                  </Badge>
                </span>
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <span className="flex items-center gap-2">
                  Upcoming
                  <Badge variant="secondary" className="h-5 px-2">
                    {projects?.filter(p => p.status === 'upcoming').length || 0}
                  </Badge>
                </span>
              </TabsTrigger>
              <TabsTrigger value="success">Completed</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] glass">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">🔥 Trending</SelectItem>
                  <SelectItem value="newest">🆕 Newest</SelectItem>
                  <SelectItem value="ending-soon">⏰ Ending Soon</SelectItem>
                  <SelectItem value="most-funded">💰 Most Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="glass">
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filterProjects().length}</span> projects
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterProjects().length > 0 ? (
                    filterProjects().map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                      <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="live" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filterProjects('live').length}</span> live projects
              </p>
            </div>
            {filterProjects('live').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('live').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No live projects</h3>
                <p className="text-muted-foreground">Check back soon for new opportunities</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filterProjects('upcoming').length}</span> upcoming projects
              </p>
            </div>
            {filterProjects('upcoming').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('upcoming').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No upcoming projects</h3>
                <p className="text-muted-foreground">New projects will be announced soon</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="success" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filterProjects('success').length}</span> completed projects
              </p>
            </div>
            {filterProjects('success').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('success').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No completed projects yet</h3>
                <p className="text-muted-foreground">Successful projects will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
      
      <Footer />
    </div>
  );
};

export default Projects;
