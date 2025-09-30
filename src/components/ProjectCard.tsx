import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const progress = (project.raised / project.goal) * 100;
  
  const statusColors = {
    upcoming: 'bg-muted text-muted-foreground',
    live: 'bg-success text-success-foreground',
    ended: 'bg-destructive text-destructive-foreground',
    success: 'bg-primary text-primary-foreground',
  };
  
  const statusIcons = {
    upcoming: <Clock className="h-3 w-3" />,
    live: <TrendingUp className="h-3 w-3" />,
    ended: <Clock className="h-3 w-3" />,
    success: <CheckCircle2 className="h-3 w-3" />,
  };
  
  return (
    <Card className="group relative overflow-hidden glass hover:shadow-glow-cyan transition-all duration-300 border-border/50">
      <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-10 transition-opacity" />
      
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img 
                src={project.logo} 
                alt={project.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.symbol}</p>
            </div>
          </div>
          
          <Badge className={`${statusColors[project.status]} flex items-center gap-1`}>
            {statusIcons[project.status]}
            {project.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{project.raised.toLocaleString()} ETH</span>
            <span>Goal: {project.goal.toLocaleString()} ETH</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="text-sm font-semibold">{project.participants}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Ends In</p>
              <p className="text-sm font-semibold">{project.endsIn}</p>
            </div>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <span className="text-sm text-muted-foreground">Token Price</span>
          <span className="text-lg font-bold text-primary">{project.price}</span>
        </div>
        
        {/* CTA */}
        <Link to={`/project/${project.id}`} className="block">
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};
