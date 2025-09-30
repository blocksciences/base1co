import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { KYCDetailsModal } from '@/components/admin/KYCDetailsModal';
import { useKYCSubmissions, type KYCSubmission } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
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

export const KYCApprovals = () => {
  const { submissions: kycSubmissions, loading, refetch } = useKYCSubmissions();
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [kycToProcess, setKycToProcess] = useState<KYCSubmission | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleViewDetails = (kyc: KYCSubmission) => {
    setSelectedKYC(kyc);
    setDetailsOpen(true);
  };

  const handleApproveClick = (kyc: KYCSubmission) => {
    setKycToProcess(kyc);
    setApproveDialogOpen(true);
  };
  
  const handleRejectClick = (kyc: KYCSubmission) => {
    setKycToProcess(kyc);
    setRejectDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const kyc = kycSubmissions.find(k => k.id === id);
      if (!kyc) return;

      // Update KYC submission
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (kycError) throw kycError;

      // Update or create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          wallet_address: kyc.wallet_address,
          email: kyc.email,
          kyc_status: 'approved'
        }, {
          onConflict: 'wallet_address'
        });

      if (profileError) throw profileError;

      await refetch();
      toast.success(`KYC approved for ${kyc.wallet_address.slice(0, 6)}...${kyc.wallet_address.slice(-4)}`);
    } catch (error: any) {
      toast.error('Failed to approve KYC');
      console.error(error);
    } finally {
      setProcessing(false);
      setApproveDialogOpen(false);
      setKycToProcess(null);
    }
  };
  
  const handleReject = async (id: string) => {
    setProcessing(true);
    try {
      const kyc = kycSubmissions.find(k => k.id === id);
      if (!kyc) return;

      // Update KYC submission
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (kycError) throw kycError;

      // Update or create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          wallet_address: kyc.wallet_address,
          email: kyc.email,
          kyc_status: 'rejected'
        }, {
          onConflict: 'wallet_address'
        });

      if (profileError) throw profileError;

      await refetch();
      toast.error(`KYC rejected for ${kyc.wallet_address.slice(0, 6)}...${kyc.wallet_address.slice(-4)}`);
    } catch (error: any) {
      toast.error('Failed to reject KYC');
      console.error(error);
    } finally {
      setProcessing(false);
      setRejectDialogOpen(false);
      setKycToProcess(null);
    }
  };

  const pendingKYC = kycSubmissions.filter(kyc => kyc.status === 'pending');
  const approvedCount = kycSubmissions.filter(k => k.status === 'approved').length;
  const rejectedCount = kycSubmissions.filter(k => k.status === 'rejected').length;
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">KYC Approvals</h1>
            <p className="text-muted-foreground">Review and approve user verification requests</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-secondary">{pendingKYC.length}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-3xl font-bold text-success">{approvedCount}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-3xl font-bold text-destructive">{rejectedCount}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Submissions</p>
              <p className="text-3xl font-bold">{kycSubmissions.length}</p>
            </Card>
          </div>
          
          {/* KYC Queue */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingKYC.length === 0 ? (
            <Card className="glass p-12 text-center">
              <p className="text-muted-foreground">No pending KYC submissions</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingKYC.map((kyc) => (
              <Card key={kyc.id} className="glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-semibold">
                        {kyc.wallet_address.slice(0, 10)}...{kyc.wallet_address.slice(-8)}
                      </code>
                      <Badge className={
                        kyc.risk_level === 'low' ? 'bg-success' :
                        kyc.risk_level === 'medium' ? 'bg-secondary' :
                        'bg-destructive'
                      }>
                        {kyc.risk_level} Risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted: {new Date(kyc.submitted_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>Country: {kyc.country}</span>
                      <span>•</span>
                      <span>Document: {kyc.document_type}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleViewDetails(kyc)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-success hover:bg-success/90"
                      onClick={() => handleApproveClick(kyc)}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleRejectClick(kyc)}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Reject
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <div className="px-3 py-1.5 rounded-md bg-muted/30 text-sm">
                    {kyc.document_type}: {kyc.document_number}
                  </div>
                  {kyc.selfie_verified && (
                    <div className="px-3 py-1.5 rounded-md bg-success/20 text-sm">
                      Selfie Verified
                    </div>
                  )}
                </div>
                
                {kyc.risk_level === 'high' && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-destructive mb-1">High Risk Alert</p>
                        <p className="text-muted-foreground">
                          This submission has been flagged for manual review. Please verify all documents carefully.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* KYC Details Modal */}
      {selectedKYC && (
        <KYCDetailsModal
          kyc={{
            id: selectedKYC.id,
            address: selectedKYC.wallet_address,
            submittedAt: new Date(selectedKYC.submitted_at).toLocaleString(),
            country: selectedKYC.country,
            documentType: selectedKYC.document_type,
            riskScore: selectedKYC.risk_level ? selectedKYC.risk_level.charAt(0).toUpperCase() + selectedKYC.risk_level.slice(1) : 'Unknown',
            documents: [selectedKYC.document_type, selectedKYC.document_number],
            status: selectedKYC.status as any
          }}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve KYC Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the KYC submission for{' '}
              <code className="font-semibold">{kycToProcess?.wallet_address.slice(0, 10)}...{kycToProcess?.wallet_address.slice(-8)}</code>?
              This will grant them full access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleApprove(kycToProcess.id)}
              className="bg-success hover:bg-success/90"
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject KYC Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the KYC submission for{' '}
              <code className="font-semibold">{kycToProcess?.wallet_address.slice(0, 10)}...{kycToProcess?.wallet_address.slice(-8)}</code>?
              They will need to resubmit their documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleReject(kycToProcess.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYCApprovals;
