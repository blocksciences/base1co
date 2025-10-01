import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Download, PlayCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DistributionJobs() {
  const [creating, setCreating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects } = useQuery({
    queryKey: ['admin-projects-for-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, symbol, status')
        .eq('status', 'live')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs, refetch } = useQuery({
    queryKey: ['distribution-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distribution_jobs')
        .select(`
          *,
          projects(name, symbol)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreateJob = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-distribution', {
        body: { projectId: selectedProjectId },
      });

      if (error) throw error;

      toast.success(`Distribution job created with ${data.batches.length} batches`);
      refetch();
      setSelectedProjectId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create distribution job');
    } finally {
      setCreating(false);
    }
  };

  const stats = {
    total: jobs?.length || 0,
    pending: jobs?.filter(j => j.status === 'pending').length || 0,
    inProgress: jobs?.filter(j => j.status === 'in_progress').length || 0,
    completed: jobs?.filter(j => j.status === 'completed').length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Distribution Jobs</h1>
                <p className="text-muted-foreground">Batch token distribution management</p>
              </div>
              <div className="flex gap-2">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select project to distribute" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleCreateJob}
                  disabled={creating || !selectedProjectId}
                  className="bg-gradient-primary gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {creating ? 'Creating...' : 'Create Distribution Job'}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Distribution Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job: any) => {
                      const progress = job.total_batches > 0 
                        ? (job.completed_batches / job.total_batches) * 100 
                        : 0;

                      return (
                        <div key={job.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {job.projects?.name || 'Unknown Project'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Job ID: {job.id}
                              </p>
                            </div>
                            <Badge
                              variant={
                                job.status === 'completed'
                                  ? 'default'
                                  : job.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {job.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Batches</p>
                              <p className="text-2xl font-bold">{job.total_batches}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Recipients</p>
                              <p className="text-2xl font-bold">{job.total_recipients}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Tokens</p>
                              <p className="text-2xl font-bold">{Number(job.total_tokens).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Progress</p>
                              <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
                            </div>
                          </div>

                          {job.status === 'in_progress' && (
                            <div className="mb-4">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {job.completed_batches} of {job.total_batches} batches completed
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Created: {format(new Date(job.created_at), 'MMM dd, yyyy HH:mm')}</span>
                            {job.completed_at && (
                              <span>• Completed: {format(new Date(job.completed_at), 'MMM dd, yyyy HH:mm')}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No distribution jobs yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}