import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContractDeployment, DeploymentParams } from '@/hooks/useContractDeployment';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from 'sonner';
import { Rocket, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function CreateICO() {
  const navigate = useNavigate();
  const { deployContracts, isDeploying } = useContractDeployment();
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  
  // Calculate minimum start date (30 minutes from now)
  const getMinStartDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };
  
  const [formData, setFormData] = useState<DeploymentParams>({
    projectName: '',
    tokenSymbol: '',
    totalSupply: '',
    tokenDecimals: 18,
    tokenPrice: '',
    softCap: '',
    hardCap: '',
    minContribution: '',
    maxContribution: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const softCap = parseFloat(formData.softCap);
    const hardCap = parseFloat(formData.hardCap);
    const minContribution = parseFloat(formData.minContribution);
    const maxContribution = parseFloat(formData.maxContribution);
    
    if (softCap >= hardCap) {
      toast.error('Soft cap must be less than hard cap');
      return;
    }
    
    if (minContribution > maxContribution) {
      toast.error('Min contribution cannot exceed max contribution');
      return;
    }
    
    // Check ICO duration
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (durationHours < 24) {
      toast.error('ICO must run for at least 24 hours');
      return;
    }
    
    const result = await deployContracts(formData);
    if (result) {
      setDeploymentResult(result);
      toast.success('Contracts deployed successfully!');
    }
  };

  if (deploymentResult) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <div className="flex-1">
          <AdminHeader />
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  Deployment Successful!
                </CardTitle>
                <CardDescription>
                  Your ICO contracts have been deployed to Base Sepolia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Token Contract</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-background px-3 py-2 rounded">
                        {deploymentResult.deployedAddresses?.token}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(deploymentResult.explorerUrls?.token, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Sale Contract</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-background px-3 py-2 rounded">
                        {deploymentResult.deployedAddresses?.sale}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(deploymentResult.explorerUrls?.sale, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Network:</strong> {deploymentResult.network}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Deployer:</strong> {deploymentResult.deployer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Time:</strong> {new Date(deploymentResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => navigate('/admin/projects')}>
                    View Projects
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setDeploymentResult(null);
                    setFormData({
                      projectName: '',
                      tokenSymbol: '',
                      totalSupply: '',
                      tokenDecimals: 18,
                      tokenPrice: '',
                      softCap: '',
                      hardCap: '',
                      minContribution: '',
                      maxContribution: '',
                      startDate: '',
                      endDate: '',
                    });
                  }}>
                    Deploy Another ICO
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Deploy New ICO</h1>
            <p className="text-muted-foreground">
              Configure and deploy your ICO contracts to Base Sepolia
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                ICO Configuration
              </CardTitle>
              <CardDescription>
                Fill in the details for your ICO. Contracts will be deployed automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeploy} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="My ICO Project"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenSymbol">Token Symbol *</Label>
                    <Input
                      id="tokenSymbol"
                      name="tokenSymbol"
                      value={formData.tokenSymbol}
                      onChange={handleChange}
                      placeholder="MYICO"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalSupply">Total Supply *</Label>
                    <Input
                      id="totalSupply"
                      name="totalSupply"
                      type="number"
                      value={formData.totalSupply}
                      onChange={handleChange}
                      placeholder="1000000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenDecimals">Token Decimals *</Label>
                    <Input
                      id="tokenDecimals"
                      name="tokenDecimals"
                      type="number"
                      value={formData.tokenDecimals}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenPrice">Token Price (ETH) *</Label>
                    <Input
                      id="tokenPrice"
                      name="tokenPrice"
                      type="number"
                      step="0.000001"
                      value={formData.tokenPrice}
                      onChange={handleChange}
                      placeholder="0.001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="softCap">Soft Cap (ETH) *</Label>
                    <Input
                      id="softCap"
                      name="softCap"
                      type="number"
                      step="0.01"
                      value={formData.softCap}
                      onChange={handleChange}
                      placeholder="100"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be less than hard cap
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hardCap">Hard Cap (ETH) *</Label>
                    <Input
                      id="hardCap"
                      name="hardCap"
                      type="number"
                      step="0.01"
                      value={formData.hardCap}
                      onChange={handleChange}
                      placeholder="1000"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum amount to raise
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minContribution">Min Contribution (ETH) *</Label>
                    <Input
                      id="minContribution"
                      name="minContribution"
                      type="number"
                      step="0.001"
                      value={formData.minContribution}
                      onChange={handleChange}
                      placeholder="1"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be less than max contribution
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxContribution">Max Contribution (ETH) *</Label>
                    <Input
                      id="maxContribution"
                      name="maxContribution"
                      type="number"
                      step="0.1"
                      value={formData.maxContribution}
                      onChange={handleChange}
                      placeholder="10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Per wallet limit
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={getMinStartDate()}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 30 minutes in the future (UTC timezone)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || getMinStartDate()}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be after start date
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isDeploying} size="lg">
                    {isDeploying ? (
                      <>
                        <span className="mr-2">Deploying...</span>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Deploy Contracts
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
}
