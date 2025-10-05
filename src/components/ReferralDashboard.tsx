import { useState } from "react";
import { useAccount } from "wagmi";
import { useReferrals } from "@/hooks/useReferrals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Gift } from "lucide-react";
import { toast } from "sonner";

export const ReferralDashboard = () => {
  const { address } = useAccount();
  const { referralCode, isLoadingCode, stats, createCode, registerReferral } = useReferrals(address);
  const [inputCode, setInputCode] = useState("");
  const [showApply, setShowApply] = useState(false);

  const copyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success("Referral code copied!");
    }
  };

  const shareUrl = referralCode?.code 
    ? `${window.location.origin}?ref=${referralCode.code}`
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Referral Program</h2>
        <p className="text-muted-foreground mt-2">
          Earn rewards by inviting friends to invest
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalEarned?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unclaimed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.unclaimed?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code or link to earn 5% of your referrals' investments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingCode ? (
            <div className="h-12 bg-muted animate-pulse rounded" />
          ) : referralCode ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 bg-muted rounded-lg font-mono text-2xl text-center">
                  {referralCode.code}
                </div>
                <Button onClick={copyCode} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied!");
                    }}
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Button onClick={() => createCode.mutate()} disabled={createCode.isPending}>
              {createCode.isPending ? "Creating..." : "Generate Referral Code"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      {!stats?.referrals?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Have a Referral Code?</CardTitle>
            <CardDescription>
              Enter a referral code to get bonus rewards on your investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showApply ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <Button 
                  onClick={() => registerReferral.mutate(inputCode)}
                  disabled={!inputCode || registerReferral.isPending}
                >
                  Apply
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowApply(true)} variant="outline">
                Apply Referral Code
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-mono text-sm">
                      {ref.referee_wallet.slice(0, 6)}...{ref.referee_wallet.slice(-4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ref.registration_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={ref.status === "active" ? "default" : "secondary"}>
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
