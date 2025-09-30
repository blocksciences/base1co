import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useAdminData';

export const AdminTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { transactions, loading } = useTransactions();
  
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
        </main>
      </div>
    </div>
  );
};

export default AdminTransactions;
