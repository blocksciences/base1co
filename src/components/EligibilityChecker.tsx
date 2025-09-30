import { useState } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function EligibilityChecker({ projectId }: { projectId: string }) {
  const { address, isConnected } = useAccount();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkEligibility = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-eligibility', {
        body: {
          walletAddress: address,
          ipAddress: '', // Would come from client IP in production
        },
      });

      if (error) throw error;
      setResult(data);

      if (data.eligible) {
        toast.success('You are eligible to participate!');
      } else {
        toast.error(data.message || 'You are not eligible');
      }
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      toast.error(error.message || 'Failed to check eligibility');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Eligibility Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verify your eligibility to participate in this token sale. You must complete KYC and
          pass geo-restrictions to invest.
        </p>

        {!isConnected ? (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">Connect your wallet to check eligibility</p>
          </div>
        ) : result ? (
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Overall Status</span>
                {result.eligible ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Eligible
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>KYC Status</span>
                  {result.kyc_approved ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Geo Check</span>
                  {!result.geo_blocked ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Sanctions Screening</span>
                  {result.sanctions_check ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              {!result.eligible && (
                <div className="mt-3 p-3 bg-destructive/10 rounded flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{result.message}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <Button 
          onClick={checkEligibility} 
          disabled={checking || !isConnected}
          className="w-full"
        >
          {checking ? 'Checking...' : 'Check Eligibility'}
        </Button>
      </CardContent>
    </Card>
  );
}