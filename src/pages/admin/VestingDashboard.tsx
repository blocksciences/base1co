import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateVestingModal } from "@/components/admin/CreateVestingModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VestingDashboard() {
  const [filterType, setFilterType] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, symbol')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vestingSchedules, isLoading, refetch } = useQuery({
    queryKey: ['admin-vesting-schedules', filterType],
    queryFn: async () => {
      let query = supabase
        .from('vesting_schedules')
        .select(`
          *,
          projects(name, symbol)
        `)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('schedule_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: vestingSchedules?.length || 0,
    team: vestingSchedules?.filter(v => v.schedule_type === 'team').length || 0,
    advisor: vestingSchedules?.filter(v => v.schedule_type === 'advisor').length || 0,
    investor: vestingSchedules?.filter(v => v.schedule_type === 'investor').length || 0,
    totalLocked: vestingSchedules?.reduce((sum, v) => sum + Number(v.total_amount - v.released_amount), 0) || 0,
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
                <h1 className="text-3xl font-bold mb-2">Vesting Dashboard</h1>
                <p className="text-muted-foreground">Monitor and manage token vesting schedules</p>
              </div>
              <div className="flex gap-2">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!selectedProjectId}
                  className="bg-gradient-primary gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.team}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Advisors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.advisor}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.investor}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Locked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLocked.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'team' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('team')}
              >
                Team
              </Button>
              <Button
                variant={filterType === 'advisor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('advisor')}
              >
                Advisors
              </Button>
              <Button
                variant={filterType === 'investor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('investor')}
              >
                Investors
              </Button>
            </div>

            {/* Vesting Schedules List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Vesting Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : vestingSchedules && vestingSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {vestingSchedules.map((schedule: any) => (
                      <div key={schedule.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{schedule.schedule_type}</Badge>
                              {schedule.projects && (
                                <span className="text-sm font-semibold">
                                  {schedule.projects.name} ({schedule.projects.symbol})
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-mono text-muted-foreground">{schedule.beneficiary_address}</p>
                          </div>
                          {schedule.revoked && (
                            <Badge variant="destructive">Revoked</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-semibold">{Number(schedule.total_amount).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Released</p>
                            <p className="font-semibold">{Number(schedule.released_amount).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-semibold text-primary">
                              {Number(schedule.total_amount - schedule.released_amount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cliff</p>
                            <p className="font-semibold">{Math.floor(schedule.cliff_duration / 86400)}d</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{Math.floor(schedule.vesting_duration / 86400)}d</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Start: {format(new Date(schedule.start_time), 'MMM dd, yyyy')}
                          </p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {schedule.contract_address.substring(0, 10)}...
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No vesting schedules found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <CreateVestingModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        projectId={selectedProjectId}
        onSuccess={() => refetch()}
      />
    </div>
  );
}