import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react';

interface KYCSubmission {
  id: string;
  address: string;
  submittedAt: string;
  country: string;
  documentType: string;
  riskScore: string;
  documents: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

interface KYCDetailsModalProps {
  kyc: KYCSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const KYCDetailsModal = ({ kyc, open, onOpenChange, onApprove, onReject }: KYCDetailsModalProps) => {
  if (!kyc) return null;

  const handleApprove = () => {
    onApprove(kyc.id);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject(kyc.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Submission Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card className="glass p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                <code className="text-lg font-semibold">{kyc.address}</code>
              </div>
              <Badge className={
                kyc.riskScore === 'Low' ? 'bg-success' :
                kyc.riskScore === 'Medium' ? 'bg-secondary' :
                'bg-destructive'
              }>
                {kyc.riskScore} Risk
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Country</p>
                <p className="font-semibold">{kyc.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Document Type</p>
                <p className="font-semibold">{kyc.documentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                <p className="font-semibold">{kyc.submittedAt}</p>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              {kyc.documents.map((doc, index) => (
                <Card key={index} className="glass p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">{doc}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Mock document preview */}
                  <div className="mt-3 aspect-video bg-muted/20 rounded-md flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Risk Assessment */}
          <Card className="glass p-4">
            <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Document Quality</span>
                <Badge className="bg-success">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Face Match</span>
                <Badge className="bg-success">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Address Verification</span>
                <Badge className="bg-success">Passed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Liveness Check</span>
                <Badge className="bg-success">Passed</Badge>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          {kyc.status === 'pending' && (
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button 
                variant="destructive"
                className="gap-2"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button 
                className="gap-2 bg-success hover:bg-success/90"
                onClick={handleApprove}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </div>
          )}

          {kyc.status === 'approved' && (
            <Card className="glass p-4 bg-success/10 border-success/20">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">This KYC has been approved</span>
              </div>
            </Card>
          )}

          {kyc.status === 'rejected' && (
            <Card className="glass p-4 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">This KYC has been rejected</span>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
