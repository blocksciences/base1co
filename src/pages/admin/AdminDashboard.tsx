import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Rocket, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_analytics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch projects data
  const { data: projects } = useQuery({
    queryKey: ['admin-projects-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent activity
  const { data: activities } = useQuery({
    queryKey: ['platform-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending KYC count
  const { data: pendingKYC } = useQuery({
    queryKey: ['pending-kyc-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total users count
  const { data: totalUsers } = useQuery({
    queryKey: ['total-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    { 
      label: 'Total Raised', 
      value: analytics ? `$${(analytics.total_raised_usd / 1000000).toFixed(1)}M` : '$0', 
      change: analytics?.platform_revenue_usd ? `+${((analytics.platform_revenue_usd / analytics.total_raised_usd) * 100).toFixed(1)}%` : '0%', 
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'Active Projects', 
      value: analytics?.active_projects.toString() || '0', 
      change: `${analytics?.active_projects || 0}`, 
      trend: 'up' as const,
      icon: Rocket,
      color: 'text-primary'
    },
    { 
      label: 'Total Users', 
      value: totalUsers ? totalUsers.toLocaleString() : '0', 
      change: analytics?.new_users_30d ? `+${analytics.new_users_30d}` : '0', 
      trend: 'up' as const,
      icon: Users,
      color: 'text-secondary'
    },
    { 
      label: 'Pending KYC', 
      value: pendingKYC?.toString() || '0', 
      change: analytics?.pending_kyc ? `${analytics.pending_kyc}` : '0', 
      trend: 'down' as const,
      icon: AlertCircle,
      color: 'text-destructive'
    },
  ];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === 'warning') return <Clock className="h-4 w-4 text-secondary" />;
    return <AlertCircle className="h-4 w-4 text-primary" />;
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="glass p-6 hover:shadow-glow-cyan transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
              {!projects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No projects yet
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const progress = project.goal_amount > 0 
                      ? Math.round((Number(project.raised_amount) / Number(project.goal_amount)) * 100)
                      : 0;
                    
                    return (
                      <div key={project.id} className="p-4 rounded-lg bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge className={
                            project.status === 'live' ? 'bg-success' :
                            project.status === 'pending' ? 'bg-secondary' :
                            project.status === 'upcoming' ? 'bg-primary' :
                            'bg-muted'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${Number(project.raised_amount).toLocaleString()} / ${Number(project.goal_amount).toLocaleString()}
                          </span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            
            {/* Recent Activity */}
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              {!activities ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'success' ? 'bg-success/20' :
                        activity.status === 'warning' ? 'bg-secondary/20' :
                        'bg-primary/20'
                      }`}>
                        {getActivityIcon(activity.activity_type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.action_text}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user_address ? `${activity.user_address.slice(0, 6)}...${activity.user_address.slice(-4)}` : 'System'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/create-ico" className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all text-left group block">
                <Rocket className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Create New ICO</h3>
                <p className="text-sm text-muted-foreground">Launch a new token sale project</p>
              </Link>
              
              <Link to="/admin/kyc" className="p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all text-left group block">
                <CheckCircle2 className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Review KYC</h3>
                <p className="text-sm text-muted-foreground">Approve pending verifications</p>
              </Link>
              
              <Link to="/admin/analytics" className="p-4 rounded-lg bg-success/10 hover:bg-success/20 border border-success/20 transition-all text-left group block">
                <TrendingUp className="h-8 w-8 text-success mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Check platform performance</p>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
