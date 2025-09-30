import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Ban, UserCheck, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { SendMessageModal } from '@/components/admin/SendMessageModal';
import { useProfiles } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
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

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { profiles: users, loading, refetch } = useProfiles();
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const filteredUsers = users.filter(user =>
    user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedKYCCount = users.filter(u => u.kyc_status === 'approved').length;
  const pendingKYCCount = users.filter(u => u.kyc_status === 'pending').length;
  const activeCount = users.filter(u => {
    const lastActive = new Date(u.last_active_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastActive > oneDayAgo;
  }).length;

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleSendMessage = (user: any) => {
    setSelectedUser(user);
    setSendMessageOpen(true);
  };

  const handleBanClick = (user: any) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleBanConfirm = async () => {
    if (selectedUser) {
      const newBannedStatus = !selectedUser.banned;
      const { error } = await supabase
        .from('profiles')
        .update({ banned: newBannedStatus })
        .eq('id', selectedUser.id);

      if (error) {
        toast.error('Failed to update user status');
        console.error(error);
      } else {
        await refetch();
        toast.success(
          newBannedStatus
            ? `User ${selectedUser.wallet_address.slice(0, 6)}...${selectedUser.wallet_address.slice(-4)} banned`
            : `User ${selectedUser.wallet_address.slice(0, 6)}...${selectedUser.wallet_address.slice(-4)} unbanned`
        );
      }
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
              <p className="text-3xl font-bold">{users.length.toLocaleString()}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">KYC Approved</p>
              <p className="text-3xl font-bold text-success">{approvedKYCCount.toLocaleString()}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending KYC</p>
              <p className="text-3xl font-bold text-secondary">{pendingKYCCount}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Today</p>
              <p className="text-3xl font-bold text-primary">{activeCount}</p>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                            {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                          </code>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            user.kyc_status === 'approved' ? 'bg-success' :
                            user.kyc_status === 'pending' ? 'bg-secondary' :
                            'bg-destructive'
                          }>
                            {user.kyc_status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{user.total_invested_eth.toFixed(2)} ETH</p>
                        </td>
                        <td className="p-4">
                          <p>{user.projects_count}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">{new Date(user.joined_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.last_active_at).toLocaleString()}
                          </p>
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
            )}
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
                ? `Are you sure you want to unban ${selectedUser?.wallet_address}? They will regain full access to the platform.`
                : `Are you sure you want to ban ${selectedUser?.wallet_address}? They will lose access to the platform.`
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
