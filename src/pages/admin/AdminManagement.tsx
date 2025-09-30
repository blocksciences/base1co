import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Trash2, Plus, AlertTriangle, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ADMIN_ADDRESSES } from '@/config/admins';

const STORAGE_KEY = 'launchbase_admins';

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    // Load admins from localStorage, fallback to hardcoded list
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAdmins(parsed);
      } catch (e) {
        setAdmins([...ADMIN_ADDRESSES]);
      }
    } else {
      setAdmins([...ADMIN_ADDRESSES]);
    }
  }, []);

  const saveAdmins = (newAdmins: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAdmins));
    setAdmins(newAdmins);
  };

  const handleAddAdmin = () => {
    if (!newAddress) {
      toast.error('Please enter a wallet address');
      return;
    }

    // Basic address validation
    if (!newAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid Ethereum address format');
      return;
    }

    const lowerAddress = newAddress.toLowerCase();

    if (admins.includes(lowerAddress)) {
      toast.error('This address is already an admin');
      return;
    }

    const updatedAdmins = [...admins, lowerAddress];
    saveAdmins(updatedAdmins);
    setNewAddress('');
    toast.success('Admin address added successfully');
  };

  const handleRemoveAdmin = (address: string) => {
    if (admins.length <= 1) {
      toast.error('Cannot remove the last admin');
      return;
    }

    const updatedAdmins = admins.filter(a => a !== address);
    saveAdmins(updatedAdmins);
    toast.success('Admin address removed successfully');
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset to default admin addresses? This will remove all custom admins.')) {
      saveAdmins([...ADMIN_ADDRESSES]);
      toast.success('Reset to default admins');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Management</h1>
            <p className="text-muted-foreground">Manage platform administrator wallet addresses</p>
          </div>

          {/* Security Warning */}
          <Card className="glass p-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-destructive">Security Notice</h3>
                <p className="text-sm text-muted-foreground">
                  Admin addresses are currently stored in browser localStorage. For production use:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Move admin management to a secure backend database</li>
                  <li>Implement multi-signature controls for adding/removing admins</li>
                  <li>Add audit logging for all admin changes</li>
                  <li>Use role-based access control (RBAC)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total Admins</p>
              </div>
              <p className="text-3xl font-bold">{admins.length}</p>
            </Card>
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-success" />
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
              <p className="text-3xl font-bold">1</p>
            </Card>
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">Default Admins</p>
              </div>
              <p className="text-3xl font-bold">{ADMIN_ADDRESSES.length}</p>
            </Card>
          </div>

          {/* Add New Admin */}
          <Card className="glass p-6 space-y-4">
            <h2 className="text-xl font-bold">Add New Administrator</h2>
            
            <div className="flex gap-3">
              <Input
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1"
                pattern="^0x[a-fA-F0-9]{40}$"
              />
              <Button 
                onClick={handleAddAdmin}
                className="bg-gradient-primary gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Admin
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Enter a valid Ethereum wallet address. The address will be converted to lowercase automatically.
            </p>
          </Card>

          {/* Current Admins */}
          <Card className="glass p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Current Administrators</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetToDefaults}
              >
                Reset to Defaults
              </Button>
            </div>

            <div className="space-y-3">
              {admins.map((address, index) => {
                const isDefault = ADMIN_ADDRESSES.includes(address);
                return (
                  <div 
                    key={address}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono">
                            {address}
                          </code>
                          {isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added: {isDefault ? 'System default' : 'Custom admin'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyAddress(address)}
                        title="Copy address"
                      >
                        {copiedAddress === address ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveAdmin(address)}
                        disabled={admins.length <= 1}
                        title={admins.length <= 1 ? "Cannot remove last admin" : "Remove admin"}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {admins.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No administrators configured
              </div>
            )}
          </Card>

          {/* Admin Permissions Info */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Admin Permissions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-2">Full Access</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and manage ICO projects</li>
                  <li>• Approve/reject KYC submissions</li>
                  <li>• View all user data</li>
                  <li>• Monitor transactions</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-2">System Control</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Modify platform settings</li>
                  <li>• Access security center</li>
                  <li>• View analytics dashboard</li>
                  <li>• Manage admin permissions</li>
                </ul>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminManagement;
