import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const AdminSettings = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
            <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
          </div>
          
          {/* Platform Configuration */}
          <Card className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold">Platform Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="LaunchBase" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform-email">Support Email</Label>
                <Input id="platform-email" type="email" defaultValue="support@launchbase.io" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform-description">Platform Description</Label>
              <Textarea 
                id="platform-description" 
                rows={3}
                defaultValue="The premier ICO launchpad for next-generation blockchain projects on Base network."
              />
            </div>
          </Card>
          
          {/* Fee Structure */}
          <Card className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold">Fee Structure</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                <Input id="platform-fee" type="number" step="0.1" defaultValue="2.5" />
                <p className="text-xs text-muted-foreground">
                  Fee charged on each investment
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="listing-fee">Project Listing Fee (ETH)</Label>
                <Input id="listing-fee" type="number" step="0.1" defaultValue="1.0" />
                <p className="text-xs text-muted-foreground">
                  One-time fee for listing a project
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="withdrawal-fee">Withdrawal Fee (%)</Label>
                <Input id="withdrawal-fee" type="number" step="0.1" defaultValue="0.5" />
                <p className="text-xs text-muted-foreground">
                  Fee charged on withdrawals
                </p>
              </div>
            </div>
          </Card>
          
          {/* KYC Settings */}
          <Card className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold">KYC/AML Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Require KYC for All Users</p>
                  <p className="text-sm text-muted-foreground">
                    Users must complete KYC before participating
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Enhanced Due Diligence</p>
                  <p className="text-sm text-muted-foreground">
                    Additional verification for high-value investments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Geographic Restrictions</p>
                  <p className="text-sm text-muted-foreground">
                    Block users from restricted countries
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kyc-threshold">KYC Threshold (USD)</Label>
              <Input id="kyc-threshold" type="number" defaultValue="1000" />
              <p className="text-xs text-muted-foreground">
                Minimum investment amount requiring KYC
              </p>
            </div>
          </Card>
          
          {/* Investment Limits */}
          <Card className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold">Investment Limits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="min-investment">Minimum Investment (ETH)</Label>
                <Input id="min-investment" type="number" step="0.01" defaultValue="0.1" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-investment">Maximum Investment (ETH)</Label>
                <Input id="max-investment" type="number" step="1" defaultValue="100" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daily-limit">Daily Investment Limit per User (ETH)</Label>
              <Input id="daily-limit" type="number" step="1" defaultValue="50" />
            </div>
          </Card>
          
          {/* Project Approval */}
          <Card className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold">Project Approval Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Auto-Approve Projects</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve projects that meet criteria
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Require Smart Contract Audit</p>
                  <p className="text-sm text-muted-foreground">
                    Projects must have verified audit report
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div>
                  <p className="font-semibold">Require Team KYC</p>
                  <p className="text-sm text-muted-foreground">
                    Project team members must complete KYC
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
          
          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} className="bg-gradient-primary">
              Save Settings
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
