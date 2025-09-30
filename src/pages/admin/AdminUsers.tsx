import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Ban, UserCheck, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { SendMessageModal } from '@/components/admin/SendMessageModal';
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

interface User {
  id: string;
  address: string;
  kycStatus: string;
  totalInvested: string;
  projects: number;
  joined: string;
  lastActive: string;
  banned?: boolean;
}

const INITIAL_USERS: User[] = [
    { 
      id: '1', 
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 
      kycStatus: 'approved', 
      totalInvested: '15.5 ETH',
      projects: 3,
      joined: '2025-08-15',
      lastActive: '2 hours ago'
    },
    { 
      id: '2', 
      address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', 
      kycStatus: 'pending', 
      totalInvested: '8.2 ETH',
      projects: 2,
      joined: '2025-09-01',
      lastActive: '1 day ago'
    },
    { 
      id: '3', 
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
      kycStatus: 'approved', 
      totalInvested: '25.0 ETH',
      projects: 5,
      joined: '2025-07-20',
      lastActive: '5 min ago'
    },
    { 
      id: '4', 
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
      kycStatus: 'rejected', 
      totalInvested: '0 ETH',
      projects: 0,
      joined: '2025-09-25',
      lastActive: '3 days ago'
    },
    { 
      id: '5', 
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 
      kycStatus: 'approved', 
      totalInvested: '42.8 ETH',
      projects: 8,
      joined: '2025-06-10',
      lastActive: '30 min ago'
  },
];

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Initialize users from localStorage or use defaults
  useEffect(() => {
    const storedUsers = localStorage.getItem('admin-users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch {
        setUsers(INITIAL_USERS);
      }
    } else {
      setUsers(INITIAL_USERS);
    }
  }, []);

  // Save to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('admin-users', JSON.stringify(users));
    }
  }, [users]);
  
  const filteredUsers = users.filter(user =>
    user.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    setSendMessageOpen(true);
  };

  const handleBanClick = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleBanConfirm = () => {
    if (selectedUser) {
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id ? { ...u, banned: !u.banned } : u
        )
      );
      toast.success(
        selectedUser.banned
          ? `User ${selectedUser.address.slice(0, 6)}...${selectedUser.address.slice(-4)} unbanned`
          : `User ${selectedUser.address.slice(0, 6)}...${selectedUser.address.slice(-4)} banned`
      );
      setBanDialogOpen(false);
      setSelectedUser(null);
    }
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and their activities</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-3xl font-bold">25,421</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">KYC Approved</p>
              <p className="text-3xl font-bold text-success">18,234</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending KYC</p>
              <p className="text-3xl font-bold text-secondary">143</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Today</p>
              <p className="text-3xl font-bold text-primary">3,421</p>
            </Card>
          </div>
          
          {/* Search */}
          <Card className="glass p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>
          
          {/* Users Table */}
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Wallet Address</th>
                    <th className="text-left p-4 font-semibold">KYC Status</th>
                    <th className="text-left p-4 font-semibold">Total Invested</th>
                    <th className="text-left p-4 font-semibold">Projects</th>
                    <th className="text-left p-4 font-semibold">Joined</th>
                    <th className="text-left p-4 font-semibold">Last Active</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <code className="text-sm">
                          {user.address.slice(0, 6)}...{user.address.slice(-4)}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          user.kycStatus === 'approved' ? 'bg-success' :
                          user.kycStatus === 'pending' ? 'bg-secondary' :
                          'bg-destructive'
                        }>
                          {user.kycStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{user.totalInvested}</p>
                      </td>
                      <td className="p-4">
                        <p>{user.projects}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">{user.joined}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">{user.lastActive}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="View Profile"
                            onClick={() => handleViewProfile(user)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Send Message"
                            onClick={() => handleSendMessage(user)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title={user.banned ? "Unban User" : "Ban User"}
                            className={user.banned ? "text-success" : "text-destructive"}
                            onClick={() => handleBanClick(user)}
                          >
                            <Ban className="h-4 w-4" />
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

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={userDetailsOpen}
        onOpenChange={setUserDetailsOpen}
      />

      {/* Send Message Modal */}
      <SendMessageModal
        user={selectedUser}
        open={sendMessageOpen}
        onOpenChange={setSendMessageOpen}
      />

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.banned ? 'Unban User?' : 'Ban User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.banned
                ? `Are you sure you want to unban ${selectedUser?.address}? They will regain full access to the platform.`
                : `Are you sure you want to ban ${selectedUser?.address}? They will lose access to the platform.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBanConfirm}
              className={selectedUser?.banned ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
            >
              {selectedUser?.banned ? 'Unban' : 'Ban User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
