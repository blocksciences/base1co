import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function LiquidityLocks() {
  const { data: locks, isLoading } = useQuery({
    queryKey: ['admin-liquidity-locks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_locks')
        .select(`
          *,
          projects(name, symbol)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: locks?.length || 0,
    active: locks?.filter(l => !l.withdrawn && new Date(l.unlock_time) > new Date()).length || 0,
    withdrawn: locks?.filter(l => l.withdrawn).length || 0,
    totalLocked: locks?.filter(l => !l.withdrawn).reduce((sum, l) => sum + Number(l.amount), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Liquidity Locks</h1>
              <p className="text-muted-foreground">Monitor locked liquidity pools</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Locks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.withdrawn}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Locked Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLocked.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Locks List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Liquidity Locks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : locks && locks.length > 0 ? (
                  <div className="space-y-4">
                    {locks.map((lock: any) => {
                      const isActive = !lock.withdrawn && new Date(lock.unlock_time) > new Date();
                      const isUnlockable = !lock.withdrawn && new Date(lock.unlock_time) <= new Date();

                      return (
                        <div key={lock.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {lock.projects && (
                                  <span className="font-semibold">
                                    {lock.projects.name} ({lock.projects.symbol})
                                  </span>
                                )}
                                {lock.withdrawn ? (
                                  <Badge variant="secondary">Withdrawn</Badge>
                                ) : isActive ? (
                                  <Badge variant="default" className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Unlockable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-semibold mb-1">{lock.description || 'Liquidity Pool Lock'}</p>
                              <p className="text-sm font-mono text-muted-foreground">{lock.token_address}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                            <div>
                              <p className="text-muted-foreground">Lock ID</p>
                              <p className="font-semibold">#{lock.lock_id}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-muted rounded">
                            <p className="text-xs text-muted-foreground">
                              Contract: {lock.contract_address}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No liquidity locks found
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