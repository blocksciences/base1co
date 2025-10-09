import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Eye, AlertCircle, Loader2, Info, Trash2, RotateCcw, ShieldCheck, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { KYCDetailsModal } from '@/components/admin/KYCDetailsModal';
import { useKYCSubmissions, type KYCSubmission } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOnChainKYCStatus } from '@/hooks/useOnChainKYCStatus';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [kycToProcess, setKycToProcess] = useState<KYCSubmission | null>(null);
  const [processing, setProcessing] = useState(false);
  const [kycRegistryAddress, setKycRegistryAddress] = useState<string | null>(null);

  // Fetch KYC Registry address
  useEffect(() => {
    const fetchKycRegistry = async () => {
      const { data } = await supabase
        .from('projects')
        .select('kyc_registry_address')
        .not('kyc_registry_address', 'is', null)
        .limit(1)
        .single();
      
      if (data?.kyc_registry_address) {
        setKycRegistryAddress(data.kyc_registry_address);
      }
    };
    
    fetchKycRegistry();
  }, []);

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

  const handleDeleteClick = (kyc: KYCSubmission) => {
    setKycToProcess(kyc);
    setDeleteDialogOpen(true);
  };

  const handleResetClick = (kyc: KYCSubmission) => {
    setKycToProcess(kyc);
    setResetDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const kyc = kycSubmissions.find(k => k.id === id);
      if (!kyc) return;

      // Step 1: Update database
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (kycError) throw kycError;

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

      const { error: eligibilityError } = await supabase
        .from('eligibility_checks')
        .upsert({
          wallet_address: kyc.wallet_address.toLowerCase(),
          kyc_approved: true,
          geo_blocked: false,
          sanctions_check: true,
          country_code: kyc.country,
          last_checked_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        });

      if (eligibilityError) throw eligibilityError;

      toast.success(`Step 1/2: Database approved`);

      // Step 2: Get KYC Registry and approve on blockchain with retries
      toast.loading('Step 2/2: Approving on blockchain...', { id: 'blockchain' });
      
      const { data: projects } = await supabase
        .from('projects')
        .select('kyc_registry_address')
        .not('kyc_registry_address', 'is', null)
        .limit(1)
        .single();

      if (!projects?.kyc_registry_address) {
        toast.error('No KYC Registry configured. Contact developer.', { id: 'blockchain' });
        await refetch();
        return;
      }

      // Retry blockchain approval up to 3 times
      let success = false;
      let lastError = '';
      
      for (let attempt = 1; attempt <= 3 && !success; attempt++) {
        try {
          if (attempt > 1) {
            toast.loading(`Retry ${attempt}/3: Approving on blockchain...`, { id: 'blockchain' });
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          const { data: result, error } = await supabase.functions.invoke('approve-kyc-onchain', {
            body: {
              walletAddress: kyc.wallet_address,
              kycRegistryAddress: projects.kyc_registry_address
            }
          });

          if (error || !result?.success) {
            lastError = result?.error || error?.message || 'Unknown error';
            throw new Error(lastError);
          }
          
          success = true;
          toast.success(`✅ APPROVED! User can invest now. Tx: ${result.txHash?.slice(0, 10)}...`, { 
            id: 'blockchain',
            duration: 8000 
          });
        } catch (error: any) {
          console.error(`Blockchain approval attempt ${attempt} failed:`, error);
          if (attempt === 3) {
            toast.error(
              `Blockchain approval failed after 3 attempts: ${lastError}. User approved in database only.`, 
              { id: 'blockchain', duration: 10000 }
            );
          }
        }
      }

      await refetch();
    } catch (error: any) {
      toast.error('Failed to approve KYC: ' + error.message);
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

  const handleDelete = async (id: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refetch();
      toast.success('KYC record deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete KYC record');
      console.error(error);
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
      setKycToProcess(null);
    }
  };

  const handleReset = async (id: string) => {
    setProcessing(true);
    try {
      const kyc = kycSubmissions.find(k => k.id === id);
      if (!kyc) return;

      // Reset to pending
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'pending',
          reviewed_at: null,
          reviewed_by: null
        })
        .eq('id', id);

      if (kycError) throw kycError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          wallet_address: kyc.wallet_address,
          email: kyc.email,
          kyc_status: 'pending'
        }, {
          onConflict: 'wallet_address'
        });

      if (profileError) throw profileError;

      await refetch();
      toast.success('KYC status reset to pending');
    } catch (error: any) {
      toast.error('Failed to reset KYC status');
      console.error(error);
    } finally {
      setProcessing(false);
      setResetDialogOpen(false);
      setKycToProcess(null);
    }
  };

  const pendingKYC = kycSubmissions.filter(kyc => kyc.status === 'pending');
  const approvedKYC = kycSubmissions.filter(kyc => kyc.status === 'approved');
  const rejectedKYC = kycSubmissions.filter(kyc => kyc.status === 'rejected');

  const KYCCardWithStatus = ({ kyc, showActions }: { kyc: KYCSubmission; showActions: boolean }) => {
    const { isApproved, isLoading } = useOnChainKYCStatus(kyc.wallet_address, kycRegistryAddress || undefined);
    
    return (
      <Card key={kyc.id} className="glass p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
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
              <Badge variant={
                kyc.status === 'approved' ? 'default' :
                kyc.status === 'rejected' ? 'destructive' :
                'secondary'
              }>
                {kyc.status}
              </Badge>
              
              {/* On-Chain Status Badge */}
              {isLoading ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking...
                </Badge>
              ) : isApproved !== null && (
                <Badge 
                  variant={isApproved ? "default" : "destructive"}
                  className={isApproved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {isApproved ? (
                    <>
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      On-Chain ✓
                    </>
                  ) : (
                    <>
                      <ShieldX className="h-3 w-3 mr-1" />
                      On-Chain ✗
                    </>
                  )}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>Submitted: {new Date(kyc.submitted_at).toLocaleString()}</span>
              {kyc.reviewed_at && (
                <>
                  <span>•</span>
                  <span>Reviewed: {new Date(kyc.reviewed_at).toLocaleString()}</span>
                </>
              )}
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
              Details
            </Button>
            
            {showActions && kyc.status === 'pending' && (
              <>
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
              </>
            )}
            
            {kyc.status !== 'pending' && (
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
                onClick={() => handleResetClick(kyc)}
                disabled={processing}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => handleDeleteClick(kyc)}
              disabled={processing}
            >
              <Trash2 className="h-4 w-4" />
              Delete
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
        
        {/* On-Chain Status Warning */}
        {kyc.status === 'approved' && isApproved === false && (
          <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <strong className="text-amber-600">Warning:</strong> This KYC is approved in database but NOT on blockchain. User cannot invest yet. Use{' '}
              <Link to="/admin/quick-kyc" className="underline font-semibold hover:text-amber-700">
                Quick KYC Approval
              </Link>{' '}
              to approve on-chain.
            </AlertDescription>
          </Alert>
        )}
      </Card>
    );
  };

  const renderKYCCard = (kyc: KYCSubmission, showActions: boolean = true) => (
    <KYCCardWithStatus kyc={kyc} showActions={showActions} />
  );
  
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

          {/* Important Notice */}
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong className="text-blue-600">Automatic Approval:</strong> When you approve KYC here, the system will automatically approve both in the database and on-chain. If on-chain approval fails, you can use the{' '}
              <Link to="/admin/quick-kyc" className="underline font-semibold hover:text-blue-700">
                Quick KYC Approval
              </Link>{' '}
              page as a backup.
            </AlertDescription>
          </Alert>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-secondary">{pendingKYC.length}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-3xl font-bold text-success">{approvedKYC.length}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-3xl font-bold text-destructive">{rejectedKYC.length}</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Submissions</p>
              <p className="text-3xl font-bold">{kycSubmissions.length}</p>
            </Card>
          </div>
          
          {/* KYC Tabs */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingKYC.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedKYC.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedKYC.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingKYC.length === 0 ? (
                  <Card className="glass p-12 text-center">
                    <p className="text-muted-foreground">No pending KYC submissions</p>
                  </Card>
                ) : (
                  pendingKYC.map((kyc) => renderKYCCard(kyc, true))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-6">
                {approvedKYC.length === 0 ? (
                  <Card className="glass p-12 text-center">
                    <p className="text-muted-foreground">No approved KYC submissions</p>
                  </Card>
                ) : (
                  approvedKYC.map((kyc) => renderKYCCard(kyc, false))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-6">
                {rejectedKYC.length === 0 ? (
                  <Card className="glass p-12 text-center">
                    <p className="text-muted-foreground">No rejected KYC submissions</p>
                  </Card>
                ) : (
                  rejectedKYC.map((kyc) => renderKYCCard(kyc, false))
                )}
              </TabsContent>
            </Tabs>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete KYC Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the KYC record for{' '}
              <code className="font-semibold">{kycToProcess?.wallet_address.slice(0, 10)}...{kycToProcess?.wallet_address.slice(-8)}</code>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleDelete(kycToProcess.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset KYC Status?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the KYC status to pending for{' '}
              <code className="font-semibold">{kycToProcess?.wallet_address.slice(0, 10)}...{kycToProcess?.wallet_address.slice(-8)}</code>?
              This will allow you to review and approve/reject again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleReset(kycToProcess.id)}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reset to Pending
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYCApprovals;
