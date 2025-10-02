import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useListTokenDeployment } from "@/hooks/useListTokenDeployment";
import { useAccount } from "wagmi";
import { Loader2, Coins, Lock, Users, Droplets, Sprout, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DeployListToken() {
  const { address } = useAccount();
  const { deployListToken, isDeploying } = useListTokenDeployment();
  
  const [network, setNetwork] = useState<'baseSepolia' | 'base'>('baseSepolia');
  const [stakingRewardsAddress, setStakingRewardsAddress] = useState("");
  const [teamAddress, setTeamAddress] = useState("");
  const [liquidityAddress, setLiquidityAddress] = useState("");
  const [ecosystemAddress, setEcosystemAddress] = useState("");
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  const handleDeploy = async () => {
    const result = await deployListToken({
      stakingRewardsAddress: stakingRewardsAddress || address,
      teamAddress: teamAddress || address,
      liquidityAddress: liquidityAddress || address,
      ecosystemAddress: ecosystemAddress || address,
      network,
    });
    
    if (result) {
      setDeploymentResult(result);
    }
  };

  const useConnectedWallet = () => {
    setStakingRewardsAddress(address || "");
    setTeamAddress(address || "");
    setLiquidityAddress(address || "");
    setEcosystemAddress(address || "");
  };

  return (
    <div className="min-h-screen bg-background">
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
                    <p>LIST Token: <code className="bg-muted px-2 py-1 rounded">{deploymentResult.contracts.listToken.address}</code></p>
                    <p>Staking Vault: <code className="bg-muted px-2 py-1 rounded">{deploymentResult.contracts.stakingVault.address}</code></p>
                    <p>Reward Pool: {deploymentResult.contracts.stakingVault.rewardPool} LIST {deploymentResult.contracts.stakingVault.funded ? '✅' : '⚠️'}</p>
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
                Configure allocation wallet addresses (leave empty to use your connected wallet)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Network</Label>
                <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
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

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Connected Wallet: <code className="bg-muted px-2 py-1 rounded">{address || 'Not connected'}</code>
                </p>
                <Button variant="outline" size="sm" onClick={useConnectedWallet} disabled={!address}>
                  Use for All
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="staking">Staking Rewards Address</Label>
                  <Input
                    id="staking"
                    placeholder={address || "0x..."}
                    value={stakingRewardsAddress}
                    onChange={(e) => setStakingRewardsAddress(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will receive 3B LIST tokens for staking rewards pool
                  </p>
                </div>

                <div>
                  <Label htmlFor="team">Team Address (Vested)</Label>
                  <Input
                    id="team"
                    placeholder={address || "0x..."}
                    value={teamAddress}
                    onChange={(e) => setTeamAddress(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will receive 2B LIST tokens for team allocation
                  </p>
                </div>

                <div>
                  <Label htmlFor="liquidity">Liquidity Address</Label>
                  <Input
                    id="liquidity"
                    placeholder={address || "0x..."}
                    value={liquidityAddress}
                    onChange={(e) => setLiquidityAddress(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will receive 1.5B LIST tokens for liquidity provision
                  </p>
                </div>

                <div>
                  <Label htmlFor="ecosystem">Ecosystem Address</Label>
                  <Input
                    id="ecosystem"
                    placeholder={address || "0x..."}
                    value={ecosystemAddress}
                    onChange={(e) => setEcosystemAddress(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will receive 1B LIST tokens for ecosystem development
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Make sure you have enough ETH for gas fees. 
                  The deployer wallet will receive the ICO allocation (2.5B LIST). 
                  The staking vault reward pool will be automatically funded if the deployer controls the staking rewards address.
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
                    Deploying Contracts...
                  </>
                ) : (
                  'Deploy LIST Token Platform'
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
                  {!deploymentResult.contracts.stakingVault.funded && (
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Fund the staking reward pool</p>
                        <p className="text-muted-foreground">
                          Call fundRewardPool() from the staking rewards address
                        </p>
                      </div>
                    </li>
                  )}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
