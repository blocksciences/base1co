import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Mail, Globe, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Application {
  id: string;
  project_name: string;
  email: string;
  website: string | null;
  whitepaper: string | null;
  description: string;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  funding_goal_usd: number;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const ProjectApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['project-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-applications'] });
      toast({
        title: "Application Approved",
        description: "The project application has been approved.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('project_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-applications'] });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedApp(null);
      toast({
        title: "Application Rejected",
        description: "The project application has been rejected.",
      });
    },
  });

  const handleReject = (app: Application) => {
    setSelectedApp(app);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedApp && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedApp.id, reason: rejectionReason });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Project Applications</h1>
              <p className="text-muted-foreground mt-2">
                Review and manage ICO launch applications
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="grid gap-6">
                {applications.map((app) => (
                  <Card key={app.id} className="glass p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold">{app.project_name}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-muted-foreground">{app.token_name} ({app.token_symbol})</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${app.email}`} className="text-primary hover:underline">
                              {app.email}
                            </a>
                          </div>
                          {app.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={app.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                Website <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {app.whitepaper && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={app.whitepaper} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                Whitepaper <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Total Supply:</span>
                            <span className="ml-2 font-medium">{app.total_supply.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Funding Goal:</span>
                            <span className="ml-2 font-medium">${app.funding_goal_usd.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="ml-2 font-medium">
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Description:</p>
                        <p className="text-sm text-muted-foreground">{app.description}</p>
                      </div>

                      {app.rejection_reason && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                          <p className="text-sm text-muted-foreground mt-1">{app.rejection_reason}</p>
                        </div>
                      )}

                      {app.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button
                            onClick={() => approveMutation.mutate(app.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(app)}
                            disabled={rejectMutation.isPending}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                  Project applications will appear here when submitted
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be stored for record keeping.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this application is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectApplications;
