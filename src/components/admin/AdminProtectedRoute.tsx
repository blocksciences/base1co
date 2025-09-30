import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data, error } = await supabase
          .rpc('is_admin', { check_user_id: session.user.id });
        
        if (!error) {
          setIsAdmin(data || false);
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data, error } = await supabase
            .rpc('is_admin', { check_user_id: session.user.id });
          
          if (!error) {
            setIsAdmin(data || false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user not logged in, redirect to auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass p-12 max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access the admin panel
            </p>
          </div>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }
  
  // If logged in but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass p-12 max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              Your account is not authorized to access the admin panel
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-4">
              User ID: {user?.id?.slice(0, 8)}...
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
