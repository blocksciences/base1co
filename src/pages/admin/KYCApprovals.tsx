import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { KYCDetailsModal } from '@/components/admin/KYCDetailsModal';
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

interface KYCSubmission {
  id: string;
  address: string;
  submittedAt: string;
  country: string;
  documentType: string;
  riskScore: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_KYC: KYCSubmission[] = [
  {
    id: '1',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    submittedAt: '2025-09-30 10:30',
    country: 'United States',
    documentType: 'Passport',
    riskScore: 'Low',
    documents: ['ID Front', 'ID Back', 'Selfie', 'Proof of Address'],
    status: 'pending'
  },
  {
    id: '2',
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    submittedAt: '2025-09-30 09:15',
    country: 'United Kingdom',
    documentType: 'Driver License',
    riskScore: 'Low',
    documents: ['ID Front', 'ID Back', 'Selfie'],
    status: 'pending'
  },
  {
    id: '3',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    submittedAt: '2025-09-30 08:45',
    country: 'Germany',
    documentType: 'ID Card',
    riskScore: 'Medium',
    documents: ['ID Front', 'ID Back', 'Selfie', 'Proof of Address'],
    status: 'pending'
  },
  {
    id: '4',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    submittedAt: '2025-09-29 16:20',
    country: 'Singapore',
    documentType: 'Passport',
    riskScore: 'High',
    documents: ['ID Front', 'ID Back', 'Selfie'],
    status: 'pending'
  },
];

export const KYCApprovals = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [kycToProcess, setKycToProcess] = useState<KYCSubmission | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-kyc-submissions');
    if (stored) {
      try {
        setKycSubmissions(JSON.parse(stored));
      } catch {
        setKycSubmissions(INITIAL_KYC);
      }
    } else {
      setKycSubmissions(INITIAL_KYC);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (kycSubmissions.length > 0) {
      localStorage.setItem('admin-kyc-submissions', JSON.stringify(kycSubmissions));
    }
  }, [kycSubmissions]);

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
  const handleApprove = (id: string) => {
    setKycSubmissions(prev =>
      prev.map(kyc => kyc.id === id ? { ...kyc, status: 'approved' as const } : kyc)
    );
    const kyc = kycSubmissions.find(k => k.id === id);
    if (kyc) {
      toast.success(`KYC approved for ${kyc.address.slice(0, 6)}...${kyc.address.slice(-4)}`);
    }
    setApproveDialogOpen(false);
    setKycToProcess(null);
  };
  
  const handleReject = (id: string) => {
    setKycSubmissions(prev =>
      prev.map(kyc => kyc.id === id ? { ...kyc, status: 'rejected' as const } : kyc)
    );
    const kyc = kycSubmissions.find(k => k.id === id);
    if (kyc) {
      toast.error(`KYC rejected for ${kyc.address.slice(0, 6)}...${kyc.address.slice(-4)}`);
    }
    setRejectDialogOpen(false);
    setKycToProcess(null);
  };

  const pendingKYC = kycSubmissions.filter(kyc => kyc.status === 'pending');
  
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
              <p className="text-3xl font-bold text-secondary">143</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Approved Today</p>
              <p className="text-3xl font-bold text-success">27</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Rejected Today</p>
              <p className="text-3xl font-bold text-destructive">3</p>
            </Card>
            <Card className="glass p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg. Review Time</p>
              <p className="text-3xl font-bold">8.5h</p>
            </Card>
          </div>
          
          {/* KYC Queue */}
          <div className="space-y-4">
            {pendingKYC.map((kyc) => (
              <Card key={kyc.id} className="glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-semibold">
                        {kyc.address.slice(0, 10)}...{kyc.address.slice(-8)}
                      </code>
                      <Badge className={
                        kyc.riskScore === 'Low' ? 'bg-success' :
                        kyc.riskScore === 'Medium' ? 'bg-secondary' :
                        'bg-destructive'
                      }>
                        {kyc.riskScore} Risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted: {kyc.submittedAt}</span>
                      <span>•</span>
                      <span>Country: {kyc.country}</span>
                      <span>•</span>
                      <span>Document: {kyc.documentType}</span>
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
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleRejectClick(kyc)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {kyc.documents.map((doc, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1.5 rounded-md bg-muted/30 text-sm"
                    >
                      {doc}
                    </div>
                  ))}
                </div>
                
                {kyc.riskScore === 'High' && (
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
        </main>
      </div>

      {/* KYC Details Modal */}
      <KYCDetailsModal
        kyc={selectedKYC}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve KYC Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the KYC submission for{' '}
              <code className="font-semibold">{kycToProcess?.address.slice(0, 10)}...{kycToProcess?.address.slice(-8)}</code>?
              This will grant them full access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleApprove(kycToProcess.id)}
              className="bg-success hover:bg-success/90"
            >
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
              <code className="font-semibold">{kycToProcess?.address.slice(0, 10)}...{kycToProcess?.address.slice(-8)}</code>?
              They will need to resubmit their documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kycToProcess && handleReject(kycToProcess.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYCApprovals;
