import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Plus, X, Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useContractDeployment } from '@/hooks/useContractDeployment';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CreateICO = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [teamMembers, setTeamMembers] = useState([{ name: '', role: '', image: '' }]);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  
  const { deployContracts, isDeploying } = useContractDeployment();
  
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: '', image: '' }]);
  };
  
  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };
  
  const handleDeploy = async () => {
    const form = document.getElementById('ico-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const projectName = formData.get('project-name') as string;
    const tokenSymbol = formData.get('token-symbol') as string;
    const totalSupply = formData.get('total-supply') as string;
    const softCap = formData.get('soft-cap') as string;
    const hardCap = formData.get('hard-cap') as string;
    const minContribution = formData.get('min-contribution') as string;
    const maxContribution = formData.get('max-contribution') as string;
    const initialPrice = formData.get('initial-price') as string;
    
    if (!projectName || !tokenSymbol || !totalSupply || !softCap || !hardCap || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const result = await deployContracts({
      projectName,
      tokenSymbol,
      totalSupply,
      tokenDecimals: 18,
      tokenPrice: initialPrice || '0.0001',
      softCap,
      hardCap,
      minContribution: minContribution || '0.1',
      maxContribution: maxContribution || '100',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    if (result) {
      setDeploymentResult(result);
      toast.success('Review the deployment instructions below');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('ICO created successfully! Pending approval.');
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Create New ICO</h1>
              <p className="text-muted-foreground">Launch a new token sale project on the platform</p>
            </div>
            
            <form id="ico-form" onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="glass">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                  <TabsTrigger value="sale">Sale Details</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="contract">Smart Contract</TabsTrigger>
                </TabsList>
                
                {/* Basic Info */}
                <TabsContent value="basic" className="space-y-6">
                  <Card className="glass p-6 space-y-6">
                    <h2 className="text-xl font-bold">Project Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name *</Label>
                        <Input name="project-name" id="project-name" placeholder="DeFi Protocol X" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="token-symbol">Token Symbol *</Label>
                        <Input name="token-symbol" id="token-symbol" placeholder="DPX" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description *</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe your project, its goals, and unique value proposition..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input id="website" type="url" placeholder="https://example.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whitepaper">Whitepaper URL</Label>
                        <Input id="whitepaper" type="url" placeholder="https://example.com/whitepaper.pdf" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input id="twitter" placeholder="@project" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telegram">Telegram</Label>
                        <Input id="telegram" placeholder="t.me/project" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discord">Discord</Label>
                        <Input id="discord" placeholder="discord.gg/project" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo">Project Logo *</Label>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Image
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Recommended: 400x400px, PNG or JPG
                        </span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Tokenomics */}
                <TabsContent value="tokenomics" className="space-y-6">
                  <Card className="glass p-6 space-y-6">
                    <h2 className="text-xl font-bold">Token Distribution</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="total-supply">Total Supply *</Label>
                      <Input name="total-supply" id="total-supply" type="number" placeholder="1000000000" required />
                    </div>
                      
                    <div className="space-y-2">
                      <Label htmlFor="initial-price">Initial Token Price (ETH) *</Label>
                      <Input name="initial-price" id="initial-price" type="number" step="0.0001" placeholder="0.0001" required />
                    </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Allocation Breakdown</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="public-sale">Public Sale %</Label>
                          <Input id="public-sale" type="number" min="0" max="100" placeholder="40" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="team">Team & Advisors %</Label>
                          <Input id="team" type="number" min="0" max="100" placeholder="20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ecosystem">Ecosystem Fund %</Label>
                          <Input id="ecosystem" type="number" min="0" max="100" placeholder="25" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="liquidity">Liquidity %</Label>
                          <Input id="liquidity" type="number" min="0" max="100" placeholder="15" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Vesting Schedule</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliff">Cliff Period (days)</Label>
                          <Input id="cliff" type="number" placeholder="90" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="vesting">Vesting Duration (days)</Label>
                          <Input id="vesting" type="number" placeholder="365" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tge">TGE Release %</Label>
                          <Input id="tge" type="number" min="0" max="100" placeholder="10" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Sale Details */}
                <TabsContent value="sale" className="space-y-6">
                  <Card className="glass p-6 space-y-6">
                    <h2 className="text-xl font-bold">Sale Configuration</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="soft-cap">Soft Cap (ETH) *</Label>
                        <Input name="soft-cap" id="soft-cap" type="number" step="0.1" placeholder="1000" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hard-cap">Hard Cap (ETH) *</Label>
                        <Input name="hard-cap" id="hard-cap" type="number" step="0.1" placeholder="5000" required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="min-contribution">Minimum Contribution (ETH)</Label>
                        <Input name="min-contribution" id="min-contribution" type="number" step="0.01" placeholder="0.1" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-contribution">Maximum Contribution (ETH)</Label>
                        <Input name="max-contribution" id="max-contribution" type="number" step="0.1" placeholder="100" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 glass">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>End Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 glass">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accepted-tokens">Accepted Payment Methods</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment methods" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="eth">ETH</SelectItem>
                          <SelectItem value="usdt">USDT</SelectItem>
                          <SelectItem value="usdc">USDC</SelectItem>
                          <SelectItem value="all">All of the above</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Team */}
                <TabsContent value="team" className="space-y-6">
                  <Card className="glass p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Team Members</h2>
                      <Button type="button" onClick={addTeamMember} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Member
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/20 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Team Member {index + 1}</h3>
                            {teamMembers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTeamMember(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`member-name-${index}`}>Name</Label>
                              <Input id={`member-name-${index}`} placeholder="John Doe" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`member-role-${index}`}>Role</Label>
                              <Input id={`member-role-${index}`} placeholder="CEO & Founder" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`member-image-${index}`}>Image URL</Label>
                              <Input id={`member-image-${index}`} placeholder="https://..." />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Smart Contract */}
                <TabsContent value="contract" className="space-y-6">
                  <Card className="glass p-6 space-y-6">
                    <h2 className="text-xl font-bold">Smart Contract Configuration</h2>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contract-address">Token Contract Address</Label>
                      <Input 
                        id="contract-address" 
                        placeholder="0x..." 
                        pattern="^0x[a-fA-F0-9]{40}$"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the deployed ERC-20 token contract address on Base network
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sale-contract">Sale Contract Address</Label>
                      <Input 
                        id="sale-contract" 
                        placeholder="0x..." 
                        pattern="^0x[a-fA-F0-9]{40}$"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the ICO sale contract address (if already deployed)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audit-report">Audit Report URL</Label>
                      <Input id="audit-report" type="url" placeholder="https://..." />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Contract Deployment</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Deploy your ICO contracts directly to Base network. This will create both the ERC20 token contract and the ICO sale contract.
                        </p>
                        <Button 
                          type="button" 
                          onClick={handleDeploy}
                          disabled={isDeploying}
                          className="gap-2"
                        >
                          <Rocket className="h-4 w-4" />
                          {isDeploying ? 'Deploying...' : 'Deploy Contracts'}
                        </Button>
                      </div>
                      
                      {deploymentResult && (
                        <Alert>
                          <AlertDescription className="space-y-3">
                            <div>
                              <p className="font-semibold mb-2">✅ Deployment Initiated</p>
                              <p className="text-sm mb-2">Project ID: {deploymentResult.projectId}</p>
                            </div>
                            
                            <div className="text-sm space-y-1">
                              <p className="font-semibold">Next Steps:</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Install dependencies: <code className="bg-muted px-1 rounded">cd contracts && npm install</code></li>
                                <li>Set up your .env file with private key and RPC URLs</li>
                                <li>Deploy: <code className="bg-muted px-1 rounded">npm run deploy -- --network baseSepolia</code></li>
                                <li>Copy the deployed contract addresses and paste them above</li>
                              </ol>
                            </div>
                            
                            <div className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              <pre>{deploymentResult.deploymentScript}</pre>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Submit Button */}
              <Card className="glass p-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Ready to Launch?</h3>
                    <p className="text-sm text-muted-foreground">
                      Review all information before submitting. Project will be pending approval.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline">
                      Save Draft
                    </Button>
                    <Button type="submit" className="bg-gradient-primary">
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateICO;
