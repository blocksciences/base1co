import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Download } from 'lucide-react';
import { useState } from 'react';

export const AdminTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const transactions = [
    {
      id: '1',
      type: 'investment',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      project: 'DeFi Protocol X',
      amount: '5.0 ETH',
      usdValue: '$10,250',
      timestamp: '2025-09-30 14:23:15',
      status: 'confirmed',
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'claim',
      from: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
      project: 'GameFi Universe',
      amount: '50,000 GFU',
      usdValue: '$1,500',
      timestamp: '2025-09-30 13:45:32',
      status: 'confirmed',
      txHash: '0xabcd...efgh'
    },
    {
      id: '3',
      type: 'investment',
      from: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      project: 'MetaAI Network',
      amount: '10.5 ETH',
      usdValue: '$21,525',
      timestamp: '2025-09-30 12:10:45',
      status: 'confirmed',
      txHash: '0x9876...5432'
    },
    {
      id: '4',
      type: 'investment',
      from: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      project: 'DeFi Protocol X',
      amount: '2.5 ETH',
      usdValue: '$5,125',
      timestamp: '2025-09-30 11:32:18',
      status: 'pending',
      txHash: '0xfedc...ba98'
    },
    {
      id: '5',
      type: 'refund',
      from: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      project: 'EcoToken',
      amount: '3.0 ETH',
      usdValue: '$6,150',
      timestamp: '2025-09-30 10:15:42',
      status: 'confirmed',
      txHash: '0x5678...1234'
    },
  ];
  
  const filteredTransactions = transactions.filter(tx =>
    tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.txHash.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              <p className="text-3xl font-bold">$156.2K</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Transactions (24h)</p>
              <p className="text-3xl font-bold">342</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
              <p className="text-3xl font-bold">$457</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-secondary">12</p>
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
                          tx.type === 'investment' ? 'bg-primary' :
                          tx.type === 'claim' ? 'bg-success' :
                          'bg-secondary'
                        }>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">
                          {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </code>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{tx.project}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{tx.amount}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-muted-foreground">{tx.usdValue}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
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
                            {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
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
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminTransactions;
