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
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { EditProjectModal } from '@/components/admin/EditProjectModal';
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

interface Project {
  id: string;
  name: string;
  symbol: string;
  status: string;
  raised: string;
  goal: string;
  participants: number;
  progress: number;
  startDate: string;
  endDate: string;
}

const INITIAL_PROJECTS: Project[] = [
    { 
      id: '1', 
      name: 'DeFi Protocol X', 
      symbol: 'DPX', 
      status: 'live', 
      raised: '1.2M', 
      goal: '2M', 
      participants: 3421,
      progress: 60,
      startDate: '2025-09-15',
      endDate: '2025-10-15'
    },
    { 
      id: '2', 
      name: 'GameFi Universe', 
      symbol: 'GFU', 
      status: 'live', 
      raised: '3.8M', 
      goal: '5M', 
      participants: 8921,
      progress: 76,
      startDate: '2025-09-10',
      endDate: '2025-10-10'
    },
    { 
      id: '3', 
      name: 'MetaAI Network', 
      symbol: 'MAI', 
      status: 'pending', 
      raised: '0', 
      goal: '1.5M', 
      participants: 0,
      progress: 0,
      startDate: '2025-10-01',
      endDate: '2025-11-01'
    },
    { 
      id: '4', 
      name: 'EcoToken', 
      symbol: 'ECO', 
      status: 'upcoming', 
      raised: '0', 
      goal: '3M', 
      participants: 0,
      progress: 0,
      startDate: '2025-10-05',
      endDate: '2025-11-05'
    },
    { 
      id: '5', 
      name: 'SocialChain', 
      symbol: 'SCH', 
      status: 'ended', 
      raised: '5.2M', 
      goal: '5M', 
      participants: 15430,
      progress: 104,
      startDate: '2025-08-01',
      endDate: '2025-09-01'
  },
];

export const AdminProjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Initialize projects from localStorage or use defaults
  useEffect(() => {
    const storedProjects = localStorage.getItem('admin-projects');
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch {
        setProjects(INITIAL_PROJECTS);
      }
    } else {
      setProjects(INITIAL_PROJECTS);
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('admin-projects', JSON.stringify(projects));
    }
  }, [projects]);
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setEditModalOpen(true);
    }
  };

  const handleSaveEdit = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      )
    );
    toast.success(`Project status changed to ${newStatus}`);
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

  const handleDelete = () => {
    if (projectToDelete) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete));
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
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
                    <tr key={project.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.symbol}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          project.status === 'live' ? 'bg-success' :
                          project.status === 'pending' ? 'bg-secondary' :
                          project.status === 'upcoming' ? 'bg-primary' :
                          project.status === 'ended' ? 'bg-muted' :
                          'bg-destructive'
                        }>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{project.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden w-24">
                            <div 
                              className="h-full bg-gradient-primary"
                              style={{ width: `${Math.min(project.progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">${project.raised}</p>
                          <p className="text-xs text-muted-foreground">of ${project.goal}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{project.participants.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">{project.startDate}</p>
                          <p className="text-muted-foreground">{project.endDate}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="View"
                            onClick={() => handleView(project.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Edit"
                            onClick={() => handleEdit(project.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {project.status === 'live' ? (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Pause"
                              onClick={() => handlePause(project.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : project.status === 'pending' ? (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                title="Approve" 
                                className="text-success hover:text-success"
                                onClick={() => handleApprove(project.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                title="Reject" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleReject(project.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Activate"
                              onClick={() => handleActivate(project.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Delete" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
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
