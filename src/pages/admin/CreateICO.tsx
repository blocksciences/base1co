import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContractDeployment, DeploymentParams } from '@/hooks/useContractDeployment';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { toast } from 'sonner';
import { Rocket, Code, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CreateICO() {
  const navigate = useNavigate();
  const { deployContracts, isDeploying } = useContractDeployment();
  const [step, setStep] = useState<'form' | 'instructions' | 'register'>('form');
  const [deploymentInstructions, setDeploymentInstructions] = useState<any>(null);
  const [projectId, setProjectId] = useState<string>('');
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
  const [deployedAddresses, setDeployedAddresses] = useState({
    tokenAddress: '',
    saleAddress: '',
    kycRegistryAddress: '',
    vestingVaultAddress: '',
    liquidityLockerAddress: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await deployContracts(formData);
    if (result) {
      setDeploymentInstructions(result);
      setProjectId(result.projectId);
      setStep('instructions');
    }
  };

  const handleRegisterContracts = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          contract_address: deployedAddresses.saleAddress,
          kyc_registry_address: deployedAddresses.kycRegistryAddress || null,
          vesting_vault_address: deployedAddresses.vestingVaultAddress || null,
          liquidity_locker_address: deployedAddresses.liquidityLockerAddress || null,
          status: 'active',
        })
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Contracts registered successfully! ICO is now live.');
      navigate('/admin/projects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register contracts');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Deploy New ICO</h1>
            <p className="text-muted-foreground">
              Create and deploy a complete ICO ecosystem on Base Sepolia
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">Configure</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'instructions' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'instructions' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">Deploy</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'register' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">Register</span>
            </div>
          </div>

          {step === 'form' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  ICO Configuration
                </CardTitle>
                <CardDescription>
                  Fill in the details for your ICO. This will generate deployment instructions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateInstructions} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
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
                        required
                      />
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
                        required
                      />
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
                        required
                      />
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isDeploying}>
                      {isDeploying ? 'Generating...' : 'Generate Deployment Instructions'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'instructions' && deploymentInstructions && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Deployment Instructions
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to deploy your ICO contracts to Base Sepolia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Step 1: Set Environment Variables</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a <code>.env</code> file in the <code>contracts/</code> directory:
                    </p>
                    <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`PRIVATE_KEY=your_wallet_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
TOKEN_NAME="${formData.projectName}"
TOKEN_SYMBOL="${formData.tokenSymbol}"
INITIAL_SUPPLY="${formData.totalSupply}"
TOKEN_DECIMALS="${formData.tokenDecimals}"
TOKEN_PRICE="${formData.tokenPrice}"
SOFT_CAP="${formData.softCap}"
HARD_CAP="${formData.hardCap}"
MIN_CONTRIBUTION="${formData.minContribution}"
MAX_CONTRIBUTION="${formData.maxContribution}"`}
                    </pre>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Step 2: Deploy Contracts</h3>
                    <p className="text-sm text-muted-foreground">
                      Run the following commands in your terminal:
                    </p>
                    <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`cd contracts
npm install
npx hardhat run scripts/deploy-ico.ts --network baseSepolia`}
                    </pre>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Step 3: Note the Contract Addresses</h3>
                    <p className="text-sm text-muted-foreground">
                      After deployment, copy the contract addresses from the terminal output.
                      You'll need to register them in the next step.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setStep('register')}>
                      I've Deployed the Contracts
                    </Button>
                    <Button variant="outline" onClick={() => setStep('form')}>
                      Back to Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'register' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Register Deployed Contracts
                </CardTitle>
                <CardDescription>
                  Enter the deployed contract addresses to activate your ICO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterContracts} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saleAddress">Sale Contract Address *</Label>
                    <Input
                      id="saleAddress"
                      name="saleAddress"
                      value={deployedAddresses.saleAddress}
                      onChange={(e) => setDeployedAddresses(prev => ({ ...prev, saleAddress: e.target.value }))}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenAddress">Token Contract Address *</Label>
                    <Input
                      id="tokenAddress"
                      name="tokenAddress"
                      value={deployedAddresses.tokenAddress}
                      onChange={(e) => setDeployedAddresses(prev => ({ ...prev, tokenAddress: e.target.value }))}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kycRegistryAddress">KYC Registry Address (Optional)</Label>
                    <Input
                      id="kycRegistryAddress"
                      name="kycRegistryAddress"
                      value={deployedAddresses.kycRegistryAddress}
                      onChange={(e) => setDeployedAddresses(prev => ({ ...prev, kycRegistryAddress: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vestingVaultAddress">Vesting Vault Address (Optional)</Label>
                    <Input
                      id="vestingVaultAddress"
                      name="vestingVaultAddress"
                      value={deployedAddresses.vestingVaultAddress}
                      onChange={(e) => setDeployedAddresses(prev => ({ ...prev, vestingVaultAddress: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liquidityLockerAddress">Liquidity Locker Address (Optional)</Label>
                    <Input
                      id="liquidityLockerAddress"
                      name="liquidityLockerAddress"
                      value={deployedAddresses.liquidityLockerAddress}
                      onChange={(e) => setDeployedAddresses(prev => ({ ...prev, liquidityLockerAddress: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">
                      Register Contracts & Launch ICO
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setStep('instructions')}>
                      Back to Instructions
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
