import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useState } from 'react';

export const Projects = () => {
  const { data: projects, isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  
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
    
    return filtered;
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-30" />
        <div className="container relative px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Discover <span className="bg-gradient-primary bg-clip-text text-transparent">Next-Gen</span> Projects
            </h1>
            <p className="text-xl text-muted-foreground">
              Invest in groundbreaking blockchain projects on Base network
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by name, symbol, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg glass"
              />
              <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section className="container px-4 pb-20">
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="glass">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="success">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filterProjects().length} projects
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterProjects().length > 0 ? (
                    filterProjects().map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-muted-foreground">No projects available</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="live" className="space-y-6">
            {filterProjects('live').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('live').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No live projects</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            {filterProjects('upcoming').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('upcoming').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No upcoming projects</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="success" className="space-y-6">
            {filterProjects('success').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProjects('success').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No completed projects</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Projects;
