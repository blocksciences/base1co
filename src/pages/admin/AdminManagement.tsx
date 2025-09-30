import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserPlus, Trash2, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useAccount } from 'wagmi';

const emailSchema = z.string().email('Invalid email address');
const walletSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');

interface AdminUser {
  id: string;
  user_id: string;
  email?: string;
  created_at: string;
}

interface AdminWallet {
  id: string;
  wallet_address: string;
  created_at: string;
  created_by?: string;
}

export default function AdminManagement() {
  const { address } = useAccount();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [walletAdmins, setWalletAdmins] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminWallet, setNewAdminWallet] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addMethod, setAddMethod] = useState<'email' | 'wallet'>('wallet');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      // Load user-based admins
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id, user_id, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (roleError) throw roleError;
      setAdmins(roleData || []);

      // Load wallet-based admins
      const { data: walletData, error: walletError } = await supabase
        .from('admin_wallets')
        .select('*')
        .order('created_at', { ascending: false });

      if (walletError) throw walletError;
      setWalletAdmins(walletData || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Failed to load admin list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    let body: any = { operation: 'add_admin' };

    // Validate based on add method
    if (addMethod === 'email') {
      try {
        emailSchema.parse(newAdminEmail);
        body.targetEmail = newAdminEmail.toLowerCase().trim();
      } catch (error) {
        toast.error('Please enter a valid email address');
        return;
      }
    } else {
      try {
        walletSchema.parse(newAdminWallet);
        body.targetWallet = newAdminWallet.trim();
      } catch (error) {
        toast.error('Please enter a valid wallet address (0x...)');
        return;
      }
    }

    setAddingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body,
        headers: address ? { 'x-wallet-address': address } : {},
      });

      if (error) throw error;

      toast.success('Admin added successfully');
      setNewAdminEmail('');
      setNewAdminWallet('');
      loadAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error(error.message || 'Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (admins.length <= 1 && walletAdmins.length === 0) {
      toast.error('Cannot remove the last admin');
      return;
    }

    if (!confirm('Are you sure you want to remove this admin?')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'remove_admin',
          targetUserId: userId,
        },
        headers: address ? { 'x-wallet-address': address } : {},
      });

      if (error) throw error;

      toast.success('Admin removed successfully');
      loadAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast.error(error.message || 'Failed to remove admin');
    }
  };

  const handleRemoveWalletAdmin = async (walletAddress: string) => {
    if (walletAdmins.length <= 1 && admins.length === 0) {
      toast.error('Cannot remove the last admin');
      return;
    }

    if (!confirm('Are you sure you want to remove this wallet admin?')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'remove_admin_wallet',
          targetWallet: walletAddress,
        },
        headers: address ? { 'x-wallet-address': address } : {},
      });

      if (error) throw error;

      toast.success('Wallet admin removed successfully');
      loadAdmins();
    } catch (error: any) {
      console.error('Error removing wallet admin:', error);
      toast.error(error.message || 'Failed to remove wallet admin');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('User ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Management</h1>
            <p className="text-muted-foreground">
              Manage administrator access and permissions
            </p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Secure Admin Management:</strong> Admin roles are now stored securely in the database with proper RLS policies. All admin operations are audited.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Admins</span>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{admins.length + walletAdmins.length}</p>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Now</span>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <p className="text-2xl font-bold">{admins.length + walletAdmins.length}</p>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Last Added</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {admins[0]
                  ? new Date(admins[0].created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </Card>
          </div>

          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Administrator</h2>
            
            {/* Add Method Toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={addMethod === 'wallet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMethod('wallet')}
              >
                Wallet Address
              </Button>
              <Button
                variant={addMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMethod('email')}
              >
                Email Address
              </Button>
            </div>

            {/* Input based on method */}
            <div className="flex gap-4">
              {addMethod === 'wallet' ? (
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={newAdminWallet}
                  onChange={(e) => setNewAdminWallet(e.target.value)}
                  disabled={addingAdmin}
                />
              ) : (
                <Input
                  placeholder="Enter user email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  disabled={addingAdmin}
                  type="email"
                />
              )}
              <Button
                onClick={handleAddAdmin}
                disabled={(addMethod === 'email' ? !newAdminEmail : !newAdminWallet) || addingAdmin}
              >
                {addingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {addMethod === 'wallet' 
                ? 'Enter a wallet address to grant admin access'
                : 'Enter the email of an existing user to grant them admin access'}
            </p>
          </Card>

          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-4">Current Administrators</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (admins.length === 0 && walletAdmins.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No administrators found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wallet-based Admins */}
                {walletAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm">{admin.wallet_address}</p>
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Wallet Admin</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyId(admin.wallet_address)}
                      >
                        {copiedId === admin.wallet_address ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWalletAdmin(admin.wallet_address)}
                        disabled={walletAdmins.length <= 1 && admins.length === 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* User-based Admins */}
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm">{admin.user_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">User Admin</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyId(admin.user_id)}
                      >
                        {copiedId === admin.user_id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.user_id)}
                        disabled={admins.length <= 1 && walletAdmins.length === 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Permissions</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Full Dashboard Access</p>
                  <p className="text-sm text-muted-foreground">
                    Access to all admin panels and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-sm text-muted-foreground">
                    View and manage user accounts and permissions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Project Management</p>
                  <p className="text-sm text-muted-foreground">
                    Create, edit, and delete ICO projects
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Transaction Oversight</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor all platform transactions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Security Controls</p>
                  <p className="text-sm text-muted-foreground">
                    Configure security settings and view audit logs
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
