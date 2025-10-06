import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useListTokenDeployment } from "@/hooks/useListTokenDeployment";
import { useAccount } from "wagmi";
import { Loader2, Coins, Lock, Users, Droplets, Sprout, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DeployListToken() {
  const { address } = useAccount();
  const { deployListToken, isDeploying } = useListTokenDeployment();
  
  const [selectedNetwork, setSelectedNetwork] = useState<'baseSepolia' | 'base'>('baseSepolia');
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  const handleDeploy = async () => {
    const result = await deployListToken({
      network: selectedNetwork,
    });
    
    if (result) {
      setDeploymentResult(result);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Deploy LIST Token Platform</h1>
            <p className="text-muted-foreground">
              Deploy the LIST token (10B supply) and Platform Staking Vault contracts
            </p>
          </div>

          {!address && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to deploy contracts
              </AlertDescription>
            </Alert>
          )}

          {deploymentResult && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Deployment Successful!</p>
                  <div className="text-sm space-y-1">
                    <p>LIST Token: <code className="bg-muted px-2 py-1 rounded text-xs">{deploymentResult.addresses.listToken}</code></p>
                    <p>Staking Vault: <code className="bg-muted px-2 py-1 rounded text-xs">{deploymentResult.addresses.stakingVault}</code></p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Token Allocation Overview */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Token Allocation (10B LIST)</CardTitle>
              <CardDescription>Total supply will be distributed according to this allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Staking Rewards</p>
                    <p className="text-sm text-muted-foreground">3,000,000,000 (30%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Coins className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">ICO Participants</p>
                    <p className="text-sm text-muted-foreground">2,500,000,000 (25%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Team (Vested)</p>
                    <p className="text-sm text-muted-foreground">2,000,000,000 (20%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Droplets className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Liquidity</p>
                    <p className="text-sm text-muted-foreground">1,500,000,000 (15%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Sprout className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Ecosystem</p>
                    <p className="text-sm text-muted-foreground">1,000,000,000 (10%)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Configuration */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
              <CardDescription>
                Deploy complete platform suite to Base blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Network</Label>
                <Select value={selectedNetwork} onValueChange={(v: any) => setSelectedNetwork(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baseSepolia">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Testnet</Badge>
                        <span>Base Sepolia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="base">
                      <div className="flex items-center gap-2">
                        <Badge>Mainnet</Badge>
                        <span>Base</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Deployer: <code className="bg-muted px-2 py-1 rounded text-xs">{address || 'Connect wallet'}</code>
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> All contracts will be deployed and configured automatically. 
                  The deployer wallet will receive ownership of all contracts and initial token supply. 
                  Ensure you have sufficient ETH for gas fees (~0.01 ETH).
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleDeploy}
                disabled={!address || isDeploying}
                className="w-full h-12 bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying Platform Suite...
                  </>
                ) : (
                  'Deploy Complete Platform Suite'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Post-Deployment Steps */}
          {deploymentResult && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Verify contracts on BaseScan</p>
                      <p className="text-muted-foreground">Use Hardhat to verify both contracts</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Update frontend configuration</p>
                      <p className="text-muted-foreground">Add contract addresses to config files</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Test staking functionality</p>
                      <p className="text-muted-foreground">Verify users can stake and earn rewards</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
