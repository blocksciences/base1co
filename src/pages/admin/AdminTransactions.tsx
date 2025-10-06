import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Download, Loader2, DollarSign, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useAdminData';
import { useProjects } from '@/hooks/useProjects';
import { useICOContract } from '@/hooks/useICOContract';
import { toast } from 'sonner';
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

export const AdminTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { transactions, loading } = useTransactions();
  const { data: projects = [] } = useProjects();
  
  const currentProject = projects.find(p => p.id === selectedProject);
  const { 
    finalizeSale, 
    enableEmergencyMode, 
    emergencyWithdrawETH,
    pauseContract,
    unpauseContract 
  } = useICOContract(currentProject?.contractAddress || '');
  
  const filteredTransactions = transactions.filter(tx =>
    tx.from_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.project_name && tx.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tx.tx_hash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const volume24h = transactions
    .filter(tx => {
      const txTime = new Date(tx.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return txTime > oneDayAgo;
    })
    .reduce((sum, tx) => sum + (tx.amount_usd || 0), 0);

  const transactions24h = transactions.filter(tx => {
    const txTime = new Date(tx.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return txTime > oneDayAgo;
  }).length;

  const avgTransaction = transactions24h > 0 ? volume24h / transactions24h : 0;
  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;

  const handleFinalizeSale = async () => {
    setActionLoading(true);
    try {
      const success = await finalizeSale();
      if (success) {
        setShowFinalizeDialog(false);
        toast.success('Sale finalized and funds withdrawn');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    setActionLoading(true);
    try {
      await enableEmergencyMode();
      const success = await emergencyWithdrawETH();
      if (success) {
        setShowEmergencyDialog(false);
        toast.success('Emergency withdrawal completed');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseContract = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project?.contractAddress) return;
    
    setActionLoading(true);
    try {
      const contract = useICOContract(project.contractAddress);
      await contract.pauseContract();
    } finally {
      setActionLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaction Monitor</h1>
              <p className="text-muted-foreground">Real-time transaction tracking and monitoring</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          {/* Project Fund Management */}
          {projects.length > 0 && (
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">Fund Management</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Select Project</label>
                  <select
                    className="w-full p-2 rounded-md bg-background border border-border"
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                
                {currentProject && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Raised:</span>
                      <span className="font-semibold">{currentProject.raised} ETH</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={currentProject.status === 'live' ? 'default' : 'secondary'}>
                        {currentProject.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => setShowFinalizeDialog(true)}
                        className="flex-1 gap-2"
                        variant="default"
                        disabled={actionLoading}
                      >
                        <DollarSign className="h-4 w-4" />
                        Finalize & Withdraw
                      </Button>
                      <Button 
                        onClick={() => setShowEmergencyDialog(true)}
                        variant="destructive"
                        size="icon"
                        disabled={actionLoading}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Volume (24h)</p>
              <p className="text-3xl font-bold">${(volume24h / 1000).toFixed(1)}K</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Transactions (24h)</p>
              <p className="text-3xl font-bold">{transactions24h}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
              <p className="text-3xl font-bold">${avgTransaction.toFixed(0)}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-secondary">{pendingCount}</p>
            </Card>
          </div>
          
          {/* Search */}
          <Card className="glass p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, project, or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>
          
          {/* Transactions Table */}
          <Card className="glass overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">From</th>
                      <th className="text-left p-4 font-semibold">Project</th>
                      <th className="text-left p-4 font-semibold">Amount</th>
                      <th className="text-left p-4 font-semibold">USD Value</th>
                      <th className="text-left p-4 font-semibold">Time</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-right p-4 font-semibold">TX Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <Badge className={
                            tx.transaction_type === 'investment' ? 'bg-primary' :
                            tx.transaction_type === 'claim' ? 'bg-success' :
                            'bg-secondary'
                          }>
                            {tx.transaction_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <code className="text-sm">
                            {tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)}
                          </code>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{tx.project_name || 'Unknown'}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{tx.amount_crypto}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-muted-foreground">${tx.amount_usd?.toLocaleString() || '0'}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            tx.status === 'confirmed' ? 'bg-success' : 'bg-secondary'
                          }>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <code className="text-sm">
                              {tx.tx_hash.slice(0, 6)}...{tx.tx_hash.slice(-4)}
                            </code>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Finalize Sale Dialog */}
          <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Finalize Sale</AlertDialogTitle>
                <AlertDialogDescription>
                  This will finalize the sale for {currentProject?.name} and withdraw all funds to your wallet. 
                  This action can only be performed after the sale has ended and if the soft cap was met.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalizeSale} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Finalize Sale'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Emergency Withdraw Dialog */}
          <AlertDialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emergency Withdrawal</AlertDialogTitle>
                <AlertDialogDescription className="text-destructive">
                  WARNING: This will enable emergency mode and withdraw all ETH from the contract. 
                  Users will be able to claim refunds after this action. Only use in case of critical issues.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleEmergencyWithdraw} 
                  disabled={actionLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Emergency Withdraw'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
};

export default AdminTransactions;
