import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ProjectTransparency() {
  const { id } = useParams<{ id: string }>();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: vestingSchedules } = useQuery({
    queryKey: ['vesting-schedules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vesting_schedules')
        .select('*')
        .eq('project_id', id);
      if (error) throw error;
      return data;
    },
  });

  const { data: liquidityLocks } = useQuery({
    queryKey: ['liquidity-locks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_locks')
        .select('*')
        .eq('project_id', id);
      if (error) throw error;
      return data;
    },
  });

  if (!project) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{project.name} Transparency Report</h1>
        <p className="text-muted-foreground">Public verification of locks, vesting, and sale details</p>
      </div>

      {/* Project Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={project.status === 'live' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-2xl font-bold">{project.progress_percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Participants</p>
              <p className="text-2xl font-bold">{project.participants_count}</p>
            </div>
          </div>
          
          {project.contract_address && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sale Contract</p>
              <code className="text-xs break-all">{project.contract_address}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vesting Schedules */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Token Vesting Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vestingSchedules && vestingSchedules.length > 0 ? (
            <div className="space-y-4">
              {vestingSchedules.map((schedule) => (
                <div key={schedule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {schedule.schedule_type}
                      </Badge>
                      <p className="text-sm font-mono">{schedule.beneficiary_address}</p>
                    </div>
                    {schedule.revoked && (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{Number(schedule.total_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Released</p>
                      <p className="font-semibold">{Number(schedule.released_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cliff</p>
                      <p className="font-semibold">{Math.floor(schedule.cliff_duration / 86400)} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{Math.floor(schedule.vesting_duration / 86400)} days</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <p className="text-muted-foreground">Contract: {schedule.contract_address}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No vesting schedules configured</p>
          )}
        </CardContent>
      </Card>

      {/* Liquidity Locks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Liquidity Locks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liquidityLocks && liquidityLocks.length > 0 ? (
            <div className="space-y-4">
              {liquidityLocks.map((lock) => (
                <div key={lock.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold mb-1">{lock.description || 'Liquidity Pool Lock'}</p>
                      <p className="text-sm font-mono text-muted-foreground">{lock.token_address}</p>
                    </div>
                    {lock.withdrawn ? (
                      <Badge variant="secondary">Withdrawn</Badge>
                    ) : (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount Locked</p>
                      <p className="font-semibold">{Number(lock.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unlock Date</p>
                      <p className="font-semibold">
                        {format(new Date(lock.unlock_time), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Beneficiary</p>
                      <p className="font-mono text-xs">{lock.beneficiary_address.substring(0, 10)}...</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <p className="text-muted-foreground">Contract: {lock.contract_address}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No liquidity locks configured</p>
          )}
        </CardContent>
      </Card>
      
      <Footer />
    </div>
  );
}