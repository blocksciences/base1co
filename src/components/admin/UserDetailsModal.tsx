import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

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

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  if (!user) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address);
    toast.success('Address copied to clipboard');
  };

  const openEtherscan = () => {
    window.open(`https://basescan.org/address/${user.address}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Address */}
          <Card className="glass p-4">
            <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 p-2 bg-muted/30 rounded">{user.address}</code>
              <Button size="icon" variant="ghost" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={openEtherscan}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">KYC Status</p>
              <Badge className={
                user.kycStatus === 'approved' ? 'bg-success' :
                user.kycStatus === 'pending' ? 'bg-secondary' :
                'bg-destructive'
              }>
                {user.kycStatus?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </Card>

            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Account Status</p>
              <Badge className={user.banned ? 'bg-destructive' : 'bg-success'}>
                {user.banned ? 'BANNED' : 'ACTIVE'}
              </Badge>
            </Card>
          </div>

          {/* Investment Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
              <p className="text-2xl font-bold">{user.totalInvested}</p>
            </Card>

            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Projects Invested</p>
              <p className="text-2xl font-bold">{user.projects}</p>
            </Card>
          </div>

          {/* Activity */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Joined</p>
              <p className="text-lg font-semibold">{user.joined}</p>
            </Card>

            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Last Active</p>
              <p className="text-lg font-semibold">{user.lastActive}</p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
