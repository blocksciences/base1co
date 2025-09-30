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
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminDashboard = () => {
  const stats = [
    { 
      label: 'Total Raised', 
      value: '$52.3M', 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'Active Projects', 
      value: '8', 
      change: '+2', 
      trend: 'up',
      icon: Rocket,
      color: 'text-primary'
    },
    { 
      label: 'Total Users', 
      value: '25,421', 
      change: '+8.2%', 
      trend: 'up',
      icon: Users,
      color: 'text-secondary'
    },
    { 
      label: 'Pending KYC', 
      value: '143', 
      change: '-5', 
      trend: 'down',
      icon: AlertCircle,
      color: 'text-destructive'
    },
  ];
  
  const recentProjects = [
    { name: 'DeFi Protocol X', status: 'live', raised: '1.2M', goal: '2M', progress: 60 },
    { name: 'GameFi Universe', status: 'live', raised: '3.8M', goal: '5M', progress: 76 },
    { name: 'MetaAI Network', status: 'pending', raised: '0', goal: '1.5M', progress: 0 },
    { name: 'EcoToken', status: 'upcoming', raised: '0', goal: '3M', progress: 0 },
  ];
  
  const recentActivity = [
    { type: 'kyc', user: 'alice.eth', action: 'KYC Approved', time: '2 min ago', status: 'success' },
    { type: 'project', user: 'Admin', action: 'New Project Created', time: '15 min ago', status: 'info' },
    { type: 'investment', user: 'bob.eth', action: 'Invested 5 ETH', time: '32 min ago', status: 'success' },
    { type: 'kyc', user: 'charlie.eth', action: 'KYC Pending Review', time: '1 hour ago', status: 'warning' },
    { type: 'project', user: 'Admin', action: 'Project Approved', time: '2 hours ago', status: 'success' },
  ];
  
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
                      stat.trend === 'up' ? 'text-success' : 'text-destructive'
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
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.name} className="p-4 rounded-lg bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge className={
                        project.status === 'live' ? 'bg-success' :
                        project.status === 'pending' ? 'bg-secondary' :
                        'bg-muted'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${project.raised} / ${project.goal}
                      </span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Recent Activity */}
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-success/20' :
                      activity.status === 'warning' ? 'bg-secondary/20' :
                      'bg-primary/20'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : activity.status === 'warning' ? (
                        <Clock className="h-4 w-4 text-secondary" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all text-left group">
                <Rocket className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Create New ICO</h3>
                <p className="text-sm text-muted-foreground">Launch a new token sale project</p>
              </button>
              
              <button className="p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all text-left group">
                <CheckCircle2 className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Review KYC</h3>
                <p className="text-sm text-muted-foreground">Approve pending verifications</p>
              </button>
              
              <button className="p-4 rounded-lg bg-success/10 hover:bg-success/20 border border-success/20 transition-all text-left group">
                <TrendingUp className="h-8 w-8 text-success mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Check platform performance</p>
              </button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
