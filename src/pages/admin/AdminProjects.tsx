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
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const projects = [
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
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
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
                          <Button size="icon" variant="ghost" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {project.status === 'live' ? (
                            <Button size="icon" variant="ghost" title="Pause">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : project.status === 'pending' ? (
                            <>
                              <Button size="icon" variant="ghost" title="Approve" className="text-success">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Reject" className="text-destructive">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="icon" variant="ghost" title="Activate">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Delete" className="text-destructive">
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
    </div>
  );
};

export default AdminProjects;
