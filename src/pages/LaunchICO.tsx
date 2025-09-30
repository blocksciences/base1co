import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Rocket, CheckCircle2, Shield, Users, TrendingUp } from 'lucide-react';

const LaunchICO = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    email: '',
    website: '',
    description: '',
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    fundingGoal: '',
    whitepaper: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission - replace with actual backend call
    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "Our team will review your project and get back to you within 48 hours.",
      });
      setIsSubmitting(false);
      setFormData({
        projectName: '',
        email: '',
        website: '',
        description: '',
        tokenName: '',
        tokenSymbol: '',
        totalSupply: '',
        fundingGoal: '',
        whitepaper: '',
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container relative px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Rocket className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Launch Your ICO on{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                LaunchBase
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the premier launchpad on Base Network. Get your project in front of 
              thousands of qualified investors with institutional-grade security.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="glass p-6 space-y-3">
            <Shield className="h-10 w-10 text-primary" />
            <h3 className="text-lg font-bold">Vetted & Secure</h3>
            <p className="text-sm text-muted-foreground">
              All projects undergo rigorous due diligence and smart contract audits.
            </p>
          </Card>
          
          <Card className="glass p-6 space-y-3">
            <Users className="h-10 w-10 text-secondary" />
            <h3 className="text-lg font-bold">Active Community</h3>
            <p className="text-sm text-muted-foreground">
              Access to 25K+ qualified investors ready to support your project.
            </p>
          </Card>
          
          <Card className="glass p-6 space-y-3">
            <TrendingUp className="h-10 w-10 text-success" />
            <h3 className="text-lg font-bold">Marketing Support</h3>
            <p className="text-sm text-muted-foreground">
              Full promotional support including featured placement and social media.
            </p>
          </Card>
        </div>
      </section>

      {/* Application Form */}
      <section className="container px-4 py-12 pb-20">
        <Card className="glass max-w-3xl mx-auto p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Submit Your Project</h2>
              <p className="text-muted-foreground">
                Fill out the form below and our team will review your application
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="Your Project Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@yourproject.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourproject.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whitepaper">Whitepaper URL</Label>
                  <Input
                    id="whitepaper"
                    name="whitepaper"
                    type="url"
                    value={formData.whitepaper}
                    onChange={handleChange}
                    placeholder="https://yourproject.com/whitepaper.pdf"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name *</Label>
                  <Input
                    id="tokenName"
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleChange}
                    placeholder="Your Token"
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
                    placeholder="TKN"
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
                  <Label htmlFor="fundingGoal">Funding Goal (USD) *</Label>
                  <Input
                    id="fundingGoal"
                    name="fundingGoal"
                    type="number"
                    value={formData.fundingGoal}
                    onChange={handleChange}
                    placeholder="500000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your project, your team, your vision, and why you want to launch on LaunchBase..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">What happens next?</p>
                    <ul className="space-y-1 ml-0">
                      <li>• Our team reviews your application (24-48 hours)</li>
                      <li>• Due diligence and preliminary security review</li>
                      <li>• If approved, we'll schedule a call to discuss next steps</li>
                      <li>• Smart contract deployment and platform integration</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default LaunchICO;
