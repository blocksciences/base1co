import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function EntityKYC() {
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: entities, refetch } = useQuery({
    queryKey: ['entity-kyc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_kyc')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('entity_kyc')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Entity KYC ${status}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    total: entities?.length || 0,
    pending: entities?.filter(e => e.status === 'pending').length || 0,
    approved: entities?.filter(e => e.status === 'approved').length || 0,
    rejected: entities?.filter(e => e.status === 'rejected').length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Entity KYC</h1>
              <p className="text-muted-foreground">Institutional investor verification</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                </CardContent>
              </Card>
            </div>

            {/* Entity List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Entity KYC Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entities && entities.length > 0 ? (
                  <div className="space-y-4">
                    {entities.map((entity: any) => (
                      <div key={entity.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{entity.entity_name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              {entity.entity_type} • {entity.jurisdiction}
                            </p>
                            <p className="text-xs font-mono">{entity.wallet_address}</p>
                          </div>
                          <Badge
                            variant={
                              entity.status === 'approved'
                                ? 'default'
                                : entity.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {entity.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Contact</p>
                            <p className="font-semibold">{entity.contact_name}</p>
                            <p className="text-xs">{entity.contact_email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Registration</p>
                            <p className="font-semibold">{entity.registration_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Risk Level</p>
                            <Badge variant="outline">{entity.risk_level}</Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="text-xs">{format(new Date(entity.created_at), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>

                        {entity.compliance_notes && (
                          <div className="p-3 bg-muted rounded mb-4">
                            <p className="text-sm">
                              <span className="font-semibold">Notes:</span> {entity.compliance_notes}
                            </p>
                          </div>
                        )}

                        {entity.documents && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documents
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {JSON.stringify(entity.documents)}
                            </div>
                          </div>
                        )}

                        {entity.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(entity.id, 'approved')}
                              disabled={updating === entity.id}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(entity.id, 'rejected')}
                              disabled={updating === entity.id}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No entity KYC submissions
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