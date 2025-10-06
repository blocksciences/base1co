import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const Footer = () => {
  return (
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
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
