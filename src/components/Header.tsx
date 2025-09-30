import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Header = () => {
  const location = useLocation();
  const { address } = useAccount();
  const [user, setUser] = useState<any>(null);
  const { isAdmin } = useAdminStatus(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
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
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success('Signed out successfully');
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
};
