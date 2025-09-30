import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { isAdmin } from '@/config/admins';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { address, isConnected } = useAccount();
  
  // If wallet not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass p-12 max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access the admin panel
            </p>
          </div>
          <ConnectButton />
        </Card>
      </div>
    );
  }
  
  // If connected but not admin, show access denied
  if (!isAdmin(address)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass p-12 max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              Your wallet address is not authorized to access the admin panel
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-4">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }
  
  // User is admin, render the protected content
  return <>{children}</>;
};
