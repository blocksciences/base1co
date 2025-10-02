import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, TrendingUp, CheckCircle2, Shield, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const progress = (project.raised / project.goal) * 100;
  const isTrending = progress > 50 && project.status === 'live';
  const softCapReached = project.softCap ? project.raised >= project.softCap : false;
  
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
      <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
      
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img 
                src={project.logo} 
                alt={project.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.symbol}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge className={`${statusColors[project.status]} flex items-center gap-1 whitespace-nowrap`}>
              {statusIcons[project.status]}
              {project.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
            {isTrending && project.status === 'live' && (
              <Badge className="bg-orange-500 text-white flex items-center gap-1 whitespace-nowrap">
                <Flame className="h-3 w-3" />
                Trending
              </Badge>
            )}
          </div>
        </div>
        
        {/* Labels Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Shield className="h-3 w-3" />
            KYC Required
          </Badge>
          {softCapReached && (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Soft Cap Reached
            </Badge>
          )}
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
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Raised</span>
              <span className="font-semibold">{project.raised.toFixed(2)} ETH</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hard Cap</span>
              <span className="font-semibold">{(project.hardCap || project.goal).toFixed(2)} ETH</span>
            </div>
            {(project.minContribution || project.maxContribution) && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                <span className="text-muted-foreground">Per Wallet</span>
                <span className="font-semibold text-[10px]">
                  {(project.minContribution || 0.01).toFixed(3)} - {(project.maxContribution || 10).toFixed(2)} ETH
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats & Countdown */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground">Token Price</p>
                <p className="text-sm font-semibold">{project.price}</p>
              </div>
            </div>
          </div>
          
          {/* Countdown Timer */}
          {project.endDate && project.status === 'live' && (
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-2">Sale Ends In</p>
              <CountdownTimer endDate={project.endDate} compact />
            </div>
          )}
        </div>
        
        {/* CTA */}
        <Link 
          to={`/project/${project.id}`} 
          className="block"
        >
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity group">
            {project.status === 'live' ? 'Participate Now' : 'View Details'}
            <TrendingUp className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
