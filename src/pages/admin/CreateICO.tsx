import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContractDeployment, DeploymentParams } from '@/hooks/useContractDeployment';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from 'sonner';
import { Rocket, ExternalLink, CheckCircle2, Building2, Users, Globe, Coins, Scale } from 'lucide-react';

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
    // Token Details
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
    
    // Company Information
    companyLegalName: '',
    registrationNumber: '',
    registrationCountry: '',
    companyAddress: '',
    businessEmail: '',
    businessPhone: '',
    
    // Project Details
    projectDescription: '',
    problemStatement: '',
    solution: '',
    targetMarket: '',
    useOfFunds: '',
    
    // Team Information
    founderName: '',
    founderRole: '',
    founderLinkedin: '',
    founderBio: '',
    teamSize: '',
    advisors: '',
    
    // Social Links
    website: '',
    whitepaper: '',
    twitter: '',
    telegram: '',
    discord: '',
    medium: '',
    github: '',
    
    // Tokenomics
    publicSaleAllocation: '',
    teamAllocation: '',
    ecosystemAllocation: '',
    liquidityAllocation: '',
    seedInvestorsAllocation: '',
    vestingSchedule: '',
    allocationImageUrl: '',
    vestingScheduleImageUrl: '',
    
    // Legal & Compliance
    jurisdictionCompliance: '',
    auditReport: '',
    kycProvider: '',
    legalOpinion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                  <Button variant="outline" onClick={() => window.location.reload()}>
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
                Comprehensive ICO Configuration
              </CardTitle>
              <CardDescription>
                Complete all sections to deploy your ICO. All information will be stored for transparency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeploy} className="space-y-6">
                <Tabs defaultValue="token" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="token">Token</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="project">Project</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="legal">Legal</TabsTrigger>
                  </TabsList>

                  {/* Token Configuration Tab */}
                  <TabsContent value="token" className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Coins className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Token Configuration</h3>
                    </div>
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
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-semibold mb-3">Tokenomics Allocation (%)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="publicSaleAllocation">Public Sale Allocation (%) *</Label>
                          <Input
                            id="publicSaleAllocation"
                            name="publicSaleAllocation"
                            type="number"
                            value={formData.publicSaleAllocation}
                            onChange={handleChange}
                            placeholder="40"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamAllocation">Team Allocation (%) *</Label>
                          <Input
                            id="teamAllocation"
                            name="teamAllocation"
                            type="number"
                            value={formData.teamAllocation}
                            onChange={handleChange}
                            placeholder="20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ecosystemAllocation">Ecosystem Allocation (%) *</Label>
                          <Input
                            id="ecosystemAllocation"
                            name="ecosystemAllocation"
                            type="number"
                            value={formData.ecosystemAllocation}
                            onChange={handleChange}
                            placeholder="25"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="liquidityAllocation">Liquidity Allocation (%) *</Label>
                          <Input
                            id="liquidityAllocation"
                            name="liquidityAllocation"
                            type="number"
                            value={formData.liquidityAllocation}
                            onChange={handleChange}
                            placeholder="15"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seedInvestorsAllocation">Seed Investors Allocation (%) *</Label>
                          <Input
                            id="seedInvestorsAllocation"
                            name="seedInvestorsAllocation"
                            type="number"
                            value={formData.seedInvestorsAllocation}
                            onChange={handleChange}
                            placeholder="10"
                            required
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="vestingSchedule">Vesting Schedule *</Label>
                          <Textarea
                            id="vestingSchedule"
                            name="vestingSchedule"
                            value={formData.vestingSchedule}
                            onChange={handleChange}
                            placeholder="Team: 24-month vesting, 6-month cliff. Advisors: 12-month vesting..."
                            required
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="allocationImageUrl">Tokenomics Allocation Chart URL</Label>
                          <Input
                            id="allocationImageUrl"
                            name="allocationImageUrl"
                            type="url"
                            value={formData.allocationImageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/tokenomics-chart.png"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload your tokenomics allocation chart to an image hosting service (e.g., Imgur, ImgBB) and paste the URL here
                          </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="vestingScheduleImageUrl">Vesting Schedule Chart URL</Label>
                          <Input
                            id="vestingScheduleImageUrl"
                            name="vestingScheduleImageUrl"
                            type="url"
                            value={formData.vestingScheduleImageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/vesting-schedule-chart.png"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload your vesting schedule timeline chart to an image hosting service and paste the URL here
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Company Information Tab */}
                  <TabsContent value="company" className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Company Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyLegalName">Legal Company Name *</Label>
                        <Input
                          id="companyLegalName"
                          name="companyLegalName"
                          value={formData.companyLegalName}
                          onChange={handleChange}
                          placeholder="Acme Blockchain Inc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number *</Label>
                        <Input
                          id="registrationNumber"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          placeholder="123456789"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationCountry">Registration Country *</Label>
                        <Input
                          id="registrationCountry"
                          name="registrationCountry"
                          value={formData.registrationCountry}
                          onChange={handleChange}
                          placeholder="United States"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessEmail">Business Email *</Label>
                        <Input
                          id="businessEmail"
                          name="businessEmail"
                          type="email"
                          value={formData.businessEmail}
                          onChange={handleChange}
                          placeholder="contact@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessPhone">Business Phone *</Label>
                        <Input
                          id="businessPhone"
                          name="businessPhone"
                          type="tel"
                          value={formData.businessPhone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="companyAddress">Registered Address *</Label>
                        <Textarea
                          id="companyAddress"
                          name="companyAddress"
                          value={formData.companyAddress}
                          onChange={handleChange}
                          placeholder="123 Main Street, Suite 100, City, State, ZIP"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Project Details Tab */}
                  <TabsContent value="project" className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Project Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectDescription">Project Description *</Label>
                        <Textarea
                          id="projectDescription"
                          name="projectDescription"
                          value={formData.projectDescription}
                          onChange={handleChange}
                          placeholder="Brief overview of your project..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="problemStatement">Problem Statement *</Label>
                        <Textarea
                          id="problemStatement"
                          name="problemStatement"
                          value={formData.problemStatement}
                          onChange={handleChange}
                          placeholder="What problem does your project solve?"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="solution">Solution *</Label>
                        <Textarea
                          id="solution"
                          name="solution"
                          value={formData.solution}
                          onChange={handleChange}
                          placeholder="How does your project solve the problem?"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetMarket">Target Market *</Label>
                        <Textarea
                          id="targetMarket"
                          name="targetMarket"
                          value={formData.targetMarket}
                          onChange={handleChange}
                          placeholder="Who are your target users/customers?"
                          rows={2}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="useOfFunds">Use of Funds *</Label>
                        <Textarea
                          id="useOfFunds"
                          name="useOfFunds"
                          value={formData.useOfFunds}
                          onChange={handleChange}
                          placeholder="How will the raised funds be used?"
                          rows={3}
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-semibold mb-3">Social Links & Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website *</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://yourproject.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="whitepaper">Whitepaper URL *</Label>
                          <Input
                            id="whitepaper"
                            name="whitepaper"
                            type="url"
                            value={formData.whitepaper}
                            onChange={handleChange}
                            placeholder="https://yourproject.com/whitepaper.pdf"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter/X</Label>
                          <Input
                            id="twitter"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            placeholder="@yourproject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram">Telegram</Label>
                          <Input
                            id="telegram"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleChange}
                            placeholder="t.me/yourproject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discord">Discord</Label>
                          <Input
                            id="discord"
                            name="discord"
                            value={formData.discord}
                            onChange={handleChange}
                            placeholder="discord.gg/yourproject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github">GitHub</Label>
                          <Input
                            id="github"
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            placeholder="github.com/yourproject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medium">Medium</Label>
                          <Input
                            id="medium"
                            name="medium"
                            value={formData.medium}
                            onChange={handleChange}
                            placeholder="medium.com/@yourproject"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Team Information Tab */}
                  <TabsContent value="team" className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Team Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="founderName">Founder/CEO Name *</Label>
                          <Input
                            id="founderName"
                            name="founderName"
                            value={formData.founderName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="founderRole">Founder Role/Title *</Label>
                          <Input
                            id="founderRole"
                            name="founderRole"
                            value={formData.founderRole}
                            onChange={handleChange}
                            placeholder="CEO & Founder"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="founderLinkedin">Founder LinkedIn *</Label>
                          <Input
                            id="founderLinkedin"
                            name="founderLinkedin"
                            type="url"
                            value={formData.founderLinkedin}
                            onChange={handleChange}
                            placeholder="linkedin.com/in/johndoe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamSize">Team Size *</Label>
                          <Input
                            id="teamSize"
                            name="teamSize"
                            value={formData.teamSize}
                            onChange={handleChange}
                            placeholder="15 full-time members"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="founderBio">Founder Biography *</Label>
                        <Textarea
                          id="founderBio"
                          name="founderBio"
                          value={formData.founderBio}
                          onChange={handleChange}
                          placeholder="Brief biography including relevant experience..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="advisors">Key Advisors *</Label>
                        <Textarea
                          id="advisors"
                          name="advisors"
                          value={formData.advisors}
                          onChange={handleChange}
                          placeholder="List key advisors and their backgrounds..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Legal & Compliance Tab */}
                  <TabsContent value="legal" className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Legal & Compliance</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jurisdictionCompliance">Jurisdictions & Compliance *</Label>
                        <Textarea
                          id="jurisdictionCompliance"
                          name="jurisdictionCompliance"
                          value={formData.jurisdictionCompliance}
                          onChange={handleChange}
                          placeholder="List jurisdictions where token sale is compliant and any restrictions..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kycProvider">KYC/AML Provider *</Label>
                        <Input
                          id="kycProvider"
                          name="kycProvider"
                          value={formData.kycProvider}
                          onChange={handleChange}
                          placeholder="e.g., Jumio, Onfido, Sumsub"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auditReport">Smart Contract Audit Report URL</Label>
                        <Input
                          id="auditReport"
                          name="auditReport"
                          type="url"
                          value={formData.auditReport}
                          onChange={handleChange}
                          placeholder="https://auditor.com/report"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="legalOpinion">Legal Opinion Document URL</Label>
                        <Input
                          id="legalOpinion"
                          name="legalOpinion"
                          type="url"
                          value={formData.legalOpinion}
                          onChange={handleChange}
                          placeholder="https://yourproject.com/legal-opinion.pdf"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" disabled={isDeploying} size="lg">
                    {isDeploying ? (
                      <>
                        <span className="mr-2">Deploying...</span>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Deploy Contracts & Create ICO
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
