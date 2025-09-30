import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Rocket className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-primary/40 transition-all" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LaunchBase
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/projects"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/projects') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/staking"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/staking') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Staking
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
};
