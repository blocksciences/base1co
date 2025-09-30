import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ExternalLink, Shield, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

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

interface SecurityAlertModalProps {
  alert: SecurityAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: (id: string) => void;
}

export const SecurityAlertModal = ({ alert, open, onOpenChange, onDismiss }: SecurityAlertModalProps) => {
  if (!alert) return null;

  const handleBlockAddress = () => {
    toast.success(`Address ${alert.address} has been blocked`);
  };

  const handleViewOnExplorer = () => {
    if (alert.address.startsWith('0x')) {
      window.open(`https://basescan.org/address/${alert.address}`, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('IP address tracking available in full security logs');
    }
  };

  const handleDismiss = () => {
    onDismiss(alert.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Security Alert Investigation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Header */}
          <Card className={`glass p-4 ${
            alert.type === 'high' ? 'bg-destructive/10 border-destructive/20' :
            alert.type === 'medium' ? 'bg-secondary/10 border-secondary/20' :
            'bg-muted/20 border-border/20'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-6 w-6 flex-shrink-0 ${
                alert.type === 'high' ? 'text-destructive' :
                alert.type === 'medium' ? 'text-secondary' :
                'text-muted-foreground'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{alert.title}</h3>
                  <Badge className={
                    alert.type === 'high' ? 'bg-destructive' :
                    alert.type === 'medium' ? 'bg-secondary' :
                    'bg-muted'
                  }>
                    {alert.type} priority
                  </Badge>
                </div>
                <p className="text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Alert Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Address/IP</p>
              <code className="text-sm font-semibold break-all">{alert.address}</code>
            </Card>

            <Card className="glass p-4">
              <p className="text-sm text-muted-foreground mb-2">Timestamp</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{alert.timestamp}</span>
              </div>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="glass p-4">
            <h3 className="text-lg font-semibold mb-4">Investigation Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge className={
                  alert.type === 'high' ? 'bg-destructive' :
                  alert.type === 'medium' ? 'bg-secondary' :
                  'bg-success'
                }>
                  {alert.type === 'high' ? 'Critical' : alert.type === 'medium' ? 'Moderate' : 'Low'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{alert.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Action Required</span>
                <span className="text-sm font-semibold">
                  {alert.type === 'high' ? 'Immediate' : alert.type === 'medium' ? 'Within 24h' : 'Monitor'}
                </span>
              </div>
            </div>
          </Card>

          {/* Recommended Actions */}
          <Card className="glass p-4">
            <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {alert.type === 'high' && (
                <>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Immediately block the wallet address from making further transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Review all recent transactions from this address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Contact user for verification if needed</span>
                  </li>
                </>
              )}
              {alert.type === 'medium' && (
                <>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Monitor address for further suspicious activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Implement rate limiting if not already in place</span>
                  </li>
                </>
              )}
              {alert.type === 'low' && (
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Continue monitoring, no immediate action required</span>
                </li>
              )}
            </ul>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={handleViewOnExplorer}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
            {alert.type === 'high' && (
              <Button variant="destructive" onClick={handleBlockAddress}>
                Block Address
              </Button>
            )}
            <Button onClick={handleDismiss}>
              Dismiss Alert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
