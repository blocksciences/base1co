import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Key,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SecurityAlertModal } from '@/components/admin/SecurityAlertModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SecurityAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  address: string;
  timestamp: string;
  status: string;
  dismissed?: boolean;
}

const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: '1',
    type: 'high',
    title: 'Unusual Investment Pattern Detected',
    description: 'Multiple large investments from new wallet in short time period',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    timestamp: '2025-09-30 14:23:15',
    status: 'investigating',
    dismissed: false
  },
  {
    id: '2',
    type: 'medium',
    title: 'Failed Login Attempts',
    description: '5 failed login attempts from suspicious IP address',
    address: '192.168.1.100',
    timestamp: '2025-09-30 13:45:32',
    status: 'blocked',
    dismissed: false
  },
  {
    id: '3',
    type: 'low',
    title: 'API Rate Limit Exceeded',
    description: 'Wallet exceeded API rate limits',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    timestamp: '2025-09-30 12:10:45',
    status: 'resolved',
    dismissed: false
  },
];

export const AdminSecurity = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [alertToDismiss, setAlertToDismiss] = useState<SecurityAlert | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-security-alerts');
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch {
        setAlerts(INITIAL_ALERTS);
      }
    } else {
      setAlerts(INITIAL_ALERTS);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('admin-security-alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  const handleInvestigate = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setInvestigateOpen(true);
  };

  const handleDismissClick = (alert: SecurityAlert) => {
    setAlertToDismiss(alert);
    setDismissDialogOpen(true);
  };

  const handleDismissConfirm = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      toast.success(`Alert "${alert.title}" dismissed`);
    }
    setDismissDialogOpen(false);
    setAlertToDismiss(null);
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const securityAlerts = activeAlerts;
  
  const contractAudits = [
    {
      project: 'DeFi Protocol X',
      auditor: 'CertiK',
      status: 'passed',
      score: '98/100',
      date: '2025-09-15'
    },
    {
      project: 'GameFi Universe',
      auditor: 'OpenZeppelin',
      status: 'passed',
      score: '95/100',
      date: '2025-09-10'
    },
    {
      project: 'MetaAI Network',
      auditor: 'Trail of Bits',
      status: 'pending',
      score: '-',
      date: 'In Progress'
    },
  ];
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Security Center</h1>
            <p className="text-muted-foreground">Monitor platform security and threat detection</p>
          </div>
          
          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-success" />
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
              <p className="text-3xl font-bold text-success">A+</p>
            </Card>
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
              <p className="text-3xl font-bold text-destructive">{activeAlerts.length}</p>
            </Card>
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Blocked IPs</p>
              </div>
              <p className="text-3xl font-bold">24</p>
            </Card>
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <p className="text-3xl font-bold text-success">99.9%</p>
            </Card>
          </div>
          
          {/* Security Alerts */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Active Security Alerts</h2>
            
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border ${
                    alert.type === 'high' ? 'bg-destructive/10 border-destructive/20' :
                    alert.type === 'medium' ? 'bg-secondary/10 border-secondary/20' :
                    'bg-muted/20 border-border/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        alert.type === 'high' ? 'text-destructive' :
                        alert.type === 'medium' ? 'text-secondary' :
                        'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={
                            alert.type === 'high' ? 'bg-destructive' :
                            alert.type === 'medium' ? 'bg-secondary' :
                            'bg-muted'
                          }>
                            {alert.type} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Address: {alert.address}</span>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleInvestigate(alert)}
                      >
                        Investigate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDismissClick(alert)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Smart Contract Audits */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Smart Contract Audits</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Project</th>
                    <th className="text-left p-4 font-semibold">Auditor</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Score</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contractAudits.map((audit, index) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="p-4">
                        <p className="font-semibold">{audit.project}</p>
                      </td>
                      <td className="p-4">
                        <p>{audit.auditor}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          audit.status === 'passed' ? 'bg-success' :
                          audit.status === 'pending' ? 'bg-secondary' :
                          'bg-destructive'
                        }>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {audit.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{audit.score}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">{audit.date}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline">
                            View Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Security Actions */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Security Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
                <Key className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Rotate API Keys</p>
                  <p className="text-xs text-muted-foreground">Generate new keys</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
                <Shield className="h-8 w-8 text-success" />
                <div className="text-left">
                  <p className="font-semibold">Run Security Scan</p>
                  <p className="text-xs text-muted-foreground">Full system check</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
                <Lock className="h-8 w-8 text-secondary" />
                <div className="text-left">
                  <p className="font-semibold">Review Permissions</p>
                  <p className="text-xs text-muted-foreground">Access control audit</p>
                </div>
              </Button>
            </div>
          </Card>
        </main>
      </div>

      {/* Investigation Modal */}
      <SecurityAlertModal
        alert={selectedAlert}
        open={investigateOpen}
        onOpenChange={setInvestigateOpen}
        onDismiss={handleDismissConfirm}
      />

      {/* Dismiss Confirmation Dialog */}
      <AlertDialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Security Alert?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss the alert "{alertToDismiss?.title}"?
              Make sure you've properly investigated and resolved the issue before dismissing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => alertToDismiss && handleDismissConfirm(alertToDismiss.id)}
            >
              Dismiss Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSecurity;
