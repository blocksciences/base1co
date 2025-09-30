import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Rocket, 
  Users, 
  CheckCircle2, 
  BarChart3,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  Clock,
  Lock,
  Building2,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: Rocket },
  { name: 'Create ICO', href: '/admin/create-ico', icon: FileText },
  { name: 'Applications', href: '/admin/applications', icon: ClipboardList },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'KYC Approvals', href: '/admin/kyc', icon: CheckCircle2 },
  { name: 'Entity KYC', href: '/admin/entity-kyc', icon: Building2 },
  { name: 'Vesting', href: '/admin/vesting', icon: Clock },
  { name: 'Liquidity Locks', href: '/admin/liquidity-locks', icon: Lock },
  { name: 'Distributions', href: '/admin/distributions', icon: Package },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Transactions', href: '/admin/transactions', icon: TrendingUp },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Admin Management', href: '/admin/manage-admins', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 min-h-screen border-r border-border glass">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Panel
          </span>
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-glow-cyan" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-destructive mb-1">Admin Access</p>
              <p className="text-muted-foreground">
                You have full system privileges
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
