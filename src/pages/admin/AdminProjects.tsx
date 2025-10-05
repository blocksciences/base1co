import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditProjectModal } from '@/components/admin/EditProjectModal';
import { useProjects as useAdminProjects } from '@/hooks/useAdminData';
import { ProjectRowWithBlockchain } from '@/components/admin/ProjectRowWithBlockchain';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminProjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { projects, loading, refetch } = useAdminProjects();
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (updatedProject: any) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updatedProject.name,
          symbol: updatedProject.symbol,
          description: updatedProject.description,
          status: updatedProject.status,
          goal_amount: parseFloat(updatedProject.goal.replace(/[^0-9.]/g, '')),
          start_date: updatedProject.startDate,
          end_date: updatedProject.endDate,
        })
        .eq('id', updatedProject.id);
      
      if (error) throw error;
      
      await refetch();
      toast.success('Project updated successfully');
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);
      
      if (error) throw error;
      
      await refetch();
      toast.success(`Project status changed to ${newStatus}`);
    } catch (error: any) {
      console.error('Error changing status:', error);
      toast.error('Failed to change project status');
    }
  };

  const handleApprove = (projectId: string) => {
    handleStatusChange(projectId, 'live');
  };

  const handleReject = (projectId: string) => {
    handleStatusChange(projectId, 'rejected');
  };

  const handlePause = (projectId: string) => {
    handleStatusChange(projectId, 'paused');
  };

  const handleActivate = (projectId: string) => {
    handleStatusChange(projectId, 'live');
  };

  const confirmDelete = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectToDelete);
        
        if (error) throw error;
        
        await refetch();
        toast.success('Project deleted successfully');
      } catch (error: any) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      }
    }
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Management</h1>
              <p className="text-muted-foreground">Manage all ICO projects on the platform</p>
            </div>
            <Link to="/admin/create-ico">
              <Button className="bg-gradient-primary gap-2">
                <Plus className="h-4 w-4" />
                Create New ICO
              </Button>
            </Link>
          </div>
          
          {/* Filters */}
          <Card className="glass p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
          
          {/* Projects Table */}
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Project</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Progress</th>
                    <th className="text-left p-4 font-semibold">Raised</th>
                    <th className="text-left p-4 font-semibold">Participants</th>
                    <th className="text-left p-4 font-semibold">Dates</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <ProjectRowWithBlockchain
                      key={project.id}
                      project={project}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={confirmDelete}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onPause={handlePause}
                      onActivate={handleActivate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {filteredProjects.length === 0 && (
            <Card className="glass p-12 text-center">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </Card>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={projectToEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default AdminProjects;
