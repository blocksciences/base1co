import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Globe,
  Activity
} from 'lucide-react';

export const AdminAnalytics = () => {
  const metrics = [
    { label: 'Total Volume', value: '$52.3M', change: '+18.2%', period: 'vs last month' },
    { label: 'Platform Revenue', value: '$2.1M', change: '+24.5%', period: 'vs last month' },
    { label: 'Active Users', value: '12,421', change: '+12.8%', period: 'vs last week' },
    { label: 'Conversion Rate', value: '4.2%', change: '+1.2%', period: 'vs last month' },
  ];
  
  const topProjects = [
    { name: 'SocialChain', raised: '$5.2M', participants: 15430, roi: '+104%' },
    { name: 'GameFi Universe', raised: '$3.8M', participants: 8921, roi: '+76%' },
    { name: 'DeFi Protocol X', raised: '$1.2M', participants: 3421, roi: '+60%' },
  ];
  
  const geographicData = [
    { country: 'United States', users: 8234, percentage: 32.4 },
    { country: 'United Kingdom', users: 4521, percentage: 17.8 },
    { country: 'Germany', users: 3102, percentage: 12.2 },
    { country: 'Singapore', users: 2845, percentage: 11.2 },
    { country: 'Others', users: 6719, percentage: 26.4 },
  ];
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive platform performance metrics</p>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.label} className="glass p-6">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <p className="text-3xl font-bold mb-2">{metric.value}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-success">{metric.change}</span>
                  <span className="text-muted-foreground">{metric.period}</span>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Projects */}
            <Card className="glass p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Top Performing Projects</h2>
              </div>
              
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.participants.toLocaleString()} participants
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{project.roi}</p>
                        <p className="text-sm text-muted-foreground">{project.raised}</p>
                      </div>
                    </div>
                    {index < topProjects.length - 1 && (
                      <div className="h-px bg-border/50" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Geographic Distribution */}
            <Card className="glass p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-bold">Geographic Distribution</h2>
              </div>
              
              <div className="space-y-4">
                {geographicData.map((geo) => (
                  <div key={geo.country} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{geo.country}</span>
                      <span className="text-muted-foreground">
                        {geo.users.toLocaleString()} users ({geo.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary"
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Activity Overview */}
          <Card className="glass p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-success" />
              <h2 className="text-xl font-bold">Platform Activity (Last 30 Days)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">3,421</p>
                <p className="text-xs text-success mt-1">+15.3% from previous period</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Investments</span>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">8,234</p>
                <p className="text-xs text-success mt-1">+22.7% from previous period</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">KYC Completed</span>
                  <Users className="h-4 w-4 text-secondary" />
                </div>
                <p className="text-2xl font-bold">2,156</p>
                <p className="text-xs text-success mt-1">+8.4% from previous period</p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;
